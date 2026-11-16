import re
from typing import Dict, Any, List, Optional

GAME_PROFILES: Dict[str, Dict[str, Any]] = {
    "gta_5": {
        "display_name": "Grand Theft Auto V",
        "short_name": "GTA 5",
        "patterns": [
            r"\bgta\s*5\b", r"\bgta\s*v\b", r"\bgrand\s*theft\s*auto\b",
            r"\bgta\s*online\b", r"\bgta\s*rp\b", r"\blos\s*santos\b",
            r"\btrevor\b", r"\bfranklin\b", r"\bmichael\b", r"\brockstar\b"
        ],
        "hashtags": ["#GTA5", "#GTAV", "#GrandTheftAuto", "#GTAOnline", "#GTAViral", "#GTAClips", "#Gaming", "#ZyronByte", "#Shorts"],
        "keywords": ["gta 5", "gta v", "grand theft auto 5", "gta online", "los santos", "gta clips", "zyronbyteyt", "gaming shorts", "action"],
        "category_titles": {
            "clutch": [
                "Unbelievable 5-Star Police Escape in GTA 5! 🚓💨",
                "He Pulled Off The Cleanest Heist Escape in GTA V! 💰",
                "Last Second Insane Vehicle Save in GTA Online! 🏎️💨",
                "Survival Mode Madness! Barely Escaped Alive in GTA 5 💀",
                "Outrunning 5-Star Cops With 1 Flat Tire in GTA 5! 🚨"
            ],
            "op_kill": [
                "Disgusting Sniper Shot Across Los Santos! 🎯",
                "Cleanest Drive-By Headshot in GTA 5! 💥",
                "Bro Completely Wiped The Whole Lobby in GTA Online ⚡",
                "Most Satisfying Sticky Bomb Play in GTA V! 💣",
                "Pure Precision Headshot In High Speed Chase! 🎯"
            ],
            "rush": [
                "5-Star Police Chase Full Send in Los Santos! 🚨",
                "High Speed Highway Rampage In GTA 5! 🏎️💨",
                "Absolute Chaos In The Downtown Shootout! 💥",
                "Military Base Infiltration Gone Completely Wild! ✈️💥",
                "Aggressive Heist Escape Through The Subway! 🚨"
            ],
            "reaction": [
                "Bro Lost His Mind Over This GTA 5 Physics Moment! 💀",
                "Trevor's Craziest Mission Had Us Dying Laughing! 😭",
                "His Reaction To The 5-Star Cops Was Priceless! 😂",
                "Bro Did NOT Expect This NPC To Do That! 😱",
                "The Funniest Cop Encounter in Los Santos History! 🗣️"
            ],
            "funny": [
                "When GTA 5 Physics Decide To Completely Break! 🚗✈️",
                "Funniest NPC Encounter in Los Santos History 😭💀",
                "How Did He Even Survive This GTA 5 Crash?! 😂",
                "Instant Regret Trying To Steal This Car In GTA 5 💀",
                "When The Parachute Opens 0.1 Seconds Too Late in GTA 5 😂"
            ]
        },
        "description_template": (
            "Insane {category_upper} highlight from Grand Theft Auto V! Watch {clip_title}.\n\n"
            "Subscribe to @ZyronByteYT for daily GTA 5, GTA Online, and gaming shorts!"
        ),
        "caption_template": (
            "{clip_title}\n\n"
            "Los Santos chaos at its finest! 🚓💨 What would you do in this situation?\n"
            "Drop a follow @ZyronByteYT for daily GTA 5 & gaming shorts!\n\n"
            "#gta5 #gtav #gtaonline #gtarp #grandtheftauto #gaming #shorts #reels #zyronbyte"
        )
    },
    "bgmi": {
        "display_name": "BGMI / PUBG Mobile",
        "short_name": "BGMI",
        "patterns": [
            r"\bbgmi\b", r"\bpubg\b", r"\bbattlegrounds\s*mobile\b",
            r"\berangel\b", r"\bmiramar\b", r"\blivik\b", r"\bsanhok\b",
            r"\bkRAFTON\b", r"\bm416\b", r"\bglacier\b", r"\btdm\b"
        ],
        "hashtags": ["#BGMI", "#PUBGMobile", "#BGMIShorts", "#BattlegroundsMobileIndia", "#BGMIClips", "#Gaming", "#ZyronByte", "#Shorts"],
        "keywords": ["bgmi", "pubg mobile", "bgmi clutch", "bgmi highlights", "erangel", "zyronbyteyt", "gaming shorts", "tdm", "esports"],
        "category_titles": {
            "clutch": [
                "UNREAL 1v4 BGMI Clutch! Winner Winner Chicken Dinner 🏆",
                "Solo vs Squad Final Circle Madness in BGMI! 🥶",
                "Down To 1 HP In The Final Zone! Insane BGMI Clutch 🔥",
                "Coldest 1v3 Battle Royale Clutch You'll See Today 🏆",
                "He Pulled Off The Impossible 1v4 In Ranked Lobby! 😱"
            ],
            "op_kill": [
                "DISGUSTING M24 One-Tap Sniper Headshot in BGMI! 🎯",
                "INSANE Squad Wipe In 5 Seconds! Clean BGMI Spray ⚡",
                "Pure Aimbot or 200 IQ M416 Laser Spray in BGMI? 💥",
                "Dirtiest AWM Quickscope Across The Map! 🎯",
                "Bro Just Deleted The Whole Squad In TDM! ⚡"
            ],
            "rush": [
                "Full Squad Aggressive Rush in BGMI Gone Wild! 🚨",
                "Insane Close-Range Jiggle Reflexes Under Heavy Fire! 💥",
                "They Tried To Rush The Compound & Regretted It ⚡",
                "Absolute Chaos At The Airdrop Fight in BGMI! 📦",
                "When The Squad Decides To Go Full Send in Erangel! 🏎️💨"
            ],
            "reaction": [
                "Bro Completely Lost His Mind After This BGMI Play! 💀",
                "Hacker Hai Kya?! Unbelievable Reaction in BGMI 😱",
                "His Reaction Said Absolutely Everything! 😂",
                "The Entire Lobby Heard That Screaming! 🗣️",
                "Bro Smashed His Phone After This No-Register! 😭"
            ],
            "funny": [
                "When The Frag Grenade Bounces Straight Back At You 😭💀",
                "Funniest Bot Encounter in BGMI Ranked History 💀",
                "How Did He Even Miss That?! Biggest Fail in BGMI 😂",
                "When Buggy Driving Goes Completely Wrong in Erangel 🚗💥",
                "Loot Ke Chakkar Me Pura Squad Khatam Ho Gaya 😂"
            ]
        },
        "description_template": (
            "High adrenaline {category_upper} highlight from BGMI / PUBG Mobile! {clip_title}.\n\n"
            "Subscribe to @ZyronByteYT for daily BGMI clutch plays and tournament highlights!"
        ),
        "caption_template": (
            "{clip_title}\n\n"
            "Rate this BGMI play 1-10 in the comments! 👇 Winner Winner Chicken Dinner!\n"
            "Drop a follow @ZyronByteYT for daily BGMI highlights & gaming shorts!\n\n"
            "#bgmi #pubgmobile #bgmishorts #bgmiclips #gaming #shorts #reels #zyronbyte"
        )
    },
    "valorant": {
        "display_name": "Valorant",
        "short_name": "Valorant",
        "patterns": [
            r"\bvalorant\b", r"\bvandal\b", r"\bphantom\b", r"\bjett\b",
            r"\breyna\b", r"\bradiant\b", r"\bascendant\b", r"\bclove\b",
            r"\biso\b", r"\briot\s*games\b", r"\boperator\b", r"\bop\b"
        ],
        "hashtags": ["#Valorant", "#ValorantClips", "#ValorantHighlights", "#ValorantAce", "#Radiant", "#Gaming", "#ZyronByte", "#Shorts"],
        "keywords": ["valorant", "valorant clips", "valorant ace", "vandal one tap", "radiant", "zyronbyteyt", "gaming shorts", "riot games"],
        "category_titles": {
            "clutch": [
                "CLEANEST 1v4 Vandal Clutch In Radiant Lobby! 🎯",
                "Down To Last 5 Seconds! Unreal 1v3 Defuse Clutch 🔥",
                "He Actually Won The 1v5 In Overtime! 🏆",
                "Coldest Vandal Clutch You'll Watch Today 🥶",
                "Pure 200 IQ Brain Play Defuse Under Smoke! 🧠"
            ],
            "op_kill": [
                "DIRTIEST Operator Flick Shot In Valorant! 🎯",
                "Crisp 1-Tap Vandal Ace In Under 4 Seconds! ⚡",
                "Is Bro Aim Botting?! Disgusting Headshot Transfer 💥",
                "Cleanest Jett Knives Ace You'll Ever See 🔥",
                "Most Disgusting Marshal Collateral in Ranked! 🎯"
            ],
            "rush": [
                "Full Team Fast A-Site Execute & Chaos! 🚨",
                "Aggressive Jett Entry Dash Into Site! ⚡",
                "They Pushed The Smoke & Instantly Regretted It 💥",
                "Mid Control Aggression Gone Completely Right! 🚨"
            ],
            "reaction": [
                "Bro Screamed In 4K After That Valorant Flick! 💀",
                "The Whole Discord Exploded After This Play! 🗣️",
                "Is He Cheating?! Enemy Team Reaction in All Chat 😱",
                "His Face When He Realized He Won The 1v5 😂"
            ],
            "funny": [
                "Funniest Silver Lobby Whiff You'll Ever Witness 😭💀",
                "When You Miss All 30 Bullets On A Defusing Enemy 😂",
                "Raze Ult Disaster! Blown Up By His Own Rocket 💀",
                "The Most Unlucky Timing In Valorant History 😭"
            ]
        },
        "description_template": (
            "Insane {category_upper} highlight from Valorant! {clip_title}.\n\n"
            "Subscribe to @ZyronByteYT for daily Valorant aces, radiant plays, and clips!"
        ),
        "caption_template": (
            "{clip_title}\n\n"
            "Vandal or Phantom? Drop your rank in the comments! 👇\n"
            "Follow @ZyronByteYT for daily Valorant aces and radiant highlights!\n\n"
            "#valorant #valorantclips #valoranthighlights #valorantace #gaming #shorts #reels #zyronbyte"
        )
    },
    "call_of_duty": {
        "display_name": "Call of Duty: Warzone",
        "short_name": "Warzone",
        "patterns": [
            r"\bcall\s*of\s*duty\b", r"\bwarzone\b", r"\bcod\b", r"\bmodern\s*warfare\b",
            r"\bmw3\b", r"\bmw2\b", r"\brebirth\s*island\b", r"\bgulag\b", r"\bblack\s*ops\b"
        ],
        "hashtags": ["#Warzone", "#CallOfDuty", "#CODWarzone", "#CODMobile", "#RebirthIsland", "#Gaming", "#ZyronByte", "#Shorts"],
        "keywords": ["call of duty", "warzone", "cod warzone", "rebirth island", "warzone victory", "zyronbyteyt", "gaming shorts"],
        "category_titles": {
            "clutch": [
                "Solo vs Quads Rebirth Island Victory! 🔥🏆",
                "1v4 Gulag Return Clutch For The Win! 🥶",
                "Down In Gas With 1 Health! Unreal Warzone Clutch 💀",
                "Last Man Standing In Final Gas Circle! GG 🏆"
            ],
            "op_kill": [
                "DIRTIEST Kar98 Quickscope Across The Map! 🎯",
                "Fastest Squad Wipe In Warzone Ranked History! ⚡",
                "Cleanest Movement & Beam You'll See Today 💥",
                "Disgusting Throwing Knife Elim Across The Roof! 🔪"
            ],
            "rush": [
                "Aggressive Slide Cancel Push Through Heavy Gas! 🚨",
                "Full Squad Breach & Clear In Prison Tower! 💥",
                "They Landed On Our Loadout & Got Deleted ⚡"
            ],
            "reaction": [
                "The Death Comms After This Kill Were Pure Gold! 😂🗣️",
                "Bro Smashed His Desk After This Warzone Death! 💀",
                "Is That A Hacker?! Death Chat Melting Down 😱"
            ],
            "funny": [
                "Funniest Loadout Drop Crush In Warzone History 😭💀",
                "When Parachute Fails To Open In Final Circle 😂",
                "He Tried To Execute Me & The Karma Was Instant 💀"
            ]
        },
        "description_template": (
            "High intensity {category_upper} highlight from Call of Duty: Warzone! {clip_title}.\n\n"
            "Subscribe to @ZyronByteYT for daily Warzone clips, loadouts, and high kill gameplay!"
        ),
        "caption_template": (
            "{clip_title}\n\n"
            "Rebirth Island or Verdansk? What's your go-to loadout? 👇\n"
            "Follow @ZyronByteYT for daily Warzone clips & high-kill gameplay!\n\n"
            "#warzone #callofduty #codwarzone #rebirthisland #gaming #shorts #reels #zyronbyte"
        )
    },
    "free_fire": {
        "display_name": "Free Fire",
        "short_name": "Free Fire",
        "patterns": [
            r"\bfree\s*fire\b", r"\bfreefire\b", r"\bgarena\s*free\s*fire\b", r"\bbooyah\b"
        ],
        "hashtags": ["#FreeFire", "#FreeFireIndia", "#FFShorts", "#Booyah", "#FreeFireHighlights", "#Gaming", "#ZyronByte", "#Shorts"],
        "keywords": ["free fire", "free fire india", "ff highlights", "ff one tap headshot", "booyah", "zyronbyteyt", "gaming shorts"],
        "category_titles": {
            "clutch": [
                "1v4 Insane One-Tap Clutch! Booyah Match! 🏆",
                "Last Second Gloo Wall Clutch For The Booyah 🔥",
                "Down To 5 HP! Coldest Free Fire Clutch You'll Watch 🥶"
            ],
            "op_kill": [
                "Dirtiest Desert Eagle One-Tap Headshot in Free Fire! 🎯",
                "M1887 Double Barrel Squad Wipe in 3 Seconds! ⚡",
                "Disgusting AWM Snipe Through Gloo Wall! 💥"
            ],
            "rush": [
                "Aggressive Gloo Wall Rush In Ranked Free Fire! 🚨",
                "Full Squad Push Gone Completely Wild! 💥"
            ],
            "reaction": [
                "Bro's Reaction After This Booyah Was Unreal! 😱",
                "Hacker Level One-Tap Reaction in Free Fire! 🗣️"
            ],
            "funny": [
                "Funniest Gloo Wall Trap Fail in Free Fire 😭💀",
                "When You Grenade Your Own Teammate In Ranked 😂"
            ]
        },
        "description_template": (
            "Insane {category_upper} highlight from Free Fire! {clip_title}.\n\n"
            "Subscribe to @ZyronByteYT for daily Free Fire one-taps and Booyah moments!"
        ),
        "caption_template": (
            "{clip_title}\n\n"
            "Drop your Free Fire ID in the comments! 👇 Booyah squad!\n"
            "Follow @ZyronByteYT for daily Free Fire one-taps & highlights!\n\n"
            "#freefire #freefireindia #ffshorts #booyah #gaming #shorts #reels #zyronbyte"
        )
    },
    "minecraft": {
        "display_name": "Minecraft",
        "short_name": "Minecraft",
        "patterns": [
            r"\bminecraft\b", r"\bbedwars\b", r"\bskywars\b", r"\bhardcore\b", r"\bnetherite\b"
        ],
        "hashtags": ["#Minecraft", "#MinecraftShorts", "#MinecraftClips", "#Bedwars", "#Gaming", "#ZyronByte", "#Shorts"],
        "keywords": ["minecraft", "minecraft clips", "bedwars", "minecraft clutch", "zyronbyteyt", "gaming shorts"],
        "category_titles": {
            "clutch": [
                "UNREAL 100-Block MLG Water Bucket Clutch! 🪣🔥",
                "Bed Destroyed! 1v4 Bedwars Final Kill Clutch 🏆",
                "Nearly Died In Hardcore 100 Days! Barely Survived 💀"
            ],
            "op_kill": [
                "Disgusting Fireball Jump 360 Bow Snipe In Bedwars! 🎯",
                "Cleanest Netherite Sword Combo In Minecraft PvP ⚡"
            ],
            "rush": [
                "Fastest Bedwars Bridge Rush In History! 🚨",
                "Aggressive Ender Pearl Push Straight Into Base! 💥"
            ],
            "reaction": [
                "His Heart Stopped When The Creeper Snuck Up! 😱💥",
                "Unbelievable Reaction To Finding 8 Ancient Debris! 🤯"
            ],
            "funny": [
                "When The Water Bucket Decides Not To Place 😭💀",
                "Dying To Gravel In Minecraft Hardcore 😂"
            ]
        },
        "description_template": (
            "Epic {category_upper} moment from Minecraft! {clip_title}.\n\n"
            "Subscribe to @ZyronByteYT for daily Minecraft hardcore clips and Bedwars plays!"
        ),
        "caption_template": (
            "{clip_title}\n\n"
            "Could you pull off this MLG clutch? 🪣 Drop a comment below!\n"
            "Follow @ZyronByteYT for daily Minecraft highlights & bedwars clutch plays!\n\n"
            "#minecraft #minecraftshorts #minecraftclips #bedwars #gaming #shorts #reels #zyronbyte"
        )
    },
    "cs2": {
        "display_name": "Counter-Strike 2",
        "short_name": "CS2",
        "patterns": [
            r"\bcounter\s*strike\b", r"\bcs2\b", r"\bcsgo\b", r"\bcs:go\b",
            r"\bde_dust2\b", r"\bmirage\b", r"\bawp\b"
        ],
        "hashtags": ["#CS2", "#CounterStrike", "#CSGO", "#CS2Clips", "#AWP", "#Gaming", "#ZyronByte", "#Shorts"],
        "keywords": ["cs2", "counter strike 2", "csgo clips", "awp ace", "zyronbyteyt", "gaming shorts"],
        "category_titles": {
            "clutch": [
                "DIRTIEST 1v4 AWP Clutch on Mirage! 🎯",
                "Coldest 1v3 Deagle Clutch In Premier Mode! 🔥",
                "1 Second Left On Bomb Defuse In Overtime! 🏆"
            ],
            "op_kill": [
                "Cleanest AK-47 One-Tap Ace In CS2! 🎯",
                "Most Disgusting AWP Flick Through Smoke! 💥"
            ],
            "rush": [
                "Full B-Rush Flash Execute Chaos! 🚨",
                "Fastest Banana Take In Inferno History! 💥"
            ],
            "reaction": [
                "Bro Couldn't Believe That AWP Wallbang! 😱",
                "The Comms When He Won The 1v4 Clutch! 🗣️"
            ],
            "funny": [
                "When You Blind Your Entire Team With A Flashbang 😂💀",
                "Funniest Silver Smoke Ninja Defuse Ever 😂"
            ]
        },
        "description_template": (
            "Crisp {category_upper} highlight from Counter-Strike 2! {clip_title}.\n\n"
            "Subscribe to @ZyronByteYT for daily CS2 aces, AWP flicks, and clips!"
        ),
        "caption_template": (
            "{clip_title}\n\n"
            "What's your CS2 Premier rating? Drop your thoughts below! 👇\n"
            "Follow @ZyronByteYT for daily Counter-Strike 2 clips!\n\n"
            "#cs2 #counterstrike #csgo #cs2clips #gaming #shorts #reels #zyronbyte"
        )
    },
    "apex_legends": {
        "display_name": "Apex Legends",
        "short_name": "Apex Legends",
        "patterns": [
            r"\bapex\s*legends\b", r"\bapex\b", r"\bwraith\b", r"\boctane\b", r"\bpathfinder\b"
        ],
        "hashtags": ["#ApexLegends", "#ApexClips", "#ApexShorts", "#ApexHighlights", "#Gaming", "#ZyronByte", "#Shorts"],
        "keywords": ["apex legends", "apex clips", "apex clutch", "champion squad", "zyronbyteyt", "gaming shorts"],
        "category_titles": {
            "clutch": [
                "Solo 1v3 For The Apex Champion Title! 🏆🔥",
                "Crazy Superglide Kraber Clutch For The Win! 🎯"
            ],
            "op_kill": [
                "Most Disgusting Kraber Headshot In Apex History! 🎯",
                "Wingman 3-Tap Squad Wipe Under Heavy Fire! ⚡"
            ],
            "rush": [
                "Aggressive Octane Jump Pad Push Straight Into Squad! 🚨",
                "Third-Party Ambush Turnaround Gone Crazy! 💥"
            ],
            "reaction": [
                "His Reaction To The 360 Kraber Snipe! 😱",
                "Bro Screamed After Winning As Solo! 🗣️"
            ],
            "funny": [
                "When You Grapple Straight Off The Map On Olympus 😭💀",
                "Funniest Supply Bin Glitch Moment 😂"
            ]
        },
        "description_template": (
            "Insane {category_upper} moment from Apex Legends! {clip_title}.\n\n"
            "Subscribe to @ZyronByteYT for daily Apex Legends movement and champion gameplay!"
        ),
        "caption_template": (
            "{clip_title}\n\n"
            "Who is your main legend? Drop it in the comments! 👇\n"
            "Follow @ZyronByteYT for daily Apex Legends highlights!\n\n"
            "#apexlegends #apexclips #apexshorts #gaming #shorts #reels #zyronbyte"
        )
    },
    "generic_gaming": {
        "display_name": "General Gaming",
        "short_name": "Gaming",
        "patterns": [],
        "hashtags": ["#Gaming", "#GamingShorts", "#Gamer", "#GamingHighlights", "#ViralClips", "#ZyronByte", "#Shorts", "#Gameplay"],
        "keywords": ["gaming", "gamer", "gaming highlights", "epic gaming moments", "zyronbyteyt", "gaming shorts", "fps", "gameplay"],
        "category_titles": {
            "clutch": [
                "UNREAL 1v4 Clutch Play! Down To The Last Second 🔥",
                "Pure 200 IQ Brain Play Under Pressure! 🏆",
                "Down To 1 HP! He Actually Won The Impossible Match 🥶",
                "Coldest Clutch You'll Watch Today 🏆"
            ],
            "op_kill": [
                "DISGUSTING One-Tap Elimination! Clean Precision 🎯",
                "INSANE Team Wipe In 5 Seconds! Pure Precision ⚡",
                "Cleanest Flick Shot Of The Entire Stream 🔥",
                "Bro Just Deleted The Whole Team! ⚡"
            ],
            "rush": [
                "Aggressive Full Send Rush Gone Completely Wild! 🚨",
                "Insane Close-Range Combat Under Heavy Fire! 💥",
                "They Tried To Ambush & Instantly Regretted It ⚡"
            ],
            "reaction": [
                "Bro Completely Lost His Mind After This! 💀",
                "His Reaction Said Absolutely Everything! 😂",
                "The Entire Lobby Heard That Scream! 🗣️",
                "Bro Could Not Believe What Just Happened 😱"
            ],
            "funny": [
                "When Physics Decide To Completely Break Down 😭💀",
                "Funniest Gaming Moment Of The Entire Year 😂",
                "How Did This Even Happen?! The Biggest Fail 💀",
                "Bro Died In The Funniest Way Possible 😭"
            ]
        },
        "description_template": (
            "High adrenaline {category_upper} highlight! {clip_title}.\n\n"
            "Subscribe to @ZyronByteYT for daily gaming shorts and livestream highlights!"
        ),
        "caption_template": (
            "{clip_title}\n\n"
            "Rate this play 1-10 in the comments! 👇\n"
            "Drop a follow @ZyronByteYT for daily high-octane gaming shorts!\n\n"
            "#gaming #gamers #shorts #reels #gamingcommunity #zyronbyte #gameplay"
        )
    }
}


