import os
import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Video, Clip, SystemLog
from ..schemas import VideoImportRequest, VideoBatchImportRequest, VideoResponse
from ..services.downloader import downloader
from ..services.pipeline_runner import pipeline_runner
from ..services.game_detector import game_detector
from ..config import settings

router = APIRouter(prefix="/videos", tags=["Videos"])

@router.get("", response_model=List[VideoResponse])
def get_videos(db: Session = Depends(get_db)):
    videos = db.query(Video).order_by(Video.created_at.desc()).all()
    results = []
    for v in videos:
        clips_cnt = db.query(Clip).filter(Clip.video_id == v.id).count()
        results.append(VideoResponse(
            id=v.id,
            title=v.title,
            game_title=v.game_title,
            source_type=v.source_type,
            source_url=v.source_url,
            file_path=v.file_path,
            duration=v.duration,
            width=v.width,
            height=v.height,
            fps=v.fps,
            status=v.status,
            progress=v.progress,
            current_step=v.current_step,
            error_message=v.error_message,
            created_at=v.created_at,
            clips_count=clips_cnt
        ))
    return results

@router.get("/supported-games")
def get_supported_games():
    """Returns all supported games and options for creator dropdowns."""
    return game_detector.get_supported_games()

@router.get("/fetch-info")
def fetch_video_info(url: str):
    """Fetches video metadata (title, duration, thumbnail, author, detected game) from any video URL."""
    if not url:
        raise HTTPException(status_code=400, detail="url parameter is required")
    info = downloader.fetch_video_info(url)
    return info

