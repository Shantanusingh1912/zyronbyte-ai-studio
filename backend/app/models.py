import datetime
import json
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from .database import Base

class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    source_type = Column(String(50), default="local")  # "local", "youtube", "livestream"
    source_url = Column(Text, nullable=True)
    file_path = Column(Text, nullable=False)
    duration = Column(Float, default=0.0)
    width = Column(Integer, default=1920)
    height = Column(Integer, default=1080)
    fps = Column(Float, default=30.0)
    
    # Status: PENDING, DOWNLOADING, TRANSCRIBING, ANALYZING, CLIPPING, EDITING, COMPLETED, FAILED
    status = Column(String(50), default="PENDING")
    progress = Column(Float, default=0.0)  # 0 to 100
    current_step = Column(String(100), default="Initialized")
    error_message = Column(Text, nullable=True)
    
    transcript_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    clips = relationship("Clip", back_populates="video", cascade="all, delete-orphan")


class Clip(Base):
    __tablename__ = "clips"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False)
    
    # Highlight detection info
    title = Column(String(255), nullable=False)
    highlight_category = Column(String(50), default="action")  # "kill", "clutch", "funny", "reaction", "action", "unexpected"
    description = Column(Text, nullable=True)
    excitement_score = Column(Integer, default=85)  # 1-100
    
    start_time = Column(Float, nullable=False)
    end_time = Column(Float, nullable=False)
    duration = Column(Float, nullable=False)
    
    # File paths
    raw_clip_path = Column(Text, nullable=True)
    edited_clip_path = Column(Text, nullable=True)
    thumbnail_path = Column(Text, nullable=True)
    
    # Style & Editing
    aspect_ratio = Column(String(20), default="9:16")
    crop_mode = Column(String(50), default="blur_fill")  # "blur_fill", "stacked", "crop_center"
    subtitles_enabled = Column(Boolean, default=True)
    sfx_enabled = Column(Boolean, default=True)
    
    # AI Metadata
    youtube_title = Column(String(100), nullable=True)
    youtube_description = Column(Text, nullable=True)
    youtube_tags = Column(Text, nullable=True)  # JSON or comma-separated
    instagram_caption = Column(Text, nullable=True)
    hashtags = Column(Text, nullable=True)
    keywords = Column(Text, nullable=True)
    
    # Quality Control
    qc_passed = Column(Boolean, default=False)
    qc_report_json = Column(Text, nullable=True)
    
    # Status & Approval
    # Status: PENDING_EDIT, EDITING, QC_PENDING, QC_PASSED, QC_FAILED, READY_FOR_APPROVAL, APPROVED, REJECTED, SCHEDULED, PUBLISHING, PUBLISHED, FAILED
    status = Column(String(50), default="PENDING_EDIT")
    approved_for_publishing = Column(Boolean, default=False)
    
    # Social Media Publishing tracking
    youtube_video_id = Column(String(100), nullable=True)
    youtube_status = Column(String(50), default="NOT_UPLOADED")  # NOT_UPLOADED, UPLOADED, FAILED
    instagram_media_id = Column(String(100), nullable=True)
    instagram_status = Column(String(50), default="NOT_UPLOADED")
    
    scheduled_time = Column(DateTime, nullable=True)
    published_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    video = relationship("Video", back_populates="clips")
    publish_tasks = relationship("PublishQueue", back_populates="clip", cascade="all, delete-orphan")


class PublishQueue(Base):
    __tablename__ = "publish_queue"

    id = Column(Integer, primary_key=True, index=True)
    clip_id = Column(Integer, ForeignKey("clips.id"), nullable=False)
    platform = Column(String(50), default="youtube")  # "youtube", "instagram", "both"
    scheduled_time = Column(DateTime, nullable=False)
    status = Column(String(50), default="QUEUED")  # "QUEUED", "PROCESSING", "SUCCESS", "FAILED"
    attempts = Column(Integer, default=0)
    last_error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    clip = relationship("Clip", back_populates="publish_tasks")


class SocialAccount(Base):
    __tablename__ = "social_accounts"

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String(50), unique=True, nullable=False)  # "youtube", "instagram"
    account_name = Column(String(100), default="ZyronByteYT")
    channel_id = Column(String(100), nullable=True)
    channel_title = Column(String(100), nullable=True)
    is_connected = Column(Boolean, default=False)
    credentials_json = Column(Text, nullable=True)
    token_expiry = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class AppSetting(Base):
    __tablename__ = "app_settings"

    key = Column(String(100), primary_key=True, index=True)
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class SystemLog(Base):
    __tablename__ = "system_logs"

    id = Column(Integer, primary_key=True, index=True)
    level = Column(String(20), default="INFO")  # DEBUG, INFO, WARNING, ERROR, SUCCESS
    module = Column(String(50), default="SYSTEM")
    message = Column(Text, nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
