import React from 'react';
import { 
  Film, Scissors, CheckCircle2, Clock, Send, 
  AlertTriangle, Zap, ShieldCheck, Sparkles, TrendingUp
} from 'lucide-react';

export default function StatsOverview({ stats, onToggleAutoPublish }) {
  if (!stats) return null;

  const cards = [
    {
      index: '01',
      title: 'Master Footage',
      subtitle: 'Raw gameplay & VODs',
      value: stats.total_videos,
      icon: Film,
      topBorder: 'border-t-blue-500',
      badgeBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      numColor: 'text-white',
      accentGlow: 'group-hover:border-blue-500/40 group-hover:shadow-blue-500/20'
    },
    {
      index: '02',
      title: 'Shorts Generated',
      subtitle: '9:16 Vertical AI edits',
      value: stats.total_clips,
      icon: Scissors,
      topBorder: 'border-t-amber-500',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
      numColor: 'text-amber-300',
      accentGlow: 'group-hover:border-amber-500/40 group-hover:shadow-amber-500/25'
    },
    {
      index: '03',
      title: 'Ready & Approved',
      subtitle: 'Passed 100/100 QC',
      value: stats.approved_clips,
      icon: CheckCircle2,
      topBorder: 'border-t-emerald-500',
      badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      numColor: 'text-emerald-300',
      accentGlow: 'group-hover:border-emerald-500/40 group-hover:shadow-emerald-500/20'
    },
    {
      index: '04',
      title: 'Publishing Queue',
      subtitle: 'Scheduled auto-release',
      value: stats.pending_uploads,
      icon: Clock,
      topBorder: 'border-t-purple-500',
      badgeBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      numColor: 'text-purple-300',
      accentGlow: 'group-hover:border-purple-500/40 group-hover:shadow-purple-500/20'
    },
    {
      index: '05',
      title: 'Live Published',
      subtitle: 'YouTube & Instagram',
      value: stats.published_count,
      icon: Send,
      topBorder: 'border-t-cyan-500',
      badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      numColor: 'text-cyan-300',
      accentGlow: 'group-hover:border-cyan-500/40 group-hover:shadow-cyan-500/20'
    },
    {
      index: '06',
      title: 'Quality Review',
      subtitle: 'Flagged / Needs attention',
      value: stats.failed_uploads,
      icon: AlertTriangle,
      topBorder: 'border-t-rose-500',
      badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      numColor: stats.failed_uploads > 0 ? 'text-rose-400' : 'text-zinc-400',
      accentGlow: 'group-hover:border-rose-500/40 group-hover:shadow-rose-500/20'
    }
  ];

  return (
    <div className="space-y-5">
      {/* Editorial Luxury Publishing Engine Bar */}
      <div className="apple-card p-5 sm:p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden border border-white/20">
        <div className="flex items-center space-x-4 relative z-10">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-blue-600/20 to-amber-500/20 text-cyan-300 border border-white/15 shadow-lg">
            <Zap className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                Social Autonomous Dispatch Engine
              </h3>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                stats.auto_publish_enabled 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-sm shadow-emerald-500/20' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-sm shadow-amber-500/20'
              }`}>
                {stats.auto_publish_enabled ? 'AUTO PUBLISH LIVE' : 'SAFETY GATE ACTIVE'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {stats.auto_publish_enabled 
                ? 'High-performance autopilot: Verified 9:16 vertical shorts are automatically scheduled and uploaded to YouTube Shorts & Instagram.' 
                : 'Manual Creator Review: Clips require your 1-click preview and approval before being uploaded.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3.5 self-end sm:self-center bg-black/60 backdrop-blur-2xl px-4 py-2 rounded-full border border-white/15 relative z-10 shadow-lg">
          <span className="text-xs font-bold text-zinc-200 select-none">
            {stats.auto_publish_enabled ? 'Auto-Publish Active' : 'Manual Approval Required'}
          </span>
          <button
            onClick={() => onToggleAutoPublish(!stats.auto_publish_enabled)}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
              stats.auto_publish_enabled 
                ? 'bg-gradient-to-r from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/40' 
                : 'bg-white/20'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                stats.auto_publish_enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 6 Apple Watch / Samsung Health Style Metrics Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`apple-card p-4 sm:p-5 rounded-3xl border border-white/15 ${card.topBorder} border-t-2 relative overflow-hidden group flex flex-col justify-between hover:scale-[1.02] transition-all duration-300`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400">
                    {card.index} //
                  </span>
                  <div className={`p-2 rounded-xl border ${card.badgeBg} shadow-sm`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <h4 className="text-xs font-bold text-zinc-200 tracking-tight">
                  {card.title}
                </h4>
                <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
                  {card.subtitle}
                </p>
              </div>

              <div className="mt-4 flex items-baseline justify-between pt-2 border-t border-white/5">
                <span className={`text-3xl sm:text-4xl font-black tracking-tight ${card.numColor}`}>
                  {card.value}
                </span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  COUNT
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
