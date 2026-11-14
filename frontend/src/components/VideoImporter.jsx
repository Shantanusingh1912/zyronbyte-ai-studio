import React, { useState } from 'react';
import { X, HardDrive, Layers, UploadCloud, AlertCircle, CheckCircle } from 'lucide-react';
import { YoutubeIcon } from './Icons';
import { api } from '../api';

export default function VideoImporter({ isOpen, onClose, onImportSuccess }) {
  const [tab, setTab] = useState('youtube'); // 'youtube', 'local_path', 'upload', 'batch'
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [localPath, setLocalPath] = useState('');
  const [batchUrls, setBatchUrls] = useState('');
  const [fileToUpload, setFileToUpload] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoStart, setAutoStart] = useState(true);

  if (!isOpen) return null;

  const handleImport = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (tab === 'youtube') {
        if (!youtubeUrl) throw new Error('Please enter a YouTube video or stream URL');
        const res = await api.importVideo({
          source_type: 'youtube',
          source_url: youtubeUrl,
          title: videoTitle || undefined
        });
        if (autoStart) {
          await api.startPipeline(res.id);
        }
        onImportSuccess();
        onClose();
      } else if (tab === 'local_path') {
        if (!localPath) throw new Error('Please enter an absolute local file path (e.g. C:\\Videos\\gameplay.mp4)');
        const res = await api.importVideo({
          source_type: 'local',
          local_file_path: localPath,
          title: videoTitle || undefined
        });
        if (autoStart) {
          await api.startPipeline(res.id);
        }
        onImportSuccess();
        onClose();
      } else if (tab === 'upload') {
        if (!fileToUpload) throw new Error('Please choose a video file to upload');
        const formData = new FormData();
        formData.append('file', fileToUpload);
        if (videoTitle) formData.append('title', videoTitle);
        
        const res = await api.uploadVideo(formData);
        if (autoStart) {
          await api.startPipeline(res.id);
        }
        onImportSuccess();
        onClose();
      } else if (tab === 'batch') {
        const urls = batchUrls.split('\n').map(u => u.trim()).filter(Boolean);
        if (urls.length === 0) throw new Error('Please provide at least one URL');
        
        const items = urls.map(url => ({
          source_type: 'youtube',
          source_url: url
        }));
        await api.importVideo({ items });
        onImportSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Import operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121622] border border-[#232B3E] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2536] bg-[#0E121B]">
          <div>
            <h2 className="text-base font-bold text-white">Import Gaming Footage</h2>
            <p className="text-xs text-slate-400">Add long videos, livestreams, or clips for AI analysis</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#1E2536] bg-[#0A0D15] px-6">
          <button
            onClick={() => setTab('youtube')}
            className={`flex items-center space-x-2 py-3 px-3 text-xs font-semibold border-b-2 transition ${
              tab === 'youtube'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <YoutubeIcon className="w-4 h-4 text-red-400" />
            <span>YouTube / Livestream URL</span>
          </button>

          <button
            onClick={() => setTab('local_path')}
            className={`flex items-center space-x-2 py-3 px-3 text-xs font-semibold border-b-2 transition ${
              tab === 'local_path'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Local File Path</span>
          </button>

          <button
            onClick={() => setTab('upload')}
            className={`flex items-center space-x-2 py-3 px-3 text-xs font-semibold border-b-2 transition ${
              tab === 'upload'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload File</span>
          </button>

          <button
            onClick={() => setTab('batch')}
            className={`flex items-center space-x-2 py-3 px-3 text-xs font-semibold border-b-2 transition ${
              tab === 'batch'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Batch URLs</span>
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleImport} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {tab === 'youtube' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  YouTube Video / Stream URL *
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full bg-[#0A0D15] border border-[#232B3E] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Video Label / Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Legends 20 Kill Livestream"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full bg-[#0A0D15] border border-[#232B3E] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {tab === 'local_path' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Local Windows File Path *
                </label>
                <input
                  type="text"
                  placeholder="C:\Users\ZyronByteYT\Videos\Captures\gameplay.mp4"
                  value={localPath}
                  onChange={(e) => setLocalPath(e.target.value)}
                  className="w-full bg-[#0A0D15] border border-[#232B3E] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Supports MP4, MKV, MOV recorded from OBS, ShadowPlay, or Elgato.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Game / Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Valorant Ranked Clutch Stream"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full bg-[#0A0D15] border border-[#232B3E] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {tab === 'upload' && (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-[#232B3E] hover:border-indigo-500/50 rounded-xl p-6 text-center transition">
                <input
                  type="file"
                  accept="video/mp4,video/mkv,video/quicktime,video/webm"
                  onChange={(e) => setFileToUpload(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <UploadCloud className="w-10 h-10 text-indigo-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-200">
                    {fileToUpload ? fileToUpload.name : 'Click to select or drag and drop gaming video'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1">MP4, MKV, MOV up to 4GB</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Call of Duty Warzone Win"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full bg-[#0A0D15] border border-[#232B3E] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {tab === 'batch' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Batch YouTube URLs (One per line)
              </label>
              <textarea
                rows={5}
                placeholder="https://youtube.com/watch?v=123&#10;https://youtube.com/watch?v=456"
                value={batchUrls}
                onChange={(e) => setBatchUrls(e.target.value)}
                className="w-full bg-[#0A0D15] border border-[#232B3E] rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          )}

          {/* Auto Start Pipeline Checkbox */}
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="auto-start"
              checked={autoStart}
              onChange={(e) => setAutoStart(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="auto-start" className="text-xs text-slate-300 cursor-pointer select-none">
              Automatically run highlight detection & 9:16 video generation immediately
            </label>
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
              disabled={isLoading}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 flex items-center space-x-1.5"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-1.5" />
                  <span>Importing...</span>
                </>
              ) : (
                <span>Import Footage</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
