from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class VideoImportRequest(BaseModel):
    title: Optional[str] = None
    game_title: Optional[str] = None
    source_type: str = "url"  # "url", "youtube", "local"
    source_url: Optional[str] = None
    local_file_path: Optional[str] = None
    auto_start: Optional[bool] = False

class VideoBatchImportRequest(BaseModel):
    items: List[VideoImportRequest]

class VideoResponse(BaseModel):
    id: int
    title: str
    game_title: Optional[str] = None
    source_type: str
    source_url: Optional[str] = None
    file_path: str
    duration: float
    width: int
    height: int
    fps: float
    status: str
    progress: float
    current_step: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    clips_count: Optional[int] = 0

    class Config:
        from_attributes = True

class ClipUpdateMetadata(BaseModel):
    youtube_title: Optional[str] = None
    youtube_description: Optional[str] = None
    youtube_tags: Optional[str] = None
    instagram_caption: Optional[str] = None
    hashtags: Optional[str] = None
    game_title: Optional[str] = None
    crop_mode: Optional[str] = None
    subtitles_enabled: Optional[bool] = None
    sfx_enabled: Optional[bool] = None
    start_time: Optional[float] = None
    end_time: Optional[float] = None

class ManualClipCreateRequest(BaseModel):
    video_id: int
    title: Optional[str] = "Custom Gaming Cut"
    game_title: Optional[str] = None
    highlight_category: Optional[str] = "action"
    start_time: float
    end_time: float
    crop_mode: Optional[str] = "blur_fill"
    subtitles_enabled: Optional[bool] = True
    sfx_enabled: Optional[bool] = True

class ClipResponse(BaseModel):
    id: int
    video_id: int
    title: str
    game_title: Optional[str] = None
    highlight_category: str
    description: Optional[str] = None
    excitement_score: int
    start_time: float
    end_time: float
    duration: float
    raw_clip_path: Optional[str] = None
    edited_clip_path: Optional[str] = None
    thumbnail_path: Optional[str] = None
    aspect_ratio: str
    crop_mode: str
    subtitles_enabled: bool
    sfx_enabled: bool
    youtube_title: Optional[str] = None
    youtube_description: Optional[str] = None
    youtube_tags: Optional[str] = None
    instagram_caption: Optional[str] = None
    hashtags: Optional[str] = None
    keywords: Optional[str] = None
    qc_passed: bool
    qc_report_json: Optional[str] = None
    status: str
    approved_for_publishing: bool
    youtube_video_id: Optional[str] = None
    youtube_status: str
    instagram_media_id: Optional[str] = None
    instagram_status: str
    scheduled_time: Optional[datetime] = None
    published_at: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class QualityControlReport(BaseModel):
    passed: bool
    resolution_valid: bool
    aspect_ratio: str
    duration_valid: bool
    duration: float
    audio_valid: bool
    has_audio: bool
    max_volume_db: float
    is_silent: bool
    black_screen_detected: bool
    file_integrity_valid: bool
    subtitle_sync_valid: bool
    issues: List[str]
    score: int  # 0 to 100

class PublishRequest(BaseModel):
    platforms: List[str] = ["youtube"]  # ["youtube", "instagram"]
    privacy_status: str = "public"  # "public", "unlisted", "private"
    schedule_time: Optional[datetime] = None

class SocialAccountResponse(BaseModel):
    platform: str
    account_name: str
    channel_title: Optional[str] = None
    is_connected: bool
    updated_at: Optional[datetime] = None

class SettingsUpdate(BaseModel):
    gemini_api_key: Optional[str] = None
    youtube_client_id: Optional[str] = None
    youtube_client_secret: Optional[str] = None
    instagram_access_token: Optional[str] = None
    instagram_account_id: Optional[str] = None
    auto_publish: Optional[bool] = None
    clips_per_video: Optional[int] = None
    daily_publish_limit: Optional[int] = None
    min_clip_duration: Optional[int] = None
    max_clip_duration: Optional[int] = None
    default_crop_mode: Optional[str] = None
    subtitles_style: Optional[str] = None

class DashboardStats(BaseModel):
    total_videos: int
    total_clips: int
    approved_clips: int
    pending_uploads: int
    published_count: int
    failed_uploads: int
    auto_publish_enabled: bool
    pipeline_active: bool
    youtube_connected: bool
    instagram_connected: bool
