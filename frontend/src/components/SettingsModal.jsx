import React, { useState, useEffect } from 'react';
import { X, Key, Sliders, Shield, Save, CheckCircle } from 'lucide-react';
import { api } from '../api';

export default function SettingsModal({ isOpen, onClose, onRefresh }) {
  if (!isOpen) return null;

  const [geminiKey, setGeminiKey] = useState('');
  const [ytClientId, setYtClientId] = useState('');
  const [ytClientSecret, setYtClientSecret] = useState('');
  const [clipsPerVideo, setClipsPerVideo] = useState(6);
  const [minDuration, setMinDuration] = useState(30);
  const [maxDuration, setMaxDuration] = useState(60);
  const [dailyLimit, setDailyLimit] = useState(3);
  const [defaultCrop, setDefaultCrop] = useState('blur_fill');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getSettings();
        setClipsPerVideo(data.clips_per_video || 6);
        setMinDuration(data.min_clip_duration || 30);
        setMaxDuration(data.max_clip_duration || 60);
        setDailyLimit(data.daily_publish_limit || 3);
        setDefaultCrop(data.default_crop_mode || 'blur_fill');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const payload = {
        clips_per_video: parseInt(clipsPerVideo),
        min_clip_duration: parseInt(minDuration),
        max_clip_duration: parseInt(maxDuration),
        daily_publish_limit: parseInt(dailyLimit),
        default_crop_mode: defaultCrop
      };
      if (geminiKey) payload.gemini_api_key = geminiKey;
      if (ytClientId) payload.youtube_client_id = ytClientId;
      if (ytClientSecret) payload.youtube_client_secret = ytClientSecret;

      await api.updateSettings(payload);
      setSuccessMsg('Settings saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      onRefresh();
    } catch (err) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121622] border border-[#232B3E] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2536] bg-[#0E121B]">
          <div className="flex items-center space-x-2.5">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white">Studio Automation Settings</h2>
              <p className="text-xs text-slate-400">Configure AI models, clipping durations, and platform API credentials</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* AI Credentials */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Key className="w-3.5 h-3.5" />
              <span>AI & API Credentials</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Google Gemini API Key
              </label>
              <input
                type="password"
                placeholder="Enter AI Studio Gemini API Key (or set in .env)"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full bg-[#0A0D15] border border-[#232B3E] rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Used for multimodal highlight detection, viral YouTube Shorts titles, and SEO tags.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  YouTube Client ID
                </label>
                <input
                  type="text"
                  placeholder="...apps.googleusercontent.com"
                  value={ytClientId}
                  onChange={(e) => setYtClientId(e.target.value)}
                  className="w-full bg-[#0A0D15] border border-[#232B3E] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  YouTube Client Secret
                </label>
                <input
                  type="password"
                  placeholder="GOCSPX-..."
                  value={ytClientSecret}
                  onChange={(e) => setYtClientSecret(e.target.value)}
                  className="w-full bg-[#0A0D15] border border-[#232B3E] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Automation Rules */}
          <div className="space-y-3 pt-3 border-t border-[#1E2536]">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Clipping & Publishing Rules</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Clips Per Video
                  </label>
                  <span className="text-[10px] text-indigo-400 font-mono font-semibold">
                    {Number(clipsPerVideo) === 0 ? 'AUTO SCALED' : `${clipsPerVideo} fixed`}
                  </span>
                </div>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={clipsPerVideo}
                  onChange={(e) => setClipsPerVideo(e.target.value)}
                  placeholder="0 for Auto"
                  className="w-full bg-[#0A0D15] border border-[#232B3E] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  0 = Auto (19m: 5-7, 100m: 12-16 clips)
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Min Duration (s)
                </label>
                <input
                  type="number"
                  min={15}
                  max={60}
                  value={minDuration}
                  onChange={(e) => setMinDuration(e.target.value)}
                  className="w-full bg-[#0A0D15] border border-[#232B3E] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Max Duration (s)
                </label>
                <input
                  type="number"
                  min={30}
                  max={60}
                  value={maxDuration}
                  onChange={(e) => setMaxDuration(e.target.value)}
                  className="w-full bg-[#0A0D15] border border-[#232B3E] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Default 9:16 Vertical Framing
              </label>
              <select
                value={defaultCrop}
                onChange={(e) => setDefaultCrop(e.target.value)}
                className="w-full bg-[#0A0D15] border border-[#232B3E] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="blur_fill">Blurred Backdrop Fill (Pro YouTube Shorts Style)</option>
                <option value="stacked">Stacked Split (Top Zoom + Bottom Gameplay)</option>
                <option value="crop_center">Direct Center Crop</option>
              </select>
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
              disabled={saving}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
