import React from 'react';
import { Play, Trash2, HardDrive, CheckCircle2, AlertCircle, Clock, Video, Film, Sparkles } from 'lucide-react';
import { YoutubeIcon } from './Icons';
import { api } from '../api';

export default function VideoList({ videos, onSelectVideo, selectedVideoId, onRefresh }) {
  if (!videos || videos.length === 0) {
    return (
      <div className="apple-card rounded-3xl p-14 text-center">
        <div className="w-16 h-16 rounded-3xl bg-white/10 border border-white/15 flex items-center justify-center mx-auto mb-4 text-cyan-400">
          <Film className="w-8 h-8" />
        </div>
        <h4 className="text-base font-bold text-white">No Gaming Footage Imported Yet</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Paste a video link in the bar above to automatically fetch and clip livestreams or long gameplays.
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
    <div className="apple-card rounded-3xl overflow-hidden border border-white/15">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Master Footage Library
            </h3>
            <p className="text-[11px] text-slate-400">Imported livestreams, OBS captures, and long gameplays</p>
          </div>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-white border border-white/15">
          {videos.length} Total VODs
        </span>
      </div>

      <div className="divide-y divide-white/5">
        {videos.map((v) => {
          const isSelected = selectedVideoId === v.id;
          const isProcessing = ['DOWNLOADING', 'TRANSCRIBING', 'ANALYZING', 'EDITING', 'PROCESSING'].includes(v.status);

          return (
            <div
              key={v.id}
              onClick={() => onSelectVideo(isSelected ? null : v.id)}
              className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/20 border-l-4 border-l-cyan-400' 
                  : 'hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-start space-x-4 min-w-0">
                <div className="p-3 rounded-2xl bg-black/60 border border-white/10 text-slate-300 flex-shrink-0 mt-0.5 shadow-sm">
                  {v.source_type === 'youtube' || v.source_type === 'url' ? (
                    <YoutubeIcon className="w-5 h-5 text-red-400" />
                  ) : (
                    <HardDrive className="w-5 h-5 text-cyan-400" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-lg">
                      {v.title}
                    </h4>
                    {v.clips_count > 0 && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        {v.clips_count} Shorts
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-1.5">
                    <span className="font-mono text-slate-200 font-semibold bg-white/5 px-2 py-0.5 rounded-full border border-white/10">{formatDuration(v.duration)}</span>
                    <span className="text-slate-600">•</span>
                    <span>{v.width}x{v.height} @ {Math.round(v.fps)}fps</span>
                    <span className="text-slate-600">•</span>
                    <span className="capitalize text-[10px] bg-white/5 px-2 py-0.5 rounded-full border border-white/10 text-slate-300">{v.source_type}</span>
                  </div>

                  {isProcessing && (
                    <div className="mt-2 text-xs text-cyan-300 flex items-center space-x-2 animate-pulse font-medium">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span>{v.current_step || 'Processing automated pipeline...'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center space-x-2.5 self-end md:self-center">
                <span className={`text-[10px] font-black px-3.5 py-1 rounded-full border uppercase tracking-wider ${
                  v.status === 'COMPLETED'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : isProcessing
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse'
                    : v.status === 'FAILED'
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    : 'bg-white/10 text-slate-300 border-white/15'
                }`}>
                  {v.status}
                </span>

                {v.status !== 'COMPLETED' && !isProcessing && (
                  <button
                    onClick={(e) => handleStart(e, v.id)}
                    className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-white text-black hover:bg-slate-200 text-xs font-bold transition shadow-md shadow-white/10"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run</span>
                  </button>
                )}

                <button
                  onClick={(e) => handleDelete(e, v.id)}
                  className="p-2 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition"
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
