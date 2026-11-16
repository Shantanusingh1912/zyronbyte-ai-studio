import os
import json
from pathlib import Path
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Clip, Video, PublishQueue, AppSetting, SystemLog
from ..schemas import ClipResponse, ClipUpdateMetadata, PublishRequest, ManualClipCreateRequest
from ..services.video_editor import video_editor
from ..services.quality_control import quality_validator
from ..services.youtube_uploader import youtube_uploader
from ..services.instagram_uploader import instagram_uploader
from ..services.gemini_ai import gemini_service
from ..config import settings

router = APIRouter(prefix="/clips", tags=["Clips"])

@router.get("", response_model=List[ClipResponse])
def get_clips(
    video_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Clip)
    if video_id:
        query = query.filter(Clip.video_id == video_id)
    if status:
        query = query.filter(Clip.status == status)
    if category:
        query = query.filter(Clip.highlight_category == category)
    
    clips = query.order_by(Clip.created_at.desc()).all()
    return clips

@router.get("/{clip_id}", response_model=ClipResponse)
def get_clip(clip_id: int, db: Session = Depends(get_db)):
    clip = db.query(Clip).filter(Clip.id == clip_id).first()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")
    return clip

@router.patch("/{clip_id}", response_model=ClipResponse)
def update_clip_metadata(clip_id: int, update_data: ClipUpdateMetadata, db: Session = Depends(get_db)):
    clip = db.query(Clip).filter(Clip.id == clip_id).first()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")

    if update_data.youtube_title is not None:
        clip.youtube_title = update_data.youtube_title
    if update_data.youtube_description is not None:
        clip.youtube_description = update_data.youtube_description
    if update_data.youtube_tags is not None:
        clip.youtube_tags = update_data.youtube_tags
    if update_data.instagram_caption is not None:
        clip.instagram_caption = update_data.instagram_caption
    if update_data.hashtags is not None:
        clip.hashtags = update_data.hashtags
    if update_data.game_title is not None:
        clip.game_title = update_data.game_title
    if update_data.crop_mode is not None:
        clip.crop_mode = update_data.crop_mode
    if update_data.subtitles_enabled is not None:
        clip.subtitles_enabled = update_data.subtitles_enabled
    if update_data.sfx_enabled is not None:
        clip.sfx_enabled = update_data.sfx_enabled
    if update_data.start_time is not None:
        clip.start_time = max(0.0, update_data.start_time)
    if update_data.end_time is not None:
        clip.end_time = max(clip.start_time + 1.0, update_data.end_time)
        clip.duration = round(clip.end_time - clip.start_time, 2)

    db.commit()
    db.refresh(clip)
    return clip

