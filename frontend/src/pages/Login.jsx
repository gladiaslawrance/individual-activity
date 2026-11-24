import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, ShieldCheck, KeyRound, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both admin email and security key');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success('Authentication confirmed. Welcome to SecOps Command.');
        navigate('/dashboard');
      } else {
        toast.error(res.message || 'Authentication credentials rejected');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Security gateway connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@security.local');
    setPassword('Admin@123456');
    toast.info('Filled default seeded administrator credentials');
  };

  return (
    <div className="min-h-screen bg-cyber-dark cyber-grid flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-cyber-navy/90 border border-cyber-border rounded-2xl shadow-2xl p-8 backdrop-blur-xl relative z-10">
        {/* Brand Emblem */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shadow-glow-cyan mb-4">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Aegis Gate Security
          </h1>
          <p className="text-xs font-mono text-cyan-400 mt-1 uppercase tracking-wider">
            Rate Limiting & API Abuse Detection Engine
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Admin Identity / Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@security.local"
                className="w-full pl-11 pr-4 py-3 bg-cyber-card/70 border border-cyber-border rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Passkey / Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-11 pr-4 py-3 bg-cyber-card/70 border border-cyber-border rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-sm flex items-center justify-center gap-2 shadow-glow-cyan transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4 animate-spin" /> Verifying Credentials...
              </span>
            ) : (
              <>
                <span>Authenticate Session</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Autofill */}
        <div className="mt-6 pt-6 border-t border-cyber-border/60">
          <button
            type="button"
            onClick={handleFillDemo}
            className="w-full py-2.5 px-3 rounded-lg bg-cyber-card hover:bg-cyber-cardHover border border-cyber-border text-xs font-mono text-cyan-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-cyan-400" />
            <span>Use Default Seed Admin (admin@security.local)</span>
          </button>
        </div>

        {/* Footer Security Watermark */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>PROTECTED BY DETERMINISTIC FSM ENGINE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
