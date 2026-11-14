import os
import json
import time
import subprocess
from pathlib import Path
from typing import Dict, Any, List, Optional, Callable
from faster_whisper import WhisperModel
from ..config import settings

class AudioTranscriber:
    """
    High-speed gaming audio transcriber with real-time second-by-second progress tracking.
    Uses 'tiny' model with greedy decoding and multi-threading for 20x-30x real-time speed.
    """
    def __init__(self, model_size: str = "tiny"):
        self.model_size = model_size
        self._model = None

    def get_model(self):
        if self._model is None:
            threads = min(8, os.cpu_count() or 4)
            # Uses CPU with int8 quantization and 8 threads
            self._model = WhisperModel(
                self.model_size,
                device="cpu",
                compute_type="int8",
                cpu_threads=threads
            )
        return self._model

    def extract_audio(self, video_path: str, output_wav_path: Optional[str] = None) -> str:
        """Extracts mono 16kHz audio from video."""
        if output_wav_path is None:
            base_name = Path(video_path).stem
            output_wav_path = str(settings.TEMP_PATH / f"{base_name}_audio.wav")
            
        cmd = [
            "ffmpeg", "-y",
            "-i", video_path,
            "-vn",
            "-acodec", "pcm_s16le",
            "-ar", "16000",
            "-ac", "1",
            output_wav_path
        ]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if res.returncode != 0:
            raise RuntimeError(f"Audio extraction failed: {res.stderr.decode('utf-8', errors='ignore')}")
        return output_wav_path

    def transcribe(
        self,
        video_path: str,
        progress_callback: Optional[Callable[[float, float], None]] = None
    ) -> Dict[str, Any]:
        """
        Transcribes gaming video audio with exact word timestamps and second-by-second progress updates.
        """
        audio_file = self.extract_audio(video_path)
        try:
            model = self.get_model()
            segments, info = model.transcribe(
                audio_file,
                word_timestamps=True,
                vad_filter=False,  # Immediate streaming without pre-buffering delays
                beam_size=1        # Greedy decoding for ultra-fast 20x real-time performance
            )

            results_segments = []
            all_words = []
            full_text_parts = []
            total_duration = float(info.duration) if info.duration > 0 else 1.0

            last_callback_time = 0.0

            for seg in segments:
                seg_words = []
                if seg.words:
                    for w in seg.words:
                        clean_word = w.word.strip()
                        if clean_word:
                            word_item = {
                                "word": clean_word,
                                "start": round(w.start, 2),
                                "end": round(w.end, 2),
                                "probability": round(w.probability, 2)
                            }
                            seg_words.append(word_item)
                            all_words.append(word_item)

                results_segments.append({
                    "start": round(seg.start, 2),
                    "end": round(seg.end, 2),
                    "text": seg.text.strip(),
                    "words": seg_words
                })
                full_text_parts.append(seg.text.strip())

                # Throttle progress callbacks to at most once per 0.5s to avoid DB lock
                now = time.time()
                if progress_callback and (now - last_callback_time >= 0.5):
                    last_callback_time = now
                    try:
                        progress_callback(seg.end, total_duration)
                    except Exception:
                        pass

            # Final 100% callback
            if progress_callback:
                try:
                    progress_callback(total_duration, total_duration)
                except Exception:
                    pass

            return {
                "language": info.language,
                "duration": round(info.duration, 2),
                "full_text": " ".join(full_text_parts),
                "segments": results_segments,
                "words": all_words
            }
        finally:
            if os.path.exists(audio_file):
                try:
                    os.remove(audio_file)
                except Exception:
                    pass

transcriber = AudioTranscriber(model_size="tiny")
