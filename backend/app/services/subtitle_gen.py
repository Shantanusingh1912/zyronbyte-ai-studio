import os
import math
from pathlib import Path
from typing import List, Dict, Any, Optional
from ..config import settings

class SubtitleGenerator:
    """
    Generates stylish, high-engagement gaming subtitles (.ass format)
    with highlighted keywords and karaoke animations.
    """

    @staticmethod
    def format_ass_time(seconds: float) -> str:
        """Converts seconds into ASS timestamp format: H:MM:SS.cs"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        centisecs = int(round((seconds - int(seconds)) * 100))
        if centisecs >= 100:
            secs += 1
            centisecs = 0
        return f"{hours}:{minutes:02d}:{secs:02d}.{centisecs:02d}"

    def generate_ass_subtitles(
        self,
        words_list: List[Dict[str, Any]],
        output_ass_path: str,
        highlight_color: str = "&H0000FFFF",  # Neon Yellow in BGR ASS format
        primary_color: str = "&H00FFFFFF",    # Pure White
        clip_start: float = 0.0,
        clip_end: float = 60.0
    ) -> str:
        """
        Creates an ASS subtitle file formatted for 1080x1920 vertical video.
        Filters words within [clip_start, clip_end] and groups into punchy 3-5 word lines.
        """
        # Filter words belonging to this clip
        clip_words = []
        for w in words_list:
            w_start = w.get("start", 0.0)
            w_end = w.get("end", 0.0)
            if w_end > clip_start and w_start < clip_end:
                # Adjust time relative to clip start
                rel_start = max(0.0, w_start - clip_start)
                rel_end = min(clip_end - clip_start, w_end - clip_start)
                if rel_end > rel_start:
                    clip_words.append({
                        "word": w.get("word", "").strip().upper(),
                        "start": rel_start,
                        "end": rel_end
                    })

        ass_header = f"""[Script Info]
Title: ZyronByte Gaming Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: GamingDefault,Arial,72,{primary_color},&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,2,0,1,6,3,2,60,60,340,1
Style: GamingHighlight,Arial,78,{highlight_color},&H000000FF,&H00000000,&H80000000,-1,0,0,0,105,105,2,0,1,8,4,2,60,60,340,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
        dialogue_lines = []

        # If no transcript words exist for this segment, return a subtle channel watermark subtitle
        if not clip_words:
            # Subtle animated channel tag
            start_fmt = self.format_ass_time(0.5)
            end_fmt = self.format_ass_time(min(4.0, clip_end - clip_start))
            dialogue_lines.append(
                f"Dialogue: 0,{start_fmt},{end_fmt},GamingHighlight,,0,0,0,,{{\\fade(200,200)}}ZYRONBYTE GAMING"
            )
        else:
            # Group into punchy phrases of 2-4 words
            phrase_size = 3
            for i in range(0, len(clip_words), phrase_size):
                chunk = clip_words[i:i + phrase_size]
                if not chunk:
                    continue
                
                chunk_start = chunk[0]["start"]
                chunk_end = chunk[-1]["end"] + 0.15
                start_str = self.format_ass_time(chunk_start)
                end_str = self.format_ass_time(chunk_end)
                
                # Highlight the middle or most energetic word with highlight style
                text_parts = []
                for idx, cw in enumerate(chunk):
                    w_text = cw["word"]
                    # Emphasize important gaming words
                    if any(kw in w_text for kw in ["KILL", "CLUTCH", "OMG", "NO", "HEADSHOT", "WIN", "BRO", "DEAD"]) or idx == (len(chunk) // 2):
                        text_parts.append(f"{{\\c{highlight_color}\\b1}}{w_text}{{\\c{primary_color}\\b0}}")
                    else:
                        text_parts.append(w_text)
                
                rendered_text = " ".join(text_parts)
                dialogue_lines.append(
                    f"Dialogue: 0,{start_str},{end_str},GamingDefault,,0,0,0,,{rendered_text}"
                )

        full_ass_content = ass_header + "\n".join(dialogue_lines) + "\n"
        
        output_path = Path(output_ass_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(full_ass_content)

        return str(output_path)

subtitle_generator = SubtitleGenerator()
