import os
import sys
import unittest
import json
import subprocess
from pathlib import Path

# Add project root to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir.parent))

from backend.app.config import settings
from backend.app.database import init_db, SessionLocal
from backend.app.models import Video, Clip, SocialAccount, AppSetting, PublishQueue
from backend.app.services.sfx_manager import sfx_manager
from backend.app.services.subtitle_gen import subtitle_generator
from backend.app.services.video_editor import video_editor
from backend.app.services.quality_control import quality_validator
from backend.app.services.gemini_ai import gemini_service
from backend.app.services.downloader import downloader

class TestZyronByteStudio(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        init_db()
        # Generate a test 16:9 gaming video using FFmpeg testsrc
        cls.test_video_path = str(settings.TEMP_PATH / "test_sample_gameplay.mp4")
        cmd = [
            "ffmpeg", "-y",
            "-f", "lavfi", "-i", "testsrc=size=1920x1080:rate=30",
            "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=44100",
            "-t", "12",
            "-c:v", "libx264", "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            cls.test_video_path
        ]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        assert res.returncode == 0, f"FFmpeg failed to create test sample: {res.stderr}"

    def test_01_sfx_manager(self):
        """Test dynamic synthesis of gaming SFX."""
        whoosh = sfx_manager.get_sfx("whoosh")
        impact = sfx_manager.get_sfx("impact")
        pop = sfx_manager.get_sfx("pop")
        ding = sfx_manager.get_sfx("ding")
        self.assertTrue(whoosh.exists(), "Whoosh SFX should exist")
        self.assertTrue(impact.exists(), "Impact SFX should exist")
        self.assertTrue(pop.exists(), "Pop SFX should exist")
        self.assertTrue(ding.exists(), "Ding SFX should exist")

    def test_02_video_metadata_inspection(self):
        """Test ffprobe metadata inspection."""
        meta = downloader.get_video_metadata(self.test_video_path)
        self.assertEqual(meta["width"], 1920)
        self.assertEqual(meta["height"], 1080)
        self.assertAlmostEqual(meta["duration"], 12.0, delta=0.5)
        self.assertTrue(meta["has_audio"])

    def test_03_subtitle_generation(self):
        """Test ASS subtitle generation with word highlighting."""
        sample_words = [
            {"word": "UNBELIEVABLE", "start": 1.0, "end": 1.8},
            {"word": "CLUTCH", "start": 1.9, "end": 2.5},
            {"word": "PLAY", "start": 2.6, "end": 3.2},
            {"word": "KILL", "start": 3.3, "end": 3.9}
        ]
        out_ass = str(settings.TEMP_PATH / "test_subs.ass")
        res_file = subtitle_generator.generate_ass_subtitles(
            words_list=sample_words,
            output_ass_path=out_ass,
            clip_start=0.0,
            clip_end=10.0
        )
        self.assertTrue(os.path.exists(res_file))
        with open(res_file, "r", encoding="utf-8") as f:
            content = f.read()
            self.assertIn("PlayResX: 1080", content)
            self.assertIn("PlayResY: 1920", content)
            self.assertIn("CLUTCH", content)

    def test_04_video_rendering_9x16(self):
        """Test rendering 9:16 vertical short with blur background & subtitles & SFX."""
        sample_words = [
            {"word": "INSANE", "start": 1.0, "end": 2.0},
            {"word": "HEADSHOT", "start": 2.1, "end": 3.0}
        ]
        result = video_editor.render_professional_short(
            source_video_path=self.test_video_path,
            start_time=1.0,
            end_time=11.0,
            clip_id=999,
            crop_mode="blur_fill",
            subtitles_enabled=True,
            sfx_enabled=True,
            transcript_words=sample_words
        )
        self.assertTrue(os.path.exists(result["edited_clip_path"]))
        self.assertTrue(os.path.exists(result["thumbnail_path"]))

        # Verify output resolution is vertical 1080x1920
        out_meta = downloader.get_video_metadata(result["edited_clip_path"])
        self.assertEqual(out_meta["width"], 1080)
        self.assertEqual(out_meta["height"], 1920)
        self.assertAlmostEqual(out_meta["duration"], 10.0, delta=0.5)

    def test_05_quality_control_validator(self):
        """Test automated pre-flight QC check on the rendered 9:16 short."""
        clip_path = str(settings.CLIPS_PATH / "clip_999_9x16.mp4")
        report = quality_validator.inspect_clip(clip_path, max_duration=60.0)
        self.assertTrue(report["passed"], f"QC should pass for generated clip: {report['issues']}")
        self.assertTrue(report["resolution_valid"])
        self.assertTrue(report["duration_valid"])
        self.assertTrue(report["audio_valid"])
        self.assertFalse(report["black_screen_detected"])
        self.assertTrue(report["file_integrity_valid"])
        self.assertGreaterEqual(report["score"], 80)

    def test_06_highlight_detection_and_metadata(self):
        """Test Gemini highlight detection and metadata generation."""
        mock_transcript = {
            "duration": 180.0,
            "segments": [
                {"start": 15.0, "end": 20.0, "text": "I got one, he is pushing right now!"},
                {"start": 21.0, "end": 25.0, "text": "OMG NO WAY THAT WAS AN INSANE CLUTCH!"},
                {"start": 60.0, "end": 65.0, "text": "Bro check this one tap headshot across the map!"}
            ]
        }
        meta = {"duration": 180.0, "width": 1920, "height": 1080}
        highlights = gemini_service.detect_highlights(
            video_metadata=meta,
            transcript_data=mock_transcript,
            min_clips=3,
            max_clips=5
        )
        self.assertGreaterEqual(len(highlights), 3)
        for h in highlights:
            self.assertIn("start_time", h)
            self.assertIn("end_time", h)
            self.assertIn("youtube_title", h)
            self.assertIn("instagram_caption", h)
            self.assertIn("score", h)
            self.assertTrue(h["end_time"] > h["start_time"])

    def test_07_database_and_models(self):
        """Test database persistence for video and clips."""
        db = SessionLocal()
        try:
            vid = Video(
                title="Apex Ranked Stream #1",
                source_type="local",
                file_path=self.test_video_path,
                duration=12.0,
                status="COMPLETED"
            )
            db.add(vid)
            db.commit()
            db.refresh(vid)

            clip = Clip(
                video_id=vid.id,
                title="Clutch 1v3 Victory",
                highlight_category="clutch",
                start_time=1.0,
                end_time=11.0,
                duration=10.0,
                crop_mode="blur_fill",
                status="READY_FOR_APPROVAL"
            )
            db.add(clip)
            db.commit()
            db.refresh(clip)

            self.assertIsNotNone(vid.id)
            self.assertIsNotNone(clip.id)
            self.assertEqual(clip.video_id, vid.id)
        finally:
            db.close()

    def test_08_manual_clip_cutting(self):
        """Test manually cutting a custom clip with user-defined start and end timestamps."""
        db = SessionLocal()
        try:
            vid = db.query(Video).filter(Video.file_path == self.test_video_path).first()
            if not vid:
                vid = Video(title="Test Cut Source", file_path=self.test_video_path, duration=12.0)
                db.add(vid)
                db.commit()
                db.refresh(vid)

            from backend.app.schemas import ManualClipCreateRequest
            from backend.app.api.clips import create_custom_cut

            req = ManualClipCreateRequest(
                video_id=vid.id,
                title="Manual 2-Second Snip",
                highlight_category="kill",
                start_time=2.0,
                end_time=6.0,
                crop_mode="blur_fill"
            )
            custom_clip = create_custom_cut(req, db)
            self.assertEqual(custom_clip.start_time, 2.0)
            self.assertEqual(custom_clip.end_time, 6.0)
            self.assertEqual(custom_clip.duration, 4.0)
            self.assertTrue(os.path.exists(custom_clip.edited_clip_path))
            self.assertTrue(os.path.exists(custom_clip.thumbnail_path))
        finally:
            db.close()

if __name__ == "__main__":
    unittest.main()
