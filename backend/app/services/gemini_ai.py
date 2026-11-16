import os
import re
import json
import logging
from typing import Dict, Any, List, Optional, Tuple
from google import genai
from google.genai import types
from ..config import settings
from .audio_analyzer import audio_analyzer
from .game_detector import game_detector

logger = logging.getLogger("zyronbyte.gemini")

def get_duration_scaled_clip_targets(duration_seconds: float, configured_clips: Optional[int] = None) -> Tuple[int, int]:
    """
    Calculates (min_clips, max_clips) dynamically based on video duration:
    - < 12 min: 3-5 clips
    - 12-25 min (e.g. 19-min video): 5-7 clips
    - 25-50 min: 7-10 clips
    - 50-90 min: 10-14 clips
    - 90-140 min (e.g. 100-min video): 12-16 clips
    - > 140 min (2-3+ hour livestream): 16-24 clips
    
    If the user has explicitly configured a non-zero, custom clips_per_video setting,
    it respects that preference.
    """
    duration_mins = max(1.0, duration_seconds / 60.0)

    # If user explicitly configured a custom number > 0 that is not the old default (6 or 7)
    if configured_clips and configured_clips > 0 and configured_clips not in (6, 7):
        min_c = max(3, int(configured_clips * 0.8))
        return (min_c, configured_clips)

    if duration_mins < 12.0:
        return (3, 5)
    elif duration_mins < 25.0:
        return (5, 7)
    elif duration_mins < 50.0:
        return (7, 10)
    elif duration_mins < 90.0:
        return (10, 14)
    elif duration_mins < 140.0:
        return (12, 16)
    else:
        return (16, 24)