@router.post("/custom-cut", response_model=ClipResponse)
def create_custom_cut(req: ManualClipCreateRequest, db: Session = Depends(get_db)):
    """Allows creator to manually cut any moment from the full video into a 9:16 Short."""
    video = db.query(Video).filter(Video.id == req.video_id).first()
    if not video or not os.path.exists(video.file_path):
        raise HTTPException(status_code=404, detail="Master video not found")

    start_t = max(0.0, req.start_time)
    end_t = min(video.duration if video.duration > 0 else req.end_time, req.end_time)
    if end_t <= start_t:
        raise HTTPException(status_code=400, detail="End time must be greater than start time")

    duration = round(end_t - start_t, 2)
    resolved_game = req.game_title or video.game_title or "General Gaming"
    meta = gemini_service.generate_single_clip_metadata(
        clip_title=req.title or "Custom Gaming Cut",
        category=req.highlight_category or "action",
        game_title=resolved_game
    )

    clip = Clip(
        video_id=video.id,
        game_title=resolved_game,
        title=req.title or "Custom Gaming Cut",
        highlight_category=req.highlight_category or "action",
        start_time=start_t,
        end_time=end_t,
        duration=duration,
        crop_mode=req.crop_mode or "blur_fill",
        subtitles_enabled=req.subtitles_enabled,
        sfx_enabled=req.sfx_enabled,
        youtube_title=meta.get("youtube_title"),
        youtube_description=meta.get("youtube_description"),
        instagram_caption=meta.get("instagram_caption"),
        hashtags=",".join(meta.get("hashtags", [])) if isinstance(meta.get("hashtags"), list) else str(meta.get("hashtags", "")),
        keywords=",".join(meta.get("keywords", [])) if isinstance(meta.get("keywords"), list) else str(meta.get("keywords", "")),
        status="EDITING"
    )
    db.add(clip)
    db.commit()
    db.refresh(clip)

    transcript_words = []
    if video.transcript_json:
        try:
            t_data = json.loads(video.transcript_json)
            transcript_words = t_data.get("words", [])
        except Exception:
            pass

    render_result = video_editor.render_professional_short(
        source_video_path=video.file_path,
        start_time=clip.start_time,
        end_time=clip.end_time,
        clip_id=clip.id,
        crop_mode=clip.crop_mode,
        subtitles_enabled=clip.subtitles_enabled,
        sfx_enabled=clip.sfx_enabled,
        transcript_words=transcript_words
    )

    clip.edited_clip_path = render_result["edited_clip_path"]
    clip.thumbnail_path = render_result["thumbnail_path"]

    qc_report = quality_validator.inspect_clip(clip.edited_clip_path)
    clip.qc_report_json = json.dumps(qc_report)
    clip.qc_passed = qc_report["passed"]
    clip.status = "READY_FOR_APPROVAL" if clip.qc_passed else "QC_FAILED"

    db.commit()
    db.refresh(clip)
    return clip

@router.post("/{clip_id}/approve", response_model=ClipResponse)
def approve_clip(clip_id: int, db: Session = Depends(get_db)):
    clip = db.query(Clip).filter(Clip.id == clip_id).first()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")

    clip.approved_for_publishing = True
    clip.status = "APPROVED"
    clip.error_message = None
    db.commit()
    db.refresh(clip)
    return clip

@router.post("/{clip_id}/reject", response_model=ClipResponse)
def reject_clip(clip_id: int, db: Session = Depends(get_db)):
    clip = db.query(Clip).filter(Clip.id == clip_id).first()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")

    clip.approved_for_publishing = False
    clip.status = "REJECTED"
    db.commit()
    db.refresh(clip)
    return clip

@router.post("/{clip_id}/rerender", response_model=ClipResponse)
def rerender_clip(clip_id: int, db: Session = Depends(get_db)):
    """Re-renders clip with current crop mode and subtitle configuration."""
    clip = db.query(Clip).filter(Clip.id == clip_id).first()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")
    video = clip.video
    if not video or not os.path.exists(video.file_path):
        raise HTTPException(status_code=400, detail="Master video file not found")

    clip.status = "EDITING"
    db.commit()

    transcript_words = []
    if video.transcript_json:
        try:
            t_data = json.loads(video.transcript_json)
            transcript_words = t_data.get("words", [])
        except Exception:
            pass

    render_result = video_editor.render_professional_short(
        source_video_path=video.file_path,
        start_time=clip.start_time,
        end_time=clip.end_time,
        clip_id=clip.id,
        crop_mode=clip.crop_mode,
        subtitles_enabled=clip.subtitles_enabled,
        sfx_enabled=clip.sfx_enabled,
        transcript_words=transcript_words
    )

    clip.edited_clip_path = render_result["edited_clip_path"]
    clip.thumbnail_path = render_result["thumbnail_path"]

    # Run QC
    qc_report = quality_validator.inspect_clip(clip.edited_clip_path)
    clip.qc_report_json = json.dumps(qc_report)
    clip.qc_passed = qc_report["passed"]
    clip.status = "READY_FOR_APPROVAL" if clip.qc_passed else "QC_FAILED"

    db.commit()
    db.refresh(clip)
    return clip

