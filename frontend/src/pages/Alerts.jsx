import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  Check,
  Shield,
  Layers,
} from 'lucide-react';
import { alertAPI } from '../services/api';
import { Card } from '../components/common/Card';
import { StatCard } from '../components/common/StatCard';
import { SeverityBadge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';

export const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [resolutionFilter, setResolutionFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const toast = useToast();

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (severityFilter) params.severity = severityFilter;
      if (resolutionFilter) params.resolutionStatus = resolutionFilter;
      if (search) params.search = search;

      const res = await alertAPI.getAlerts(params);
      if (res.data?.success) {
        setAlerts(res.data.alerts || []);
        setCounts(res.data.counts || {});
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load abuse detection alerts');
    } finally {
      setLoading(false);
    }
  }, [page, severityFilter, resolutionFilter, search, toast]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleResolve = async (alert, status = 'RESOLVED') => {
    try {
      const res = await alertAPI.resolveAlert(alert.alertId, { resolutionStatus: status });
      if (res.data?.success) {
        toast.success(`Alert ${alert.alertId} marked as ${status}`);
        fetchAlerts();
      }
    } catch (err) {
      toast.error('Failed to update alert resolution');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cyber-border/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-red-400" />
            API Abuse Detection & Threat Alerts
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Interception telemetry for automated burst flooding, path traversal, and throttling violations
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          title="Refresh Alerts"
          className="p-2 rounded-lg bg-cyber-navy border border-cyber-border text-slate-300 hover:text-cyan-400 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* KPI Severity Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          title="Critical Threats"
          value={counts?.critical}
          subtitle="Traversal / Blocked attempts"
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="High Severity"
          value={counts?.high}
          subtitle="Post-throttle violations"
          icon={Zap}
          color="amber"
        />
        <StatCard
          title="Medium Severity"
          value={counts?.medium}
          subtitle="Burst flooding & 429 ceilings"
          icon={Shield}
          color="amber"
        />
        <StatCard
          title="Low Severity"
          value={counts?.low}
          subtitle="Malformed requests & probes"
          icon={Layers}
          color="cyan"
        />
        <StatCard
          title="Unresolved Queue"
          value={counts?.unresolved}
          subtitle="Awaiting SecOps action"
          icon={Clock}
          color="blue"
        />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search alerts by Alert ID, client ID, IP, or threat description..."
            className="w-full pl-10 pr-4 py-2 bg-cyber-navy/80 border border-cyber-border rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto font-mono text-xs">
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-cyber-navy/80 border border-cyber-border rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          <select
            value={resolutionFilter}
            onChange={(e) => {
              setResolutionFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-cyber-navy/80 border border-cyber-border rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="">All Resolution Statuses</option>
            <option value="UNRESOLVED">UNRESOLVED</option>
            <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <Card title="Threat Alerts Stream" subtitle={`Displaying ${alerts.length} security alerts`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-cyber-border text-slate-400">
                <th className="pb-3 px-3">ALERT ID</th>
                <th className="pb-3 px-3">SEVERITY</th>
                <th className="pb-3 px-3">ABUSE PATTERN</th>
                <th className="pb-3 px-3">CLIENT INFO</th>
                <th className="pb-3 px-3">IP ADDRESS</th>
                <th className="pb-3 px-3">DESCRIPTION</th>
                <th className="pb-3 px-3">STATUS</th>
                <th className="pb-3 px-3 text-right">TIMESTAMP</th>
                <th className="pb-3 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40">
              {alerts.length > 0 ? (
                alerts.map((a) => (
                  <tr key={a.alertId} className="hover:bg-cyber-card/40 transition-colors">
                    <td className="py-3 px-3 text-cyan-400 font-bold">{a.alertId}</td>
                    <td className="py-3 px-3">
                      <SeverityBadge severity={a.severity} />
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-200 tracking-tight">
                        {a.abuseType}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-100">{a.clientName}</div>
                      <div className="text-[10px] text-cyan-400">{a.clientId}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{a.ipAddress}</td>
                    <td className="py-3 px-3 text-slate-300 max-w-[280px] truncate" title={a.description}>
                      {a.description}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          a.resolutionStatus === 'RESOLVED'
                            ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40'
                            : a.resolutionStatus === 'ACKNOWLEDGED'
                            ? 'bg-amber-950/70 text-amber-300 border border-amber-500/40'
                            : 'bg-red-950/70 text-red-300 border border-red-500/40'
                        }`}
                      >
                        {a.resolutionStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      {new Date(a.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {a.resolutionStatus !== 'RESOLVED' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          {a.resolutionStatus === 'UNRESOLVED' && (
                            <button
                              onClick={() => handleResolve(a, 'ACKNOWLEDGED')}
                              title="Acknowledge threat"
                              className="px-2 py-1 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 hover:bg-amber-900/60 text-[10px]"
                            >
                              ACK
                            </button>
                          )}
                          <button
                            onClick={() => handleResolve(a, 'RESOLVED')}
                            title="Resolve Alert"
                            className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/60 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-sans italic">
                          Resolved
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No abuse alerts found matching criteria.
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
