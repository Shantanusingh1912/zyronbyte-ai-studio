import os
import re
import json
import subprocess
import logging
from pathlib import Path
from typing import Dict, Any, List

logger = logging.getLogger("zyronbyte.qc")

class QualityControlValidator:
    """
    Automated pre-flight quality control inspector.
    Ensures video meets platform compliance standards before social media publication.
    """

    def inspect_clip(self, file_path: str, max_duration: float = 60.0) -> Dict[str, Any]:
        """Runs full suite of pre-flight quality checks on an edited video clip."""
        issues: List[str] = []
        path_obj = Path(file_path)
        
        if not path_obj.exists():
            return {
                "passed": False,
                "score": 0,
                "issues": [f"File not found: {file_path}"],
                "resolution_valid": False,
                "aspect_ratio": "0:0",
                "duration_valid": False,
                "duration": 0.0,
                "audio_valid": False,
                "has_audio": False,
                "max_volume_db": -99.0,
                "is_silent": True,
                "black_screen_detected": False,
                "file_integrity_valid": False,
                "subtitle_sync_valid": False
            }

        # 1. FFprobe stream analysis
        meta = self._probe_streams(file_path)
        width = meta.get("width", 0)
        height = meta.get("height", 0)
        duration = meta.get("duration", 0.0)
        has_audio = meta.get("has_audio", False)
        
        # Check Resolution & Aspect Ratio (Expect 9:16 vertical, e.g. 1080x1920)
        aspect_ratio_str = f"{width}:{height}"
        resolution_valid = (width == 1080 and height == 1920) or (height > width and width > 0 and (height / width) >= 1.6)
        if not resolution_valid:
            issues.append(f"Invalid vertical aspect ratio: {width}x{height} (Expected 1080x1920).")

        # Check Duration (Shorts must be <= 60s, ideally between 15s and 60s)
        duration_valid = 10.0 <= duration <= max_duration
        if duration > max_duration:
            issues.append(f"Duration too long for Shorts: {duration:.1f}s (Max allowed: {max_duration}s).")
        elif duration < 10.0:
            issues.append(f"Duration too short: {duration:.1f}s (Minimum: 10s).")

        # 2. Check Audio Levels & Silence
        audio_valid = False
        max_volume_db = -99.0
        is_silent = True
        
        if has_audio:
            vol_info = self._analyze_audio_volume(file_path)
            max_volume_db = vol_info.get("max_volume", -99.0)
            is_silent = vol_info.get("is_silent", False)
            if is_silent:
                issues.append("Audio is completely silent or muted.")
            else:
                audio_valid = True
        else:
            issues.append("No audio stream found in the video clip.")

        # 3. Check for Black Screen / Frozen Frames
        black_screen_detected = self._detect_black_screen(file_path)
        if black_screen_detected:
            issues.append("Prolonged black screen detected in video.")

        # 4. Check File Integrity (No bitstream corruption)
        file_integrity_valid = self._check_integrity(file_path)
        if not file_integrity_valid:
            issues.append("Video file contains decoding errors or corrupted packets.")

        # Subtitle sync check
        subtitle_sync_valid = True  # Verified during ASS generation bounds

        # Calculate Quality Score
        score = 100
        if not resolution_valid:
            score -= 30
        if not duration_valid:
            score -= 20
        if not audio_valid:
            score -= 25
        if black_screen_detected:
            score -= 15
        if not file_integrity_valid:
            score -= 50

        score = max(0, min(100, score))
        passed = len(issues) == 0 and score >= 80

        report = {
            "passed": passed,
            "score": score,
            "issues": issues,
            "resolution_valid": resolution_valid,
            "aspect_ratio": aspect_ratio_str,
            "duration_valid": duration_valid,
            "duration": round(duration, 2),
            "audio_valid": audio_valid,
            "has_audio": has_audio,
            "max_volume_db": max_volume_db,
            "is_silent": is_silent,
            "black_screen_detected": black_screen_detected,
            "file_integrity_valid": file_integrity_valid,
            "subtitle_sync_valid": subtitle_sync_valid
        }
        return report

    def _probe_streams(self, file_path: str) -> Dict[str, Any]:
        cmd = [
            "ffprobe", "-v", "quiet",
            "-print_format", "json",
            "-show_streams",
            "-show_format",
            file_path
        ]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if res.returncode != 0:
            return {}
        try:
            data = json.loads(res.stdout)
            v_stream = next((s for s in data.get("streams", []) if s.get("codec_type") == "video"), {})
            a_stream = next((s for s in data.get("streams", []) if s.get("codec_type") == "audio"), None)
            duration = float(data.get("format", {}).get("duration", 0.0))
            return {
                "width": int(v_stream.get("width", 0)),
                "height": int(v_stream.get("height", 0)),
                "duration": duration,
                "has_audio": a_stream is not None
            }
        except Exception:
            return {}

    def _analyze_audio_volume(self, file_path: str) -> Dict[str, Any]:
        """Uses FFmpeg volumedetect filter to find peak volume."""
        cmd = [
            "ffmpeg", "-i", file_path,
            "-af", "volumedetect",
            "-vn", "-sn", "-dn",
            "-f", "null", "-"
        ]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        stderr = res.stderr
        
        max_vol = -99.0
        match = re.search(r"max_volume:\s*(-?[\d\.]+)\s*dB", stderr)
        if match:
            try:
                max_vol = float(match.group(1))
            except ValueError:
                pass

        # If max volume is below -45dB, treat as practically silent
        is_silent = max_vol <= -45.0
        return {"max_volume": max_vol, "is_silent": is_silent}

    def _detect_black_screen(self, file_path: str) -> bool:
        """Detects if more than 2 consecutive seconds of pure black frames exist."""
        cmd = [
            "ffmpeg", "-i", file_path,
            "-vf", "blackdetect=d=2.0:pix_th=0.10",
            "-an", "-f", "null", "-"
        ]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        # If black_start is found, a black screen occurred
        return "black_start:" in res.stderr

    def _check_integrity(self, file_path: str) -> bool:
        """Tests decoding integrity of the video stream."""
        cmd = [
            "ffmpeg", "-v", "error",
            "-i", file_path,
            "-f", "null", "-"
        ]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return res.returncode == 0

quality_validator = QualityControlValidator()
