import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  Key,
  ShieldCheck,
  RotateCcw,
  Unlock,
  History,
  Trash2,
  Edit2,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { clientAPI } from '../services/api';
import { Card } from '../components/common/Card';
import { FsmBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';

export const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [clientHistory, setClientHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    ipAddress: '',
    requestLimit: 20,
    customClientId: '',
    customApiKey: '',
  });

  const toast = useToast();

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (stateFilter) params.state = stateFilter;

      const res = await clientAPI.getClients(params);
      if (res.data?.success) {
        setClients(res.data.clients || []);
      }
    } catch (err) {
      toast.error('Failed to retrieve client directory');
    } finally {
      setLoading(false);
    }
  }, [search, stateFilter, toast]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleCopyKey = (key, id) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    toast.info('API Key copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenHistory = async (client) => {
    setSelectedClient(client);
    setHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const res = await clientAPI.getClientHistory(client.clientId, { limit: 25 });
      if (res.data?.success) {
        setClientHistory(res.data.requests || []);
      }
    } catch (err) {
      toast.error('Failed to load client request logs');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleUnblock = async (client) => {
    try {
      const res = await clientAPI.unblockClient(client.clientId);
      if (res.data?.success) {
        toast.success(`Client ${client.name} restored to NORMAL state`);
        fetchClients();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to unblock client');
    }
  };

  const handleResetCounters = async (client) => {
    try {
      const res = await clientAPI.resetCounters(client.clientId);
      if (res.data?.success) {
        toast.success(`Access counters reset for ${client.name}`);
        fetchClients();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset counters');
    }
  };

  const handleDelete = async (client) => {
    if (!window.confirm(`Are you sure you want to delete client ${client.name}?`)) return;
    try {
      const res = await clientAPI.deleteClient(client.clientId);
      if (res.data?.success) {
        toast.success(`Client ${client.name} deleted successfully`);
        fetchClients();
      }
    } catch (err) {
      toast.error('Failed to delete client');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await clientAPI.createClient(formData);
      if (res.data?.success) {
        toast.success(`Client ${res.data.client.name} registered with generated API key`);
        setCreateModalOpen(false);
        setFormData({
          name: '',
          email: '',
          ipAddress: '',
          requestLimit: 20,
          customClientId: '',
          customApiKey: '',
        });
        fetchClients();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating client');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await clientAPI.updateClient(selectedClient.clientId, {
        name: formData.name,
        email: formData.email,
        ipAddress: formData.ipAddress,
        requestLimit: formData.requestLimit,
      });
      if (res.data?.success) {
        toast.success('Client updated successfully');
        setEditModalOpen(false);
        fetchClients();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating client');
    }
  };

  const openEditModal = (client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      ipAddress: client.ipAddress,
      requestLimit: client.requestLimit,
    });
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cyber-border/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-cyber-cyan" />
            Client API Security & Registry
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Manage authorized API clients, rate-limit quotas, API keys, and state transitions
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              email: '',
              ipAddress: '192.168.1.150',
              requestLimit: 20,
              customClientId: '',
              customApiKey: '',
            });
            setCreateModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono shadow-glow-cyan transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Client</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name, ID, email, or IP address..."
            className="w-full pl-10 pr-4 py-2 bg-cyber-navy/80 border border-cyber-border rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-44">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-cyber-navy/80 border border-cyber-border rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
            >
              <option value="">All FSM States</option>
              <option value="NORMAL">NORMAL (S0)</option>
              <option value="WARNED">WARNED (S1)</option>
              <option value="THROTTLED">THROTTLED (S2)</option>
              <option value="BLOCKED">BLOCKED (S3)</option>
            </select>
          </div>

          <button
            onClick={fetchClients}
            title="Refresh list"
            className="p-2 rounded-lg bg-cyber-navy border border-cyber-border text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Clients Table */}
      <Card title="Registered Clients" subtitle={`Showing ${clients.length} authenticated services`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-cyber-border text-slate-400">
                <th className="pb-3 px-3">CLIENT INFO</th>
                <th className="pb-3 px-3">API KEY</th>
                <th className="pb-3 px-3">IP ADDRESS</th>
                <th className="pb-3 px-3">FSM STATE</th>
                <th className="pb-3 px-3">SLIDING QUOTA</th>
                <th className="pb-3 px-3">TOTAL CALLS</th>
                <th className="pb-3 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40">
              {clients.length > 0 ? (
                clients.map((c) => {
                  const windowUsage = c.activeWindowCount || 0;
                  const limit = c.requestLimit || 20;
                  const percent = Math.min(100, Math.round((windowUsage / limit) * 100));

                  return (
                    <tr key={c.clientId} className="hover:bg-cyber-card/40 transition-colors">
                      {/* Client Info */}
                      <td className="py-3 px-3">
                        <div className="font-sans font-bold text-slate-100 text-sm">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
                          {c.clientId}
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans">{c.email}</div>
                      </td>

                      {/* API Key */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300 font-mono text-[11px] bg-cyber-dark/80 px-2 py-1 rounded border border-cyber-border">
                            {c.apiKey?.slice(0, 10)}...{c.apiKey?.slice(-6)}
                          </span>
                          <button
                            onClick={() => handleCopyKey(c.apiKey, c.clientId)}
                            title="Copy API Key"
                            className="text-slate-400 hover:text-cyan-400 p-1 rounded hover:bg-slate-800 transition-colors"
                          >
                            {copiedKey === c.clientId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* IP Address */}
                      <td className="py-3 px-3 text-slate-300">{c.ipAddress}</td>

                      {/* FSM State */}
                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          <FsmBadge state={c.currentState} />
                          {c.violationCount > 0 && (
                            <div className="text-[10px] text-red-400 font-mono">
                              Violations: {c.violationCount}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Sliding Quota Bar */}
                      <td className="py-3 px-3 min-w-[140px]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-slate-300 font-bold">{windowUsage} / {limit}</span>
                          <span
                            className={`font-mono text-[10px] ${
                              percent >= 100
                                ? 'text-red-400'
                                : percent >= 70
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {percent}%
                          </span>
                        </div>
                        <div className="w-full bg-cyber-dark/80 rounded-full h-1.5 overflow-hidden border border-cyber-border">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              percent >= 100
                                ? 'bg-red-500'
                                : percent >= 70
                                ? 'bg-amber-400'
                                : 'bg-cyan-400'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>

                      {/* Total Calls */}
                      <td className="py-3 px-3 text-slate-300 font-bold">{c.requestCount}</td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Unblock button if blocked or throttled */}
                          {(c.currentState === 'BLOCKED' || c.currentState === 'THROTTLED') && (
                            <button
                              onClick={() => handleUnblock(c)}
                              title="Unblock Client to NORMAL"
                              className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/60 transition-colors"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Reset counter */}
                          <button
                            onClick={() => handleResetCounters(c)}
                            title="Reset Quota Counters"
                            className="p-1.5 rounded-lg bg-cyber-navy border border-cyber-border text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          {/* View Request History */}
                          <button
                            onClick={() => handleOpenHistory(c)}
                            title="View Request Trace Log"
                            className="p-1.5 rounded-lg bg-cyber-navy border border-cyber-border text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(c)}
                            title="Edit Client"
                            className="p-1.5 rounded-lg bg-cyber-navy border border-cyber-border text-slate-300 hover:text-blue-400 hover:border-blue-500/40 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(c)}
                            title="Delete Client"
                            className="p-1.5 rounded-lg bg-cyber-navy border border-cyber-border text-slate-300 hover:text-red-400 hover:border-red-500/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No clients found matching query criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* History Modal */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title={`Request Trace: ${selectedClient?.name}`}
        subtitle={`Client ID: ${selectedClient?.clientId} • Current FSM State: ${selectedClient?.currentState}`}
        icon={History}
        maxWidth="max-w-3xl"
      >
        {historyLoading ? (
          <div className="py-12 flex justify-center text-cyan-400">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        ) : clientHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-cyber-border text-slate-400">
                  <th className="pb-2">REQ ID</th>
                  <th className="pb-2">METHOD</th>
                  <th className="pb-2">ENDPOINT</th>
                  <th className="pb-2">STATUS</th>
                  <th className="pb-2">STATE</th>
                  <th className="pb-2 text-right">TIME</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border/40">
                {clientHistory.map((item) => (
                  <tr key={item.requestId} className="hover:bg-cyber-card/30">
                    <td className="py-2.5 text-cyan-400">{item.requestId}</td>
                    <td className="py-2.5 text-slate-300 font-bold">{item.method}</td>
                    <td className="py-2.5 text-slate-200 truncate max-w-[220px]">
                      {item.endpoint}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`font-bold ${
                          item.responseStatus === 200
                            ? 'text-emerald-400'
                            : item.responseStatus === 429
                            ? 'text-orange-400'
                            : 'text-red-400'
                        }`}
                      >
                        {item.responseStatus}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <FsmBadge state={item.fsmState} />
                    </td>
                    <td className="py-2.5 text-right text-slate-400">
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs font-mono">
            No logged request activity for this client yet.
          </div>
        )}
      </Modal>

      {/* Register New Client Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Register New API Client"
        subtitle="Automatic API key generation with strict regex validation"
        icon={UserPlus}
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Client Service Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Payment Gateway Service"
              className="w-full px-3.5 py-2.5 bg-cyber-card/80 border border-cyber-border rounded-lg text-xs font-sans text-slate-100 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Contact Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="dev@service.internal"
                className="w-full px-3.5 py-2.5 bg-cyber-card/80 border border-cyber-border rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                IP Address
              </label>
              <input
                type="text"
                required
                value={formData.ipAddress}
                onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                placeholder="e.g. 192.168.1.105"
                className="w-full px-3.5 py-2.5 bg-cyber-card/80 border border-cyber-border rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Sliding Window Request Limit
            </label>
            <input
              type="number"
              min="1"
              required
              value={formData.requestLimit}
              onChange={(e) => setFormData({ ...formData, requestLimit: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-cyber-card/80 border border-cyber-border rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Default system baseline is 20 requests per 60s sliding window.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-mono text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono shadow-glow-cyan transition-all cursor-pointer"
            >
              Confirm Registration
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Client Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Client: ${selectedClient?.clientId}`}
        icon={Edit2}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Client Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-cyber-card/80 border border-cyber-border rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-cyber-card/80 border border-cyber-border rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                IP Address
              </label>
              <input
                type="text"
                required
                value={formData.ipAddress}
                onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-cyber-card/80 border border-cyber-border rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Request Limit
            </label>
            <input
              type="number"
              min="1"
              required
              value={formData.requestLimit}
              onChange={(e) => setFormData({ ...formData, requestLimit: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-cyber-card/80 border border-cyber-border rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-mono text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-mono shadow-glow-cyan transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
