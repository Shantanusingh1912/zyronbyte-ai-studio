import os
import json
import logging
import threading
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Video, Clip, PublishQueue, AppSetting, SystemLog
from ..config import settings
from .downloader import downloader
from .transcriber import transcriber
from .gemini_ai import gemini_service
from .video_editor import video_editor
from .quality_control import quality_validator

logger = logging.getLogger("zyronbyte.pipeline")

class PipelineRunner:
    """
    Master end-to-end automated orchestrator:
    Import -> Transcribe -> Detect Highlights -> Clip & Render 9:16 -> QC Inspection -> Queue & Publish.
    """

    def __init__(self):
        self.active_tasks: Dict[int, threading.Thread] = {}
        self.paused = False

    def log_event(self, db: Session, level: str, message: str, details: Optional[str] = None):
        try:
            log_item = SystemLog(level=level, module="PIPELINE", message=message, details=details)
            db.add(log_item)
            db.commit()
        except Exception:
            pass

    def run_video_pipeline_async(self, video_id: int):
        """Spawns background worker thread to process video without blocking HTTP requests."""
        if video_id in self.active_tasks and self.active_tasks[video_id].is_alive():
            logger.info(f"Video #{video_id} is already actively running.")
            return
        thread = threading.Thread(target=self._execute_pipeline, args=(video_id,), daemon=True)
        self.active_tasks[video_id] = thread
        thread.start()

    def resume_stale_jobs(self):
        """Checks for jobs left in processing state from an earlier session and restarts them."""
        db = SessionLocal()
        try:
            stale = db.query(Video).filter(Video.status.in_(["DOWNLOADING", "TRANSCRIBING", "ANALYZING", "EDITING", "PROCESSING"])).all()
            for v in stale:
                if v.id not in self.active_tasks or not self.active_tasks[v.id].is_alive():
                    logger.info(f"Auto-resuming interrupted job for Video #{v.id} ('{v.title}')...")
                    self.run_video_pipeline_async(v.id)
        except Exception as e:
            logger.error(f"Error auto-resuming jobs: {e}")
        finally:
            db.close()

    def _execute_pipeline(self, video_id: int):
        db: Session = SessionLocal()
        video = db.query(Video).filter(Video.id == video_id).first()
        if not video:
            db.close()
            return

        try:
            self.log_event(db, "INFO", f"Starting automated pipeline for Video #{video_id}: '{video.title}'")

            # ---------------------------------------------------------
            # STEP 1: Download or Inspect Video
            # ---------------------------------------------------------
            video.status = "PROCESSING"
            video.current_step = "Inspecting Video & Audio Streams"
            video.progress = 10.0
            db.commit()

            if video.source_type == "youtube" and not os.path.exists(video.file_path):
                video.current_step = "Downloading YouTube Video"
                db.commit()
                dl_result = downloader.download_youtube_video(video.source_url)
                video.file_path = dl_result["file_path"]
                video.duration = dl_result["duration"]
                video.width = dl_result["width"]
                video.height = dl_result["height"]
                video.fps = dl_result["fps"]
                db.commit()

            # Ensure metadata is fresh
            meta = downloader.get_video_metadata(video.file_path)
            video.duration = meta["duration"]
            video.width = meta["width"]
            video.height = meta["height"]
            video.fps = meta["fps"]
            db.commit()

            # ---------------------------------------------------------
            # STEP 2: Transcribe Speech & Audio Events (Whisper)
            # ---------------------------------------------------------
            if video.transcript_json and len(video.transcript_json) > 100:
                self.log_event(db, "INFO", f"Reusing saved transcript for video #{video_id} ({video.duration:.1f}s)")
                transcript_data = json.loads(video.transcript_json)
                video.progress = 40.0
                video.current_step = "Transcript ready"
                db.commit()
            else:
                video.status = "TRANSCRIBING"
                video.current_step = "Transcribing Speech & Timestamps with Whisper AI"
                video.progress = 25.0
                db.commit()

                self.log_event(db, "INFO", f"Extracting audio & transcribing video #{video_id} ({video.duration:.1f}s)...")
                
                def on_transcribe_progress(current_s: float, total_s: float):
                    pct = min(100.0, (current_s / max(1.0, total_s)) * 100.0)
                    cur_m = int(current_s // 60)
                    cur_s = int(current_s % 60)
                    tot_m = int(total_s // 60)
                    tot_s = int(total_s % 60)
                    time_str = f"{cur_m:02d}:{cur_s:02d} / {tot_m:02d}:{tot_s:02d}"
                    video.progress = round(25.0 + (15.0 * (pct / 100.0)), 1)
                    video.current_step = f"Transcribing Audio: {time_str} ({int(pct)}%)"
                    db.commit()

                transcript_data = transcriber.transcribe(video.file_path, progress_callback=on_transcribe_progress)
                video.transcript_json = json.dumps(transcript_data)
                db.commit()

            # ---------------------------------------------------------
            # STEP 3: Detect Gaming Highlights (Multimodal & Gemini AI)
            # ---------------------------------------------------------
            video.status = "ANALYZING"
            video.current_step = "Detecting Highlights with Multimodal AI"
            video.progress = 42.0
            db.commit()

            # Fetch settings
            min_clips_setting = db.query(AppSetting).filter(AppSetting.key == "clips_per_video").first()
            configured_clips = int(min_clips_setting.value) if min_clips_setting else 0

            min_dur_setting = db.query(AppSetting).filter(AppSetting.key == "min_clip_duration").first()
            min_dur = int(min_dur_setting.value) if min_dur_setting else settings.DEFAULT_MIN_CLIP_DURATION

            max_dur_setting = db.query(AppSetting).filter(AppSetting.key == "max_clip_duration").first()
            max_dur = int(max_dur_setting.value) if max_dur_setting else settings.DEFAULT_MAX_CLIP_DURATION

            from .gemini_ai import get_duration_scaled_clip_targets
            min_clips, max_clips = get_duration_scaled_clip_targets(video.duration, configured_clips)

            meta["file_path"] = video.file_path
            meta["duration"] = video.duration

            self.log_event(
                db, "INFO",
                f"Analyzing video timeline ({video.duration / 60.0:.1f} mins) for {min_clips}-{max_clips} highlights across clutch, op_kill, rush, reaction & funny..."
            )
            highlights = gemini_service.detect_highlights(
                video_metadata=meta,
                transcript_data=transcript_data,
                min_clips=min_clips,
                max_clips=max_clips,
                min_duration=min_dur,
                max_duration=max_dur,
                configured_clips_setting=configured_clips
            )

            self.log_event(db, "SUCCESS", f"Detected {len(highlights)} epic gaming highlights!")

            # ---------------------------------------------------------
            # STEP 4: Create Clip Records
            # ---------------------------------------------------------
            # Clean up any existing unapproved clips for this video
            existing_clips = db.query(Clip).filter(Clip.video_id == video.id, Clip.approved_for_publishing == False).all()
            for old_c in existing_clips:
                db.delete(old_c)
            db.commit()

            crop_setting = db.query(AppSetting).filter(AppSetting.key == "default_crop_mode").first()
            default_crop = crop_setting.value if crop_setting else "blur_fill"

            created_clips = []
            for h in highlights:
                clip = Clip(
                    video_id=video.id,
                    title=h.get("title", "Epic Gaming Moment"),
                    highlight_category=h.get("category", "action"),
                    description=h.get("description", ""),
                    excitement_score=h.get("score", 90),
                    start_time=h.get("start_time", 0.0),
                    end_time=h.get("end_time", 35.0),
                    duration=h.get("end_time", 35.0) - h.get("start_time", 0.0),
                    crop_mode=default_crop,
                    subtitles_enabled=True,
                    sfx_enabled=True,
                    youtube_title=h.get("youtube_title"),
                    instagram_caption=h.get("instagram_caption"),
                    hashtags=",".join(h.get("hashtags", [])) if isinstance(h.get("hashtags"), list) else str(h.get("hashtags", "")),
                    keywords=",".join(h.get("keywords", [])) if isinstance(h.get("keywords"), list) else str(h.get("keywords", "")),
                    status="PENDING_EDIT"
                )
                db.add(clip)
                db.flush()
                created_clips.append(clip)

            db.commit()

            # ---------------------------------------------------------
            # STEP 5: Professional Video Editing & Rendering (FFmpeg)
            # ---------------------------------------------------------
            video.status = "EDITING"
            video.current_step = "Editing & Rendering 9:16 Vertical Shorts"
            db.commit()

            total_clips = len(created_clips)
            for idx, clip in enumerate(created_clips, 1):
                video.current_step = f"Rendering Clip {idx}/{total_clips} [{clip.highlight_category.upper()}]: {clip.title[:30]}"
                video.progress = round(45.0 + (45.0 * (idx / max(1, total_clips))), 1)
                db.commit()

                self.log_event(db, "INFO", f"Rendering Clip #{clip.id}: '{clip.title}' ({clip.duration:.1f}s, {clip.crop_mode})")
                render_result = video_editor.render_professional_short(
                    source_video_path=video.file_path,
                    start_time=clip.start_time,
                    end_time=clip.end_time,
                    clip_id=clip.id,
                    crop_mode=clip.crop_mode,
                    subtitles_enabled=clip.subtitles_enabled,
                    sfx_enabled=clip.sfx_enabled,
                    transcript_words=transcript_data.get("words", [])
                )

                clip.edited_clip_path = render_result["edited_clip_path"]
                clip.thumbnail_path = render_result["thumbnail_path"]
                db.commit()

                # ---------------------------------------------------------
                # STEP 6: Pre-flight Quality Control (QC Inspection)
                # ---------------------------------------------------------
                qc_report = quality_validator.inspect_clip(clip.edited_clip_path)
                clip.qc_report_json = json.dumps(qc_report)
                clip.qc_passed = qc_report["passed"]

                if clip.qc_passed:
                    clip.status = "READY_FOR_APPROVAL"
                    self.log_event(db, "SUCCESS", f"Clip #{clip.id} passed QC with score {qc_report['score']}/100!")
                else:
                    clip.status = "QC_FAILED"
                    self.log_event(db, "WARNING", f"Clip #{clip.id} failed QC: {', '.join(qc_report['issues'])}")

                db.commit()

                # ---------------------------------------------------------
                # STEP 7: Check Auto-Publish Setting
                # ---------------------------------------------------------
                auto_pub_setting = db.query(AppSetting).filter(AppSetting.key == "auto_publish").first()
                auto_publish_enabled = auto_pub_setting.value.lower() == "true" if auto_pub_setting else False

                if auto_publish_enabled and clip.qc_passed:
                    clip.approved_for_publishing = True
                    clip.status = "SCHEDULED"
                    # Schedule evenly across peak gaming hours (every 4 hours from now)
                    sched_time = datetime.utcnow() + timedelta(hours=2 * idx)
                    clip.scheduled_time = sched_time

                    task = PublishQueue(
                        clip_id=clip.id,
                        platform="youtube",
                        scheduled_time=sched_time,
                        status="QUEUED"
                    )
                    db.add(task)
                    self.log_event(db, "INFO", f"Auto-scheduled Clip #{clip.id} for {sched_time.strftime('%Y-%m-%d %H:%M UTC')}")
                    db.commit()

            # ---------------------------------------------------------
            # FINALIZE VIDEO STATUS
            # ---------------------------------------------------------
            video.status = "COMPLETED"
            video.progress = 100.0
            video.current_step = f"Complete: {len(created_clips)} Clips Created & Ready!"
            db.commit()
            self.log_event(db, "SUCCESS", f"Pipeline completed for Video #{video_id}! {len(created_clips)} clips ready.")

        except Exception as e:
            logger.exception(f"Pipeline crashed for video #{video_id}: {e}")
            video.status = "FAILED"
            video.error_message = str(e)
            video.current_step = f"Failed: {str(e)[:100]}"
            db.commit()
            self.log_event(db, "ERROR", f"Pipeline failed for Video #{video_id}: {e}")
        finally:
            if video_id in self.active_tasks:
                del self.active_tasks[video_id]
            db.close()

pipeline_runner = PipelineRunner()