class GameDetector:
    """Intelligent game detection, profiles, and authentic social copy templates."""

    @classmethod
    def detect_game(cls, text: str, fallback_name: Optional[str] = None) -> Dict[str, Any]:
        """Detects the specific game from video title, description, or filename."""
        if not text:
            if fallback_name and fallback_name in GAME_PROFILES:
                return {
                    "key": fallback_name,
                    "display_name": GAME_PROFILES[fallback_name]["display_name"],
                    "short_name": GAME_PROFILES[fallback_name]["short_name"],
                    "confidence": "fallback"
                }
            return {
                "key": "generic_gaming",
                "display_name": GAME_PROFILES["generic_gaming"]["display_name"],
                "short_name": GAME_PROFILES["generic_gaming"]["short_name"],
                "confidence": "default"
            }

        # Normalize text and replace underscores and hyphens with spaces for filename compatibility
        text_lower = text.lower().replace("_", " ").replace("-", " ")

        # Check explicit patterns per game
        for key, profile in GAME_PROFILES.items():
            if key == "generic_gaming":
                continue
            for pat in profile["patterns"]:
                if re.search(pat, text_lower):
                    return {
                        "key": key,
                        "display_name": profile["display_name"],
                        "short_name": profile["short_name"],
                        "confidence": "high",
                        "matched_pattern": pat
                    }

        # If user explicitly passed a game name
        if fallback_name:
            norm = fallback_name.lower().replace(" ", "_").replace("/", "_")
            for k in GAME_PROFILES:
                if k in norm or norm in k:
                    return {
                        "key": k,
                        "display_name": GAME_PROFILES[k]["display_name"],
                        "short_name": GAME_PROFILES[k]["short_name"],
                        "confidence": "user_input"
                    }
            return {
                "key": "custom",
                "display_name": fallback_name,
                "short_name": fallback_name,
                "confidence": "user_input"
            }

        return {
            "key": "generic_gaming",
            "display_name": GAME_PROFILES["generic_gaming"]["display_name"],
            "short_name": GAME_PROFILES["generic_gaming"]["short_name"],
            "confidence": "generic"
        }

    @classmethod
    def get_game_profile(cls, key_or_name: Optional[str]) -> Dict[str, Any]:
        """Retrieves game profile with metadata and templates."""
        if not key_or_name:
            return GAME_PROFILES["generic_gaming"]

        key_or_name_lower = key_or_name.lower().strip()

        # Direct key match
        if key_or_name_lower in GAME_PROFILES:
            return GAME_PROFILES[key_or_name_lower]

        # Match by display name or pattern
        for key, prof in GAME_PROFILES.items():
            if (prof["display_name"].lower() == key_or_name_lower or 
                prof["short_name"].lower() == key_or_name_lower):
                return prof
            for pat in prof["patterns"]:
                if re.search(pat, key_or_name_lower):
                    return prof

        # If it's a custom game name specified by the user
        custom_tag = re.sub(r'[^a-zA-Z0-9]', '', key_or_name)
        return {
            "display_name": key_or_name,
            "short_name": key_or_name,
            "patterns": [],
            "hashtags": [f"#{custom_tag}", f"#{custom_tag}Clips", "#Gaming", "#GamingShorts", "#ZyronByte", "#Shorts"],
            "keywords": [key_or_name.lower(), f"{key_or_name.lower()} highlights", "zyronbyteyt", "gaming shorts"],
            "category_titles": {
                cat: [t.replace("Gaming", key_or_name) for t in titles]
                for cat, titles in GAME_PROFILES["generic_gaming"]["category_titles"].items()
            },
            "description_template": (
                f"Epic {{category_upper}} highlight from {key_or_name}! {{clip_title}}.\n\n"
                f"Subscribe to @ZyronByteYT for daily {key_or_name} & gaming shorts!"
            ),
            "caption_template": (
                f"{{clip_title}}\n\n"
                f"Rate this {key_or_name} moment 1-10 in the comments! 👇\n"
                f"Follow @ZyronByteYT for daily {key_or_name} shorts!\n\n"
                f"#{custom_tag.lower()} #gaming #shorts #reels #zyronbyte"
            )
        }

    @classmethod
    def get_supported_games(cls) -> List[Dict[str, str]]:
        """Returns list of supported games for frontend dropdowns."""
        res = [{"key": "auto", "label": "Auto-Detect Game From Video"}]
        for k, p in GAME_PROFILES.items():
            if k != "generic_gaming":
                res.append({"key": k, "label": p["display_name"]})
        res.append({"key": "generic_gaming", "label": "Other / Generic Gaming"})
        return res

game_detector = GameDetector()
