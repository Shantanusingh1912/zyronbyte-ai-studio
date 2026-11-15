import React from 'react';
import { Play, Trash2, HardDrive, CheckCircle2, AlertCircle, Clock, Video, Film, Sparkles } from 'lucide-react';
import { YoutubeIcon } from './Icons';
import { api } from '../api';

export default function VideoList({ videos, onSelectVideo, selectedVideoId, onRefresh }) {
  if (!videos || videos.length === 0) {
    return (
      <div className="studio-card rounded-3xl p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-3 text-slate-500">
          <Film className="w-8 h-8 text-indigo-400" />
        </div>
        <h4 className="text-sm font-bold text-slate-200">No Gaming Footage Imported Yet</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Paste a video link in the bar above or click "Import" to add long YouTube livestreams, OBS captures, or gameplay recordings.
        </p>
      </div>
    );
  }

  const handleStart = async (e, videoId) => {
    e.stopPropagation();
    try {
      await api.startPipeline(videoId);
      onRefresh();
    } catch (err) {
      alert(`Failed to start pipeline: ${err.message}`);
    }
  };

  const handleDelete = async (e, videoId) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this master video and its clips?')) return;
    try {
      await api.deleteVideo(videoId);
      onRefresh();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="studio-card rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between bg-[#080B14]/70">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Master Footage Library
            </h3>
            <p className="text-[11px] text-slate-400">Imported livestreams, OBS captures, and long gameplays</p>
          </div>
        </div>

        <span className="studio-pill text-[10px] font-black px-3 py-1 rounded-full bg-white/[0.04] text-slate-300 border border-white/[0.08]">
          {videos.length} TOTAL VODS
        </span>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {videos.map((v) => {
          const isSelected = selectedVideoId === v.id;
          const isProcessing = ['DOWNLOADING', 'TRANSCRIBING', 'ANALYZING', 'EDITING', 'PROCESSING'].includes(v.status);

          return (
            <div
              key={v.id}
              onClick={() => onSelectVideo(isSelected ? null : v.id)}
              className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'bg-indigo-950/25 border-l-4 border-l-indigo-500' 
                  : 'hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-start space-x-4 min-w-0">
                <div className="p-3 rounded-2xl bg-[#070A12] border border-white/[0.08] text-slate-300 flex-shrink-0 mt-0.5">
                  {v.source_type === 'youtube' || v.source_type === 'url' ? (
                    <YoutubeIcon className="w-5 h-5 text-red-400" />
                  ) : (
                    <HardDrive className="w-5 h-5 text-indigo-400" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-lg">
                      {v.title}
                    </h4>
                    {v.clips_count > 0 && (
                      <span className="studio-pill text-[9px] font-black px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/30">
                        {v.clips_count} SHORTS
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-1.5">
                    <span className="studio-pill font-mono text-slate-300 font-semibold">{formatDuration(v.duration)}</span>
                    <span className="text-slate-600">•</span>
                    <span className="studio-pill">{v.width}x{v.height} @ {Math.round(v.fps)}fps</span>
                    <span className="text-slate-600">•</span>
                    <span className="capitalize studio-pill text-[10px] bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.06]">{v.source_type}</span>
                  </div>

                  {isProcessing && (
                    <div className="mt-2 text-xs text-indigo-300 flex items-center space-x-2 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span className="font-medium">{v.current_step || 'Processing automated pipeline...'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center space-x-2.5 self-end md:self-center">
                <span className={`studio-pill text-[10px] font-black px-3 py-1 rounded-xl border uppercase tracking-wider ${
                  v.status === 'COMPLETED'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : isProcessing
                    ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40 animate-pulse'
                    : v.status === 'FAILED'
                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    : 'bg-white/[0.04] text-slate-400 border-white/[0.08]'
                }`}>
                  {v.status}
                </span>

                {v.status !== 'COMPLETED' && !isProcessing && (
                  <button
                    onClick={(e) => handleStart(e, v.id)}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Automation</span>
                  </button>
                )}

                <button
                  onClick={(e) => handleDelete(e, v.id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition"
                  title="Delete Video"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
