import React, { useState, useEffect } from 'react';
import { 
  X, Play, Pause, Volume2, 
  ShieldCheck, AlertTriangle, CheckCircle, RefreshCw, 
  Send, Calendar, Clock, Edit3, Tag, Layers, Film, Scissors,
  Sparkles, Gamepad2 
} from 'lucide-react';
import { YoutubeIcon, InstagramIcon } from './Icons';
import { api } from '../api';

export default function ClipPreviewModal({ clip, isOpen, onClose, onRefresh }) {
  if (!isOpen || !clip) return null;

  const [activeTab, setActiveTab] = useState('trim'); // 'trim', 'youtube', 'instagram', 'qc', 'style'
  const [startTime, setStartTime] = useState(clip.start_time ?? 0.0);
  const [endTime, setEndTime] = useState(clip.end_time ?? 30.0);
  const [ytTitle, setYtTitle] = useState(clip.youtube_title || clip.title || '');
  const [ytDesc, setYtDesc] = useState(clip.youtube_description || '');
  const [ytTags, setYtTags] = useState(clip.youtube_tags || '');
  const [igCaption, setIgCaption] = useState(clip.instagram_caption || '');
  const [cropMode, setCropMode] = useState(clip.crop_mode || 'blur_fill');
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(clip.subtitles_enabled ?? true);
  const [sfxEnabled, setSfxEnabled] = useState(clip.sfx_enabled ?? true);
  const [clipGame, setClipGame] = useState(clip.game_title || 'General Gaming');
  
  const [scheduleTime, setScheduleTime] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isRerendering, setIsRerendering] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    setStartTime(clip.start_time ?? 0.0);
    setEndTime(clip.end_time ?? 30.0);
    setYtTitle(clip.youtube_title || clip.title || '');
    setYtDesc(clip.youtube_description || '');
    setYtTags(clip.youtube_tags || '');
    setIgCaption(clip.instagram_caption || '');
    setCropMode(clip.crop_mode || 'blur_fill');
    setSubtitlesEnabled(clip.subtitles_enabled ?? true);
    setSfxEnabled(clip.sfx_enabled ?? true);
    setClipGame(clip.game_title || 'General Gaming');
  }, [clip]);

  let qcData = null;
  if (clip.qc_report_json) {
    try {
      qcData = JSON.parse(clip.qc_report_json);
    } catch (e) {}
  }

  const currentDuration = Math.max(0, endTime - startTime);

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleRegenerateGameMetadata = async () => {
    setIsRegenerating(true);
    try {
      const updated = await api.regenerateClipMetadata(clip.id, clipGame);
      setYtTitle(updated.youtube_title || '');
      setYtDesc(updated.youtube_description || '');
      setYtTags(updated.youtube_tags || '');
      setIgCaption(updated.instagram_caption || '');
      setClipGame(updated.game_title || clipGame);
      alert(`AI metadata refreshed specifically for ${clipGame}!`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Regeneration failed: ${err.message}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSaveMetadata = async () => {
    setIsSaving(true);
    try {
      await api.updateClipMetadata(clip.id, {
        start_time: parseFloat(startTime),
        end_time: parseFloat(endTime),
        game_title: clipGame,
        youtube_title: ytTitle,
        youtube_description: ytDesc,
        youtube_tags: ytTags,
        instagram_caption: igCaption,
        crop_mode: cropMode,
        subtitles_enabled: subtitlesEnabled,
        sfx_enabled: sfxEnabled
      });
      alert('Clip settings and timestamps saved!');
      onRefresh();
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyTrimAndRerender = async () => {
    if (endTime <= startTime) {
      alert('End time must be greater than start time.');
      return;
    }
    setIsRerendering(true);
    try {
      await api.updateClipMetadata(clip.id, {
        start_time: parseFloat(startTime),
        end_time: parseFloat(endTime),
        crop_mode: cropMode,
        subtitles_enabled: subtitlesEnabled,
        sfx_enabled: sfxEnabled
      });
      await api.rerenderClip(clip.id);
      alert('Clip successfully re-cut and rendered with updated timestamps!');
      onRefresh();
    } catch (err) {
      alert(`Re-cut failed: ${err.message}`);
    } finally {
      setIsRerendering(false);
    }
  };

  const handleApprove = async () => {
    try {
      await api.approveClip(clip.id);
      onRefresh();
      onClose();
    } catch (err) {
      alert(`Approve failed: ${err.message}`);
    }
  };

  const handlePublishNow = async () => {
    setIsPublishing(true);
    try {
      await api.publishNow(clip.id, ['youtube', 'instagram']);
      alert('Clip added to immediate publishing queue!');
      onRefresh();
      onClose();
    } catch (err) {
      alert(`Publish failed: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduleTime) {
      alert('Please select a date and time for publication.');
      return;
    }
    setIsPublishing(true);
    try {
      await api.scheduleClip(clip.id, new Date(scheduleTime).toISOString(), ['youtube', 'instagram']);
      alert('Clip scheduled successfully!');
      onRefresh();
      onClose();
    } catch (err) {
      alert(`Scheduling failed: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const videoStreamUrl = `/api/clips/${clip.id}/stream`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121622] border border-[#232B3E] rounded-2xl w-full max-w-5xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#1E2536] bg-[#0E121B]">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
              {clip.highlight_category}
            </span>
            <h2 className="text-sm font-bold text-white truncate max-w-lg">
              {clip.youtube_title || clip.title}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split 2 Columns (Left: 9:16 Video Player, Right: Controls & Tabs) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-y-auto divide-y md:divide-y-0 md:divide-x divide-[#1E2536]">
          
          {/* Column 1: Vertical 9:16 Video Player */}
          <div className="md:col-span-5 p-6 bg-[#090C13] flex flex-col items-center justify-center">
            <div className="w-[260px] aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-[#1E2536] relative flex items-center justify-center">
              <video
                key={clip.edited_clip_path}
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover"
                src={videoStreamUrl}
              >
                Your browser does not support HTML5 video streaming.
              </video>
            </div>
            
            {/* Timestamp Badge */}
            <div className="mt-3.5 text-center space-y-1">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono">
                <Scissors className="w-3.5 h-3.5 text-indigo-400" />
                <span>Cut: {startTime.toFixed(1)}s ➔ {endTime.toFixed(1)}s ({currentDuration.toFixed(1)}s)</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">1080x1920 (9:16 Vertical Gaming Short)</p>
            </div>
          </div>

          {/* Column 2: Metadata Editor & Social Publishing Controls */}
          <div className="md:col-span-7 flex flex-col bg-[#121622]">
            
            {/* Game Profile & Instant AI Captions Regenerator Bar */}
            <div className="px-5 py-3 bg-[#0a0d15] border-b border-[#1E2536] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Gamepad2 className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-300">Game Profile:</span>
                <select
                  value={clipGame}
                  onChange={(e) => setClipGame(e.target.value)}
                  className="bg-black/60 border border-white/20 text-xs font-bold text-amber-300 rounded-full px-3 py-1 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="Grand Theft Auto V">🚗 Grand Theft Auto V (GTA 5)</option>
                  <option value="BGMI / PUBG Mobile">🏆 BGMI / PUBG Mobile</option>
                  <option value="Valorant">🎯 Valorant</option>
                  <option value="Call of Duty: Warzone">💥 Call of Duty: Warzone</option>
                  <option value="Free Fire">🔥 Free Fire</option>
                  <option value="Minecraft">🪣 Minecraft</option>
                  <option value="Counter-Strike 2">💣 Counter-Strike 2 (CS2)</option>
                  <option value="Apex Legends">⚡ Apex Legends</option>
                  <option value="General Gaming">🎮 Other / Generic Gaming</option>
                </select>
              </div>

              <button
                type="button"
                disabled={isRegenerating}
                onClick={handleRegenerateGameMetadata}
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-extrabold flex items-center space-x-1.5 shadow-md shadow-cyan-500/20 disabled:opacity-50 cursor-pointer transition active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>{isRegenerating ? 'Generating...' : `Regenerate Captions for ${clipGame}`}</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#1E2536] bg-[#0E121B] px-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('trim')}
                className={`flex items-center space-x-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                  activeTab === 'trim'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Scissors className="w-4 h-4" />
                <span>Trim & Cut</span>
              </button>

              <button
                onClick={() => setActiveTab('youtube')}
                className={`flex items-center space-x-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                  activeTab === 'youtube'
                    ? 'border-red-500 text-red-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <YoutubeIcon className="w-4 h-4 text-red-500" />
                <span>YouTube Shorts</span>
              </button>

              <button
                onClick={() => setActiveTab('instagram')}
                className={`flex items-center space-x-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                  activeTab === 'instagram'
                    ? 'border-pink-500 text-pink-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <InstagramIcon className="w-4 h-4 text-pink-500" />
                <span>Instagram Reels</span>
              </button>

              <button
                onClick={() => setActiveTab('style')}
                className={`flex items-center space-x-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                  activeTab === 'style'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Film className="w-4 h-4" />
                <span>Layout & FX</span>
              </button>

              <button
                onClick={() => setActiveTab('qc')}
                className={`flex items-center space-x-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                  activeTab === 'qc'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>QC Check</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6 flex-1 space-y-4 overflow-y-auto">
              
              {/* Trim & Cut Tab */}
              {activeTab === 'trim' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-[#0C101A] border border-[#1E2536] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <Scissors className="w-4 h-4 text-indigo-400" />
                        <span>Interactive Clip Trimmer</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Adjust start and end timestamps to fine-tune the exact highlight window
                      </p>
                    </div>
                    <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                      currentDuration <= 60
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {currentDuration.toFixed(1)}s {currentDuration <= 60 ? '✓ (Shorts)' : '⚠️ > 60s'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Start Time Control */}
                    <div className="p-3 rounded-xl bg-[#0A0D15] border border-[#1E2536] space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-300">Start Timestamp</label>
                        <span className="text-xs text-indigo-400 font-mono">({formatSeconds(startTime)})</span>
                      </div>
                      <input
                        type="number"
                        min={0}
                        step="0.5"
                        value={startTime}
                        onChange={(e) => setStartTime(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#121622] border border-[#232B3E] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                      <div className="flex space-x-1 pt-1">
                        <button type="button" onClick={() => setStartTime(Math.max(0, startTime - 5))} className="flex-1 py-1 rounded bg-slate-800 text-[10px] text-slate-300 hover:text-white hover:bg-slate-700">-5s</button>
                        <button type="button" onClick={() => setStartTime(Math.max(0, startTime - 1))} className="flex-1 py-1 rounded bg-slate-800 text-[10px] text-slate-300 hover:text-white hover:bg-slate-700">-1s</button>
                        <button type="button" onClick={() => setStartTime(startTime + 1)} className="flex-1 py-1 rounded bg-slate-800 text-[10px] text-slate-300 hover:text-white hover:bg-slate-700">+1s</button>
                        <button type="button" onClick={() => setStartTime(startTime + 5)} className="flex-1 py-1 rounded bg-slate-800 text-[10px] text-slate-300 hover:text-white hover:bg-slate-700">+5s</button>
                      </div>
                    </div>

                    {/* End Time Control */}
                    <div className="p-3 rounded-xl bg-[#0A0D15] border border-[#1E2536] space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-300">End Timestamp</label>
                        <span className="text-xs text-indigo-400 font-mono">({formatSeconds(endTime)})</span>
                      </div>
                      <input
                        type="number"
                        min={0}
                        step="0.5"
                        value={endTime}
                        onChange={(e) => setEndTime(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#121622] border border-[#232B3E] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                      <div className="flex space-x-1 pt-1">
                        <button type="button" onClick={() => setEndTime(Math.max(startTime + 1, endTime - 5))} className="flex-1 py-1 rounded bg-slate-800 text-[10px] text-slate-300 hover:text-white hover:bg-slate-700">-5s</button>
                        <button type="button" onClick={() => setEndTime(Math.max(startTime + 1, endTime - 1))} className="flex-1 py-1 rounded bg-slate-800 text-[10px] text-slate-300 hover:text-white hover:bg-slate-700">-1s</button>
                        <button type="button" onClick={() => setEndTime(endTime + 1)} className="flex-1 py-1 rounded bg-slate-800 text-[10px] text-slate-300 hover:text-white hover:bg-slate-700">+1s</button>
                        <button type="button" onClick={() => setEndTime(endTime + 5)} className="flex-1 py-1 rounded bg-slate-800 text-[10px] text-slate-300 hover:text-white hover:bg-slate-700">+5s</button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleApplyTrimAndRerender}
                      disabled={isRerendering}
                      className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                    >
                      <Scissors className={`w-4 h-4 ${isRerendering ? 'animate-spin' : ''}`} />
                      <span>{isRerendering ? 'Re-cutting Video & Rendering 9:16...' : 'Cut & Re-render Video with These Timestamps'}</span>
                    </button>
                    <p className="text-[11px] text-slate-500 text-center mt-1.5">
                      Extracts exact frames from master footage, synchronizes subtitles, and applies 9:16 vertical layout.
                    </p>
                  </div>
                </div>
              )}

              {/* YouTube Shorts Tab */}
              {activeTab === 'youtube' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Shorts Title (Max 100 characters)
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={ytTitle}
                      onChange={(e) => setYtTitle(e.target.value)}
                      className="w-full bg-[#0A0D15] border border-[#232B3E] rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                    <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                      <span>Must include #Shorts</span>
                      <span>{ytTitle.length}/100</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Shorts Description & Gaming Hooks
                    </label>
                    <textarea
                      rows={4}
                      value={ytDesc}
                      onChange={(e) => setYtDesc(e.target.value)}
                      className="w-full bg-[#0A0D15] border border-[#232B3E] rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      SEO Tags (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={ytTags}
                      onChange={(e) => setYtTags(e.target.value)}
                      className="w-full bg-[#0A0D15] border border-[#232B3E] rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              )}

              {/* Instagram Reels Tab */}
              {activeTab === 'instagram' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Reel Caption & Hashtags
                    </label>
                    <textarea
                      rows={6}
                      value={igCaption}
                      onChange={(e) => setIgCaption(e.target.value)}
                      className="w-full bg-[#0A0D15] border border-[#232B3E] rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>
              )}

              {/* Quality Control Tab */}
              {activeTab === 'qc' && (
                <div className="space-y-3.5">
                  <div className="p-4 rounded-xl bg-[#0C101A] border border-[#1E2536] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Pre-Flight Quality Score</h4>
                      <p className="text-[11px] text-slate-400">Automated platform compliance verification</p>
                    </div>
                    <div className="text-2xl font-extrabold text-emerald-400">
                      {qcData?.score ?? 100}/100
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { label: 'Vertical Aspect Ratio (1080x1920)', status: qcData?.resolution_valid ?? true },
                      { label: 'Video Duration within Shorts Limit (15-60s)', status: qcData?.duration_valid ?? true },
                      { label: 'Audio Stream Active (No Silence / Clipping)', status: qcData?.audio_valid ?? true },
                      { label: 'No Prolonged Black Screens Detected', status: !(qcData?.black_screen_detected ?? false) },
                      { label: 'File Bitstream Integrity Valid', status: qcData?.file_integrity_valid ?? true },
                      { label: 'Subtitle Synchronization Synchronized', status: qcData?.subtitle_sync_valid ?? true },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-[#0A0D15] border border-[#1E2536] text-xs">
                        <span className="text-slate-300">{item.label}</span>
                        {item.status ? (
                          <span className="flex items-center space-x-1 text-emerald-400 text-[11px] font-semibold">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Pass</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 text-rose-400 text-[11px] font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Issue</span>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Style & Re-render Tab */}
              {activeTab === 'style' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Intelligent 9:16 Gameplay Framing
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'blur_fill', label: 'Blurred Backdrop', desc: '16:9 gameplay over blurred 9:16 background' },
                        { id: 'stacked', label: 'Stacked Layout', desc: 'Top facecam zoom + bottom gameplay' },
                        { id: 'crop_center', label: 'Center Crop', desc: 'Direct 9:16 center crop' },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setCropMode(mode.id)}
                          className={`p-3 rounded-xl border text-left transition ${
                            cropMode === mode.id
                              ? 'bg-indigo-600/10 border-indigo-500 text-white'
                              : 'bg-[#0A0D15] border-[#232B3E] text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="text-xs font-bold">{mode.label}</div>
                          <div className="text-[10px] text-slate-500 mt-1">{mode.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={subtitlesEnabled}
                        onChange={(e) => setSubtitlesEnabled(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-indigo-600 w-4 h-4"
                      />
                      <span>Burn animated karaoke subtitles with highlighted gaming words</span>
                    </label>

                    <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sfxEnabled}
                        onChange={(e) => setSfxEnabled(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-indigo-600 w-4 h-4"
                      />
                      <span>Mix subtle sound effects (whoosh transition & bass impact)</span>
                    </label>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Bottom Action Bar */}
            <div className="p-4 border-t border-[#1E2536] bg-[#0E121B] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleSaveMetadata}
                  disabled={isSaving}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>

                {!clip.approved_for_publishing && (
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold transition"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                )}
              </div>

              {/* Publish / Schedule Section */}
              <div className="flex items-center space-x-2">
                <input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="bg-[#0A0D15] border border-[#232B3E] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                />

                <button
                  type="button"
                  onClick={handleSchedule}
                  disabled={isPublishing}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Schedule</span>
                </button>

                <button
                  type="button"
                  onClick={handlePublishNow}
                  disabled={isPublishing}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Now</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