class GeminiAIService:
    """
    Integrates Google Gemini API and Multimodal Audio Peak Analysis for:
    - Dynamic highlight detection across multiple gaming categories (clutch, op_kill, rush, reaction, funny)
    - Category diversity quota enforcement (guaranteeing varied Shorts, never just one category)
    - Viral YouTube Shorts titles (#Shorts #Gaming #ZyronByte)
    - Engaging Instagram Reel captions with CTAs
    - SEO gaming tags and metadata
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        self.model_name = settings.GEMINI_MODEL
        self._client = None

    def get_client(self):
        current_key = self.api_key or settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        if current_key and not self._client:
            self._client = genai.Client(api_key=current_key)
        return self._client

    def detect_highlights(
        self,
        video_metadata: Dict[str, Any],
        transcript_data: Dict[str, Any],
        min_clips: Optional[int] = None,
        max_clips: Optional[int] = None,
        min_duration: int = 30,
        max_duration: int = 60,
        configured_clips_setting: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Detects top gaming highlights using Gemini AI when configured,
        fused with audio peak gunfire/combat detection and intelligent multilingual gaming heuristics.
        """
        video_duration = float(video_metadata.get("duration", 0.0))

        # Resolve the game title (user provided or auto-detected)
        game_title = video_metadata.get("game_title")
        if not game_title:
            detected = game_detector.detect_game(video_metadata.get("title", ""))
            game_title = detected["display_name"]
        video_metadata["game_title"] = game_title

        # Dynamically scale clips based on video duration if not explicitly passed
        if min_clips is None or max_clips is None:
            min_clips, max_clips = get_duration_scaled_clip_targets(video_duration, configured_clips_setting)

        client = self.get_client()

        # If Gemini API client is available and key is configured, call Gemini
        if client and self.api_key:
            try:
                logger.info(f"Calling Gemini API for intelligent highlight detection for '{game_title}' (target {min_clips}-{max_clips} clips)...")
                gemini_results = self._gemini_analyze_highlights(
                    client=client,
                    video_metadata=video_metadata,
                    transcript_data=transcript_data,
                    min_clips=min_clips,
                    max_clips=max_clips,
                    min_duration=min_duration,
                    max_duration=max_duration,
                    game_title=game_title
                )
                if gemini_results and len(gemini_results) >= min_clips:
                    return gemini_results
            except Exception as e:
                logger.error(f"Gemini API analysis failed: {e}. Falling back to multi-signal heuristic analyzer.")

        # Multimodal Heuristic Highlight Analyzer (Audio Peaks + Transcripts + Category Diversity)
        return self._heuristic_analyze_highlights(
            video_metadata=video_metadata,
            transcript_data=transcript_data,
            min_clips=min_clips,
            max_clips=max_clips,
            min_duration=min_duration,
            max_duration=max_duration,
            game_title=game_title
        )

    def _gemini_analyze_highlights(
        self,
        client: genai.Client,
        video_metadata: Dict[str, Any],
        transcript_data: Dict[str, Any],
        min_clips: int,
        max_clips: int,
        min_duration: int,
        max_duration: int,
        game_title: str = "General Gaming"
    ) -> List[Dict[str, Any]]:
        """Prompt Gemini with video info and transcript segments to extract balanced highlights."""
        duration = float(video_metadata.get("duration", 0.0))
        duration_mins = duration / 60.0
        game_prof = game_detector.get_game_profile(game_title)
        short_game_tag = game_prof["short_name"].replace(" ", "")

        # Sample segments evenly across the video to avoid truncating long videos
        raw_segments = transcript_data.get("segments", [])
        if len(raw_segments) > 250:
            step = len(raw_segments) / 250.0
            sampled_segments = [raw_segments[int(i * step)] for i in range(250)]
        else:
            sampled_segments = raw_segments

        prompt = f"""
You are the Lead Video Editor and Social Media Director for a top gaming YouTube channel called 'ZyronByteYT'.
Analyze this gaming video transcript and timeline to identify the top {min_clips} to {max_clips} viral gaming highlights.

TARGET GAME: {game_title}
CRITICAL REQUIREMENT - AUTHENTIC TO {game_title.upper()}:
- This footage is strictly from '{game_title}'.
- You MUST write titles, descriptions, hashtags, and social captions specifically tailored to '{game_title}'.
- ABSOLUTELY DO NOT use terminology, mechanics, or hashtags from other games (for example: if '{game_title}' is Grand Theft Auto V, Valorant, or Minecraft, DO NOT mention 'BGMI', 'Chicken Dinner', or 'PUBG'!).
- Use mechanics, weapon names, vehicles, mission references, and hashtags authentic to '{game_title}'.

CRITICAL REQUIREMENT - DIVERSE CATEGORIES:
Do NOT make all clips the same category or repeat similar titles.
You MUST provide a balanced distribution across these categories:
- 'clutch': 1v3/1v4, solo survival, final showdown, last man standing, high stakes escape (at least 25%).
- 'op_kill': One-tap sniper headshots, squad wipes, spray transfers, clean flick shots, insane eliminations (at least 25%).
- 'rush': High action pushes, aggressive close-quarters combat, speed escapes (20%).
- 'reaction': Screaming, hype moments, "Oh my God", genuine disbelief (15%).
- 'funny': Hilarious fails, accidents, bot/NPC encounters, vehicle crashes, awkward physics (15%).

SPECIFICATIONS:
- Video Total Duration: {duration:.1f} seconds ({duration_mins:.1f} minutes).
- Return between {min_clips} and {max_clips} highlights spread across the full timeline.
- Each clip duration must be between {min_duration} and {max_duration} seconds (ideal ~35-45s).
- Provide exact start_time and end_time (in seconds, e.g. 45.0, 80.0).
- Categorize each highlight accurately: 'clutch', 'op_kill', 'rush', 'reaction', or 'funny'.
- Excitement score from 80 to 99.
- Write a punchy YouTube Shorts title (under 65 chars) with #{short_game_tag} #Shorts #ZyronByte.
- Write a compelling YouTube description with call to action for @ZyronByteYT.
- Write an engaging Instagram Reel caption with call to action.
- Provide 5-8 relevant hashtags and SEO keywords specifically for {game_title}.

TRANSCRIPT TIMELINE DATA:
{json.dumps(sampled_segments, indent=2)}

OUTPUT FORMAT:
Return strictly a valid JSON array of objects conforming to this schema:
[
  {{
    "title": "Short descriptive clip title",
    "category": "clutch",
    "description": "Why this is an epic highlight in {game_title}",
    "youtube_description": "Catchy YouTube description for {game_title} with call to action and hashtags",
    "score": 96,
    "start_time": 45.0,
    "end_time": 80.0,
    "youtube_title": "HE PULLED OFF THE IMPOSSIBLE ESCAPE! 🔥 #{short_game_tag} #Shorts #ZyronByte",
    "instagram_caption": "Down to 1 HP and the last bullet in {game_title}... Would you have survived this? Drop a 💀 in the comments! Follow @ZyronByteYT for daily shorts!",
    "hashtags": {json.dumps(game_prof["hashtags"][:6])},
    "keywords": {json.dumps(game_prof["keywords"][:6])}
  }}
]
"""
        response = client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.3
            )
        )

        parsed = json.loads(response.text)
        if isinstance(parsed, dict) and "highlights" in parsed:
            parsed = parsed["highlights"]
        return parsed

    def _heuristic_analyze_highlights(
        self,
        video_metadata: Dict[str, Any],
        transcript_data: Dict[str, Any],
        min_clips: int,
        max_clips: int,
        min_duration: int,
        max_duration: int,
        game_title: str = "General Gaming"
    ) -> List[Dict[str, Any]]:
        """
        Multimodal Heuristic Highlight Detector:
        1. Analyzes audio energy peaks (gunfire, combat, explosions, screaming) using FFmpeg streamed audio.
        2. Detects multilingual gaming keywords across 5 distinct categories: clutch, op_kill, rush, reaction, funny.
        3. Enforces strict category diversity quota (never all 'funny').
        4. Generates unique, viral titles and social captions tailored to each highlight category.
        """
        video_path = video_metadata.get("file_path", "")
        duration = float(video_metadata.get("duration", 180.0))
        target_clip_length = 35.0

        # Category definitions with keywords, priority weights, and varied title templates
        CATEGORIES = {
            "clutch": {
                "weight": 96,
                "keywords": [
                    "1v4", "1v3", "1v2", "1v1", "clutch", "last man", "last one", "last player",
                    "clutch or kick", "solo vs squad", "chicken dinner", "winner winner",
                    "final zone", "last circle", "we won", "won", "revive me", "stay alive",
                    "lone survivor", "unreal clutch", "last banda", "aakhri banda", "bach gaya",
                    "khatam kiya", "bhai clutch", "ek goli", "one hp", "1 hp", "zone me", "heal kar"
                ],
                "titles": [
                    "UNREAL 1v3 Clutch Play! Down To The Last Bullet 🔥",
                    "Solo vs Squad Final Circle Madness! 🏆",
                    "He Actually Pulled Off The Impossible 1v4! 😱",
                    "Down To 1 HP In The Final Zone! Clutch or Kick 🥶",
                    "Coldest Battle Royale Clutch You'll See Today 🥶",
                    "Pure 200 IQ Brain Play In Final Circle! 🧠",
                    "Down To The Last Second! GG Winner 🏆"
                ]
            },
            "op_kill": {
                "weight": 93,
                "keywords": [
                    "op", "headshot", "one tap", "sniper", "kar98", "m24", "awm", "wipe",
                    "squad wipe", "team wipe", "knocked", "knock", "finish", "triple kill",
                    "quad kill", "ace", "ultra kill", "noscope", "quickscope", "spray transfer",
                    "laser spray", "melted", "frag", "dink", "clean headshot", "eliminated",
                    "op kill", "op bhai", "kya headshot mara", "headshot mara", "baja diya",
                    "pel diya", "gira diya", "knock kiya", "squad khatam", "ek tap", "dhuan dhaar",
                    "chala gaya", "mar gaya", "khatam ho gaya", "gaya gaya"
                ],
                "titles": [
                    "DISGUSTING One-Tap Sniper Headshot! 🎯",
                    "INSANE Squad Wipe In 5 Seconds! ⚡",
                    "Pure Aimbot or 200 IQ Spray Transfer? 💥",
                    "OP Elimination! They Never Stood A Chance 💀",
                    "Dirtiest Sniper Quickscope Across The Map! 🤯",
                    "Most Disgusting Flick Shot Of The Stream 🔥",
                    "Bro Just Deleted The Whole Team! ⚡",
                    "Cleanest One-Tap You'll Watch Today 🎯"
                ]
            },
            "rush": {
                "weight": 89,
                "keywords": [
                    "rush", "push", "pushing", "full send", "aggressive", "under fire",
                    "enemies ahead", "third party", "flank", "smoke", "breach", "drop shot",
                    "jiggle peek", "combat", "airdrop", "rush karo", "push karo", "aage banda",
                    "banda hai", "peche se", "chadh gaye", "goli chal rahi", "drop pe",
                    "andar aao", "gaadi aayi", "chalo chalo", "ghus gaye", "andhi rush"
                ],
                "titles": [
                    "Full Squad Aggressive Rush Gone Completely Wild! 🚨",
                    "Insane Close-Range Reflexes Under Heavy Fire! 💥",
                    "They Tried To Third Party & Instantly Regretted It ⚡",
                    "Absolute Chaos At The Airdrop Fight! 📦",
                    "When The Squad Decides To Go Full Send! 🏎️💨",
                    "Most Aggressive Push You'll See In Ranked 💥"
                ]
            },
            "reaction": {
                "weight": 88,
                "keywords": [
                    "omg", "no way", "what the", "holy", "are you kidding", "unbelievable",
                    "screaming", "hacker", "reported", "he's cheating", "lets go", "let's go",
                    "kya baat hai", "arey bhai", "pagal", "hacker hai kya", "bhai ye kya tha",
                    "kya hi mara", "arre yaar", "bhai sun", "dekh dekh", "ye kaise hua",
                    "lost his mind", "chilla raha", "bawal", "oh my god", "my god"
                ],
                "titles": [
                    "Bro Completely Lost His Mind After This! 💀",
                    "His Reaction Said Absolutely Everything! 😂",
                    "Is He Actually Hacking?! Unbelievable Reaction 😱",
                    "Screaming At The Top Of His Lungs! 🔊",
                    "The Entire Lobby Heard That Reaction! 🗣️",
                    "Bro Could Not Believe What His Eyes Just Saw 🤯"
                ]
            },
            "funny": {
                "weight": 86,
                "keywords": [
                    "fail", "lol", "lmao", "wtf", "bot", "noob", "potato aim", "grenade fail",
                    "accident", "glitch", "bug", "stuck", "blown up", "embarrassing", "choke",
                    "kya bot hai", "hasi aa gayi", "fail ho gaya", "khud ko uda liya",
                    "apne hi bomb se", "gaadi thuk gayi", "kya noob hai", "loot ke chakkar me",
                    "funny moment", "hasi nahi ruk rahi"
                ],
                "titles": [
                    "When The Grenade Bounces Straight Back At You 😭💀",
                    "Funniest Potato Aim Moment Of The Year 😂",
                    "How Did This Even Happen?! The Biggest Fail 💀",
                    "When Driving Goes Completely Wrong In Battle Royale 🚗💥",
                    "Bro Died In The Funniest Way Possible 😭",
                    "Funniest Bot Encounter Of The Entire Stream 💀"
                ]
            }
        }

        # Step A: Collect Audio Energy Peaks (Gunfire, combat, hype)
        audio_peaks = []
        if video_path and os.path.exists(video_path):
            audio_peaks = audio_analyzer.analyze_audio_peaks(
                video_path,
                target_clip_duration=target_clip_length,
                min_distance_seconds=30.0
            )

        # Step B: Score Transcript Segments across Categories
        transcript_candidates = []
        segments = transcript_data.get("segments", [])

        if segments:
            for seg in segments:
                text = seg.get("text", "").lower()
                seg_start = seg.get("start", 0.0)
                seg_end = seg.get("end", seg_start + 5.0)

                best_category = None
                best_score = 70
                matched_kw = ""

                # Evaluate text against categories
                for cat_name, cat_data in CATEGORIES.items():
                    for kw in cat_data["keywords"]:
                        # Word boundary or phrase check
                        pattern = r'\b' + re.escape(kw) + r'\b' if len(kw) <= 4 else re.escape(kw)
                        if re.search(pattern, text):
                            cand_score = cat_data["weight"]
                            if "!" in text or "?" in text:
                                cand_score += 3
                            if cand_score > best_score:
                                best_score = cand_score
                                best_category = cat_name
                                matched_kw = kw

                if best_category and best_score >= 80:
                    c_start = max(0.0, seg_start - 8.0)
                    c_end = min(duration, c_start + target_clip_length)
                    if c_end - c_start >= min_duration:
                        transcript_candidates.append({
                            "start_time": round(c_start, 2),
                            "end_time": round(c_end, 2),
                            "category": best_category,
                            "score": best_score,
                            "source": "transcript",
                            "matched_keyword": matched_kw
                        })

        # Step C: Convert Audio Peaks into Action / Clutch / OP Kill Candidates
        audio_candidates = []
        for ap in audio_peaks:
            p_time = ap["peak_time"]
            # If peak is in final 20% of video duration, likely final circle clutch
            is_final_circle = (p_time / max(1.0, duration)) > 0.75
            category = "clutch" if is_final_circle else ("op_kill" if ap["score"] >= 90 else "rush")

            # Check if this peak overlaps with any transcript candidate and boost its score
            overlapping_trans = [
                tc for tc in transcript_candidates
                if abs((tc["start_time"] + tc["end_time"]) / 2.0 - p_time) < 15.0
            ]
            if overlapping_trans:
                for tc in overlapping_trans:
                    tc["score"] = min(99, tc["score"] + 6)
            else:
                audio_candidates.append({
                    "start_time": ap["start_time"],
                    "end_time": ap["end_time"],
                    "category": category,
                    "score": ap["score"],
                    "source": "audio_peak",
                    "matched_keyword": "audio_energy_burst"
                })

        # Combine all candidates
        all_candidates = transcript_candidates + audio_candidates

        # Step D: Fill with timeline-spaced intervals if needed to ensure coverage across the video
        timeline_candidates = []
        usable_duration = max(min_duration, duration - 30.0)
        num_intervals = max(max_clips * 2, int(duration / 300.0))  # one every ~5 mins
        interval_step = usable_duration / max(1, num_intervals)
        cat_keys = ["clutch", "op_kill", "rush", "reaction", "funny"]

        for i in range(num_intervals):
            c_start = max(5.0, 15.0 + (i * interval_step))
            c_end = min(duration - 2.0, c_start + target_clip_length)
            if c_end - c_start >= min_duration:
                # Cycle categories gracefully
                cat = cat_keys[i % len(cat_keys)]
                timeline_candidates.append({
                    "start_time": round(c_start, 2),
                    "end_time": round(c_end, 2),
                    "category": cat,
                    "score": 82 + (i % 8),
                    "source": "timeline_interval",
                    "matched_keyword": "gameplay_interval"
                })

        # Pool all candidates together
        full_pool = all_candidates + timeline_candidates

        # Step E: Enforce Category Diversity Quota
        # Group candidates by category
        pool_by_category = {cat: [] for cat in cat_keys}
        for item in full_pool:
            pool_by_category[item["category"]].append(item)

        for cat in cat_keys:
            pool_by_category[cat].sort(key=lambda x: x["score"], reverse=True)

        # Target quota distribution for max_clips
        # e.g. for 14 clips: clutch ~4, op_kill ~4, rush ~3, reaction ~2, funny ~1
        selected: List[Dict[str, Any]] = []

        def can_add(candidate: Dict[str, Any]) -> bool:
            c_mid = (candidate["start_time"] + candidate["end_time"]) / 2.0
            for s in selected:
                s_mid = (s["start_time"] + s["end_time"]) / 2.0
                if abs(c_mid - s_mid) < 22.0:  # Avoid heavy overlap
                    return False
            return True

        # Round 1: Give each category at least 1-2 top slots (guarantees diverse categories)
        min_per_cat = max(1, max_clips // 6)
        for cat in cat_keys:
            count = 0
            for item in pool_by_category[cat]:
                if can_add(item):
                    selected.append(item)
                    count += 1
                    if count >= min_per_cat or len(selected) >= max_clips:
                        break

        # Round 2: Fill remaining slots prioritized by score (clutch & op_kill favored)
        priority_cat_order = ["clutch", "op_kill", "rush", "reaction", "funny"]
        for cat in priority_cat_order:
            if len(selected) >= max_clips:
                break
            for item in pool_by_category[cat]:
                if item not in selected and can_add(item):
                    selected.append(item)
                    if len(selected) >= max_clips:
                        break

        # Round 3: If still under min_clips, fill with any valid non-overlapping moment
        if len(selected) < min_clips:
            full_pool.sort(key=lambda x: x["score"], reverse=True)
            for item in full_pool:
                if item not in selected and can_add(item):
                    selected.append(item)
                    if len(selected) >= max_clips:
                        break

        # Sort selected chronologically across video timeline
        selected.sort(key=lambda x: x["start_time"])

        # Step F: Generate High-Impact Titles, Captions, and Metadata per Category
        game_prof = game_detector.get_game_profile(game_title)
        short_game_tag = game_prof["short_name"].replace(" ", "")

        category_title_counters = {cat: 0 for cat in cat_keys}
        results = []

        for idx, item in enumerate(selected, 1):
            cat = item["category"]
            # Use game-authentic titles from the game profile
            game_cat_titles = game_prof.get("category_titles", {}).get(cat)
            if not game_cat_titles:
                cat_info = CATEGORIES.get(cat, CATEGORIES["clutch"])
                game_cat_titles = cat_info["titles"]

            # Select title cyclically for this category
            t_idx = category_title_counters[cat] % len(game_cat_titles)
            category_title_counters[cat] += 1
            clip_title = game_cat_titles[t_idx]

            yt_title = f"{clip_title} #{short_game_tag} #Shorts #ZyronByte"[:95]
            yt_desc = (
                game_prof["description_template"].format(
                    category_upper=cat.upper(), clip_title=clip_title
                )
                + "\n\n"
                + " ".join(game_prof["hashtags"])
            )
            ig_caption = game_prof["caption_template"].format(clip_title=clip_title)
            hashtags = game_prof["hashtags"]
            keywords = game_prof["keywords"] + [cat, "gaming shorts"]

            results.append({
                "title": f"Clip #{idx}: {clip_title}",
                "category": cat,
                "game_title": game_prof["display_name"],
                "description": f"High intensity {cat.upper()} highlight from {game_prof['display_name']} at {item['start_time']}s.",
                "score": item["score"],
                "start_time": item["start_time"],
                "end_time": item["end_time"],
                "youtube_title": yt_title,
                "youtube_description": yt_desc,
                "instagram_caption": ig_caption,
                "hashtags": hashtags,
                "keywords": keywords
            })

        logger.info(f"Heuristic highlight detector finalized {len(results)} clips for '{game_prof['display_name']}' across categories: "
                    f"{[r['category'] for r in results]}")
        return results

    def generate_single_clip_metadata(self, clip_title: str, category: str, game_title: Optional[str] = None) -> Dict[str, Any]:
        """Generates refreshed social metadata for an individual clip authentic to its specific game."""
        game_prof = game_detector.get_game_profile(game_title)
        g_name = game_prof["display_name"]
        short_tag = game_prof["short_name"].replace(" ", "")

        client = self.get_client()
        if client and self.api_key:
            try:
                prompt = f"""
Generate viral social media metadata for a gaming short titled '{clip_title}' with category '{category}' specifically for the game '{g_name}'.
Target creator: ZyronByteYT.
CRITICAL MANDATE:
- This clip is strictly from the game '{g_name}'.
- Write content authentic to '{g_name}'.
- DO NOT mention terms, weapons, or hashtags from other games (such as BGMI, PUBG, Chicken Dinner if '{g_name}' is not BGMI!).
Return valid JSON:
{{
  "youtube_title": "Catchy Shorts title under 65 chars with #{short_tag} #Shorts #ZyronByte",
  "youtube_description": "Catchy YouTube video description with call to action for @ZyronByteYT and authentic hashtags",
  "instagram_caption": "Engaging IG Reels caption with CTA and authentic hashtags",
  "hashtags": {json.dumps(game_prof["hashtags"][:6])},
  "keywords": {json.dumps(game_prof["keywords"][:6])}
}}
"""
                resp = client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(response_mime_type="application/json")
                )
                return json.loads(resp.text)
            except Exception as e:
                logger.warning(f"Single clip metadata generation failed: {e}")

        # Fallback game-authentic metadata
        yt_desc = (
            game_prof["description_template"].format(
                category_upper=category.upper(), clip_title=clip_title
            )
            + "\n\n"
            + " ".join(game_prof["hashtags"])
        )

        return {
            "youtube_title": f"{clip_title} 🔥 #{short_tag} #Shorts #ZyronByte"[:95],
            "youtube_description": yt_desc,
            "instagram_caption": game_prof["caption_template"].format(clip_title=clip_title),
            "hashtags": game_prof["hashtags"],
            "keywords": game_prof["keywords"] + [category, "shorts", "zyronbyte"]
        }

gemini_service = GeminiAIService()
