import os
import json
import shutil
import subprocess
import logging
from pathlib import Path
from typing import Dict, Any, Optional, Callable
import yt_dlp
from ..config import settings

logger = logging.getLogger("zyronbyte.downloader")

class VideoDownloader:
    """
    Handles downloading videos from URLs (YouTube, Twitch, Kick, Twitter, generic web)
    and importing local gaming footage.
    """

    @staticmethod
    def get_video_metadata(file_path: str) -> Dict[str, Any]:
        """Uses ffprobe to extract exact video metadata (duration, resolution, fps, audio)."""
        cmd = [
            "ffprobe",
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            file_path
        ]
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if result.returncode != 0:
            raise RuntimeError(f"FFprobe failed to inspect file: {result.stderr}")
        
        data = json.loads(result.stdout)
        video_stream = next((s for s in data.get("streams", []) if s.get("codec_type") == "video"), None)
        audio_stream = next((s for s in data.get("streams", []) if s.get("codec_type") == "audio"), None)
        
        duration = float(data.get("format", {}).get("duration", 0.0))
        if duration == 0.0 and video_stream:
            duration = float(video_stream.get("duration", 0.0))
            
        width = int(video_stream.get("width", 1920)) if video_stream else 1920
        height = int(video_stream.get("height", 1080)) if video_stream else 1080
        
        # Calculate FPS
        fps = 30.0
        if video_stream and "r_frame_rate" in video_stream:
            try:
                num, den = video_stream["r_frame_rate"].split('/')
                fps = round(float(num) / float(den), 2)
            except Exception:
                fps = 30.0

        return {
            "duration": duration,
            "width": width,
            "height": height,
            "fps": fps,
            "has_audio": audio_stream is not None,
            "video_codec": video_stream.get("codec_name") if video_stream else None,
            "audio_codec": audio_stream.get("codec_name") if audio_stream else None
        }

    @staticmethod
    def fetch_video_info(url: str) -> Dict[str, Any]:
        """Extracts title, duration, thumbnail, and author from any video link without downloading."""
        ydl_opts = {
            'quiet': True,
            'skip_download': True,
            'no_warnings': True,
        }
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                return {
                    "title": info.get("title", "Online Gaming Video"),
                    "duration": float(info.get("duration") or 0.0),
                    "thumbnail": info.get("thumbnail"),
                    "uploader": info.get("uploader") or info.get("channel", "Creator"),
                    "webpage_url": info.get("webpage_url", url),
                    "extractor": info.get("extractor", "generic")
                }
        except Exception as e:
            logger.warning(f"Could not pre-fetch video info for {url}: {e}")
            return {
                "title": "Online Gaming Video",
                "duration": 0.0,
                "thumbnail": None,
                "uploader": "Online Creator",
                "webpage_url": url,
                "extractor": "generic"
            }

    @staticmethod
    def download_video_from_url(
        url: str,
        output_dir: Optional[Path] = None,
        progress_hook: Optional[Callable] = None
    ) -> Dict[str, Any]:
        """
        Downloads a video or livestream recording from YouTube, Twitch, Kick, Twitter, or web URLs using yt-dlp.
        Merges best video and audio streams to MP4.
        """
        if output_dir is None:
            output_dir = settings.IMPORTS_PATH
        output_dir.mkdir(parents=True, exist_ok=True)
        
        ydl_opts = {
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best[ext=mp4]/best',
            'outtmpl': str(output_dir / '%(id)s_%(title).50s.%(ext)s'),
            'merge_output_format': 'mp4',
            'quiet': True,
            'no_warnings': True,
        }
        
        if progress_hook:
            ydl_opts['progress_hooks'] = [progress_hook]

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = Path(ydl.prepare_filename(info))
            
            # Resolve actual file path on disk (handles Windows sanitization & merge extension)
            if not filename.exists():
                filename = filename.with_suffix('.mp4')
            if not filename.exists():
                for req in info.get('requested_downloads', []):
                    f_p = req.get('filepath') or req.get('_filename')
                    if f_p and os.path.exists(f_p):
                        filename = Path(f_p)
                        break
            if not filename.exists():
                vid_id = info.get('id', '')
                for candidate in output_dir.glob(f"*{vid_id}*"):
                    if candidate.is_file() and candidate.suffix.lower() in ('.mp4', '.mkv', '.webm'):
                        filename = candidate
                        break

        meta = VideoDownloader.get_video_metadata(str(filename))
        return {
            "title": info.get("title", "Online Gaming Video"),
            "file_path": str(filename),
            "source_url": url,
            "duration": meta["duration"],
            "width": meta["width"],
            "height": meta["height"],
            "fps": meta["fps"]
        }

    # Backward compatibility alias
    download_youtube_video = download_video_from_url

    @staticmethod
    def import_local_file(file_path: str, title: Optional[str] = None) -> Dict[str, Any]:
        """Validates and imports a local video file into the project workspace."""
        src_path = Path(file_path)
        if not src_path.exists():
            raise FileNotFoundError(f"Source file not found at: {file_path}")

        meta = VideoDownloader.get_video_metadata(str(src_path))
        
        video_title = title or src_path.stem
        dest_filename = f"{src_path.stem}_{int(meta['duration'])}s{src_path.suffix}"
        dest_path = settings.IMPORTS_PATH / dest_filename
        
        if not dest_path.exists() or dest_path.resolve() != src_path.resolve():
            shutil.copy2(src_path, dest_path)
        
        return {
            "title": video_title,
            "file_path": str(dest_path),
            "source_url": None,
            "duration": meta["duration"],
            "width": meta["width"],
            "height": meta["height"],
            "fps": meta["fps"]
        }

downloader = VideoDownloader()
