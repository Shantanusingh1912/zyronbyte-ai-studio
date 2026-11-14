# 🎮 ZyronByte AI Studio

> **AI-Powered Gaming Video Clipping, Professional 9:16 Editing, and Automated Social Media Publishing System for YouTube Channel [ZyronByteYT]**

---

## 🌟 Overview

**ZyronByte AI Studio** is a fully functional, self-contained automation system designed for gaming creators. It ingests long YouTube livestream recordings or local video files (OBS, ShadowPlay), automatically discovers high-energy gaming highlights using **Google Gemini AI** and **Whisper**, transforms horizontal 16:9 gameplay into 1080x1920 vertical video Shorts/Reels with dynamic framing, karaoke subtitles, and gaming sound effects, validates the output with a pre-flight Quality Control suite, and publishes to **YouTube Shorts** and **Instagram Reels** on an automated schedule.

---

## 🚀 Key Features

### 1. Video Ingestion & Import (Feature 1)
- **YouTube URLs & Livestreams**: Downloads high-res video and audio using `yt-dlp`.
- **Local Storage Import**: Accepts local MP4, MKV, and MOV recordings from OBS or capture cards.
- **Batch Processing**: Ingest multiple videos simultaneously for parallel pipeline processing.
- **Direct Web Upload**: Drag and drop footage directly inside the studio dashboard.

### 2. AI Highlight Detection (Feature 2)
- Powered by **Google Gemini AI** (`gemini-2.5-flash` / `gemini-2.5-pro`).
- Pinpoints:
  - Epic kills & clutch plays
  - Hilarious fails & banter
  - Screaming reactions & team calls
  - Unexpected game physics & clutch moments
- Computes excitement scores (0–100) and marks exact start and end timestamps.
- Filters out loading screens, menus, dead silence, and lobby downtime.

### 3. Automatic Clipping & Context Padding (Feature 3)
- Generates 5–10 punchy clips per long video (configurable 30–60 seconds).
- Includes 2–3 seconds of pre-roll and post-roll context so the viewer never misses the setup or reaction.
- Deduplicates overlapping highlights to maximize content variety.

### 4. Professional 9:16 Video Editing Engine (Feature 4)
- **1080x1920 Vertical Aspect Ratio**:
  - **Blurred Backdrop Fill**: The gold standard for gaming Shorts. Centers 16:9 gameplay over a heavily blurred, darkened 9:16 background.
  - **Stacked Split Layout**: Top 40% facecam zoom, bottom 60% gameplay action.
  - **Direct Center Crop**: Dynamic action crop.
- **Animated Karaoke Subtitles**: Bold high-contrast typography (Yellow `#FFDD00` & White) with thick black stroke and dynamic word highlighting. Positioned to avoid mobile UI overlays.
- **Dynamic Gaming SFX**: Automatically mixes subtle whooshes at transitions and bass impact/chime at the climax moment. Includes synthetic audio generation with zero external asset dependencies.
- **Audio Normalization**: Normalizes volume using the broadcast standard EBU R128 (`loudnorm`) filter.

### 5. AI Captions, SEO & Metadata (Feature 5)
- Catchy YouTube Shorts titles (with `#Shorts`, `#Gaming`, `#ZyronByte`).
- Instagram Reel captions with hook, emojis, and call to action.
- Gaming hashtags and targeted SEO keywords.

### 6. Social Media Publishing (Feature 6)
- **YouTube Data API v3**:
  - Official OAuth2 authentication flow.
  - Resumable video upload chunking for large Shorts.
  - Scheduled publication support (`publishAt`) and privacy settings (`public`, `unlisted`, `private`).
- **Instagram Graph API**:
  - Instagram Reels container creation, encoding polling, and direct publishing.
  - Zero password storage (uses secure OAuth tokens stored in local SQLite).

### 7. Automation Scheduler (Feature 7)
- Built on **APScheduler** background daemon.
- Configurable upload cadence (e.g. 1–3 clips per day spaced at peak gaming hours).
- Automatic retry on network drops and failed upload recovery.

### 8. Modern Dark-Themed Studio Dashboard (Feature 8)
- Modern dark-themed dashboard built with React 19, Vite, and Tailwind CSS.
- Real-time pipeline progress bars showing active operations (Whisper transcription, Gemini analysis, FFmpeg rendering).
- Integrated 9:16 vertical video player for instant clip previews.
- Clip approval gate, metadata editor, re-render controls, and system log viewer.

### 9. Pre-Flight Quality Control (Feature 9)
- Runs automated pre-flight checks before publishing:
  - Resolution verification (1080x1920).
  - Duration check (15s–60s).
  - Audio presence & volume check (detects muted or silent audio).
  - Black screen & frozen frame detection (`blackdetect`).
  - Bitstream integrity check (`ffmpeg -v error -f null -`).