@router.post("/{clip_id}/publish-now")
def publish_clip_now(clip_id: int, req: PublishRequest, db: Session = Depends(get_db)):
    """Publishes clip immediately to specified platforms."""
    clip = db.query(Clip).filter(Clip.id == clip_id).first()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")
    if not clip.edited_clip_path or not os.path.exists(clip.edited_clip_path):
        raise HTTPException(status_code=400, detail="Edited video clip file does not exist")

    platform_str = ",".join(req.platforms) if req.platforms else "youtube"

    # Add priority task to queue with scheduled_time = now
    task = PublishQueue(
        clip_id=clip.id,
        platform=platform_str,
        scheduled_time=datetime.utcnow(),
        status="QUEUED"
    )
    db.add(task)
    clip.status = "SCHEDULED"
    clip.approved_for_publishing = True
    clip.error_message = None
    db.commit()
    db.refresh(task)

    # Process immediately instead of waiting for 30s background poll
    try:
        from ..services.scheduler_service import scheduler_service
        scheduler_service._process_single_publish_task(db, task)
        db.refresh(clip)
    except Exception as e:
        logger.error(f"Error during immediate publishing execution: {e}")

    return {
        "message": "Publishing task executed",
        "clip_id": clip_id,
        "status": clip.status,
        "youtube_video_id": clip.youtube_video_id,
        "youtube_status": clip.youtube_status
    }

@router.post("/{clip_id}/schedule")
def schedule_clip(clip_id: int, req: PublishRequest, db: Session = Depends(get_db)):
    """Schedules a clip for a future publishing timestamp."""
    clip = db.query(Clip).filter(Clip.id == clip_id).first()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")
    if not req.schedule_time:
        raise HTTPException(status_code=400, detail="schedule_time is required")

    task = PublishQueue(
        clip_id=clip.id,
        platform=",".join(req.platforms),
        scheduled_time=req.schedule_time,
        status="QUEUED"
    )
    db.add(task)
    clip.scheduled_time = req.schedule_time
    clip.status = "SCHEDULED"
    clip.approved_for_publishing = True
    db.commit()

    return {"message": "Clip scheduled successfully", "scheduled_time": req.schedule_time}

@router.post("/{clip_id}/regenerate-metadata", response_model=ClipResponse)
def regenerate_clip_metadata(
    clip_id: int, 
    game_title: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Regenerates YouTube title, description, Instagram caption, and hashtags tailored to a specific game."""
    clip = db.query(Clip).filter(Clip.id == clip_id).first()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")

    video = clip.video
    resolved_game = game_title or clip.game_title or (video.game_title if video else "General Gaming")

    meta = gemini_service.generate_single_clip_metadata(
        clip_title=clip.title,
        category=clip.highlight_category or "action",
        game_title=resolved_game
    )

    clip.game_title = resolved_game
    clip.youtube_title = meta.get("youtube_title")
    clip.youtube_description = meta.get("youtube_description")
    clip.instagram_caption = meta.get("instagram_caption")
    if meta.get("hashtags"):
        clip.hashtags = ",".join(meta["hashtags"]) if isinstance(meta["hashtags"], list) else str(meta["hashtags"])
    if meta.get("keywords"):
        clip.keywords = ",".join(meta["keywords"]) if isinstance(meta["keywords"], list) else str(meta["keywords"])

    db.commit()
    db.refresh(clip)
    return clip

@router.get("/{clip_id}/stream")
def stream_clip_video(clip_id: int, db: Session = Depends(get_db)):
    """Streams the 9:16 vertical video clip to the web browser."""
    clip = db.query(Clip).filter(Clip.id == clip_id).first()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")

    target_file = clip.edited_clip_path or clip.raw_clip_path
    if not target_file or not os.path.exists(target_file):
        raise HTTPException(status_code=404, detail="Video file not found on disk")

    return FileResponse(target_file, media_type="video/mp4", filename=f"zyronbyte_short_{clip.id}.mp4")

@router.get("/{clip_id}/thumbnail")
def stream_clip_thumbnail(clip_id: int, db: Session = Depends(get_db)):
    """Streams the thumbnail image for the clip."""
    clip = db.query(Clip).filter(Clip.id == clip_id).first()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")

    if clip.thumbnail_path and os.path.exists(clip.thumbnail_path):
        return FileResponse(clip.thumbnail_path, media_type="image/jpeg")
    
    raise HTTPException(status_code=404, detail="Thumbnail not generated")
