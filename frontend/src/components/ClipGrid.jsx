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
      onRefresh();
    } catch (err) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const handleReject = async (e, clipId) => {
    e.stopPropagation();
    try {
      await api.rejectClip(clipId);
      onRefresh();
    } catch (err) {
      alert(`Reject error: ${err.message}`);
    }
  };

  const handlePublishNow = async (e, clipId) => {
    e.stopPropagation();
    try {
      await api.publishNow(clipId, ['youtube', 'instagram']);
      alert('Clip added to immediate publishing queue!');
      onRefresh();
    } catch (err) {
      alert(`Publish error: ${err.message}`);
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'clutch':
        return {
          label: 'CLUTCH 🏆',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/20'
        };
      case 'op_kill':
      case 'kill':
        return {
          label: 'OP KILL ⚡',
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/20'
        };
      case 'rush':
        return {
          label: 'RUSH 🚨',
          color: 'bg-red-500/20 text-red-300 border-red-500/40 shadow-red-500/20'
        };
      case 'funny':
        return {
          label: 'FUNNY 💀',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20'
        };
      case 'reaction':
        return {
          label: 'REACTION 😱',
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-purple-500/20'
        };
      default:
        return {
          label: (cat || 'HIGHLIGHT').toUpperCase(),
          color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-indigo-500/20'
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* Editorial Filter Header Bar */}
      <div className="studio-card p-3 sm:p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="studio-pill text-[10px] font-bold text-slate-500 mr-1 hidden sm:inline">
            FILTER //
          </span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/25 border border-indigo-400/30'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Status Dropdown Filter */}
        <div className="flex items-center space-x-2">
          <span className="studio-pill text-[10px] font-bold text-slate-500 hidden sm:inline">
            STATUS //
          </span>
          <select
            value={selectedStatus}
            onChange={(e) => onSelectStatus(e.target.value)}
            className="bg-[#070A12] border border-white/[0.1] text-xs font-semibold text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            {statuses.map((st) => (
              <option key={st.id} value={st.id}>
                {st.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 9:16 Editorial Gallery Grid */}
      {filteredClips.length === 0 ? (
        <div className="studio-card rounded-3xl p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-3 text-slate-500">
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </div>
          <h4 className="text-base font-bold text-white tracking-tight">No Shorts Found in this View</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Import or paste a video link above to generate high-octane 9:16 vertical Shorts with animated subtitles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredClips.map((clip) => {
            const hasThumb = Boolean(clip.thumbnail_path);
            const thumbUrl = `/api/clips/${clip.id}/thumbnail`;
            const badge = getCategoryBadge(clip.highlight_category);

            return (
              <div
                key={clip.id}
                onClick={() => onPreviewClip(clip)}
                className="group studio-card rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col hover:-translate-y-1"
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
                    <div className="flex flex-col items-center justify-center text-slate-600 p-4 text-center">
                      <Play className="w-10 h-10 mb-2 opacity-50" />
                      <span className="studio-pill text-[10px]">9:16 RENDERING</span>
                    </div>
                  )}

                  {/* Gradient Framing Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60 pointer-events-none" />

                  {/* Top Floating Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className={`studio-pill text-[10px] font-black px-2.5 py-1 rounded-lg border backdrop-blur-md shadow-md ${badge.color}`}>
                      {badge.label}
                    </span>

                    <span className="studio-pill text-[10px] font-black px-2 py-0.5 rounded-lg bg-black/70 text-amber-300 border border-amber-400/30 backdrop-blur-md flex items-center space-x-1">
                      <Flame className="w-3 h-3 text-amber-400" />
                      <span>{clip.excitement_score}</span>
                    </span>
                  </div>

                  {/* Play Action Hover Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600/95 text-white flex items-center justify-center shadow-2xl shadow-indigo-600/60 transform group-hover:scale-110 transition duration-300 backdrop-blur-md">
                      <Play className="w-6 h-6 ml-0.5 fill-current" />
                    </div>
                  </div>

                  {/* Bottom Overlay on Thumbnail */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <span className="studio-pill font-mono bg-black/70 px-2 py-0.5 rounded-md text-[10px] border border-white/[0.1]">
                      {Math.round(clip.duration)}s • 9:16
                    </span>

                    {clip.qc_passed ? (
                      <span className="flex items-center space-x-1 text-[10px] text-emerald-400 bg-black/70 px-2 py-0.5 rounded-md border border-emerald-500/40 backdrop-blur-md">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="studio-pill">QC 100</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-[10px] text-amber-400 bg-black/70 px-2 py-0.5 rounded-md border border-amber-500/40 backdrop-blur-md">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span className="studio-pill">QC PENDING</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Editorial Content Info */}
                <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2.5 bg-[#080B14]">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-indigo-300 transition duration-200">
                      {clip.youtube_title || clip.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {clip.description || 'Intelligent AI-clipped moment'}
                    </p>
                  </div>

                  {/* Status & Action Footer */}
                  <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between">
                    <span className={`studio-pill text-[9px] font-black px-2 py-0.5 rounded-md border ${
                      clip.status === 'PUBLISHED'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : clip.status === 'APPROVED'
                        ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                        : clip.status === 'SCHEDULED'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-white/[0.04] text-slate-400 border-white/[0.08]'
                    }`}>
                      {clip.status.replace('_', ' ')}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      {!clip.approved_for_publishing ? (
                        <button
                          onClick={(e) => handleApprove(e, clip.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold transition flex items-center space-x-1"
                          title="Approve for Publishing"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handlePublishNow(e, clip.id)}
                          className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[10px] font-black transition shadow-md shadow-indigo-600/30"
                          title="Publish to YouTube Shorts & Reels"
                        >
                          <Send className="w-2.5 h-2.5" />
                          <span>Publish</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => handleReject(e, clip.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition"
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
