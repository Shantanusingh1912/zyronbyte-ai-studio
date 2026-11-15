import React, { useState } from 'react';
import { Sparkles, Link2, ArrowRight, Loader2, Play, CheckCircle, Video } from 'lucide-react';
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

      setSuccessMsg(`Fetched "${res.title}"! Automated AI clipping pipeline started.`);
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
    <div className="bg-gradient-to-r from-[#111625] via-[#141A2B] to-[#121422] border border-indigo-500/25 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title and Badge */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </span>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Paste Any Video Link & Auto-Clip
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              1-CLICK PIPELINE
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-lg">
            Paste any YouTube video, livestream recording, Twitch VOD, Kick clip, or video URL.
            ZyronByte AI will fetch it, transcribe, extract highlights, and render 9:16 Shorts automatically!
          </p>
        </div>

        {/* Input Bar Form */}
        <form onSubmit={handleFetchAndClip} className="flex-1 max-w-2xl">
          <div className="flex items-center bg-[#090C14] border border-[#232B3E] focus-within:border-indigo-500 rounded-xl p-1.5 transition shadow-inner">
            <div className="pl-3 pr-2 text-slate-400 flex items-center space-x-1.5">
              <Link2 className="w-4 h-4 text-indigo-400" />
            </div>

            <input
              type="url"
              placeholder="Paste YouTube, Twitch, Kick, Twitter, or direct video link here..."
              value={url}
              onChange={handleUrlChange}
              className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none flex-1 py-1.5 font-sans"
              required
            />

            {fetchingPreview && (
              <span className="text-[11px] text-slate-500 pr-2 flex items-center space-x-1">
                <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                <span>Checking...</span>
              </span>
            )}

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/25 flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <span>Fetch & Auto-Clip</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Live Preview Card if URL is identified */}
      {previewInfo && (
        <div className="mt-3.5 p-2.5 rounded-xl bg-[#090D18]/90 border border-indigo-500/30 flex items-center space-x-3 text-xs animate-in fade-in duration-200">
          {previewInfo.thumbnail ? (
            <img 
              src={previewInfo.thumbnail} 
              alt={previewInfo.title} 
              className="w-16 h-10 object-cover rounded-lg border border-slate-700 flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-10 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 text-slate-400">
              <Video className="w-5 h-5" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-white truncate text-xs">
              {previewInfo.title}
            </h4>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
              <span className="text-indigo-400 font-medium">{previewInfo.uploader}</span>
              {previewInfo.duration > 0 && (
                <>
                  <span>•</span>
                  <span>{formatSecs(previewInfo.duration)}</span>
                </>
              )}
              <span>•</span>
              <span className="capitalize">{previewInfo.extractor || 'Web Video'}</span>
            </div>
          </div>

          <div className="text-[11px] font-semibold text-emerald-400 flex items-center space-x-1 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" />
            <span>Ready to Auto-Clip</span>
          </div>
        </div>
      )}

      {/* Success / Error Banners */}
      {successMsg && (
        <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
