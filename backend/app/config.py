import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR.parent / ".env")
load_dotenv()
STORAGE_DIR = BASE_DIR / "storage"
IMPORTS_DIR = STORAGE_DIR / "imports"
CLIPS_DIR = STORAGE_DIR / "clips"
TEMP_DIR = STORAGE_DIR / "temp"
ASSETS_DIR = BASE_DIR / "assets"
SFX_DIR = ASSETS_DIR / "sfx"

for d in [STORAGE_DIR, IMPORTS_DIR, CLIPS_DIR, TEMP_DIR, ASSETS_DIR, SFX_DIR]:
    d.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    APP_NAME: str = "ZyronByte AI Studio"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = f"sqlite:///{STORAGE_DIR / 'zyronbyte.db'}"
    
    # Paths
    STORAGE_PATH: Path = STORAGE_DIR
    IMPORTS_PATH: Path = IMPORTS_DIR
    CLIPS_PATH: Path = CLIPS_DIR
    TEMP_PATH: Path = TEMP_DIR
    SFX_PATH: Path = SFX_DIR
    
    # AI Config
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # Default Video Parameters
    DEFAULT_MIN_CLIP_DURATION: int = 30
    DEFAULT_MAX_CLIP_DURATION: int = 60
    DEFAULT_TARGET_WIDTH: int = 1080
    DEFAULT_TARGET_HEIGHT: int = 1920
    DEFAULT_FPS: int = 60
    
    # Social Auth Settings
    YOUTUBE_CLIENT_ID: str = os.getenv("YOUTUBE_CLIENT_ID", "")
    YOUTUBE_CLIENT_SECRET: str = os.getenv("YOUTUBE_CLIENT_SECRET", "")
    YOUTUBE_REDIRECT_URI: str = os.getenv("YOUTUBE_REDIRECT_URI", "http://localhost:8000/auth/youtube/callback")
    
    INSTAGRAM_ACCESS_TOKEN: str = os.getenv("INSTAGRAM_ACCESS_TOKEN", "")
    INSTAGRAM_ACCOUNT_ID: str = os.getenv("INSTAGRAM_ACCOUNT_ID", "")
    
    # Automation Defaults
    AUTO_PUBLISH_DEFAULT: bool = False  # Initially require manual approval as requested
    MAX_CLIPS_PER_VIDEO: int = 0  # 0 = Auto Dynamic Scaling based on video duration (19min -> 5-7, 100min -> 12-16)
    DAILY_PUBLISH_LIMIT: int = 3
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
