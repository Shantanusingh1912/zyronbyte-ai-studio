import React, { useState, useEffect } from 'react';
import { X, Terminal, Trash2, RefreshCw, Filter } from 'lucide-react';
import { api } from '../api';

export default function LogsViewer({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [logs, setLogs] = useState([]);
  const [level, setLevel] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const data = await api.getLogs(150);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleClear = async () => {
    try {
      await api.clearLogs();
      setLogs([]);
    } catch (err) {
      alert('Failed to clear logs');
    }
  };

  const filteredLogs = (logs || []).filter(l => {
    if (level !== 'all' && l.level !== level) return false;
    return true;
  });

  const getLevelColor = (lvl) => {
    switch (lvl) {
      case 'SUCCESS': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'WARNING': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'ERROR': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-300 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121622] border border-[#232B3E] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col h-[75vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2536] bg-[#0E121B]">
          <div className="flex items-center space-x-2.5">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white">System Processing Console</h2>
              <p className="text-xs text-slate-400">Live logs for Whisper, Gemini AI, FFmpeg rendering, and upload queue</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Clear Logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-6 py-2.5 bg-[#0A0D15] border-b border-[#1E2536] flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Filter Level:</span>
            {['all', 'SUCCESS', 'INFO', 'WARNING', 'ERROR'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  level === lvl ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <span className="text-slate-500 font-mono text-[11px]">
            {filteredLogs.length} events logged
          </span>
        </div>

        {/* Logs terminal body */}
        <div className="flex-1 p-4 bg-[#080B11] overflow-y-auto font-mono text-xs space-y-1.5">
          {filteredLogs.length === 0 ? (
            <div className="text-center text-slate-600 py-10">No log records to display</div>
          ) : (
            filteredLogs.map((l) => (
              <div key={l.id} className="flex items-start space-x-2.5 py-0.5">
                <span className="text-slate-500 text-[10px] whitespace-nowrap mt-0.5">
                  {new Date(l.created_at).toLocaleTimeString()}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase flex-shrink-0 ${getLevelColor(l.level)}`}>
                  {l.level}
                </span>
                <span className="text-indigo-400 text-[10px] font-bold flex-shrink-0">
                  [{l.module}]
                </span>
                <span className="text-slate-200 leading-relaxed">
                  {l.message}
                </span>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
