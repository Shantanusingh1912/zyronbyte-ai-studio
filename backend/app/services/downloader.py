import os
import json
import shutil
import subprocess
from pathlib import Path
from typing import Dict, Any, Optional, Callable
import yt_dlp
from ..config import settings

class VideoDownloader:
    """Handles downloading YouTube videos, livestreams, and importing local gaming clips."""

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
    def download_youtube_video(url: str, output_dir: Optional[Path] = None, progress_hook: Optional[Callable] = None) -> Dict[str, Any]:
        """Downloads a video or livestream recording using yt-dlp."""
        if output_dir is None:
            output_dir = settings.IMPORTS_PATH
        output_dir.mkdir(parents=True, exist_ok=True)
        
        ydl_opts = {
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            'outtmpl': str(output_dir / '%(id)s_%(title).50s.%(ext)s'),
            'merge_output_format': 'mp4',
            'quiet': False,
            'no_warnings': True,
        }
        
        if progress_hook:
            ydl_opts['progress_hooks'] = [progress_hook]

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            if not filename.endswith('.mp4'):
                filename = Path(filename).with_suffix('.mp4')

        meta = VideoDownloader.get_video_metadata(str(filename))
        return {
            "title": info.get("title", "YouTube Gaming Video"),
            "file_path": str(filename),
            "source_url": url,
            "duration": meta["duration"],
            "width": meta["width"],
            "height": meta["height"],
            "fps": meta["fps"]
        }

    @staticmethod
    def import_local_file(file_path: str, title: Optional[str] = None) -> Dict[str, Any]:
        """Validates and imports a local video file into the project workspace."""
        src_path = Path(file_path)
        if not src_path.exists():
            raise FileNotFoundError(f"Source file not found at: {file_path}")

        meta = VideoDownloader.get_video_metadata(str(src_path))
        
        video_title = title or src_path.stem
        # Copy to imports folder to avoid touching user's raw master if editing in-place
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
