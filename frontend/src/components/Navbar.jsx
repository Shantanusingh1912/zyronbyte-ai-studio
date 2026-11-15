import React from 'react';
import { 
  Play, Pause, Settings, Upload, Scissors,
  Terminal, ShieldCheck, Flame, RefreshCw, Radio
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
    <header className="border-b border-white/[0.08] bg-[#070A12]/90 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-8 py-3.5 transition">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand & Studio Identity */}
        <div className="flex items-center space-x-3.5">
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition duration-300">
              <Flame className="w-5 h-5 text-white" />
            </div>
            {isPipelineActive && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#070A12] animate-ping" />
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent font-sans">
                ZyronByte AI Studio
              </h1>
              <span className="studio-pill text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 tracking-widest">
                STUDIO PRO
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
              <span>Channel: <strong className="text-slate-200 font-semibold">ZyronByteYT</strong></span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center space-x-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="studio-pill text-[10px]">AI ENGINE ACTIVE</span>
              </span>
            </div>
          </div>
        </div>

        {/* Platform Status Pills (YouTube Shorts & Instagram Reels) */}
        <div className="hidden lg:flex items-center space-x-2">
          <button 
            onClick={onOpenSocial}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              stats?.youtube_connected 
                ? 'bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20' 
                : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20'
            }`}
          >
            <YoutubeIcon className="w-3.5 h-3.5 text-red-400" />
            <span>Shorts: {stats?.youtube_connected ? 'Connected' : 'Offline'}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${stats?.youtube_connected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
          </button>

          <button 
            onClick={onOpenSocial}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              stats?.instagram_connected 
                ? 'bg-pink-500/10 border-pink-500/30 text-pink-300 hover:bg-pink-500/20' 
                : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20'
            }`}
          >
            <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
            <span>Reels: {stats?.instagram_connected ? 'Connected' : 'Offline'}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${stats?.instagram_connected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
          </button>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          <button
            onClick={onRefresh}
            title="Refresh Studio Data"
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition shadow-sm active:rotate-180 duration-300"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePause}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition shadow-sm ${
              isPaused 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isPaused ? 'Resume Pipeline' : 'Automation Live'}</span>
          </button>

          <button
            onClick={onOpenLogs}
            title="Processing Logs Terminal"
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition shadow-sm"
          >
            <Terminal className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            title="Studio Settings"
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition shadow-sm"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenCut}
            className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-semibold border border-white/[0.08] transition shadow-sm"
          >
            <Scissors className="w-3.5 h-3.5 text-indigo-400" />
            <span>Trim Clip</span>
          </button>

          <button
            onClick={onOpenImport}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>
        </div>

      </div>
    </header>
  );
}
