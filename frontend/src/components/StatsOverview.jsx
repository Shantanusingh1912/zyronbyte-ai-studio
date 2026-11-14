import React from 'react';
import { 
  Film, Scissors, CheckCircle2, Clock, Send, 
  AlertTriangle, Zap, ShieldCheck 
} from 'lucide-react';

export default function StatsOverview({ stats, onToggleAutoPublish }) {
  if (!stats) return null;

  const cards = [
    {
      title: 'Videos Processed',
      value: stats.total_videos,
      icon: Film,
      color: 'from-blue-500/20 to-blue-600/5',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/20'
    },
    {
      title: 'Clips Generated',
      value: stats.total_clips,
      icon: Scissors,
      color: 'from-purple-500/20 to-purple-600/5',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/20'
    },
    {
      title: 'Approved / Ready',
      value: stats.approved_clips,
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-emerald-600/5',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20'
    },
    {
      title: 'Pending Uploads',
      value: stats.pending_uploads,
      icon: Clock,
      color: 'from-amber-500/20 to-amber-600/5',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/20'
    },
    {
      title: 'Published (Shorts & Reels)',
      value: stats.published_count,
      icon: Send,
      color: 'from-cyan-500/20 to-cyan-600/5',
      iconColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/20'
    },
    {
      title: 'Failed Uploads',
      value: stats.failed_uploads,
      icon: AlertTriangle,
      color: 'from-rose-500/20 to-rose-600/5',
      iconColor: 'text-rose-400',
      borderColor: 'border-rose-500/20'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#131722] border border-[#1E2536] p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Publishing Mode</h3>
            <p className="text-xs text-slate-400">
              {stats.auto_publish_enabled 
                ? 'Full Auto-Publish: Approved QC-verified clips are automatically queued and published.' 
                : 'Manual Approval Gate: You review and approve clips before they are published.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-end sm:self-center">
          <span className="text-xs font-medium text-slate-300">
            {stats.auto_publish_enabled ? 'Auto-Publish' : 'Manual Approval'}
          </span>
          <button
            onClick={() => onToggleAutoPublish(!stats.auto_publish_enabled)}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
              stats.auto_publish_enabled ? 'bg-indigo-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                stats.auto_publish_enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx}
              className={`p-4 rounded-xl bg-gradient-to-br ${card.color} bg-[#111520] border ${card.borderColor} flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">{card.title}</span>
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
              <div className="text-2xl font-bold tracking-tight text-white">{card.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
