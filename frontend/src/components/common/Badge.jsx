import React from 'react';
import { ShieldCheck, AlertCircle, ShieldAlert, Ban, Zap } from 'lucide-react';

export const FsmBadge = ({ state }) => {
  const normalized = (state || 'NORMAL').toUpperCase();

  switch (normalized) {
    case 'NORMAL':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-500/40 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          NORMAL (S0)
        </span>
      );
    case 'WARNED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-amber-950/70 text-amber-300 border border-amber-500/40 shadow-sm">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          WARNED (S1)
        </span>
      );
    case 'THROTTLED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-orange-950/70 text-orange-400 border border-orange-500/40 shadow-sm animate-pulse">
          <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
          THROTTLED (S2)
        </span>
      );
    case 'BLOCKED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-red-950/80 text-red-400 border border-red-500/50 shadow-sm">
          <Ban className="w-3.5 h-3.5 text-red-400" />
          BLOCKED (S3)
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
          {normalized}
        </span>
      );
  }
};

export const MethodBadge = ({ method }) => {
  const m = (method || 'GET').toUpperCase();
  let colorStyle = 'bg-blue-950/80 text-blue-300 border-blue-500/40';

  if (m === 'POST') colorStyle = 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40';
  if (m === 'PUT') colorStyle = 'bg-amber-950/80 text-amber-300 border-amber-500/40';
  if (m === 'DELETE') colorStyle = 'bg-rose-950/80 text-rose-300 border-rose-500/40';

  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold border tracking-wider ${colorStyle}`}>
      {m}
    </span>
  );
};

export const StatusBadge = ({ statusCode }) => {
  const code = Number(statusCode) || 200;
  let style = 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40';

  if (code >= 400 && code < 429) {
    style = 'bg-purple-950/70 text-purple-300 border-purple-500/40';
  } else if (code === 429) {
    style = 'bg-orange-950/80 text-orange-300 border-orange-500/40 animate-pulse';
  } else if (code >= 403 && code < 405) {
    style = 'bg-red-950/80 text-red-300 border-red-500/50';
  } else if (code >= 500) {
    style = 'bg-red-950/90 text-red-200 border-red-600';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold border ${style}`}>
      {code}
    </span>
  );
};

export const SeverityBadge = ({ severity }) => {
  const s = (severity || 'LOW').toUpperCase();
  let style = 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40';

  if (s === 'MEDIUM') style = 'bg-amber-950/70 text-amber-300 border-amber-500/40';
  if (s === 'HIGH') style = 'bg-orange-950/80 text-orange-300 border-orange-500/40';
  if (s === 'CRITICAL') style = 'bg-red-950/90 text-red-300 border-red-500/60 animate-pulse';

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold tracking-wide border ${style}`}>
      <Zap className="w-3 h-3" />
      {s}
    </span>
  );
};
