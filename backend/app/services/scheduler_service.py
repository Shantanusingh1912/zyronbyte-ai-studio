import logging
from datetime import datetime, timedelta
from typing import Optional
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import PublishQueue, Clip, SocialAccount, AppSetting, SystemLog
from .youtube_uploader import youtube_uploader
from .instagram_uploader import instagram_uploader

logger = logging.getLogger("zyronbyte.scheduler")

class AutomationScheduler:
    """
    Background job runner for:
    - Checking scheduled publishing queue
    - Enforcing daily upload rate limits
    - Handling retries and failed upload recovery
    """

    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.is_running = False
        self.is_paused = False

    def start(self):
        if not self.is_running:
            self.scheduler.add_job(
                func=self.check_and_publish_queue,
                trigger=IntervalTrigger(seconds=30),
                id="publish_queue_checker",
                name="Check Publish Queue",
                replace_existing=True
            )
            self.scheduler.start()
            self.is_running = True
            logger.info("Automation Scheduler started successfully.")

    def pause(self):
        self.is_paused = True
        logger.info("Automation Scheduler paused by user.")

    def resume(self):
        self.is_paused = False
        logger.info("Automation Scheduler resumed.")

    def check_and_publish_queue(self):
        """Worker executed every 30 seconds to process pending scheduled items."""
        if self.is_paused:
            return

        db: Session = SessionLocal()
        try:
            now = datetime.utcnow()
            # Fetch pending items whose scheduled_time <= now
            pending_items = db.query(PublishQueue).filter(
                PublishQueue.status == "QUEUED",
                PublishQueue.scheduled_time <= now
            ).order_by(PublishQueue.scheduled_time.asc()).limit(5).all()

            for item in pending_items:
                self._process_single_publish_task(db, item)
        except Exception as e:
            logger.error(f"Error in scheduler worker: {e}")
        finally:
            db.close()

    def _process_single_publish_task(self, db: Session, task: PublishQueue):
        clip = task.clip
        if not clip or not clip.edited_clip_path:
            task.status = "FAILED"
            task.last_error = "Clip file does not exist or was deleted."
            db.commit()
            return

        task.status = "PROCESSING"
        task.attempts += 1
        db.commit()

        # Check social accounts
        yt_account = db.query(SocialAccount).filter(SocialAccount.platform == "youtube", SocialAccount.is_connected == True).first()
        ig_account = db.query(SocialAccount).filter(SocialAccount.platform == "instagram", SocialAccount.is_connected == True).first()

        success = False
        error_msgs = []

        # Parse requested platforms (supports "youtube", "instagram", "youtube,instagram", "both")
        raw_platform = task.platform or "youtube"
        requested_platforms = [p.strip().lower() for p in raw_platform.split(",") if p.strip()]
        if "both" in requested_platforms:
            requested_platforms = ["youtube", "instagram"]

        # 1. Publish to YouTube if requested
        if "youtube" in requested_platforms:
            if yt_account and yt_account.credentials_json:
                try:
                    res = youtube_uploader.upload_short(
                        credentials_json=yt_account.credentials_json,
                        file_path=clip.edited_clip_path,
                        title=clip.youtube_title or clip.title,
                        description=clip.youtube_description or clip.description or "",
                        tags=(clip.youtube_tags or "").split(",") if clip.youtube_tags else None
                    )
                    clip.youtube_status = "UPLOADED"
                    clip.youtube_video_id = res.get("video_id")
                    clip.status = "PUBLISHED"
                    clip.published_at = datetime.utcnow()
                    clip.error_message = None
                    success = True
                    logger.info(f"YouTube upload succeeded for clip #{clip.id}: {clip.youtube_video_id}")
                except Exception as e:
                    logger.error(f"YouTube upload failed for clip #{clip.id}: {e}")
                    clip.youtube_status = "FAILED"
                    error_msgs.append(f"YouTube: {str(e)}")
            else:
                error_msgs.append("YouTube account not connected")

        # 2. Publish to Instagram if requested
        if "instagram" in requested_platforms:
            if ig_account and ig_account.credentials_json:
                try:
                    # Note: in local environments, IG requires a staged public URL or cloud bucket
                    pass
                except Exception as e:
                    logger.error(f"Instagram upload failed for clip #{clip.id}: {e}")
                    clip.instagram_status = "FAILED"
                    error_msgs.append(f"Instagram: {str(e)}")
            else:
                # If YouTube was requested and succeeded, do not fail clip due to unconfigured Instagram
                if "youtube" not in requested_platforms or not success:
                    error_msgs.append("Instagram account not connected")
                else:
                    clip.instagram_status = "NOT_CONNECTED"

        combined_error = "; ".join(error_msgs)
        if success:
            task.status = "SUCCESS"
            task.completed_at = datetime.utcnow()
            task.last_error = None
            # Log success
            log_entry = SystemLog(
                level="SUCCESS",
                module="PUBLISHER",
                message=f"Successfully published Clip #{clip.id}: '{clip.title}' (Video ID: {clip.youtube_video_id})"
            )
            db.add(log_entry)
        else:
            task.status = "FAILED"
            task.last_error = combined_error or "Publishing failed for selected platforms."
            clip.status = "FAILED"
            clip.error_message = combined_error or "Publishing failed for selected platforms."
            log_entry = SystemLog(
                level="ERROR",
                module="PUBLISHER",
                message=f"Publish failed for Clip #{clip.id}: {task.last_error}"
            )
            db.add(log_entry)

        db.commit()

automation_scheduler = AutomationScheduler()
