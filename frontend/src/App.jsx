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
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 flex flex-col">
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* KPI & Metric Cards */}
        <StatsOverview
          stats={stats}
          onToggleAutoPublish={handleToggleAutoPublish}
        />

        {/* Real-time Pipeline Progress (Visible when active) */}
        <PipelineProgress pipelineStatus={pipelineStatus} />

        {/* 1-Click Fast URL Auto-Clipper Bar */}
        <QuickUrlClipper onVideoImported={fetchData} />

        {/* Master Footage Library (Videos) */}
        <VideoList
          videos={videos}
          selectedVideoId={selectedVideoId}
          onSelectVideo={setSelectedVideoId}
          onRefresh={fetchData}
        />

        {/* Generated Gaming Shorts & Reels (Clips Grid) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Scissors className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Generated Shorts & Reels Gallery
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {clips.length}
              </span>
            </div>
            
            {selectedVideoId && (
              <button
                onClick={() => setSelectedVideoId(null)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
              >
                Clear Video Filter
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
      <footer className="border-t border-[#1E2536] py-5 px-6 text-center text-xs text-slate-500 bg-[#0E121B]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>ZyronByte AI Studio • Automated Gaming Shorts & Reels Publishing Platform</p>
          <p className="font-mono text-[11px]">Channel: ZyronByteYT • Powered by Google Gemini & FFmpeg</p>
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
