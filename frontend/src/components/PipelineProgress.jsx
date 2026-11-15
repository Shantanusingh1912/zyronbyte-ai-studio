import React from 'react';
import { Loader2, Sparkles, Video, Cpu, Film, CheckCircle, Radio } from 'lucide-react';

export default function PipelineProgress({ pipelineStatus }) {
  const processingVideos = pipelineStatus?.processing_videos || [];
  if (processingVideos.length === 0) return null;

  return (
    <div className="apple-card p-6 rounded-3xl border border-white/20 relative overflow-hidden shadow-2xl">
      {/* Siri / Galaxy AI Iridescent Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-cyan-400 tracking-wider">
                LIVE TASK RUNNER
              </span>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                AI Automation Pipeline Active ({processingVideos.length} Job{processingVideos.length > 1 ? 's' : ''})
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-2 text-xs font-bold px-3.5 py-1.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/20">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>SIRI / GALAXY AI ACCELERATED</span>
            </span>
          </div>
        </div>

        <div className="space-y-3.5">
          {processingVideos.map((v) => (
            <div key={v.id} className="bg-black/50 rounded-2xl p-4 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold text-white truncate max-w-[70%]">
                  {v.title}
                </span>
                <span className="font-mono font-black text-cyan-400 text-base">
                  {Math.round(v.progress)}%
                </span>
              </div>

              {/* Siri Iridescent Wave Progress Bar */}
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/15">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 transition-all duration-300 rounded-full shadow-lg shadow-cyan-500/40"
                  style={{ width: `${Math.max(4, v.progress)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                <span className="flex items-center space-x-2 text-cyan-300 font-medium truncate max-w-[75%]">
                  <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 animate-pulse" />
                  <span className="truncate">{v.current_step || 'Processing...'}</span>
                </span>
                <span className="text-[10px] font-black px-3 py-1 rounded-full bg-white/10 text-white border border-white/20">
                  {v.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
