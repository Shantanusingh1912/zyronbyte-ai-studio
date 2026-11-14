from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Video, PublishQueue
from ..services.pipeline_runner import pipeline_runner
from ..services.scheduler_service import automation_scheduler

router = APIRouter(prefix="/pipeline", tags=["Pipeline"])

@router.get("/status")
def get_pipeline_status(db: Session = Depends(get_db)):
    active_videos = db.query(Video).filter(Video.status.in_(["DOWNLOADING", "TRANSCRIBING", "ANALYZING", "EDITING", "PROCESSING"])).all()
    pending_queue = db.query(PublishQueue).filter(PublishQueue.status == "QUEUED").count()

    return {
        "is_scheduler_running": automation_scheduler.is_running,
        "is_paused": automation_scheduler.is_paused or pipeline_runner.paused,
        "active_jobs_count": len(pipeline_runner.active_tasks),
        "pending_publish_queue_count": pending_queue,
        "processing_videos": [
            {
                "id": v.id,
                "title": v.title,
                "status": v.status,
                "progress": v.progress,
                "current_step": v.current_step
            } for v in active_videos
        ]
    }

@router.post("/pause")
def pause_pipeline():
    pipeline_runner.paused = True
    automation_scheduler.pause()
    return {"message": "Automation pipeline and scheduler paused"}

@router.post("/resume")
def resume_pipeline():
    pipeline_runner.paused = False
    automation_scheduler.resume()
    return {"message": "Automation pipeline and scheduler resumed"}
