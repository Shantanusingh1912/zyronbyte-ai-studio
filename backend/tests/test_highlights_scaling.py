import os
import sys
import json
import sqlite3

# Ensure root is in sys.path
sys.path.insert(0, os.path.abspath("."))

from backend.app.services.gemini_ai import gemini_service, get_duration_scaled_clip_targets

def test_scaling_and_diversity():
    conn = sqlite3.connect(r"backend/storage/zyronbyte.db")
    c = conn.cursor()
    row = c.execute("SELECT id, file_path, duration, transcript_json FROM videos WHERE id = 2").fetchone()
    if not row:
        print("Video 2 not found!")
        return

    vid_id, file_path, duration, transcript_json = row
    min_c, max_c = get_duration_scaled_clip_targets(duration)
    print(f"Video #{vid_id} Duration: {duration/60:.1f} mins -> Target Range: {min_c} to {max_c} clips")
    assert min_c >= 10 and max_c >= 15, "100-min video must target at least 10-15 clips!"

    meta = {"file_path": file_path, "duration": duration}
    transcript = json.loads(transcript_json)

    highlights = gemini_service.detect_highlights(meta, transcript, min_clips=min_c, max_clips=max_c)
    print(f"\nSuccessfully extracted {len(highlights)} highlights:")

    categories_count = {}
    for i, h in enumerate(highlights, 1):
        cat = h["category"]
        categories_count[cat] = categories_count.get(cat, 0) + 1
        print(f"#{i:02d} [{cat.upper():10s}] ({h['start_time']:6.1f}s - {h['end_time']:6.1f}s) | {h['title']}")

    print("\nCategory Distribution Summary:")
    for cat, cnt in categories_count.items():
        print(f" - {cat.upper()}: {cnt} clips")

    # Verify diversity
    assert len(categories_count) >= 3, "Highlights must span multiple diverse categories!"
    assert "clutch" in categories_count or "op_kill" in categories_count, "Must contain clutch or op_kill!"
    print("\nALL VERIFICATIONS PASSED!")

if __name__ == "__main__":
    test_scaling_and_diversity()
