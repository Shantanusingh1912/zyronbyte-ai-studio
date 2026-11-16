import React from 'react';
import { 
  Play, CheckCircle, XCircle, Send, Sparkles, 
  ShieldCheck, AlertTriangle, Clock, Flame, Zap, Trophy, Smile, Skull
} from 'lucide-react';
import { YoutubeIcon, InstagramIcon } from './Icons';
import { api } from '../api';

export default function ClipGrid({ 
  clips, 
  onPreviewClip, 
  onRefresh, 
  selectedCategory, 
  onSelectCategory,
  selectedStatus,
  onSelectStatus 
}) {
  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'clutch', label: 'Clutch 🏆' },
    { id: 'op_kill', label: 'OP Kill ⚡' },
    { id: 'rush', label: 'Rush 🚨' },
    { id: 'reaction', label: 'Reaction 😱' },
    { id: 'funny', label: 'Funny 💀' }
  ];

  const statuses = [
    { id: 'all', label: 'All Statuses' },
    { id: 'READY_FOR_APPROVAL', label: 'Needs Approval' },
    { id: 'APPROVED', label: 'Approved' },
    { id: 'SCHEDULED', label: 'Scheduled' },
    { id: 'PUBLISHED', label: 'Published' },
    { id: 'QC_FAILED', label: 'QC Issues' }
  ];

  const filteredClips = (clips || []).filter(c => {
    if (selectedCategory !== 'all') {
      const cCat = c.highlight_category?.toLowerCase();
      if (selectedCategory === 'op_kill' && (cCat === 'op_kill' || cCat === 'kill')) return true;
      if (cCat !== selectedCategory) return false;
    }
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
    return true;
  });

  const handleApprove = async (e, clipId) => {
    e.stopPropagation();
    try {
      await api.approveClip(clipId);
      if (typeof onRefresh === 'function') onRefresh();
    } catch (err) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const handleReject = async (e, clipId) => {
    e.stopPropagation();
    try {
      await api.rejectClip(clipId);
      if (typeof onRefresh === 'function') onRefresh();
    } catch (err) {
      alert(`Reject error: ${err.message}`);
    }
  };

  const handlePublishNow = async (e, clipId) => {
    e.stopPropagation();
    try {
      await api.publishNow(clipId, ['youtube']);
      alert('Clip published / queued for YouTube Shorts!');
      if (typeof onRefresh === 'function') onRefresh();
    } catch (err) {
      alert(`Publish error: ${err.message}`);
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'clutch':
        return {
          label: 'CLUTCH 🏆',
          color: 'bg-amber-500/25 text-amber-200 border-amber-400/50 shadow-md shadow-amber-500/20'
        };
      case 'op_kill':
      case 'kill':
        return {
          label: 'OP KILL ⚡',
          color: 'bg-rose-500/25 text-rose-200 border-rose-400/50 shadow-md shadow-rose-500/20'
        };
      case 'rush':
        return {
          label: 'RUSH 🚨',
          color: 'bg-red-500/25 text-red-200 border-red-400/50 shadow-md shadow-red-500/20'
        };
      case 'funny':
        return {
          label: 'FUNNY 💀',
          color: 'bg-emerald-500/25 text-emerald-200 border-emerald-400/50 shadow-md shadow-emerald-500/20'
        };
      case 'reaction':
        return {
          label: 'REACTION 😱',
          color: 'bg-purple-500/25 text-purple-200 border-purple-400/50 shadow-md shadow-purple-500/20'
        };
      default:
        return {
          label: (cat || 'HIGHLIGHT').toUpperCase(),
          color: 'bg-cyan-500/25 text-cyan-200 border-cyan-400/50 shadow-md shadow-cyan-500/20'
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* Apple-style Capsule Filter Toolbar */}
      <div className="apple-card p-3 sm:p-4 rounded-3xl flex flex-wrap items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition shadow-sm ${
                selectedCategory === cat.id
                  ? 'bg-white text-black shadow-lg shadow-white/20 border border-white'
                  : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/15 border border-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Status Dropdown Filter */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedStatus}
            onChange={(e) => onSelectStatus(e.target.value)}
            className="bg-black/60 border border-white/15 text-xs font-bold text-slate-200 rounded-full px-4 py-2 focus:outline-none focus:border-cyan-400 backdrop-blur-md"
          >
            {statuses.map((st) => (
              <option key={st.id} value={st.id} className="bg-black text-white">
                {st.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 9:16 Apple TV / Galaxy Gallery Grid */}
      {filteredClips.length === 0 ? (
        <div className="apple-card rounded-3xl p-16 text-center">
          <div className="w-16 h-16 rounded-3xl bg-white/10 border border-white/15 flex items-center justify-center mx-auto mb-4 text-cyan-400 shadow-xl shadow-cyan-500/20">
            <Sparkles className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-black text-white tracking-tight">No Shorts Found in this View</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Paste a video link in the bar above to generate high-octane 9:16 vertical Shorts with animated subtitles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredClips.map((clip) => {
            const hasThumb = Boolean(clip.thumbnail_path);
            const thumbUrl = `/api/clips/${clip.id}/thumbnail`;
            const badge = getCategoryBadge(clip.highlight_category);

            return (
              <div
                key={clip.id}
                onClick={() => onPreviewClip(clip)}
                className="group apple-card rounded-3xl overflow-hidden cursor-pointer flex flex-col hover:-translate-y-1.5"
              >
                {/* 9:16 Vertical Aspect Card */}
                <div className="relative aspect-[9/16] bg-black overflow-hidden flex items-center justify-center">
                  {hasThumb ? (
                    <img
                      src={thumbUrl}
                      alt={clip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                      <Play className="w-10 h-10 mb-2 opacity-50 text-cyan-400" />
                      <span className="text-[10px] font-bold tracking-wider">9:16 RENDERING</span>
                    </div>
                  )}

                  {/* Gradient Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60 pointer-events-none" />

                  {/* Top Floating Badges */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full border backdrop-blur-xl ${badge.color}`}>
                      {badge.label}
                    </span>

                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-black/70 text-amber-300 border border-amber-400/40 backdrop-blur-xl flex items-center space-x-1 shadow-md">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>{clip.excitement_score}</span>
                    </span>
                  </div>

                  {/* Apple-style Frosted Glass Play Button on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-2xl border border-white/40 text-white flex items-center justify-center shadow-2xl shadow-cyan-500/50 transform group-hover:scale-110 transition duration-300">
                      <Play className="w-7 h-7 ml-1 fill-current text-white" />
                    </div>
                  </div>

                  {/* Bottom Overlay on Thumbnail */}
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-xs text-white">
                    <span className="font-mono font-bold bg-black/75 px-2.5 py-0.5 rounded-full text-[10px] border border-white/15 backdrop-blur-md">
                      {Math.round(clip.duration)}s • 9:16
                    </span>

                    {clip.qc_passed ? (
                      <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-300 bg-black/75 px-2.5 py-0.5 rounded-full border border-emerald-500/40 backdrop-blur-md">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>QC 100</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-[10px] font-bold text-amber-300 bg-black/75 px-2.5 py-0.5 rounded-full border border-amber-500/40 backdrop-blur-md">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>QC PENDING</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Editorial Content Info */}
                <div className="p-4 flex flex-col justify-between flex-1 space-y-3 bg-[#0E0E12]">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-cyan-300 transition duration-200">
                      {clip.youtube_title || clip.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {clip.description || 'Intelligent AI-clipped moment'}
                    </p>
                  </div>

                  {/* Status & Action Footer */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border uppercase ${
                      clip.status === 'PUBLISHED'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : clip.status === 'APPROVED'
                        ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                        : clip.status === 'SCHEDULED'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-white/10 text-slate-300 border-white/15'
                    }`}>
                      {clip.status.replace('_', ' ')}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      {!clip.approved_for_publishing ? (
                        <button
                          onClick={(e) => handleApprove(e, clip.id)}
                          className="px-3 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold transition flex items-center space-x-1"
                          title="Approve for Publishing"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handlePublishNow(e, clip.id)}
                          className="flex items-center space-x-1 px-3.5 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-[10px] font-black transition shadow-lg shadow-purple-600/30"
                          title="Publish to YouTube Shorts & Reels"
                        >
                          <Send className="w-2.5 h-2.5" />
                          <span>Publish</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => handleReject(e, clip.id)}
                        className="p-1.5 rounded-full hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 transition"
                        title="Delete Clip"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
