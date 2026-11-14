import React from 'react';
import { Play, Trash2, HardDrive, CheckCircle2, AlertCircle, Clock, Video } from 'lucide-react';
import { YoutubeIcon } from './Icons';
import { api } from '../api';

export default function VideoList({ videos, onSelectVideo, selectedVideoId, onRefresh }) {
  if (!videos || videos.length === 0) {
    return (
      <div className="bg-[#121622] border border-[#1E2536] rounded-xl p-8 text-center">
        <Video className="w-10 h-10 text-slate-600 mx-auto mb-2.5" />
        <h4 className="text-sm font-semibold text-slate-300">No Gaming Videos Imported Yet</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Click "Import Video" above to import your YouTube livestream, long gameplay recording, or local OBS file.
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
    if (!confirm('Are you sure you want to delete this video and its generated clips?')) return;
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
    <div className="bg-[#121622] border border-[#1E2536] rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#1E2536] flex items-center justify-between bg-[#0E121B]">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-bold text-white">Master Footage Library</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {videos.length}
          </span>
        </div>
      </div>

      <div className="divide-y divide-[#1A202E]">
        {videos.map((v) => {
          const isSelected = selectedVideoId === v.id;
          const isProcessing = ['DOWNLOADING', 'TRANSCRIBING', 'ANALYZING', 'EDITING', 'PROCESSING'].includes(v.status);

          return (
            <div
              key={v.id}
              onClick={() => onSelectVideo(isSelected ? null : v.id)}
              className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer transition ${
                isSelected ? 'bg-indigo-950/20 border-l-4 border-l-indigo-500' : 'hover:bg-slate-850/40'
              }`}
            >
              <div className="flex items-start space-x-3.5 min-w-0">
                <div className="p-2.5 rounded-lg bg-slate-800/80 text-slate-300 flex-shrink-0 mt-0.5">
                  {v.source_type === 'youtube' ? (
                    <YoutubeIcon className="w-4 h-4 text-red-400" />
                  ) : (
                    <HardDrive className="w-4 h-4 text-indigo-400" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-semibold text-white truncate max-w-md">
                      {v.title}
                    </h4>
                    {v.clips_count > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {v.clips_count} Shorts
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1">
                    <span>{formatDuration(v.duration)}</span>
                    <span>•</span>
                    <span>{v.width}x{v.height} @ {Math.round(v.fps)}fps</span>
                    <span>•</span>
                    <span className="capitalize">{v.source_type}</span>
                  </div>

                  {isProcessing && (
                    <div className="mt-2 text-[11px] text-indigo-300 flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                      <span>{v.current_step || 'Processing...'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center space-x-2.5 self-end md:self-center">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                  v.status === 'COMPLETED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : isProcessing
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 animate-pulse'
                    : v.status === 'FAILED'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {v.status}
                </span>

                {v.status !== 'COMPLETED' && !isProcessing && (
                  <button
                    onClick={(e) => handleStart(e, v.id)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium transition shadow-sm"
                  >
                    <Play className="w-3 h-3" />
                    <span>Run Automation</span>
                  </button>
                )}

                <button
                  onClick={(e) => handleDelete(e, v.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
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
