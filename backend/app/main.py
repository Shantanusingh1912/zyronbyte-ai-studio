import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse
from .config import settings
from .database import init_db, get_db
from .services.scheduler_service import automation_scheduler
from .services.sfx_manager import sfx_manager
from .services.pipeline_runner import pipeline_runner
from .api import videos, clips, pipeline, social, settings as app_settings, logs, dashboard

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("zyronbyte.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing ZyronByte AI Studio Database...")
    init_db()
    logger.info("Synthesizing audio assets & SFX...")
    sfx_manager.ensure_default_sfx()
    logger.info("Starting Automation Scheduler...")
    automation_scheduler.start()
    logger.info("Checking for interrupted jobs to auto-resume...")
    pipeline_runner.resume_stale_jobs()
    yield
    # Shutdown
    logger.info("Stopping Automation Scheduler...")
    if automation_scheduler.scheduler.running:
        automation_scheduler.scheduler.shutdown()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# Enable CORS for React/Vite development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(dashboard.router, prefix="/api")
app.include_router(videos.router, prefix="/api")
app.include_router(clips.router, prefix="/api")
app.include_router(pipeline.router, prefix="/api")
app.include_router(social.router, prefix="/api")
app.include_router(app_settings.router, prefix="/api")
app.include_router(logs.router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }

# Google OAuth Callback Aliases matching client_secret.json redirect_uris
@app.get("/auth/youtube/callback")
@app.get("/api/auth/youtube/callback")
@app.get("/oauth2callback")
@app.get("/callback")
def google_oauth_callback_aliases(code: str = "", error: str = "", db = Depends(get_db)):
    if error:
        logger.error(f"Google OAuth reported error: {error}")
        return RedirectResponse(url=f"/?oauth_error={error}")
    from .api.social import youtube_callback
    return youtube_callback(code=code, db=db)

# Mount Frontend Built Static Files
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = frontend_dist / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")
