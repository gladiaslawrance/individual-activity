import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  ShieldCheck,
  AlertCircle,
  ShieldAlert,
  Ban,
  ArrowRight,
  RefreshCw,
  Info,
  Clock,
  Layers,
  CheckCircle2,
  Lock,
  Unlock,
} from 'lucide-react';
import { fsmAPI } from '../services/api';
import { Card } from '../components/common/Card';
import { FsmBadge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';

export const FsmVisualization = () => {
  const [fsmStates, setFsmStates] = useState([]);
  const [transitionTable, setTransitionTable] = useState([]);
  const [transitionHistory, setTransitionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState(null);

  const toast = useToast();

  const fetchFsmData = async () => {
    try {
      setLoading(true);
      const [statesRes, transRes, histRes] = await Promise.all([
        fsmAPI.getStates(),
        fsmAPI.getTransitions(),
        fsmAPI.getHistory({ limit: 15 }),
      ]);

      if (statesRes.data?.success) setFsmStates(statesRes.data.states || []);
      if (transRes.data?.success) setTransitionTable(transRes.data.transitionTable || []);
      if (histRes.data?.success) setTransitionHistory(histRes.data.history || []);
    } catch (err) {
      toast.error('Failed to load FSM state models');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFsmData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cyber-border/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <GitBranch className="w-6 h-6 text-cyber-cyan" />
            Deterministic Finite State Machine (FSM) Engine
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Mathematical access-control state model governing client transitions across S0, S1, S2, and S3
          </p>
        </div>

        <button
          onClick={fetchFsmData}
          title="Refresh FSM Data"
          className="p-2 rounded-lg bg-cyber-navy border border-cyber-border text-slate-300 hover:text-cyan-400 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* State Node Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* S0: NORMAL */}
        <div
          onClick={() => setSelectedState(selectedState === 'NORMAL' ? null : 'NORMAL')}
          className={`p-5 rounded-xl bg-cyber-navy/80 border transition-all cursor-pointer ${
            selectedState === 'NORMAL'
              ? 'border-emerald-400 shadow-lg shadow-emerald-950/60 ring-1 ring-emerald-400'
              : 'border-emerald-500/30 hover:border-emerald-500/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 tracking-wider">
              STATE S0 (INITIAL)
            </span>
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-white font-sans">NORMAL</div>
          <p className="mt-1 text-[11px] text-slate-400 font-sans">
            Standard baseline state. Client requests are below 70% threshold. HTTP 200 OK.
          </p>
          <div className="mt-3 pt-3 border-t border-cyber-border/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Active Clients:</span>
            <span className="text-emerald-400 font-bold">
              {fsmStates.find((s) => s.name === 'NORMAL')?.activeClientCount || 0}
            </span>
          </div>
        </div>

        {/* S1: WARNED */}
        <div
          onClick={() => setSelectedState(selectedState === 'WARNED' ? null : 'WARNED')}
          className={`p-5 rounded-xl bg-cyber-navy/80 border transition-all cursor-pointer ${
            selectedState === 'WARNED'
              ? 'border-amber-400 shadow-lg shadow-amber-950/60 ring-1 ring-amber-400'
              : 'border-amber-500/30 hover:border-amber-500/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 tracking-wider">STATE S1</span>
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-white font-sans">WARNED</div>
          <p className="mt-1 text-[11px] text-slate-400 font-sans">
            Approaching limit: Traffic between 70% and 99% of quota. HTTP 200 OK with warning.
          </p>
          <div className="mt-3 pt-3 border-t border-cyber-border/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Active Clients:</span>
            <span className="text-amber-400 font-bold">
              {fsmStates.find((s) => s.name === 'WARNED')?.activeClientCount || 0}
            </span>
          </div>
        </div>

        {/* S2: THROTTLED */}
        <div
          onClick={() => setSelectedState(selectedState === 'THROTTLED' ? null : 'THROTTLED')}
          className={`p-5 rounded-xl bg-cyber-navy/80 border transition-all cursor-pointer ${
            selectedState === 'THROTTLED'
              ? 'border-orange-400 shadow-lg shadow-orange-950/60 ring-1 ring-orange-400'
              : 'border-orange-500/30 hover:border-orange-500/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-400 tracking-wider">STATE S2</span>
            <div className="p-2 rounded-lg bg-orange-950/60 border border-orange-500/40 text-orange-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-white font-sans">THROTTLED</div>
          <p className="mt-1 text-[11px] text-slate-400 font-sans">
            Ceiling breached (&gt;= 100%). Client rejected with HTTP 429 during cooldown window.
          </p>
          <div className="mt-3 pt-3 border-t border-cyber-border/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Active Clients:</span>
            <span className="text-orange-400 font-bold">
              {fsmStates.find((s) => s.name === 'THROTTLED')?.activeClientCount || 0}
            </span>
          </div>
        </div>

        {/* S3: BLOCKED */}
        <div
          onClick={() => setSelectedState(selectedState === 'BLOCKED' ? null : 'BLOCKED')}
          className={`p-5 rounded-xl bg-cyber-navy/80 border transition-all cursor-pointer ${
            selectedState === 'BLOCKED'
              ? 'border-red-400 shadow-lg shadow-red-950/60 ring-1 ring-red-400'
              : 'border-red-500/30 hover:border-red-500/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 tracking-wider">STATE S3</span>
            <div className="p-2 rounded-lg bg-red-950/60 border border-red-500/40 text-red-400">
              <Ban className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-white font-sans">BLOCKED</div>
          <p className="mt-1 text-[11px] text-slate-400 font-sans">
            Repeated abuse (&gt;= 3 violations). Access revoked. HTTP 403 Forbidden until manual unblock.
          </p>
          <div className="mt-3 pt-3 border-t border-cyber-border/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Active Clients:</span>
            <span className="text-red-400 font-bold">
              {fsmStates.find((s) => s.name === 'BLOCKED')?.activeClientCount || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Visual State Transition Architecture Diagram */}
      <Card
        title="FSM State Transition Topology"
        subtitle="Directed transition vectors and conditional triggers enforced by the backend engine"
        icon={GitBranch}
      >
        <div className="relative p-6 bg-cyber-dark/90 border border-cyber-border rounded-xl overflow-x-auto min-w-[700px]">
          {/* Visual SVG Flowchart representation */}
          <div className="flex items-center justify-between gap-6 py-8">
            {/* S0 Node */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-2xl bg-emerald-950/70 border-2 border-emerald-400 flex flex-col items-center justify-center p-3 text-center shadow-lg shadow-emerald-950/50 relative group">
                <span className="absolute -top-3 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500 text-black">
                  INITIAL
                </span>
                <ShieldCheck className="w-7 h-7 text-emerald-400 mb-1" />
                <span className="text-sm font-bold text-white font-mono">NORMAL</span>
                <span className="text-[10px] font-mono text-emerald-300">S0</span>
                <span className="text-[10px] text-slate-400 mt-1">Req &lt; 70%</span>
              </div>
            </div>

            {/* S0 -> S1 Arrow */}
            <div className="flex-1 flex flex-col items-center px-2">
              <div className="text-[10px] font-mono text-amber-400 mb-1 text-center font-bold">
                Req &gt;= 70%
              </div>
              <div className="w-full h-0.5 bg-gradient-to-r from-emerald-500 to-amber-500 relative">
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-amber-400 rotate-45" />
              </div>
              <div className="text-[9px] font-mono text-emerald-400 mt-1 text-center">
                &lt;-- Traffic slows (&lt; 70%)
              </div>
            </div>

            {/* S1 Node */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-2xl bg-amber-950/70 border-2 border-amber-400 flex flex-col items-center justify-center p-3 text-center shadow-lg shadow-amber-950/50 relative">
                <AlertCircle className="w-7 h-7 text-amber-400 mb-1" />
                <span className="text-sm font-bold text-white font-mono">WARNED</span>
                <span className="text-[10px] font-mono text-amber-300">S1</span>
                <span className="text-[10px] text-slate-400 mt-1">70% - 99%</span>
              </div>
            </div>

            {/* S1 -> S2 Arrow */}
            <div className="flex-1 flex flex-col items-center px-2">
              <div className="text-[10px] font-mono text-orange-400 mb-1 text-center font-bold">
                Req &gt;= 100%
              </div>
              <div className="w-full h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 relative">
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-orange-400 rotate-45" />
              </div>
              <div className="text-[9px] font-mono text-cyan-400 mt-1 text-center">
                Cooldown recovery --&gt;
              </div>
            </div>

            {/* S2 Node */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-2xl bg-orange-950/70 border-2 border-orange-400 flex flex-col items-center justify-center p-3 text-center shadow-lg shadow-orange-950/50 relative">
                <ShieldAlert className="w-7 h-7 text-orange-400 mb-1" />
                <span className="text-sm font-bold text-white font-mono">THROTTLED</span>
                <span className="text-[10px] font-mono text-orange-300">S2</span>
                <span className="text-[10px] text-slate-400 mt-1">HTTP 429</span>
              </div>
            </div>

            {/* S2 -> S3 Arrow */}
            <div className="flex-1 flex flex-col items-center px-2">
              <div className="text-[10px] font-mono text-red-400 mb-1 text-center font-bold">
                Violations &gt;= 3
              </div>
              <div className="w-full h-0.5 bg-gradient-to-r from-orange-500 to-red-500 relative">
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-red-400 rotate-45" />
              </div>
              <div className="text-[9px] font-mono text-red-300 mt-1 text-center">
                Automated Lockout
              </div>
            </div>

            {/* S3 Node */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-2xl bg-red-950/80 border-2 border-red-500 flex flex-col items-center justify-center p-3 text-center shadow-lg shadow-red-950/50 relative">
                <Ban className="w-7 h-7 text-red-400 mb-1" />
                <span className="text-sm font-bold text-white font-mono">BLOCKED</span>
                <span className="text-[10px] font-mono text-red-300">S3</span>
                <span className="text-[10px] text-slate-400 mt-1">HTTP 403</span>
              </div>
            </div>
          </div>

          {/* S3 -> S0 Admin Unblock Return Vector */}
          <div className="mt-4 pt-4 border-t border-cyber-border/60 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-emerald-400">
              <Unlock className="w-4 h-4" />
              <span className="font-bold">ADMIN MANUAL UNBLOCK:</span>
              <span className="text-slate-300">
                Direct state transition from S3 (BLOCKED) --&gt; S0 (NORMAL). Clears cooldown & resets violation counters.
              </span>
            </div>
            <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-500/30">
              Deterministic Security Policy
            </span>
          </div>
        </div>
      </Card>

      {/* Formal State Transition Table */}
      <Card
        title="State Transition Matrix"
        subtitle="Formal condition and action mapping executed by backend fsmService.js"
        icon={Layers}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-cyber-border text-slate-400">
                <th className="pb-3 px-3">RULE ID</th>
                <th className="pb-3 px-3">CURRENT STATE</th>
                <th className="pb-3 px-3">INPUT / CONDITION</th>
                <th className="pb-3 px-3">NEXT STATE</th>
                <th className="pb-3 px-3">SYSTEM ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40">
              {transitionTable.map((row) => (
                <tr key={row.ruleId} className="hover:bg-cyber-card/40 transition-colors">
                  <td className="py-2.5 px-3 text-cyan-400 font-bold">{row.ruleId}</td>
                  <td className="py-2.5 px-3 text-slate-200 font-bold">{row.currentState}</td>
                  <td className="py-2.5 px-3 text-slate-300">{row.condition}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-bold ${
                        row.nextState.includes('NORMAL')
                          ? 'text-emerald-400'
                          : row.nextState.includes('WARNED')
                          ? 'text-amber-400'
                          : row.nextState.includes('THROTTLED')
                          ? 'text-orange-400'
                          : 'text-red-400'
                      }`}
                    >
                      {row.nextState}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Live State Transition History */}
      <Card
        title="Live State Transition History"
        subtitle="Chronological transition records emitted from backend evaluation"
        icon={Clock}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-cyber-border text-slate-400">
                <th className="pb-3 px-3">TRANSITION ID</th>
                <th className="pb-3 px-3">CLIENT</th>
                <th className="pb-3 px-3">FROM STATE</th>
                <th className="pb-3 px-3">TO STATE</th>
                <th className="pb-3 px-3">TRANSITION REASON</th>
                <th className="pb-3 px-3">TRIGGERED BY</th>
                <th className="pb-3 px-3 text-right">TIMESTAMP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40">
              {transitionHistory.length > 0 ? (
                transitionHistory.map((th) => (
                  <tr key={th.transitionId} className="hover:bg-cyber-card/30">
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">{th.transitionId}</td>
                    <td className="py-2.5 px-3 text-slate-200">{th.clientName || th.clientId}</td>
                    <td className="py-2.5 px-3">
                      <FsmBadge state={th.fromState} />
                    </td>
                    <td className="py-2.5 px-3">
                      <FsmBadge state={th.toState} />
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 max-w-[280px] truncate" title={th.reason}>
                      {th.reason}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyber-dark border border-cyber-border text-cyan-300">
                        {th.triggeredBy}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">
                      {new Date(th.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No transition history recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
