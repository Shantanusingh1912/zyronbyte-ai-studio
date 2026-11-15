import React from 'react';
import { 
  Film, Scissors, CheckCircle2, Clock, Send, 
  AlertTriangle, Zap, ShieldCheck, Sparkles 
} from 'lucide-react';

export default function StatsOverview({ stats, onToggleAutoPublish }) {
  if (!stats) return null;

  const cards = [
    {
      index: '01',
      title: 'Master Footage',
      subtitle: 'Long gameplay & VODs',
      value: stats.total_videos,
      icon: Film,
      color: 'from-blue-500/10 to-transparent',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/20'
    },
    {
      index: '02',
      title: 'Shorts Generated',
      subtitle: '9:16 Vertical edits',
      value: stats.total_clips,
      icon: Scissors,
      color: 'from-purple-500/10 to-transparent',
      textColor: 'text-purple-400',
      borderColor: 'border-purple-500/20'
    },
    {
      index: '03',
      title: 'Ready & Approved',
      subtitle: 'Passed 100/100 QC',
      value: stats.approved_clips,
      icon: CheckCircle2,
      color: 'from-emerald-500/10 to-transparent',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20'
    },
    {
      index: '04',
      title: 'Publishing Queue',
      subtitle: 'Scheduled uploads',
      value: stats.pending_uploads,
      icon: Clock,
      color: 'from-amber-500/10 to-transparent',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/20'
    },
    {
      index: '05',
      title: 'Live Published',
      subtitle: 'YouTube & Instagram',
      value: stats.published_count,
      icon: Send,
      color: 'from-cyan-500/10 to-transparent',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/20'
    },
    {
      index: '06',
      title: 'Failed Uploads',
      subtitle: 'Requires attention',
      value: stats.failed_uploads,
      icon: AlertTriangle,
      color: 'from-rose-500/10 to-transparent',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/20'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Publishing Mode Gate Banner */}
      <div className="studio-card p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Social Publishing Mode
              </h3>
              <span className={`studio-pill text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                stats.auto_publish_enabled 
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                  : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
              }`}>
                {stats.auto_publish_enabled ? 'AUTONOMOUS' : 'MANUAL APPROVAL'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {stats.auto_publish_enabled 
                ? 'Full Auto: QC-inspected 9:16 Shorts are scheduled & published automatically to YouTube Shorts and Instagram Reels.' 
                : 'Safety Review: Clips require your 1-click preview and approval in the gallery before going live.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-end sm:self-center bg-[#070A12]/80 p-2 rounded-xl border border-white/[0.08]">
          <span className="text-xs font-semibold text-slate-300 select-none">
            {stats.auto_publish_enabled ? 'Auto-Publish Active' : 'Manual Approval Required'}
          </span>
          <button
            onClick={() => onToggleAutoPublish(!stats.auto_publish_enabled)}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
              stats.auto_publish_enabled ? 'bg-indigo-600 shadow-lg shadow-indigo-600/40' : 'bg-slate-700'
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

      {/* Editorial Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx}
              className={`studio-card p-4 rounded-2xl border ${card.borderColor} bg-gradient-to-b ${card.color} flex flex-col justify-between group transition-all duration-300`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="studio-pill text-[10px] text-slate-500 font-bold tracking-wider">
                    {card.index} //
                  </span>
                  <div className={`p-1.5 rounded-lg bg-white/[0.03] ${card.textColor} group-hover:scale-110 transition duration-300`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="text-xs font-semibold text-slate-300 leading-tight">
                  {card.title}
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                  {card.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-white/[0.04] flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sans">
                  {card.value}
                </span>
                <span className={`text-[10px] font-bold ${card.textColor} studio-pill`}>
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
