import React from 'react';
import { Loader2, Sparkles, Video, Cpu, Film, CheckCircle, Radio } from 'lucide-react';

export default function PipelineProgress({ pipelineStatus }) {
  const processingVideos = pipelineStatus?.processing_videos || [];
  if (processingVideos.length === 0) return null;

  return (
    <div className="studio-card p-5 rounded-3xl border-indigo-500/30 relative overflow-hidden">
      {/* Background ambient pulse */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/30 via-purple-950/20 to-transparent pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            </div>
            <div>
              <span className="studio-pill text-[9px] font-bold text-indigo-400 tracking-wider">
                LIVE TASK RUNNER
              </span>
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                AI Automation Pipeline Active ({processingVideos.length} Job{processingVideos.length > 1 ? 's' : ''})
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1.5 studio-pill text-[10px] font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>GPU/CPU ACCELERATED</span>
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {processingVideos.map((v) => (
            <div key={v.id} className="bg-[#070A12]/90 rounded-2xl p-4 border border-white/[0.08] space-y-2.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold text-slate-100 truncate max-w-[65%]">
                  {v.title}
                </span>
                <span className="font-mono font-black text-indigo-400 text-sm">
                  {Math.round(v.progress)}%
                </span>
              </div>

              {/* High-tech Gradient Progress Bar */}
              <div className="w-full h-2.5 bg-white/[0.05] rounded-full overflow-hidden p-0.5 border border-white/[0.06]">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 transition-all duration-300 rounded-full shadow-lg shadow-indigo-500/50"
                  style={{ width: `${Math.max(4, v.progress)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span className="flex items-center space-x-2 text-indigo-300 font-medium truncate max-w-[75%]">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span className="truncate">{v.current_step || 'Processing...'}</span>
                </span>
                <span className="studio-pill text-[9px] font-black px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
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
