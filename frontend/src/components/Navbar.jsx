import React from 'react';
import { 
  Play, Pause, Settings, Upload, Scissors,
  Terminal, ShieldCheck, Flame, RefreshCw, Sparkles, Radio
} from 'lucide-react';
import { YoutubeIcon, InstagramIcon } from './Icons';

export default function Navbar({ 
  stats, 
  pipelineStatus, 
  onOpenImport, 
  onOpenCut,
  onOpenSettings, 
  onOpenSocial, 
  onOpenLogs,
  onTogglePause,
  onRefresh
}) {
  const isPaused = pipelineStatus?.is_paused;
  const isPipelineActive = pipelineStatus?.active_jobs_count > 0;

  return (
    <header className="sticky top-4 z-50 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto rounded-full bg-[#0c0d12]/80 backdrop-blur-3xl border border-white/15 px-6 py-3 shadow-2xl shadow-black/90 flex items-center justify-between">
        
        {/* Brand & Studio Identity */}
        <div className="flex items-center space-x-3.5">
          <div className="relative group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-600 to-amber-500 p-[1.5px] shadow-lg shadow-blue-500/30 group-hover:scale-105 transition duration-300">
              <div className="w-full h-full bg-[#0a0a0f] rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              </div>
            </div>
            {isPipelineActive && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-cyan-400 rounded-full border-2 border-[#0c0d12] animate-ping" />
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-black text-sm sm:text-base tracking-tight text-white font-sans">
                ZyronByte <span className="galaxy-ai-text font-black">AI Studio</span>
              </h1>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/30 shadow-sm shadow-amber-500/20">
                PRO 2026
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] text-zinc-400">
              <span>Channel: <span className="text-zinc-200 font-semibold">ZyronByteYT</span></span>
              <span>•</span>
              <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>AI ENGINE READY</span>
              </span>
            </div>
          </div>
        </div>

        {/* Platform Integration Status Badges */}
        <div className="hidden lg:flex items-center space-x-2.5">
          <button 
            onClick={onOpenSocial}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
              stats?.youtube_connected 
                ? 'bg-red-500/15 border-red-500/30 text-red-300 hover:bg-red-500/25 shadow-sm shadow-red-500/20' 
                : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <YoutubeIcon className="w-3.5 h-3.5 text-red-400" />
            <span>Shorts</span>
            <span className={`w-1.5 h-1.5 rounded-full ${stats?.youtube_connected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
          </button>

          <button 
            onClick={onOpenSocial}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
              stats?.instagram_connected 
                ? 'bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 border-pink-500/30 text-pink-300 hover:bg-pink-500/25 shadow-sm shadow-pink-500/20' 
                : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
            <span>Reels</span>
            <span className={`w-1.5 h-1.5 rounded-full ${stats?.instagram_connected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
          </button>
        </div>

        {/* Action Controls & Navigation Pills */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            title="Refresh Data"
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-zinc-300 border border-white/10 transition active:rotate-180 duration-300"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onTogglePause}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition shadow-sm ${
              isPaused 
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30' 
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
            }`}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            <span className="hidden sm:inline">{isPaused ? 'Paused' : 'Automation Live'}</span>
          </button>

          <button
            onClick={onOpenLogs}
            title="Studio Terminal Logs"
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-zinc-300 border border-white/10 transition"
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenSettings}
            title="Studio Settings"
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-zinc-300 border border-white/10 transition"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenCut}
            className="hidden md:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/5 hover:bg-white/15 text-zinc-200 border border-white/10 transition"
          >
            <Scissors className="w-3.5 h-3.5 text-cyan-400" />
            <span>Trim Clip</span>
          </button>

          <button
            onClick={onOpenImport}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-white text-black hover:bg-zinc-200 transition shadow-lg shadow-white/10 active:scale-95"
          >
            <Upload className="w-3.5 h-3.5 text-black" />
            <span>Import</span>
          </button>
        </div>

      </div>
    </header>
  );
}
