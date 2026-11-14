from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import AppSetting
from ..schemas import SettingsUpdate
from ..config import settings
from ..services.gemini_ai import gemini_service

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("")
def get_settings(db: Session = Depends(get_db)):
    rows = db.query(AppSetting).all()
    settings_dict = {r.key: r.value for r in rows}

    gemini_key = settings_dict.get("gemini_api_key", settings.GEMINI_API_KEY)
    yt_cid = settings_dict.get("youtube_client_id", settings.YOUTUBE_CLIENT_ID)
    yt_sec = settings_dict.get("youtube_client_secret", settings.YOUTUBE_CLIENT_SECRET)
    ig_token = settings_dict.get("instagram_access_token", settings.INSTAGRAM_ACCESS_TOKEN)
    ig_acc = settings_dict.get("instagram_account_id", settings.INSTAGRAM_ACCOUNT_ID)

    auto_pub = settings_dict.get("auto_publish", "false").lower() == "true"
    clips_per_video = int(settings_dict.get("clips_per_video", settings.MAX_CLIPS_PER_VIDEO))
    daily_limit = int(settings_dict.get("daily_publish_limit", settings.DAILY_PUBLISH_LIMIT))
    min_dur = int(settings_dict.get("min_clip_duration", settings.DEFAULT_MIN_CLIP_DURATION))
    max_dur = int(settings_dict.get("max_clip_duration", settings.DEFAULT_MAX_CLIP_DURATION))
    crop_mode = settings_dict.get("default_crop_mode", "blur_fill")
    subs_style = settings_dict.get("subtitles_style", "gaming_neon")

    return {
        "gemini_api_key_configured": bool(gemini_key),
        "gemini_api_key_masked": f"{gemini_key[:4]}...{gemini_key[-4:]}" if len(gemini_key) > 8 else ("Set" if gemini_key else ""),
        "youtube_client_id_configured": bool(yt_cid),
        "youtube_client_id_masked": f"{yt_cid[:6]}...apps.googleusercontent.com" if len(yt_cid) > 10 else ("Set" if yt_cid else ""),
        "instagram_configured": bool(ig_token and ig_acc),
        "auto_publish": auto_pub,
        "clips_per_video": clips_per_video,
        "daily_publish_limit": daily_limit,
        "min_clip_duration": min_dur,
        "max_clip_duration": max_dur,
        "default_crop_mode": crop_mode,
        "subtitles_style": subs_style
    }

@router.post("")
def update_settings(update_data: SettingsUpdate, db: Session = Depends(get_db)):
    def set_val(k: str, v: str):
        row = db.query(AppSetting).filter(AppSetting.key == k).first()
        if not row:
            row = AppSetting(key=k, value=v)
            db.add(row)
        else:
            row.value = v

    if update_data.gemini_api_key is not None:
        set_val("gemini_api_key", update_data.gemini_api_key)
        settings.GEMINI_API_KEY = update_data.gemini_api_key
        gemini_service.api_key = update_data.gemini_api_key
        gemini_service._client = None
    if update_data.youtube_client_id is not None:
        set_val("youtube_client_id", update_data.youtube_client_id)
        settings.YOUTUBE_CLIENT_ID = update_data.youtube_client_id
    if update_data.youtube_client_secret is not None:
        set_val("youtube_client_secret", update_data.youtube_client_secret)
        settings.YOUTUBE_CLIENT_SECRET = update_data.youtube_client_secret
    if update_data.instagram_access_token is not None:
        set_val("instagram_access_token", update_data.instagram_access_token)
        settings.INSTAGRAM_ACCESS_TOKEN = update_data.instagram_access_token
    if update_data.instagram_account_id is not None:
        set_val("instagram_account_id", update_data.instagram_account_id)
        settings.INSTAGRAM_ACCOUNT_ID = update_data.instagram_account_id
    if update_data.auto_publish is not None:
        set_val("auto_publish", str(update_data.auto_publish).lower())
    if update_data.clips_per_video is not None:
        set_val("clips_per_video", str(update_data.clips_per_video))
    if update_data.daily_publish_limit is not None:
        set_val("daily_publish_limit", str(update_data.daily_publish_limit))
    if update_data.min_clip_duration is not None:
        set_val("min_clip_duration", str(update_data.min_clip_duration))
    if update_data.max_clip_duration is not None:
        set_val("max_clip_duration", str(update_data.max_clip_duration))
    if update_data.default_crop_mode is not None:
        set_val("default_crop_mode", update_data.default_crop_mode)
    if update_data.subtitles_style is not None:
        set_val("subtitles_style", update_data.subtitles_style)

    db.commit()
    return {"message": "Settings updated successfully"}
