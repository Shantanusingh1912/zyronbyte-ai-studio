import React from 'react';
import { Loader2, Sparkles, Video, Cpu, Film, CheckCircle } from 'lucide-react';

export default function PipelineProgress({ pipelineStatus }) {
  const processingVideos = pipelineStatus?.processing_videos || [];
  if (processingVideos.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-950/60 via-[#131826] to-purple-950/40 border border-indigo-500/30 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2.5">
          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
          <h3 className="text-sm font-bold text-white tracking-wide">
            AI Automation Pipeline Active ({processingVideos.length} Job{processingVideos.length > 1 ? 's' : ''})
          </h3>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse">
          LIVE RENDERING
        </span>
      </div>

      <div className="space-y-3">
        {processingVideos.map((v) => (
          <div key={v.id} className="bg-[#0C0F17]/80 rounded-lg p-3 border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-200 truncate max-w-[60%]">
                {v.title}
              </span>
              <span className="text-indigo-400 font-mono font-bold">
                {Math.round(v.progress)}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(5, v.progress)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center space-x-1.5 text-slate-300">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>{v.current_step || 'Processing...'}</span>
              </span>
              <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {v.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