- Requires manual approval initially, with a 1-click toggle to enable Full Auto-Publishing.

### 10. Robust Error Handling (Feature 10)
- Exponential backoff retry mechanism.
- State-machine tracking (`PENDING` ➔ `TRANSCRIBING` ➔ `ANALYZING` ➔ `EDITING` ➔ `READY_FOR_APPROVAL` ➔ `SCHEDULED` ➔ `PUBLISHED`).
- Resumable pipeline capability if interrupted.

---

## 🛠️ Project Structure

```
zyronbyte-ai-studio/
├── start.bat                   # 1-Click Windows Launcher
├── .env.example                # Environment variables template
├── .env                        # Local configuration
├── README.md                   # System documentation
├── backend/
│   ├── requirements.txt        # Python backend dependencies
│   ├── assets/sfx/             # Synthesized gaming sound effects (whoosh, impact, pop, ding)
│   ├── storage/                # SQLite database, imported raw footage, and rendered clips
│   ├── app/
│   │   ├── main.py             # FastAPI application & static file server
│   │   ├── config.py           # Configuration & path definitions
│   │   ├── database.py         # SQLAlchemy engine & SQLite session
│   │   ├── models.py           # Video, Clip, PublishQueue, SocialAccount, AppSetting models
│   │   ├── schemas.py          # Pydantic schemas for requests and responses
│   │   ├── api/                # REST API routers (videos, clips, pipeline, social, settings, logs)
│   │   └── services/
│   │       ├── downloader.py          # yt-dlp YouTube & local footage importer
│   │       ├── transcriber.py         # Faster-Whisper word-timestamp speech recognition
│   │       ├── gemini_ai.py           # Google Gemini highlight detection & viral metadata
│   │       ├── subtitle_gen.py        # ASS karaoke subtitle generator with highlighted keywords
│   │       ├── video_editor.py        # FFmpeg 9:16 vertical renderer & loudnorm mixer
│   │       ├── sfx_manager.py         # Synthetic audio generator for whooshes & impacts
│   │       ├── quality_control.py     # Pre-flight QC validator
│   │       ├── youtube_uploader.py    # Official YouTube Data API v3 OAuth & Shorts uploader
│   │       ├── instagram_uploader.py  # Instagram Graph API Reels uploader
│   │       ├── scheduler_service.py   # APScheduler automated queue publisher
│   │       └── pipeline_runner.py     # Master end-to-end background pipeline coordinator
│   └── tests/
│       └── test_system.py      # Automated test suite
└── frontend/
    ├── package.json            # React, Vite, and Tailwind dependencies
    ├── vite.config.js          # Vite config with API proxy
    ├── index.html              # HTML5 entry point
    └── src/
        ├── main.jsx            # React root
        ├── App.jsx             # Main dashboard controller
        ├── api.js              # REST API client
        └── components/         # Navbar, StatsOverview, VideoList, ClipGrid, Modals
```

---

## ⚡ Quick Start (Windows)

### 1. Launch with One Click
Double-click `start.bat` in the project root:
- Starts the FastAPI backend server on port 8000.
- Initializes the SQLite database.
- Synthesizes audio assets.
- Starts the background automation scheduler.
- Automatically opens `http://localhost:8000` in your default browser.

### 2. Manual Start (Optional)
**Terminal 1 (Backend):**
```powershell
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 (Frontend Dev Server - Optional):**
```powershell
cd frontend
npm run dev
```

---

## 🔑 Configuration & API Keys

You can enter your API keys either in the `.env` file or directly inside the Studio Dashboard by clicking the **Settings (⚙️)** icon:

```ini
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# YouTube Data API v3 OAuth
YOUTUBE_CLIENT_ID=your_client_id.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=your_client_secret

# Instagram Graph API
INSTAGRAM_ACCESS_TOKEN=your_instagram_graph_token
INSTAGRAM_ACCOUNT_ID=your_instagram_business_account_id
```

---

## 🧪 Automated Test Suite

Run the full end-to-end test suite anytime:
```powershell
python -m unittest backend.tests.test_system
```

All 7 test suites verify:
1. Dynamic SFX synthesis (whoosh, impact, pop, ding).
2. FFprobe stream metadata extraction.
3. ASS subtitle generation with word-level highlights.
4. FFmpeg 9:16 vertical video rendering with blur fill and audio normalization.
5. Pre-flight Quality Control inspector.
6. Gemini highlight detection and metadata generation.
7. SQLite database persistence and state transitions.
