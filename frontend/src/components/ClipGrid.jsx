import React from 'react';
import { 
  Play, CheckCircle, XCircle, Send, Sparkles, 
  ShieldCheck, AlertTriangle, Clock 
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
  const categories = ['all', 'clutch', 'op_kill', 'rush', 'reaction', 'funny'];
  const statuses = ['all', 'READY_FOR_APPROVAL', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'QC_FAILED'];

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

  const getCategoryColor = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'clutch': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'op_kill':
      case 'kill': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'rush': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'funny': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'reaction': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'unexpected': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default: return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <div className="space-y-4">
      {/* Category and Status Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#121622] border border-[#1E2536] p-3 rounded-xl">
        {/* Category buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status filters */}
        <div className="flex items-center space-x-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Status:
          </span>
          <select
            value={selectedStatus}
            onChange={(e) => onSelectStatus(e.target.value)}
            className="bg-[#0A0D15] border border-[#232B3E] text-xs text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="READY_FOR_APPROVAL">Needs Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PUBLISHED">Published</option>
            <option value="QC_FAILED">QC Issues</option>
          </select>
        </div>
      </div>

      {/* Grid of 9:16 Shorts */}
      {filteredClips.length === 0 ? (
        <div className="bg-[#121622] border border-[#1E2536] rounded-xl p-12 text-center">
          <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-300">No Shorts Found in this View</h4>
          <p className="text-xs text-slate-500 mt-1">
            Import a video above or run automation to detect viral highlights.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredClips.map((clip) => {
            const hasThumb = Boolean(clip.thumbnail_path);
            const thumbUrl = `/api/clips/${clip.id}/thumbnail`;

            return (
              <div
                key={clip.id}
                onClick={() => onPreviewClip(clip)}
                className="group bg-[#121622] border border-[#1E2536] hover:border-indigo-500/50 rounded-xl overflow-hidden cursor-pointer transition flex flex-col shadow-lg hover:shadow-indigo-500/10"
              >
                {/* 9:16 Aspect Thumbnail Container */}
                <div className="relative aspect-[9/16] bg-slate-950 overflow-hidden flex items-center justify-center">
                  {hasThumb ? (
                    <img
                      src={thumbUrl}
                      alt={clip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-600">
                      <Play className="w-8 h-8 mb-1" />
                      <span className="text-[10px]">Processing 9:16</span>
                    </div>
                  )}

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md ${getCategoryColor(clip.highlight_category)}`}>
                      {clip.highlight_category.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-black/60 text-amber-300 border border-amber-400/30 backdrop-blur-md">
                      🔥 {clip.excitement_score}
                    </span>
                  </div>

                  {/* Play hover button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                    <div className="w-12 h-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-xl shadow-indigo-600/50 transform group-hover:scale-110 transition">
                      <Play className="w-5 h-5 ml-0.5 fill-current" />
                    </div>
                  </div>

                  {/* Bottom info on thumbnail */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white">
                    <span className="font-mono bg-black/60 px-1.5 py-0.5 rounded text-[10px]">
                      {Math.round(clip.duration)}s
                    </span>

                    {/* Quality Control badge */}
                    {clip.qc_passed ? (
                      <span className="flex items-center space-x-1 text-[10px] text-emerald-400 bg-black/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        <ShieldCheck className="w-3 h-3" />
                        <span>QC Passed</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-[10px] text-amber-400 bg-black/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                        <AlertTriangle className="w-3 h-3" />
                        <span>QC Pending</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Metadata content */}
                <div className="p-3 flex flex-col justify-between flex-1 space-y-2">
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight">
                      {clip.youtube_title || clip.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {clip.description || 'Viral gameplay highlight'}
                    </p>
                  </div>

                  {/* Status & Quick Action Buttons */}
                  <div className="pt-2 border-t border-[#1E2536] flex items-center justify-between">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      clip.status === 'PUBLISHED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : clip.status === 'APPROVED'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        : clip.status === 'SCHEDULED'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {clip.status.replace('_', ' ')}
                    </span>

                    <div className="flex items-center space-x-1">
                      {!clip.approved_for_publishing ? (
                        <button
                          onClick={(e) => handleApprove(e, clip.id)}
                          className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition"
                          title="Approve for Publishing"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handlePublishNow(e, clip.id)}
                          className="flex items-center space-x-1 px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold transition shadow-sm"
                          title="Publish Immediately"
                        >
                          <Send className="w-2.5 h-2.5" />
                          <span>Publish</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => handleReject(e, clip.id)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition"
                        title="Reject Clip"
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
