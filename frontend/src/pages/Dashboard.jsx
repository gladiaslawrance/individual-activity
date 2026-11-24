import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Users,
  ShieldAlert,
  Ban,
  Clock,
  RefreshCw,
  TrendingUp,
  PieChart as PieIcon,
  BarChart2,
  Cpu,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { dashboardAPI } from '../services/api';
import { Card } from '../components/common/Card';
import { StatCard } from '../components/common/StatCard';
import { FsmBadge, MethodBadge, StatusBadge } from '../components/common/Badge';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getActivity(),
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.stats);
      if (activityRes.data?.success) setActivity(activityRes.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('[Dashboard Telemetry Error]', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 6000); // 6s live polling
    return () => clearInterval(interval);
  }, [autoRefresh, fetchDashboardData]);

  return (
    <div className="space-y-6">
      {/* Title & Operations Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cyber-border/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-cyber-cyan" />
            Security & Traffic Monitoring Hub
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Real-time telemetry, sliding window quotas, and deterministic FSM access enforcement
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 border transition-all ${
              autoRefresh
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40 shadow-glow-cyan'
                : 'bg-cyber-navy text-slate-400 border-cyber-border'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'}`}
            />
            {autoRefresh ? 'AUTO-REFRESH ON' : 'AUTO-REFRESH PAUSED'}
          </button>

          <button
            onClick={fetchDashboardData}
            title="Refresh Data"
            className="p-2 rounded-lg bg-cyber-navy border border-cyber-border text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top 6 KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total API Calls"
          value={stats?.totalRequests}
          subtitle="Aggregated traffic"
          icon={TrendingUp}
          color="cyan"
        />
        <StatCard
          title="Active Clients"
          value={stats?.activeClients}
          subtitle="Registered services"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Blocked Clients"
          value={stats?.blockedClients}
          subtitle="FSM S3 revokation"
          icon={Ban}
          color="red"
        />
        <StatCard
          title="Throttled Clients"
          value={stats?.throttledClients}
          subtitle="FSM S2 active cooldown"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Abuse Alerts"
          value={stats?.abuseAlerts}
          subtitle="Unresolved anomalies"
          icon={ShieldAlert}
          color="red"
        />
        <StatCard
          title="Requests / Min"
          value={stats?.requestsPerMinute}
          subtitle="Rolling 60s window"
          icon={Activity}
          color="green"
        />
      </div>

      {/* Primary Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Requests Over Time */}
        <div className="lg:col-span-8">
          <Card
            title="Traffic Volume Over Time"
            subtitle="Comparing normal baseline traffic vs rate-limited & blocked attempts"
            icon={TrendingUp}
            className="h-full"
          >
            <div className="h-72 w-full">
              {activity?.charts?.requestsOverTime && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activity.charts.requestsOverTime}>
                    <defs>
                      <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="abusiveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2e54" />
                    <XAxis
                      dataKey="time"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      fontFamily="monospace"
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      fontFamily="monospace"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0B132B',
                        borderColor: '#1F2E54',
                        borderRadius: '0.5rem',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      name="Total Traffic"
                      stroke="#00F0FF"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#totalGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="abusive"
                      name="Abuse / Blocked"
                      stroke="#EF4444"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#abusiveGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        {/* Normal vs Abusive Requests Breakdown */}
        <div className="lg:col-span-4">
          <Card
            title="Traffic Integrity"
            subtitle="Response code breakdown"
            icon={PieIcon}
            className="h-full"
          >
            <div className="h-72 w-full flex flex-col items-center justify-center">
              {activity?.charts?.requestBreakdown && (
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={activity.charts.requestBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {activity.charts.requestBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0B132B',
                        borderColor: '#1F2E54',
                        borderRadius: '0.5rem',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              {/* Custom Legend */}
              <div className="grid grid-cols-2 gap-2 w-full text-[11px] font-mono mt-1">
                {activity?.charts?.requestBreakdown?.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-300 truncate">{item.name}:</span>
                    <span className="font-bold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Secondary Row: Client Activity & FSM Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Client Activity Distribution */}
        <div className="lg:col-span-7">
          <Card
            title="Top Client Activity"
            subtitle="Total request distribution by registered API client"
            icon={BarChart2}
          >
            <div className="h-64 w-full">
              {activity?.charts?.clientActivityDistribution && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activity.charts.clientActivityDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2e54" />
                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => (val?.length > 12 ? val.slice(0, 10) + '..' : val)}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      fontFamily="monospace"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0B132B',
                        borderColor: '#1F2E54',
                        borderRadius: '0.5rem',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                      }}
                    />
                    <Bar
                      dataKey="totalRequests"
                      name="Total Requests"
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        {/* FSM State Distribution */}
        <div className="lg:col-span-5">
          <Card
            title="FSM Client State Quotas"
            subtitle="Active client distribution across finite states"
            icon={Layers}
          >
            <div className="h-64 w-full flex flex-col justify-around">
              {activity?.charts?.fsmStateDistribution?.map((item) => (
                <div key={item.state} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-slate-200 font-bold">{item.state}</span>
                    </span>
                    <span className="text-slate-300 font-semibold">{item.count} clients</span>
                  </div>
                  <div className="w-full bg-cyber-dark/80 rounded-full h-2 overflow-hidden border border-cyber-border">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: item.fill,
                        width: `${Math.min(100, (item.count / Math.max(1, stats?.activeClients || 5)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity Table */}
      <Card
        title="Live API Activity Stream"
        subtitle="Real-time request trace log evaluated against sliding window and FSM"
        icon={Cpu}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-cyber-border text-slate-400">
                <th className="pb-3 px-3">REQUEST ID</th>
                <th className="pb-3 px-3">CLIENT ID</th>
                <th className="pb-3 px-3">IP ADDRESS</th>
                <th className="pb-3 px-3">METHOD</th>
                <th className="pb-3 px-3">ENDPOINT</th>
                <th className="pb-3 px-3">STATUS</th>
                <th className="pb-3 px-3">FSM STATE</th>
                <th className="pb-3 px-3">RESULT</th>
                <th className="pb-3 px-3 text-right">TIMESTAMP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40">
              {activity?.recentActivity?.length > 0 ? (
                activity.recentActivity.map((req) => (
                  <tr key={req.requestId} className="hover:bg-cyber-card/40 transition-colors">
                    <td className="py-3 px-3 text-cyan-400 font-bold">{req.requestId}</td>
                    <td className="py-3 px-3 text-slate-300">{req.clientId}</td>
                    <td className="py-3 px-3 text-slate-400">{req.ipAddress}</td>
                    <td className="py-3 px-3">
                      <MethodBadge method={req.method} />
                    </td>
                    <td className="py-3 px-3 text-slate-200 truncate max-w-[200px]" title={req.endpoint}>
                      {req.endpoint}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge statusCode={req.responseStatus} />
                    </td>
                    <td className="py-3 px-3">
                      <FsmBadge state={req.fsmState} />
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[11px] font-bold ${
                          req.processingResult === 'SUCCESS'
                            ? 'text-emerald-400'
                            : req.processingResult === 'THROTTLED'
                            ? 'text-orange-400'
                            : 'text-red-400'
                        }`}
                      >
                        {req.processingResult}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      {new Date(req.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No recent API activity telemetry found. Use the Simulator to inject traffic!
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
