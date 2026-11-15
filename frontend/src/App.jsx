import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import PipelineProgress from './components/PipelineProgress';
import VideoList from './components/VideoList';
import QuickUrlClipper from './components/QuickUrlClipper';
import ClipGrid from './components/ClipGrid';
import VideoImporter from './components/VideoImporter';
import CustomCutModal from './components/CustomCutModal';
import ClipPreviewModal from './components/ClipPreviewModal';
import SocialAccountsModal from './components/SocialAccountsModal';
import SettingsModal from './components/SettingsModal';
import LogsViewer from './components/LogsViewer';
import { api } from './api';
import { Film, Scissors, Sparkles, Upload, Play, Pause, RefreshCw } from 'lucide-react';

export default function App() {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [clips, setClips] = useState([]);
  const [pipelineStatus, setPipelineStatus] = useState(null);
  
  // Filtering & Selection
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [previewClip, setPreviewClip] = useState(null);

  // Modals
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCustomCutOpen, setIsCustomCutOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [statsData, videosData, clipsData, pipeData] = await Promise.all([
        api.getStats().catch(() => null),
        api.getVideos().catch(() => []),
        api.getClips(selectedVideoId ? { video_id: selectedVideoId } : {}).catch(() => []),
        api.getPipelineStatus().catch(() => null)
      ]);

      if (statsData) setStats(statsData);
      if (videosData) setVideos(videosData);
      if (clipsData) setClips(clipsData);
      if (pipeData) setPipelineStatus(pipeData);
    } catch (err) {
      console.error('Error fetching studio data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    // Real-time polling interval (every 4 seconds)
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [selectedVideoId]);

  const handleToggleAutoPublish = async (enabled) => {
    try {
      await api.updateSettings({ auto_publish: enabled });
      fetchData();
    } catch (err) {
      alert(`Failed to update publishing mode: ${err.message}`);
    }
  };

  const handleTogglePause = async () => {
    try {
      if (pipelineStatus?.is_paused) {
        await api.resumePipeline();
      } else {
        await api.pausePipeline();
      }
      fetchData();
    } catch (err) {
      alert(`Failed to toggle pause: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen apple-canvas text-zinc-100 flex flex-col selection:bg-amber-400 selection:text-black">
      {/* Navigation Bar */}
      <Navbar
        stats={stats}
        pipelineStatus={pipelineStatus}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenCut={() => setIsCustomCutOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSocial={() => setIsSocialOpen(true)}
        onOpenLogs={() => setIsLogsOpen(true)}
        onTogglePause={handleTogglePause}
        onRefresh={fetchData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* Apple & Samsung Galaxy AI Style Hero Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-7 pt-2">
          <div>
            <div className="flex items-center space-x-2.5 mb-2.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
              </span>
              <span className="text-[11px] font-extrabold tracking-[0.2em] text-cyan-400 uppercase">
                STUDIO PRO // 2026 EDITION
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-sans">
              Autonomous Video Clipping & <span className="galaxy-ai-text">Publishing Studio</span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 mt-2.5 max-w-2xl leading-relaxed">
              Transform long livestreams and full gaming footage into high-energy 9:16 vertical Shorts and Reels with real-time combat audio peak detection and synced animated subtitles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-end">
            <span className="text-[11px] font-bold px-3.5 py-1.5 rounded-full bg-white/10 text-white border border-white/15 backdrop-blur-xl shadow-sm">
              GEMINI 2.5 FLASH
            </span>
            <span className="text-[11px] font-bold px-3.5 py-1.5 rounded-full bg-white/10 text-white border border-white/15 backdrop-blur-xl shadow-sm">
              FFMPEG 1080x1920
            </span>
            <span className="text-[11px] font-bold px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 backdrop-blur-xl shadow-sm shadow-amber-500/20">
              ⚡ SMART COMBAT AI
            </span>
          </div>
        </div>

        {/* 1-Click Fast URL Auto-Clipper Bar */}
        <QuickUrlClipper onVideoImported={fetchData} />

        {/* KPI & Metric Cards */}
        <StatsOverview
          stats={stats}
          onToggleAutoPublish={handleToggleAutoPublish}
        />

        {/* Real-time Pipeline Progress (Visible when active) */}
        <PipelineProgress pipelineStatus={pipelineStatus} />

        {/* Master Footage Library (Videos) */}
        <VideoList
          videos={videos}
          selectedVideoId={selectedVideoId}
          onSelectVideo={setSelectedVideoId}
          onRefresh={fetchData}
        />

        {/* AI Highlight Clips Section */}
        <section className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/30">
                  9:16 VERTICAL SHOWCASE
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                Generated Highlights Gallery
              </h3>
              <p className="text-xs text-zinc-400">
                {selectedVideoId ? 'Displaying clips for selected video' : 'Displaying all generated shorts across games'}
              </p>
            </div>

            {selectedVideoId && (
              <button
                onClick={() => setSelectedVideoId(null)}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 self-start sm:self-center px-3 py-1.5 rounded-full bg-white/5 border border-white/10 transition"
              >
                Clear video filter ✕
              </button>
            )}
          </div>

          <ClipGrid
            clips={clips}
            onPreviewClip={setPreviewClip}
            onRefresh={fetchData}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedStatus={selectedStatus}
            onSelectStatus={setSelectedStatus}
          />
        </section>

      </main>

      {/* Studio Footer */}
      <footer className="border-t border-white/10 mt-16 py-8 px-4 text-center text-xs text-zinc-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white">ZyronByte AI Studio</span>
            <span>•</span>
            <span>Channel: ZyronByteYT</span>
          </div>
          <div className="text-zinc-300">
            Powered by Google Gemini 2.5 Flash, Whisper AI & FFmpeg
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isImportOpen && (
        <VideoImporter
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onImportSuccess={() => {
            fetchData();
            setIsImportOpen(false);
          }}
        />
      )}

      {isCustomCutOpen && (
        <CustomCutModal
          isOpen={isCustomCutOpen}
          onClose={() => setIsCustomCutOpen(false)}
          videos={videos}
          onCutCreated={() => {
            fetchData();
            setIsCustomCutOpen(false);
          }}
        />
      )}

      {previewClip && (
        <ClipPreviewModal
          clip={previewClip}
          isOpen={Boolean(previewClip)}
          onClose={() => setPreviewClip(null)}
          onClipUpdated={() => {
            fetchData();
            setPreviewClip(null);
          }}
        />
      )}

      {isSocialOpen && (
        <SocialAccountsModal
          isOpen={isSocialOpen}
          onClose={() => setIsSocialOpen(false)}
          onAccountsUpdated={fetchData}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSettingsUpdated={fetchData}
        />
      )}

      {isLogsOpen && (
        <LogsViewer
          isOpen={isLogsOpen}
          onClose={() => setIsLogsOpen(false)}
        />
      )}

    </div>
  );
}
