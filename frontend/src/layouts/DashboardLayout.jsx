import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Cpu,
  History,
  ShieldAlert,
  GitBranch,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
  Radio,
  Clock,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { alertAPI } from '../services/api';

export const DashboardLayout = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unresolvedAlerts, setUnresolvedAlerts] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date().toUTCString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toUTCString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchBadgeData = async () => {
      try {
        const res = await alertAPI.getAlerts({ resolutionStatus: 'UNRESOLVED', limit: 1 });
        if (res.data?.success && res.data.counts) {
          setUnresolvedAlerts(res.data.counts.unresolved || 0);
        }
      } catch (e) {
        // Silent catch for background polling
      }
    };

    fetchBadgeData();
    const interval = setInterval(fetchBadgeData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Client Management', path: '/clients', icon: Users },
    { label: 'Request Simulator', path: '/simulator', icon: Cpu },
    { label: 'Request History', path: '/requests', icon: History },
    {
      label: 'Abuse Alerts',
      path: '/alerts',
      icon: ShieldAlert,
      badge: unresolvedAlerts > 0 ? unresolvedAlerts : null,
      badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/40',
    },
    { label: 'FSM Visualization', path: '/fsm', icon: GitBranch },
    { label: 'System Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-cyber-dark text-slate-100 overflow-hidden font-sans">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Cyber Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-cyber-navy/95 border-r border-cyber-border flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-cyber-border/80">
          <div className="flex items-center gap-3">
            <div className="relative p-2 rounded-xl bg-cyan-950/70 border border-cyan-500/50 shadow-glow-cyan text-cyan-400">
              <Shield className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-wider text-slate-100 uppercase">
                Aegis Gate
              </div>
              <div className="text-[10px] font-mono tracking-widest text-cyan-400 font-semibold uppercase">
                Rate Limit & Abuse Hub
              </div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Status Pill */}
        <div className="px-6 py-3 border-b border-cyber-border/40 bg-cyber-dark/40">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="flex items-center gap-2 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ENGINE ACTIVE
            </span>
            <span className="text-slate-400">FSM v2.4</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-cyber-card/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Admin Details & Logout */}
        <div className="p-4 border-t border-cyber-border/80 bg-cyber-dark/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold font-mono text-sm">
                {admin?.username?.charAt(0) || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {admin?.username || 'SecOps Admin'}
                </p>
                <p className="text-[11px] font-mono text-slate-400 truncate">
                  {admin?.email || 'admin@security.local'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout session"
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Operational Bar */}
        <header className="h-16 bg-cyber-navy/80 border-b border-cyber-border/80 px-6 flex items-center justify-between backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>GATEWAY NODE:</span>
              <span className="text-cyan-400 font-bold">PRODUCTION-EDGE-01</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400 bg-cyber-dark/60 px-3 py-1.5 rounded-md border border-cyber-border/60">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentTime}</span>
            </div>

            <NavLink
              to="/simulator"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono shadow-glow-cyan transition-all"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>SIMULATE TRAFFIC</span>
            </NavLink>
          </div>
        </header>

        {/* Dynamic Route View */}
        <main className="flex-1 overflow-y-auto p-6 cyber-grid">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
