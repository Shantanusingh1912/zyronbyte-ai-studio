import React from 'react';
import { 
  Play, Pause, Settings, Upload, Scissors,
  Terminal, ShieldCheck, Flame, RefreshCw 
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

  return (
    <header className="border-b border-[#1E2536] bg-[#0E121B]/95 backdrop-blur sticky top-0 z-40 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand & Channel */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                ZyronByte AI Studio
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PRO GAMING v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">Automated YouTube Shorts & Instagram Reels Engine</p>
          </div>
        </div>

        {/* Platform Status Pills */}
        <div className="hidden md:flex items-center space-x-2.5">
          <button 
            onClick={onOpenSocial}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              stats?.youtube_connected 
                ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' 
                : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:border-slate-600'
            }`}
          >
            <YoutubeIcon className="w-3.5 h-3.5" />
            <span>YouTube: {stats?.youtube_connected ? 'Connected' : 'Offline'}</span>
          </button>

          <button 
            onClick={onOpenSocial}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              stats?.instagram_connected 
                ? 'bg-pink-500/10 border-pink-500/30 text-pink-400 hover:bg-pink-500/20' 
                : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:border-slate-600'
            }`}
          >
            <InstagramIcon className="w-3.5 h-3.5" />
            <span>Reels: {stats?.instagram_connected ? 'Connected' : 'Offline'}</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onRefresh}
            title="Refresh Data"
            className="p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePause}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition ${
              isPaused 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isPaused ? 'Resume System' : 'Active'}</span>
          </button>

          <button
            onClick={onOpenLogs}
            title="System Processing Logs"
            className="p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition"
          >
            <Terminal className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            title="Studio Settings"
            className="p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenCut}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/60 transition shadow-sm"
          >
            <Scissors className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Cut Clip</span>
          </button>

          <button
            onClick={onOpenImport}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition transform active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Video</span>
          </button>
        </div>

      </div>
    </header>
  );
}
