from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Video, Clip, PublishQueue, SocialAccount, AppSetting
from ..schemas import DashboardStats
from ..services.pipeline_runner import pipeline_runner

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_videos = db.query(Video).count()
    total_clips = db.query(Clip).count()
    approved_clips = db.query(Clip).filter(Clip.approved_for_publishing == True).count()
    pending_uploads = db.query(PublishQueue).filter(PublishQueue.status == "QUEUED").count()
    published_count = db.query(Clip).filter(Clip.status == "PUBLISHED").count()
    failed_uploads = db.query(PublishQueue).filter(PublishQueue.status == "FAILED").count()

    auto_pub_row = db.query(AppSetting).filter(AppSetting.key == "auto_publish").first()
    auto_publish_enabled = auto_pub_row.value.lower() == "true" if auto_pub_row else False

    pipeline_active = len(pipeline_runner.active_tasks) > 0

    yt_acc = db.query(SocialAccount).filter(SocialAccount.platform == "youtube", SocialAccount.is_connected == True).first()
    ig_acc = db.query(SocialAccount).filter(SocialAccount.platform == "instagram", SocialAccount.is_connected == True).first()

    return DashboardStats(
        total_videos=total_videos,
        total_clips=total_clips,
        approved_clips=approved_clips,
        pending_uploads=pending_uploads,
        published_count=published_count,
        failed_uploads=failed_uploads,
        auto_publish_enabled=auto_publish_enabled,
        pipeline_active=pipeline_active,
        youtube_connected=yt_acc is not None,
        instagram_connected=ig_acc is not None
    )