@router.get("/{video_id}", response_model=VideoResponse)
def get_video(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    clips_cnt = db.query(Clip).filter(Clip.video_id == video.id).count()
    return VideoResponse(
        id=video.id,
        title=video.title,
        game_title=video.game_title,
        source_type=video.source_type,
        source_url=video.source_url,
        file_path=video.file_path,
        duration=video.duration,
        width=video.width,
        height=video.height,
        fps=video.fps,
        status=video.status,
        progress=video.progress,
        current_step=video.current_step,
        error_message=video.error_message,
        created_at=video.created_at,
        clips_count=clips_cnt
    )

@router.post("/import", response_model=VideoResponse)
def import_video(req: VideoImportRequest, db: Session = Depends(get_db)):
    """Imports video from any video URL (YouTube, Twitch, Kick, Twitter, etc.) or a local path."""
    is_url = req.source_url or req.source_type in ("youtube", "url", "twitch", "web")
    
    if is_url:
        if not req.source_url:
            raise HTTPException(status_code=400, detail="source_url is required for URL video imports")
        
        # Pre-fetch video metadata if title wasn't provided
        final_title = req.title
        est_duration = 0.0
        detected_game = req.game_title
        if not final_title or not detected_game or detected_game.lower() in ("auto", "auto-detect"):
            try:
                info = downloader.fetch_video_info(req.source_url)
                if not final_title:
                    final_title = info.get("title") or "Online Gaming Video"
                if not detected_game or detected_game.lower() in ("auto", "auto-detect"):
                    detected_game = info.get("detected_game")
                est_duration = float(info.get("duration") or 0.0)
            except Exception:
                if not final_title:
                    final_title = "Online Gaming Video"

        if not detected_game or detected_game.lower() in ("auto", "auto-detect"):
            detected_game = game_detector.detect_game(final_title)["display_name"]

        video = Video(
            title=final_title or "Online Gaming Video",
            game_title=detected_game,
            source_type="url",
            source_url=req.source_url,
            file_path="",
            duration=est_duration,
            status="PENDING",
            current_step="Queued for download & AI clipping"
        )
        db.add(video)
        db.commit()
        db.refresh(video)

        if req.auto_start:
            pipeline_runner.run_video_pipeline_async(video.id)

        return VideoResponse(
            id=video.id,
            title=video.title,
            game_title=video.game_title,
            source_type=video.source_type,
            source_url=video.source_url,
            file_path=video.file_path,
            duration=video.duration,
            width=video.width,
            height=video.height,
            fps=video.fps,
            status=video.status,
            progress=video.progress,
            current_step=video.current_step,
            error_message=video.error_message,
            created_at=video.created_at,
            clips_count=0
        )
    else:
        # Local file path
        if not req.local_file_path or not os.path.exists(req.local_file_path):
            raise HTTPException(status_code=400, detail=f"Local file does not exist: {req.local_file_path}")
        
        try:
            imported = downloader.import_local_file(req.local_file_path, title=req.title)
            final_game = req.game_title
            if not final_game or final_game.lower() in ("auto", "auto-detect"):
                final_game = imported.get("detected_game") or game_detector.detect_game(imported["title"])["display_name"]

            video = Video(
                title=imported["title"],
                game_title=final_game,
                source_type="local",
                file_path=imported["file_path"],
                duration=imported["duration"],
                width=imported["width"],
                height=imported["height"],
                fps=imported["fps"],
                status="PENDING",
                current_step="Imported and ready for automation"
            )
            db.add(video)
            db.commit()
            db.refresh(video)

            if req.auto_start:
                pipeline_runner.run_video_pipeline_async(video.id)

            return VideoResponse(
                id=video.id,
                title=video.title,
                game_title=video.game_title,
                source_type=video.source_type,
                source_url=video.source_url,
                file_path=video.file_path,
                duration=video.duration,
                width=video.width,
                height=video.height,
                fps=video.fps,
                status=video.status,
                progress=video.progress,
                current_step=video.current_step,
                error_message=video.error_message,
                created_at=video.created_at,
                clips_count=0
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to import local video: {e}")

@router.post("/upload", response_model=VideoResponse)
async def upload_local_file(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    game_title: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Directly uploads a local gaming video from the browser dashboard."""
    dest_path = settings.IMPORTS_PATH / file.filename
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    meta = downloader.get_video_metadata(str(dest_path))
    v_title = title or Path(file.filename).stem
    v_game = game_title
    if not v_game or v_game.lower() in ("auto", "auto-detect"):
        v_game = game_detector.detect_game(v_title)["display_name"]

    video = Video(
        title=v_title,
        game_title=v_game,
        source_type="local",
        file_path=str(dest_path),
        duration=meta["duration"],
        width=meta["width"],
        height=meta["height"],
        fps=meta["fps"],
        status="PENDING",
        current_step="Uploaded and ready"
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    return VideoResponse(
        id=video.id,
        title=video.title,
        game_title=video.game_title,
        source_type=video.source_type,
        source_url=video.source_url,
        file_path=video.file_path,
        duration=video.duration,
        width=video.width,
        height=video.height,
        fps=video.fps,
        status=video.status,
        progress=video.progress,
        current_step=video.current_step,
        error_message=video.error_message,
        created_at=video.created_at,
        clips_count=0
    )

@router.post("/batch", response_model=List[VideoResponse])
def batch_import(req: VideoBatchImportRequest, db: Session = Depends(get_db)):
    """Imports multiple gaming videos at once for batch pipeline processing."""
    created = []
    for item in req.items:
        res = import_video(item, db)
        created.append(res)
    return created

@router.post("/{video_id}/start")
def start_pipeline(video_id: int, db: Session = Depends(get_db)):
    """Triggers the full automated clipping, editing, and metadata pipeline."""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    pipeline_runner.run_video_pipeline_async(video_id)
    return {"message": "Automation pipeline started", "video_id": video_id}

@router.delete("/{video_id}")
def delete_video(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Remove files if needed
    if video.file_path and os.path.exists(video.file_path):
        try:
            os.remove(video.file_path)
        except Exception:
            pass

    db.delete(video)
    db.commit()
    return {"message": "Video and clips deleted successfully"}
