import React, { useState } from 'react';
import { X, Scissors, Clock, Film, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../api';

export default function CustomCutModal({ isOpen, onClose, videos, onCutSuccess }) {
  if (!isOpen) return null;

  const [selectedVideoId, setSelectedVideoId] = useState(videos?.[0]?.id || '');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('action');
  const [startTime, setStartTime] = useState(10);
  const [endTime, setEndTime] = useState(45);
  const [cropMode, setCropMode] = useState('blur_fill');
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedVideo = (videos || []).find(v => v.id === parseInt(selectedVideoId));
  const maxDur = selectedVideo ? Math.floor(selectedVideo.duration) : 3600;
  const duration = Math.max(0, endTime - startTime);

  const handleCut = async (e) => {
    e.preventDefault();
    if (!selectedVideoId) {
      setError('Please select a video');
      return;
    }
    if (endTime <= startTime) {
      setError('End timestamp must be greater than start timestamp');
      return;
    }
    if (duration > 60) {
      if (!confirm(`This clip is ${duration}s long, which exceeds the 60s YouTube Shorts limit. Continue anyway?`)) {
        return;
      }
    }

    setLoading(true);
    setError('');
    try {
      await api.createCustomCut({
        video_id: parseInt(selectedVideoId),
        title: title || 'Custom Gaming Cut',
        highlight_category: category,
        start_time: parseFloat(startTime),
        end_time: parseFloat(endTime),
        crop_mode: cropMode,
        subtitles_enabled: subtitlesEnabled,
        sfx_enabled: sfxEnabled
      });
      alert('Custom 9:16 Short cut and rendered successfully!');
      onCutSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to cut clip');
    } finally {
      setLoading(false);
    }
  };

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121622] border border-[#232B3E] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2536] bg-[#0E121B]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Manual Video Cutter</h2>
              <p className="text-xs text-slate-400">Cut any custom moment from your full gameplay into a 9:16 Short</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCut} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Video Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Source Footage
            </label>
            <select
              value={selectedVideoId}
              onChange={(e) => setSelectedVideoId(e.target.value)}
              className="w-full bg-[#0A0D15] border border-[#232B3E] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            >
              {videos.map(v => (
                <option key={v.id} value={v.id}>
                  {v.title} ({formatSeconds(v.duration)})
                </option>
              ))}
            </select>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Clip Title
              </label>
              <input
                type="text"
                placeholder="e.g. Crazy Sniping Moment"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0A0D15] border border-[#232B3E] rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0A0D15] border border-[#232B3E] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 capitalize"
              >
                <option value="clutch">Clutch</option>
                <option value="kill">Kill</option>
                <option value="funny">Funny</option>
                <option value="reaction">Reaction</option>
                <option value="action">Action</option>
                <option value="unexpected">Unexpected</option>
              </select>
            </div>
          </div>

          {/* Timestamp Trimming Inputs */}
          <div className="p-4 rounded-xl bg-[#0A0D15] border border-[#1E2536] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Exact Cut Boundaries</span>
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                duration <= 60 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                Duration: {duration.toFixed(1)}s {duration <= 60 ? '✓ (Shorts Compliant)' : '⚠️ > 60s'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Start Time (seconds)
                </label>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min={0}
                    max={maxDur}
                    step="0.5"
                    value={startTime}
                    onChange={(e) => setStartTime(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121622] border border-[#232B3E] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-xs text-slate-500 font-mono">({formatSeconds(startTime)})</span>
                </div>
                <div className="flex space-x-1 mt-1.5">
                  <button type="button" onClick={() => setStartTime(Math.max(0, startTime - 5))} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 hover:text-white">-5s</button>
                  <button type="button" onClick={() => setStartTime(Math.max(0, startTime - 1))} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 hover:text-white">-1s</button>
                  <button type="button" onClick={() => setStartTime(startTime + 1)} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 hover:text-white">+1s</button>
                  <button type="button" onClick={() => setStartTime(startTime + 5)} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 hover:text-white">+5s</button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  End Time (seconds)
                </label>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min={0}
                    max={maxDur}
                    step="0.5"
                    value={endTime}
                    onChange={(e) => setEndTime(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121622] border border-[#232B3E] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-xs text-slate-500 font-mono">({formatSeconds(endTime)})</span>
                </div>
                <div className="flex space-x-1 mt-1.5">
                  <button type="button" onClick={() => setEndTime(Math.max(startTime + 1, endTime - 5))} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 hover:text-white">-5s</button>
                  <button type="button" onClick={() => setEndTime(Math.max(startTime + 1, endTime - 1))} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 hover:text-white">-1s</button>
                  <button type="button" onClick={() => setEndTime(Math.min(maxDur, endTime + 1))} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 hover:text-white">+1s</button>
                  <button type="button" onClick={() => setEndTime(Math.min(maxDur, endTime + 5))} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 hover:text-white">+5s</button>
                </div>
              </div>
            </div>
          </div>

          {/* Framing mode & Subtitles */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                9:16 Framing Mode
              </label>
              <select
                value={cropMode}
                onChange={(e) => setCropMode(e.target.value)}
                className="w-full bg-[#0A0D15] border border-[#232B3E] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="blur_fill">Blurred Backdrop Fill (Original 16:9 Gameplay over 9:16 Blurred Background)</option>
                <option value="stacked">Stacked Split (Top Zoom / Bottom Gameplay)</option>
                <option value="crop_center">Direct Center Action Crop</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={subtitlesEnabled}
                  onChange={(e) => setSubtitlesEnabled(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 w-4 h-4"
                />
                <span>Include animated subtitles for this segment</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sfxEnabled}
                  onChange={(e) => setSfxEnabled(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 w-4 h-4"
                />
                <span>Add subtle sound effects (whoosh transition & bass impact)</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#1E2536]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>{loading ? 'Cutting & Rendering...' : 'Cut & Render Short'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
