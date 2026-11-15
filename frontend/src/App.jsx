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
    <div className="min-h-screen bg-[#06080F] text-slate-100 flex flex-col studio-grid-bg selection:bg-indigo-500 selection:text-white">
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        
        {/* Editorial Studio Hero Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/[0.08] pb-5 pt-1">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span className="studio-pill text-[10px] font-black tracking-widest text-indigo-400">
                PRO AUTOMATION SYSTEM // EDITION 2026
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sans">
              Autonomous Video Clipping & Studio
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Turn long livestreams and gaming footage into viral 9:16 YouTube Shorts and Instagram Reels with synced animated subtitles and smart combat detection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-end">
            <span className="studio-pill text-[9px] font-bold px-2.5 py-1 rounded-lg bg-white/[0.04] text-slate-300 border border-white/[0.08]">
              GEMINI 2.5 FLASH
            </span>
            <span className="studio-pill text-[9px] font-bold px-2.5 py-1 rounded-lg bg-white/[0.04] text-slate-300 border border-white/[0.08]">
              FFMPEG 1080x1920
            </span>
            <span className="studio-pill text-[9px] font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              WHISPER AI SYNC
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

        {/* Generated Gaming Shorts & Reels (Clips Grid) */}
        <div className="space-y-4 pt-4 border-t border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Generated Shorts & Reels Gallery
                </h3>
                <p className="text-xs text-slate-400">9:16 vertical edits ready for review and publishing</p>
              </div>
              <span className="studio-pill text-[10px] px-2.5 py-1 rounded-full bg-white/[0.04] text-slate-300 font-bold border border-white/[0.08]">
                {clips.length} TOTAL
              </span>
            </div>
            
            {selectedVideoId && (
              <button
                onClick={() => setSelectedVideoId(null)}
                className="studio-pill text-xs text-indigo-400 hover:text-indigo-300 font-bold px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 transition"
              >
                Clear Video Filter ✕
              </button>
            )}
          </div>

          <ClipGrid
            clips={clips}
            onPreviewClip={(clip) => setPreviewClip(clip)}
            onRefresh={fetchData}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedStatus={selectedStatus}
            onSelectStatus={setSelectedStatus}
          />
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-6 px-6 text-center text-xs text-slate-500 bg-[#070A12]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-semibold text-slate-400">ZyronByte AI Studio • Automated Gaming Shorts & Reels Publishing Platform</p>
          <p className="studio-pill text-[10px] text-slate-500">Channel: ZyronByteYT • Powered by Google Gemini & FFmpeg</p>
        </div>
      </footer>

      {/* Modals */}
      <VideoImporter
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={fetchData}
      />

      <CustomCutModal
        isOpen={isCustomCutOpen}
        onClose={() => setIsCustomCutOpen(false)}
        videos={videos}
        onCutSuccess={fetchData}
      />

      <ClipPreviewModal
        clip={previewClip}
        isOpen={Boolean(previewClip)}
        onClose={() => setPreviewClip(null)}
        onRefresh={fetchData}
      />

      <SocialAccountsModal
        isOpen={isSocialOpen}
        onClose={() => setIsSocialOpen(false)}
        onRefresh={fetchData}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onRefresh={fetchData}
      />

      <LogsViewer
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
      />

    </div>
  );
}
