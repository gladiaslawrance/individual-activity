import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Code2,
  Clock,
  Layers,
} from 'lucide-react';
import { requestAPI, clientAPI } from '../services/api';
import { Card } from '../components/common/Card';
import { FsmBadge, MethodBadge, StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';

export const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  // Filters
  const [search, setSearch] = useState('');
  const [clientIdFilter, setClientIdFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Request Inspection Modal
  const [selectedReq, setSelectedReq] = useState(null);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);

  const toast = useToast();

  const fetchClients = async () => {
    try {
      const res = await clientAPI.getClients();
      if (res.data?.success) setClients(res.data.clients || []);
    } catch (e) {}
  };

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
      };
      if (search) params.search = search;
      if (clientIdFilter) params.clientId = clientIdFilter;
      if (stateFilter) params.fsmState = stateFilter;
      if (methodFilter) params.method = methodFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await requestAPI.getRequests(params);
      if (res.data?.success) {
        setRequests(res.data.requests || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load request history');
    } finally {
      setLoading(false);
    }
  }, [page, search, clientIdFilter, stateFilter, methodFilter, startDate, endDate, toast]);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleInspect = (req) => {
    setSelectedReq(req);
    setInspectModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearch('');
    setClientIdFilter('');
    setStateFilter('');
    setMethodFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cyber-border/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <History className="w-6 h-6 text-cyber-cyan" />
            API Request Trace Audit Logs
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Comprehensive sliding-window audit ledger of all intercepted & processed API calls
          </p>
        </div>

        <button
          onClick={fetchRequests}
          title="Refresh Data"
          className="p-2 rounded-lg bg-cyber-navy border border-cyber-border text-slate-300 hover:text-cyan-400 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-cyber-navy/80 border border-cyber-border rounded-xl p-4 space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search request ID, endpoint, IP..."
              className="w-full pl-9 pr-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs"
            />
          </div>

          {/* Client Filter */}
          <div>
            <select
              value={clientIdFilter}
              onChange={(e) => {
                setClientIdFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="">All Clients</option>
              {clients.map((c) => (
                <option key={c.clientId} value={c.clientId}>
                  {c.name} ({c.clientId})
                </option>
              ))}
            </select>
          </div>

          {/* State Filter */}
          <div>
            <select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="">All FSM States</option>
              <option value="NORMAL">NORMAL (S0)</option>
              <option value="WARNED">WARNED (S1)</option>
              <option value="THROTTLED">THROTTLED (S2)</option>
              <option value="BLOCKED">BLOCKED (S3)</option>
            </select>
          </div>

          {/* Method Filter */}
          <div>
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
        </div>

        {/* Date Filter & Clear */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-cyber-border/40">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">DATE FROM:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1 bg-cyber-dark border border-cyber-border rounded text-slate-200 text-xs"
            />
            <span className="text-[11px] text-slate-400">TO:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1 bg-cyber-dark border border-cyber-border rounded text-slate-200 text-xs"
            />
          </div>

          <button
            onClick={handleResetFilters}
            className="text-xs text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      </div>

      {/* Main Table */}
      <Card
        title="Audit Ledger"
        subtitle={`Showing ${requests.length} of ${total} recorded requests (Page ${page} of ${totalPages})`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-cyber-border text-slate-400">
                <th className="pb-3 px-3">REQUEST ID</th>
                <th className="pb-3 px-3">CLIENT ID</th>
                <th className="pb-3 px-3">METHOD</th>
                <th className="pb-3 px-3">ENDPOINT</th>
                <th className="pb-3 px-3">IP ADDRESS</th>
                <th className="pb-3 px-3">STATUS</th>
                <th className="pb-3 px-3">FSM STATE</th>
                <th className="pb-3 px-3">RESULT</th>
                <th className="pb-3 px-3">LATENCY</th>
                <th className="pb-3 px-3 text-right">TIMESTAMP</th>
                <th className="pb-3 px-3 text-right">DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40">
              {requests.length > 0 ? (
                requests.map((r) => (
                  <tr key={r.requestId} className="hover:bg-cyber-card/40 transition-colors">
                    <td className="py-3 px-3 text-cyan-400 font-bold">{r.requestId}</td>
                    <td className="py-3 px-3 text-slate-300">{r.clientId}</td>
                    <td className="py-3 px-3">
                      <MethodBadge method={r.method} />
                    </td>
                    <td className="py-3 px-3 text-slate-200 truncate max-w-[200px]" title={r.endpoint}>
                      {r.endpoint}
                    </td>
                    <td className="py-3 px-3 text-slate-400">{r.ipAddress}</td>
                    <td className="py-3 px-3">
                      <StatusBadge statusCode={r.responseStatus} />
                    </td>
                    <td className="py-3 px-3">
                      <FsmBadge state={r.fsmState} />
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-bold text-[11px] ${
                          r.processingResult === 'SUCCESS'
                            ? 'text-emerald-400'
                            : r.processingResult === 'THROTTLED'
                            ? 'text-orange-400'
                            : 'text-red-400'
                        }`}
                      >
                        {r.processingResult}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{r.responseTimeMs}ms</td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleInspect(r)}
                        className="p-1.5 rounded-lg bg-cyber-dark hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
                        title="Inspect Request"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    No requests found matching specified filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-cyber-border mt-4 text-xs font-mono">
          <span className="text-slate-400">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} records
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-cyber-dark border border-cyber-border text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-300 px-2">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-cyber-dark border border-cyber-border text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Inspection Modal */}
      <Modal
        isOpen={inspectModalOpen}
        onClose={() => setInspectModalOpen(false)}
        title={`Request Audit Inspection: ${selectedReq?.requestId}`}
        subtitle={`Recorded on ${selectedReq ? new Date(selectedReq.createdAt).toUTCString() : ''}`}
        icon={Code2}
        maxWidth="max-w-2xl"
      >
        {selectedReq && (
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-cyber-dark border border-cyber-border">
              <div>
                <span className="text-slate-400 block text-[10px]">CLIENT ID</span>
                <span className="text-cyan-400 font-bold">{selectedReq.clientId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">SOURCE IP</span>
                <span className="text-slate-200">{selectedReq.ipAddress}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ENDPOINT</span>
                <span className="text-slate-200 font-bold">{selectedReq.method} {selectedReq.endpoint}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">RESPONSE STATUS</span>
                <div className="mt-0.5">
                  <StatusBadge statusCode={selectedReq.responseStatus} />
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">FSM STATE</span>
                <div className="mt-0.5">
                  <FsmBadge state={selectedReq.fsmState} />
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">PROCESSING RESULT</span>
                <span className="text-white font-bold">{selectedReq.processingResult}</span>
              </div>
            </div>

            {/* Payload View */}
            <div>
              <span className="text-slate-400 block text-[11px] uppercase mb-1">
                REQUEST PAYLOAD (BODY)
              </span>
              <pre className="p-3 rounded-lg bg-cyber-dark border border-cyber-border text-slate-300 max-h-48 overflow-y-auto">
                {selectedReq.payload ? JSON.stringify(selectedReq.payload, null, 2) : 'null (empty body)'}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
