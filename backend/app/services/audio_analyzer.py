import os
import subprocess
import logging
import numpy as np
from typing import List, Dict, Any, Optional
from ..config import settings

logger = logging.getLogger("zyronbyte.audio_analyzer")

class AudioPeakAnalyzer:
    """
    High-speed audio energy and peak analyzer.
    Streams 4kHz audio from video via FFmpeg to find combat, gunfire, explosions,
    screaming, and gameplay climax moments across long livestreams in seconds.
    """

    def analyze_audio_peaks(
        self,
        video_path: str,
        target_clip_duration: float = 35.0,
        min_distance_seconds: float = 35.0
    ) -> List[Dict[str, Any]]:
        """
        Analyzes video audio track and returns candidate peak highlight timestamps.
        Runs at ~50x-100x real-time speed using streamed FFmpeg pipe.
        """
        if not os.path.exists(video_path):
            return []

        try:
            # Stream 4kHz 16-bit mono PCM via stdout pipe (only 8KB/s data rate)
            cmd = [
                "ffmpeg", "-y",
                "-i", video_path,
                "-vn",
                "-f", "s16le",
                "-acodec", "pcm_s16le",
                "-ar", "4000",
                "-ac", "1",
                "-"
            ]
            proc = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL
            )
            raw_bytes = proc.stdout.read()
            proc.wait()

            if not raw_bytes or len(raw_bytes) < 8000:
                logger.warning("No audio data extracted from video.")
                return []

            audio = np.frombuffer(raw_bytes, dtype=np.int16)
            total_seconds = len(audio) // 4000
            if total_seconds < 30:
                return []

            # Compute RMS energy in 1-second chunks
            audio_trimmed = audio[:total_seconds * 4000].reshape(-1, 4000).astype(np.float32)
            rms = np.sqrt(np.mean(audio_trimmed ** 2, axis=1))

            baseline = float(np.median(rms))
            std_dev = float(np.std(rms))
            threshold = baseline + (1.1 * std_dev)

            # Identify peak seconds (ignoring first 20s intro and last 20s outro)
            peak_indices = [
                i for i, r in enumerate(rms)
                if r > threshold and 20 < i < (total_seconds - 25)
            ]

            if not peak_indices:
                # If audio is quiet or normalized, take top 10% loudest seconds
                sorted_indices = np.argsort(rms)[::-1]
                peak_indices = [
                    int(i) for i in sorted_indices[:max(10, total_seconds // 60)]
                    if 20 < i < (total_seconds - 25)
                ]

            # Cluster adjacent peak seconds (within 4s of each other) into action bursts
            clusters = []
            current_burst = []
            for p in peak_indices:
                if not current_burst or (p - current_burst[-1] <= 4):
                    current_burst.append(p)
                else:
                    clusters.append(current_burst)
                    current_burst = [p]
            if current_burst:
                clusters.append(current_burst)

            candidates = []
            for burst in clusters:
                burst_start = burst[0]
                burst_end = burst[-1]
                burst_duration = burst_end - burst_start + 1
                max_rms_val = max(float(rms[p]) for p in burst)
                peak_sec = max(burst, key=lambda p: rms[p])

                # Position the clip window: give ~8s lead-in context before the climax
                clip_start = max(5.0, float(peak_sec) - 10.0)
                clip_end = min(float(total_seconds) - 2.0, clip_start + target_clip_duration)
                if clip_end - clip_start < 25.0:
                    continue

                # Compute normalized score between 80 and 98
                ratio = max_rms_val / max(1.0, baseline)
                score = min(98, max(82, int(80 + (ratio * 3.5))))

                candidates.append({
                    "start_time": round(clip_start, 2),
                    "end_time": round(clip_end, 2),
                    "peak_time": peak_sec,
                    "score": score,
                    "max_rms": round(max_rms_val, 1),
                    "burst_duration": burst_duration
                })

            # Sort by score descending and deduplicate overlapping candidate windows
            candidates.sort(key=lambda x: x["score"], reverse=True)
            filtered = []
            for cand in candidates:
                cand_mid = (cand["start_time"] + cand["end_time"]) / 2.0
                overlap = False
                for f in filtered:
                    f_mid = (f["start_time"] + f["end_time"]) / 2.0
                    if abs(cand_mid - f_mid) < min_distance_seconds:
                        overlap = True
                        break
                if not overlap:
                    filtered.append(cand)

            logger.info(f"Audio Peak Analyzer detected {len(filtered)} combat/hype action peaks across {total_seconds}s.")
            return filtered

        except Exception as e:
            logger.error(f"Error analyzing audio peaks: {e}")
            return []

audio_analyzer = AudioPeakAnalyzer()
