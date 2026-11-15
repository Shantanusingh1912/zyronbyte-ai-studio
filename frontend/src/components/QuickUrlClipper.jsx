import React, { useState } from 'react';
import { Sparkles, Link2, ArrowRight, Loader2, Play, CheckCircle, Video, Flame, Radio } from 'lucide-react';
import { YoutubeIcon } from './Icons';
import { api } from '../api';

export default function QuickUrlClipper({ onVideoImported }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewInfo, setPreviewInfo] = useState(null);
  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle URL change with auto preview fetch
  const handleUrlChange = async (e) => {
    const val = e.target.value;
    setUrl(val);
    setSuccessMsg('');
    setErrorMsg('');
    
    if (val.startsWith('http://') || val.startsWith('https://')) {
      try {
        setFetchingPreview(true);
        const info = await api.fetchVideoInfo(val);
        setPreviewInfo(info);
      } catch (err) {
        setPreviewInfo(null);
      } finally {
        setFetchingPreview(false);
      }
    } else {
      setPreviewInfo(null);
    }
  };

  const handleFetchAndClip = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.importVideo({
        source_type: 'url',
        source_url: url.trim(),
        title: previewInfo?.title || undefined,
        auto_start: true
      });

      setSuccessMsg(`Fetched "${res.title}"! Automated AI clipping pipeline is running.`);
      setUrl('');
      setPreviewInfo(null);
      if (onVideoImported) onVideoImported();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch and clip video URL');
    } finally {
      setLoading(false);
    }
  };

  const formatSecs = (sec) => {
    if (!sec) return '';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="studio-card p-5 sm:p-6 rounded-3xl relative overflow-hidden transition-all duration-300">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-10 w-96 h-36 bg-gradient-to-l from-indigo-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-80 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Editorial Subheader */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </span>
            <div>
              <span className="studio-pill text-[10px] font-bold text-indigo-400 tracking-wider">
                FEATURED ENGINE // 1-CLICK CLIPPER
              </span>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight font-sans">
                Paste Any Video Link & Auto-Clip
              </h3>
            </div>
          </div>

          {/* Supported platform pills */}
          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center">
            <span className="studio-pill text-[9px] font-bold px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.08]">
              YOUTUBE 4K
            </span>
            <span className="studio-pill text-[9px] font-bold px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.08]">
              TWITCH VODS
            </span>
            <span className="studio-pill text-[9px] font-bold px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.08]">
              KICK CLIPS
            </span>
            <span className="studio-pill text-[9px] font-bold px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.08]">
              X / TWITTER
            </span>
          </div>
        </div>

        {/* Input Bar Form */}
        <form onSubmit={handleFetchAndClip} className="w-full">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-[#070A12] border border-white/[0.12] focus-within:border-indigo-500 rounded-2xl p-2 gap-2 transition-all shadow-inner group">
            <div className="flex items-center flex-1 min-w-0 pl-2">
              <Link2 className="w-4 h-4 text-indigo-400 mr-2.5 flex-shrink-0" />
              <input
                type="url"
                placeholder="Paste YouTube, Twitch, Kick, Twitter, or web video URL here..."
                value={url}
                onChange={handleUrlChange}
                className="bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none w-full py-1.5 font-sans"
                required
              />
              {fetchingPreview && (
                <span className="text-[11px] text-slate-400 px-2 flex items-center space-x-1.5 flex-shrink-0">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span className="hidden sm:inline">Inspecting...</span>
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-black tracking-wide transition shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 transform active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Fetching Video...</span>
                </>
              ) : (
                <>
                  <span>FETCH & AUTO-CLIP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Detected Preview Card */}
        {previewInfo && (
          <div className="p-3.5 rounded-2xl bg-[#090D18]/90 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center space-x-3.5 min-w-0">
              {previewInfo.thumbnail ? (
                <img 
                  src={previewInfo.thumbnail} 
                  alt={previewInfo.title} 
                  className="w-20 h-12 object-cover rounded-xl border border-white/[0.1] shadow-md flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-12 bg-white/[0.04] rounded-xl flex items-center justify-center flex-shrink-0 text-slate-400">
                  <Video className="w-6 h-6" />
                </div>
              )}

              <div className="min-w-0">
                <h4 className="font-bold text-white truncate text-xs sm:text-sm">
                  {previewInfo.title}
                </h4>
                <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                  <span className="text-indigo-400 font-semibold">{previewInfo.uploader}</span>
                  {previewInfo.duration > 0 && (
                    <>
                      <span>•</span>
                      <span>{formatSecs(previewInfo.duration)}</span>
                    </>
                  )}
                  <span>•</span>
                  <span className="capitalize studio-pill text-[10px]">{previewInfo.extractor}</span>
                </div>
              </div>
            </div>

            <div className="self-end sm:self-center">
              <span className="studio-pill text-[10px] font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>READY TO PROCESS</span>
              </span>
            </div>
          </div>
        )}

        {/* Feedback Banners */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-in fade-in">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}
