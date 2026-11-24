import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  Sliders,
  Shield,
  Clock,
  AlertTriangle,
  Cpu,
  CheckCircle,
} from 'lucide-react';
import { settingsAPI } from '../services/api';
import { Card } from '../components/common/Card';
import { useToast } from '../context/ToastContext';

export const Settings = () => {
  const [settings, setSettings] = useState({
    requestLimit: 20,
    timeWindow: 60,
    warningThreshold: 70,
    throttlingThreshold: 100,
    cooldownDuration: 30,
    autoBlockThreshold: 3,
    simulationInterval: 500,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const toast = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsAPI.getSettings();
      if (res.data?.success && res.data.settings) {
        setSettings(res.data.settings);
      }
    } catch (err) {
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await settingsAPI.updateSettings(settings);
      if (res.data?.success) {
        toast.success('System rate limiting & security policy successfully saved');
        setSettings(res.data.settings);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setSettings({
      requestLimit: 20,
      timeWindow: 60,
      warningThreshold: 70,
      throttlingThreshold: 100,
      cooldownDuration: 30,
      autoBlockThreshold: 3,
      simulationInterval: 500,
    });
    toast.info('Settings form reset to default baseline parameters');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cyber-border/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-cyber-cyan" />
            Rate Limiting Engine & Global Policies
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Configure sliding-window quotas, FSM thresholds, automated lockout policies, and simulation speeds
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono text-slate-300 bg-cyber-navy border border-cyber-border hover:bg-cyber-card transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono shadow-glow-cyan transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Sliding Window Quotas */}
        <Card
          title="Sliding Window Rate Limit Quotas"
          subtitle="Governs standard client allowances and evaluation window"
          icon={Clock}
        >
          <div className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Maximum Requests Per Window (Limit)
              </label>
              <input
                type="number"
                min="1"
                required
                value={settings.requestLimit}
                onChange={(e) => handleChange('requestLimit', e.target.value)}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-slate-100 focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Standard baseline quota for registered API clients (Default: 20 calls)
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Sliding Window Duration (Seconds)
              </label>
              <input
                type="number"
                min="5"
                required
                value={settings.timeWindow}
                onChange={(e) => handleChange('timeWindow', e.target.value)}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-slate-100 focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Rolling duration window for calculating request rate (Default: 60 seconds)
              </span>
            </div>
          </div>
        </Card>

        {/* Card 2: FSM Transition Thresholds */}
        <Card
          title="FSM Thresholds & Throttling Parameters"
          subtitle="Defines mathematical trigger points for state transitions"
          icon={Sliders}
        >
          <div className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Warning Threshold Percentage (%)
              </label>
              <input
                type="number"
                min="1"
                max="99"
                required
                value={settings.warningThreshold}
                onChange={(e) => handleChange('warningThreshold', e.target.value)}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-slate-100 focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-amber-400 mt-1 block">
                Requests at or above this threshold transition from S0 (NORMAL) to S1 (WARNED) (Default: 70%)
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Throttling Threshold Percentage (%)
              </label>
              <input
                type="number"
                min="50"
                required
                value={settings.throttlingThreshold}
                onChange={(e) => handleChange('throttlingThreshold', e.target.value)}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-slate-100 focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-orange-400 mt-1 block">
                Reaching this limit transitions client to S2 (THROTTLED) (Default: 100%)
              </span>
            </div>
          </div>
        </Card>

        {/* Card 3: Throttling Cooldown & Lockdown Policies */}
        <Card
          title="Security Enforcement & Cooldown Policy"
          subtitle="Cooldown penalty durations and automated permanent blocking limits"
          icon={Shield}
        >
          <div className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Throttling Cooldown Window (Seconds)
              </label>
              <input
                type="number"
                min="5"
                required
                value={settings.cooldownDuration}
                onChange={(e) => handleChange('cooldownDuration', e.target.value)}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-slate-100 focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Duration a throttled client must wait before recovery evaluation (Default: 30s)
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Automatic Escalation to BLOCKED Threshold (Violations)
              </label>
              <input
                type="number"
                min="1"
                required
                value={settings.autoBlockThreshold}
                onChange={(e) => handleChange('autoBlockThreshold', e.target.value)}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-slate-100 focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-red-400 mt-1 block">
                Number of rate limit or throttling violations before client is permanently BLOCKED (S3) (Default: 3)
              </span>
            </div>
          </div>
        </Card>

        {/* Card 4: Simulation Performance Tuning */}
        <Card
          title="Traffic Simulator Cadence"
          subtitle="Governs automated continuous request generator speed"
          icon={Cpu}
        >
          <div className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Simulation Request Dispatch Interval (Milliseconds)
              </label>
              <input
                type="number"
                min="50"
                step="50"
                required
                value={settings.simulationInterval}
                onChange={(e) => handleChange('simulationInterval', e.target.value)}
                className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-slate-100 focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Millisecond delay between successive simulated requests during continuous streaming (Default: 500ms)
              </span>
            </div>

            <div className="p-3 rounded-lg bg-cyber-dark/80 border border-cyber-border/80 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div className="text-[11px] text-slate-300 font-sans">
                Changes take effect across the backend Express engine immediately via memory cache invalidation.
              </div>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};
