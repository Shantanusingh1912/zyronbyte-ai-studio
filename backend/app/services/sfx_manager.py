import os
import math
import wave
import struct
import numpy as np
from pathlib import Path
from ..config import settings

class SFXManager:
    """
    Manages and synthesizes gaming sound effects (whoosh, impact, pop, ding)
    so the system is 100% self-contained with zero missing asset errors.
    """
    def __init__(self):
        self.sfx_dir = settings.SFX_PATH
        self.sfx_dir.mkdir(parents=True, exist_ok=True)
        self.ensure_default_sfx()

    def ensure_default_sfx(self):
        """Generates standard gaming sound effects if not already present."""
        whoosh_path = self.sfx_dir / "whoosh.wav"
        impact_path = self.sfx_dir / "impact.wav"
        pop_path = self.sfx_dir / "pop.wav"
        ding_path = self.sfx_dir / "ding.wav"

        if not whoosh_path.exists():
            self._create_whoosh(str(whoosh_path))
        if not impact_path.exists():
            self._create_impact(str(impact_path))
        if not pop_path.exists():
            self._create_pop(str(pop_path))
        if not ding_path.exists():
            self._create_ding(str(ding_path))

    def _create_whoosh(self, filename: str, duration: float = 0.4, sample_rate: int = 44100):
        """Creates a smooth cinematic whoosh transition sound."""
        n_samples = int(duration * sample_rate)
        t = np.linspace(0, duration, n_samples)
        
        # Frequency sweep from 150Hz up to 900Hz and back to 100Hz
        freq = 150 + 750 * np.sin(np.pi * (t / duration))
        phase = 2 * np.pi * np.cumsum(freq) / sample_rate
        
        # Envelope: rise and smooth decay
        envelope = np.sin(np.pi * (t / duration)) ** 2
        noise = (np.random.rand(n_samples) - 0.5) * 0.4
        
        signal = (np.sin(phase) * 0.6 + noise) * envelope
        self._write_wav(filename, signal, sample_rate)

    def _create_impact(self, filename: str, duration: float = 0.5, sample_rate: int = 44100):
        """Creates a deep gaming bass hit / impact sound."""
        n_samples = int(duration * sample_rate)
        t = np.linspace(0, duration, n_samples)
        
        # Pitch drops quickly from 220Hz down to 40Hz
        freq = 40 + 180 * np.exp(-15 * t)
        phase = 2 * np.pi * np.cumsum(freq) / sample_rate
        envelope = np.exp(-7 * t)
        
        signal = np.sin(phase) * envelope * 0.9
        self._write_wav(filename, signal, sample_rate)

    def _create_pop(self, filename: str, duration: float = 0.12, sample_rate: int = 44100):
        """Creates a crisp text pop / subtitle pop sound."""
        n_samples = int(duration * sample_rate)
        t = np.linspace(0, duration, n_samples)
        
        freq = 300 + 900 * (1 - t / duration)
        phase = 2 * np.pi * np.cumsum(freq) / sample_rate
        envelope = np.exp(-25 * t)
        
        signal = np.sin(phase) * envelope * 0.7
        self._write_wav(filename, signal, sample_rate)

    def _create_ding(self, filename: str, duration: float = 0.6, sample_rate: int = 44100):
        """Creates a bell/chime celebration ding."""
        n_samples = int(duration * sample_rate)
        t = np.linspace(0, duration, n_samples)
        
        # Harmonics for clear chime
        f1, f2, f3 = 1046.5, 2093.0, 3135.9  # C6, C7, G7
        envelope = np.exp(-6 * t)
        signal = (0.6 * np.sin(2 * np.pi * f1 * t) + 
                  0.3 * np.sin(2 * np.pi * f2 * t) + 
                  0.1 * np.sin(2 * np.pi * f3 * t)) * envelope * 0.7
        self._write_wav(filename, signal, sample_rate)

    def _write_wav(self, filename: str, signal: np.ndarray, sample_rate: int):
        # Normalize and clip to 16-bit range
        signal = np.clip(signal, -1.0, 1.0)
        int_data = (signal * 32767).astype(np.int16)
        
        with wave.open(filename, 'wb') as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(sample_rate)
            wf.writeframes(int_data.tobytes())

    def get_sfx(self, name: str) -> Path:
        sfx_file = self.sfx_dir / f"{name}.wav"
        if not sfx_file.exists():
            self.ensure_default_sfx()
        return sfx_file

sfx_manager = SFXManager()
