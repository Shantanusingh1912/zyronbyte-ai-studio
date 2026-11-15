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
    <div className="apple-card p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-white/20 shadow-2xl">
      {/* Samsung Galaxy AI & Apple Event Ambient Light Halos */}
      <div className="absolute -top-24 left-1/4 w-96 h-48 bg-gradient-to-r from-cyan-500/15 via-blue-600/20 to-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-80 h-40 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Header Title with Apple & Samsung Editorial Typography */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-amber-400 p-[1.5px] shadow-lg shadow-blue-500/30">
              <div className="w-full h-full bg-[#0d0e14] rounded-2xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 tracking-wider">
                  GALAXY AI // 1-CLICK CLIPPER
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans mt-0.5">
                Paste Any Video Link & <span className="galaxy-ai-text">Auto-Clip</span>
              </h3>
            </div>
          </div>

          {/* Platform Pills with Distinct Vivid Colors */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-red-500/15 text-red-300 border border-red-500/30 shadow-sm flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span>YouTube 4K</span>
            </span>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>Twitch VODs</span>
            </span>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Kick Clips</span>
            </span>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>X / Twitter</span>
            </span>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Direct URL</span>
            </span>
          </div>
        </div>

        {/* Apple Spotlight / Samsung Capsule Input Bar */}
        <form onSubmit={handleFetchAndClip} className="w-full">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-[#090a0f]/90 backdrop-blur-3xl border border-white/20 hover:border-white/30 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20 rounded-full p-2 transition-all duration-300 shadow-2xl group">
            <div className="flex items-center flex-1 min-w-0 pl-4">
              <Link2 className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0" />
              <input
                type="url"
                placeholder="Paste video URL from YouTube, Twitch, Kick, Twitter, or direct MP4 link..."
                value={url}
                onChange={handleUrlChange}
                className="bg-transparent text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none w-full py-2.5 font-sans"
                required
              />
              {fetchingPreview && (
                <span className="text-xs text-cyan-300 px-3 flex items-center space-x-2 flex-shrink-0 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span className="hidden sm:inline">Inspecting metadata...</span>
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="galaxy-cta-btn px-8 py-3.5 rounded-full flex items-center justify-center space-x-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Fetching Video...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>FETCH & AUTO-CLIP ⚡</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Detected Preview Card */}
        {previewInfo && (
          <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/20 backdrop-blur-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300 shadow-xl">
            <div className="flex items-center space-x-4 min-w-0">
              {previewInfo.thumbnail ? (
                <img 
                  src={previewInfo.thumbnail} 
                  alt={previewInfo.title} 
                  className="w-24 h-15 object-cover rounded-xl border border-white/20 shadow-md flex-shrink-0"
                />
              ) : (
                <div className="w-24 h-15 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 text-zinc-400">
                  <Video className="w-6 h-6" />
                </div>
              )}

              <div className="min-w-0">
                <h4 className="font-bold text-white truncate text-sm sm:text-base">
                  {previewInfo.title}
                </h4>
                <div className="flex items-center space-x-3 text-xs text-zinc-400 mt-1">
                  <span className="text-cyan-400 font-semibold">{previewInfo.uploader}</span>
                  {previewInfo.duration > 0 && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-white bg-white/10 px-2 py-0.5 rounded-md">{formatSecs(previewInfo.duration)}</span>
                    </>
                  )}
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">Ready for auto-clipping</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-center">
              <button
                type="button"
                onClick={handleFetchAndClip}
                disabled={loading}
                className="px-5 py-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition shadow-md shadow-cyan-500/30 flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Process Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Feedback Messages */}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center space-x-2.5 animate-in fade-in duration-300">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center space-x-2.5 animate-in fade-in duration-300">
            <span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
