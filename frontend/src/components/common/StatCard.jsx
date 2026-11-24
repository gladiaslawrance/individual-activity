import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'cyan', // cyan, blue, red, amber, green
}) => {
  const colorMap = {
    cyan: {
      border: 'border-cyan-500/30 hover:border-cyan-500/60',
      iconBg: 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/40',
      value: 'text-cyan-400',
    },
    blue: {
      border: 'border-blue-500/30 hover:border-blue-500/60',
      iconBg: 'bg-blue-950/60 text-blue-400 border border-blue-500/40',
      value: 'text-blue-400',
    },
    red: {
      border: 'border-red-500/30 hover:border-red-500/60',
      iconBg: 'bg-red-950/60 text-red-400 border border-red-500/40',
      value: 'text-red-400',
    },
    amber: {
      border: 'border-amber-500/30 hover:border-amber-500/60',
      iconBg: 'bg-amber-950/60 text-amber-400 border border-amber-500/40',
      value: 'text-amber-400',
    },
    green: {
      border: 'border-emerald-500/30 hover:border-emerald-500/60',
      iconBg: 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40',
      value: 'text-emerald-400',
    },
  };

  const scheme = colorMap[color] || colorMap.cyan;

  return (
    <div
      className={`bg-cyber-navy/80 border rounded-xl p-5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 ${scheme.border}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg ${scheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className={`text-2xl font-bold font-mono tracking-tight ${scheme.value}`}>
          {value !== undefined && value !== null ? value : '--'}
        </div>
        {trend && <span className="text-xs font-mono text-slate-400">{trend}</span>}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
};
