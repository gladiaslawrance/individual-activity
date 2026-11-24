import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Play,
  Square,
  Send,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Code2,
  Terminal,
  Activity,
  CheckCircle,
  XCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { clientAPI, requestAPI, settingsAPI } from '../services/api';
import { Card } from '../components/common/Card';
import { FsmBadge, MethodBadge, StatusBadge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';

export const Simulator = () => {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [endpoint, setEndpoint] = useState('/api/v1/orders');
  const [method, setMethod] = useState('GET');
  const [payload, setPayload] = useState('{\n  "customerId": "cust_9921",\n  "amount": 250\n}');
  const [customRequestId, setCustomRequestId] = useState('');
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simulationIntervalMs, setSimulationIntervalMs] = useState(500);

  // Results & Live Feed
  const [latestResponse, setLatestResponse] = useState(null);
  const [simulationFeed, setSimulationFeed] = useState([]);

  // Regex Live Preview
  const [regexFeedback, setRegexFeedback] = useState({ isValid: true, message: 'Valid endpoint format' });

  const toast = useToast();
  const simulationRef = useRef(null);

  // Fetch registered clients
  const fetchClients = async () => {
    try {
      const res = await clientAPI.getClients();
      if (res.data?.success && res.data.clients?.length > 0) {
        setClients(res.data.clients);
        if (!selectedClientId) {
          setSelectedClientId(res.data.clients[0].clientId);
        }
      }
    } catch (e) {
      toast.error('Failed to load client directory');
    }
  };

  useEffect(() => {
    fetchClients();
    // Load simulation interval from settings
    settingsAPI.getSettings().then((res) => {
      if (res.data?.success && res.data.settings?.simulationInterval) {
        setSimulationIntervalMs(res.data.settings.simulationInterval);
      }
    });
  }, []);

  // Client-side regex instant feedback helper
  useEffect(() => {
    if (!endpoint) {
      setRegexFeedback({ isValid: false, message: 'Endpoint cannot be empty' });
      return;
    }
    if (!endpoint.startsWith('/')) {
      setRegexFeedback({ isValid: false, message: 'Must begin with forward slash ("/")' });
      return;
    }
    if (/\/{2,}/.test(endpoint)) {
      setRegexFeedback({ isValid: false, message: 'Consecutive forward slashes ("//") prohibited' });
      return;
    }
    if (/(\.\.|\%2e\%2e|\/etc\/|\/proc\/|windows\/system32)/i.test(endpoint)) {
      setRegexFeedback({
        isValid: false,
        message: 'PATH TRAVERSAL DETECTED! Security violation pattern',
        isSecurity: true,
      });
      return;
    }
    if (!/^\/[a-zA-Z0-9_.\-\/~%]*$/.test(endpoint)) {
      setRegexFeedback({ isValid: false, message: 'Illegal URL characters detected' });
      return;
    }
    setRegexFeedback({ isValid: true, message: 'Endpoint matches valid URL regex pattern: ^/[a-zA-Z0-9_.-/~%]*$' });
  }, [endpoint]);

  const selectedClient = clients.find((c) => c.clientId === selectedClientId);

  // Send Single Request through Express Backend
  const handleSendSingle = async () => {
    if (!selectedClientId) {
      toast.error('Please select an active client');
      return;
    }

    setLoading(true);
    try {
      let parsedPayload = null;
      if (payload && (method === 'POST' || method === 'PUT')) {
        try {
          parsedPayload = JSON.parse(payload);
        } catch (e) {
          // Send raw unparseable string to test backend JSON regex validation!
          parsedPayload = payload;
        }
      }

      const res = await requestAPI.simulate({
        clientId: selectedClientId,
        endpoint,
        method,
        payload: parsedPayload,
        customRequestId: customRequestId || undefined,
      });

      setLatestResponse(res.data);
      setSimulationFeed((prev) => [res.data, ...prev.slice(0, 49)]);

      if (res.data.statusCode === 200) {
        toast.success(`Request accepted (200 OK) • State: ${res.data.fsmState}`);
      } else if (res.data.statusCode === 429) {
        toast.warning(`Rate Limit Exceeded (429) • FSM State: ${res.data.fsmState}`);
      } else if (res.data.statusCode === 403) {
        toast.error(`Forbidden (403) • Client is in BLOCKED state`);
      } else {
        toast.error(`Rejected (${res.data.statusCode}) • ${res.data.error || res.data.processingResult}`);
      }

      // Refresh client list to reflect updated sliding counts & state
      fetchClients();
    } catch (err) {
      const errData = err.response?.data;
      if (errData) {
        setLatestResponse(errData);
        setSimulationFeed((prev) => [errData, ...prev.slice(0, 49)]);
        toast.error(`Rejected (${err.response.status}): ${errData.error || errData.message}`);
      } else {
        toast.error('Failed to communicate with API server');
      }
      fetchClients();
    } finally {
      setLoading(false);
    }
  };

  // Bulk Request (5, 10, 50)
  const handleSendBulk = async (count) => {
    if (!selectedClientId) {
      toast.error('Please select an active client');
      return;
    }

    setLoading(true);
    try {
      let parsedPayload = null;
      if (payload && (method === 'POST' || method === 'PUT')) {
        try {
          parsedPayload = JSON.parse(payload);
        } catch (e) {
          parsedPayload = payload;
        }
      }

      toast.info(`Sending batch of ${count} requests through Express...`);
      const res = await requestAPI.bulkSimulate({
        clientId: selectedClientId,
        endpoint,
        method,
        payload: parsedPayload,
        count,
      });

      if (res.data?.success) {
        const { summary, results } = res.data;
        toast.success(
          `Batch complete: ${summary.succeeded} OK, ${summary.throttled} Throttled, ${summary.blocked} Blocked. Final State: ${summary.finalFsmState}`
        );

        // Prepend results to feed
        setSimulationFeed((prev) => [
          ...results.map((r) => ({
            requestId: `batch_${r.iteration}`,
            clientId: selectedClientId,
            endpoint,
            method,
            responseStatus: r.statusCode,
            fsmState: r.fsmState,
            processingResult: r.processingResult,
            createdAt: new Date().toISOString(),
          })),
          ...prev.slice(0, 50 - results.length),
        ]);

        fetchClients();
      }
    } catch (err) {
      toast.error('Error executing batch requests');
    } finally {
      setLoading(false);
    }
  };

  // Continuous Traffic Simulation
  const handleStartSimulation = () => {
    if (!selectedClientId) {
      toast.error('Please select a client');
      return;
    }

    setSimulating(true);
    toast.info(`Traffic stream active (dispatching every ${simulationIntervalMs}ms)`);

    simulationRef.current = setInterval(async () => {
      try {
        let parsedPayload = null;
        if (payload && (method === 'POST' || method === 'PUT')) {
          try {
            parsedPayload = JSON.parse(payload);
          } catch (e) {
            parsedPayload = payload;
          }
        }

        const res = await requestAPI.simulate({
          clientId: selectedClientId,
          endpoint,
          method,
          payload: parsedPayload,
        });

        setLatestResponse(res.data);
        setSimulationFeed((prev) => [res.data, ...prev.slice(0, 49)]);
      } catch (err) {
        const errData = err.response?.data;
        if (errData) {
          setLatestResponse(errData);
          setSimulationFeed((prev) => [errData, ...prev.slice(0, 49)]);
        }
      }
    }, Math.max(100, simulationIntervalMs));
  };

  const handleStopSimulation = () => {
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
      simulationRef.current = null;
    }
    setSimulating(false);
    toast.info('Continuous traffic stream halted');
    fetchClients();
  };

  useEffect(() => {
    return () => {
      if (simulationRef.current) clearInterval(simulationRef.current);
    };
  }, []);

  // Quick Preset Scenarios
  const applyPreset = (preset) => {
    switch (preset) {
      case 'NORMAL':
        setEndpoint('/api/v1/orders');
        setMethod('GET');
        toast.info('Loaded Normal Traffic scenario');
        break;
      case 'PATH_TRAVERSAL':
        setEndpoint('/api/v1/users/../../etc/passwd');
        setMethod('GET');
        toast.warning('Loaded Path Traversal attack pattern');
        break;
      case 'BURST_WARN':
        setEndpoint('/api/v1/analytics/telemetry');
        setMethod('POST');
        setPayload('{\n  "metric": "cpu_load",\n  "value": 85.2\n}');
        toast.info('Loaded 70% Warning threshold payload');
        break;
      case 'MALFORMED_JSON':
        setEndpoint('/api/v1/payment');
        setMethod('POST');
        setPayload('{\n  "account": "broken_json_missing_brace"');
        toast.warning('Loaded Malformed JSON scenario');
        break;
      case 'SCRIPT_INJECTION':
        setEndpoint('/api/v1/feedback');
        setMethod('POST');
        setPayload('{\n  "comment": "<script>alert(1)</script>"\n}');
        toast.warning('Loaded XSS Script injection attack scenario');
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cyber-border/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-cyber-cyan" />
            Live API Traffic Simulator
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Dispatch single, burst, or continuous requests through the Express backend & FSM engine
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {simulating ? (
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-950/70 text-cyan-300 border border-cyan-500/50 shadow-glow-cyan animate-pulse">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              SIMULATION RUNNING
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-cyber-navy border border-cyber-border text-slate-400">
              SIMULATOR IDLE
            </span>
          )}
        </div>
      </div>

      {/* Preset Quick Selectors */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-slate-400 flex items-center gap-1.5 mr-1 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> QUICK SCENARIOS:
        </span>
        <button
          onClick={() => applyPreset('NORMAL')}
          className="px-3 py-1 rounded-lg bg-cyber-navy hover:bg-cyber-card border border-cyber-border text-slate-300 hover:text-cyan-400 transition-colors"
        >
          Scenario 1: Normal Flow
        </button>
        <button
          onClick={() => applyPreset('BURST_WARN')}
          className="px-3 py-1 rounded-lg bg-cyber-navy hover:bg-cyber-card border border-cyber-border text-slate-300 hover:text-amber-400 transition-colors"
        >
          Scenario 2: Warning Threshold (70%)
        </button>
        <button
          onClick={() => applyPreset('PATH_TRAVERSAL')}
          className="px-3 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/40 border border-red-500/40 text-red-300 transition-colors"
        >
          Scenario 7: Path Traversal
        </button>
        <button
          onClick={() => applyPreset('MALFORMED_JSON')}
          className="px-3 py-1 rounded-lg bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/40 text-purple-300 transition-colors"
        >
          Malformed JSON
        </button>
        <button
          onClick={() => applyPreset('SCRIPT_INJECTION')}
          className="px-3 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/40 border border-red-500/40 text-red-300 transition-colors"
        >
          XSS Script Inject
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Request Builder */}
        <div className="lg:col-span-7 space-y-5">
          <Card
            title="Request Configuration"
            subtitle="Configure simulated HTTP request parameters"
            icon={Terminal}
          >
            <div className="space-y-4 font-mono text-xs">
              {/* Client Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  1. Target Client Identity
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-slate-100 focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      {clients.map((c) => (
                        <option key={c.clientId} value={c.clientId}>
                          {c.name} ({c.clientId})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Client Snapshot Pill */}
                  <div className="bg-cyber-dark/80 border border-cyber-border rounded-lg p-2 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400">STATE:</div>
                      <FsmBadge state={selectedClient?.currentState} />
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">LIMIT:</div>
                      <div className="text-slate-200 font-bold">
                        {selectedClient?.activeWindowCount || 0} / {selectedClient?.requestLimit || 20}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Endpoint with Live Regex Validator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-300 uppercase">
                    2. API Endpoint Path
                  </label>
                  <span
                    className={`text-[10px] flex items-center gap-1 font-bold ${
                      regexFeedback.isValid
                        ? 'text-emerald-400'
                        : regexFeedback.isSecurity
                        ? 'text-red-400 animate-pulse'
                        : 'text-amber-400'
                    }`}
                  >
                    {regexFeedback.isValid ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    {regexFeedback.message}
                  </span>
                </div>
                <input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="/api/v1/resource"
                  className={`w-full px-3 py-2.5 bg-cyber-dark border rounded-lg text-slate-100 focus:outline-none transition-colors ${
                    regexFeedback.isValid
                      ? 'border-cyber-border focus:border-cyan-400'
                      : 'border-red-500/70 focus:border-red-400'
                  }`}
                />
              </div>

              {/* Method & Custom Identifier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    3. HTTP Method
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['GET', 'POST', 'PUT', 'DELETE'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMethod(m)}
                        className={`py-2 rounded-lg font-bold text-center border transition-all ${
                          method === m
                            ? 'bg-cyan-950/80 text-cyan-300 border-cyan-400 shadow-glow-cyan'
                            : 'bg-cyber-dark border-cyber-border text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    4. Custom Request ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={customRequestId}
                    onChange={(e) => setCustomRequestId(e.target.value)}
                    placeholder="e.g. test_sim_001"
                    className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Request Payload */}
              {(method === 'POST' || method === 'PUT') && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1 flex items-center justify-between">
                    <span>5. Request Body (JSON)</span>
                    <span className="text-[10px] text-slate-400">Validated via backend Regex parser</span>
                  </label>
                  <textarea
                    rows={4}
                    value={payload}
                    onChange={(e) => setPayload(e.target.value)}
                    className="w-full p-3 bg-cyber-dark border border-cyber-border rounded-lg text-slate-100 focus:outline-none focus:border-cyan-400 font-mono text-[11px]"
                  />
                </div>
              )}

              {/* Dispatch Action Buttons */}
              <div className="pt-3 border-t border-cyber-border space-y-3">
                <div className="text-[11px] font-semibold text-slate-300 uppercase">
                  6. Dispatch Actions
                </div>

                {/* Single & Batch Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={handleSendSingle}
                    disabled={loading || simulating}
                    className="py-2.5 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold flex items-center justify-center gap-1.5 shadow-glow-cyan transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send 1 Req</span>
                  </button>

                  <button
                    onClick={() => handleSendBulk(5)}
                    disabled={loading || simulating}
                    className="py-2.5 px-3 rounded-lg bg-cyber-navy hover:bg-cyber-card border border-cyber-border text-cyan-300 font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Send 5</span>
                  </button>

                  <button
                    onClick={() => handleSendBulk(10)}
                    disabled={loading || simulating}
                    className="py-2.5 px-3 rounded-lg bg-cyber-navy hover:bg-cyber-card border border-cyber-border text-cyan-300 font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Send 10</span>
                  </button>

                  <button
                    onClick={() => handleSendBulk(50)}
                    disabled={loading || simulating}
                    className="py-2.5 px-3 rounded-lg bg-cyber-navy hover:bg-cyber-card border border-cyber-border text-cyan-300 font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-red-400" />
                    <span>Send 50</span>
                  </button>
                </div>

                {/* Continuous Traffic Generator Toggle */}
                <div className="pt-2 flex items-center gap-3">
                  {!simulating ? (
                    <button
                      onClick={handleStartSimulation}
                      disabled={loading}
                      className="flex-1 py-3 px-4 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-emerald-400" />
                      <span>Start Continuous Traffic Stream</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStopSimulation}
                      className="flex-1 py-3 px-4 rounded-xl bg-red-950/80 hover:bg-red-900/80 border border-red-500/50 text-red-300 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Square className="w-4 h-4 fill-red-400" />
                      <span>Stop Simulation Stream</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: Live Response Telemetry Inspector */}
        <div className="lg:col-span-5 space-y-5">
          <Card
            title="Real-Time Response Telemetry"
            subtitle="Inspecting HTTP status, FSM transition, and sliding window headers"
            icon={Activity}
          >
            {latestResponse ? (
              <div className="space-y-4 font-mono text-xs">
                {/* Big Status Header */}
                <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      HTTP RESPONSE
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <StatusBadge statusCode={latestResponse.statusCode} />
                      <span className="font-bold text-slate-200">
                        {latestResponse.statusCode === 200
                          ? 'OK'
                          : latestResponse.statusCode === 429
                          ? 'TOO MANY REQUESTS'
                          : latestResponse.statusCode === 403
                          ? 'FORBIDDEN (BLOCKED)'
                          : 'VALIDATION / SECURITY ERROR'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold text-right">
                      FSM STATE
                    </div>
                    <div className="mt-1">
                      <FsmBadge state={latestResponse.fsmState} />
                    </div>
                  </div>
                </div>

                {/* Execution Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-cyber-dark/80 border border-cyber-border">
                    <span className="text-[10px] text-slate-400 block">RESULT</span>
                    <span
                      className={`font-bold ${
                        latestResponse.processingResult === 'SUCCESS'
                          ? 'text-emerald-400'
                          : latestResponse.processingResult === 'THROTTLED'
                          ? 'text-orange-400'
                          : 'text-red-400'
                      }`}
                    >
                      {latestResponse.processingResult}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-cyber-dark/80 border border-cyber-border">
                    <span className="text-[10px] text-slate-400 block">WINDOW QUOTA</span>
                    <span className="text-slate-200 font-bold">
                      {latestResponse.rateLimit?.currentWindowCount || 0} /{' '}
                      {latestResponse.rateLimit?.limit || 20} reqs
                    </span>
                  </div>
                </div>

                {/* Reason Banner */}
                {latestResponse.reason && (
                  <div className="p-3 rounded-lg bg-cyber-navy border border-cyber-border/80 text-[11px] text-slate-300">
                    <span className="text-cyan-400 font-bold block mb-0.5">FSM REASON:</span>
                    {latestResponse.reason}
                  </div>
                )}

                {/* Security Alert Triggered Notice */}
                {latestResponse.alertGenerated && (
                  <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/50 text-red-300 flex items-center gap-2 text-[11px]">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>Security Alert generated and persisted to MongoDB!</span>
                  </div>
                )}

                {/* Raw JSON Payload Inspector */}
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1 flex items-center justify-between">
                    <span>RAW JSON RESPONSE INSPECTOR</span>
                    <span className="text-cyan-400">{latestResponse.requestId}</span>
                  </div>
                  <pre className="p-3 rounded-lg bg-cyber-dark border border-cyber-border text-slate-300 text-[11px] overflow-x-auto max-h-56 leading-relaxed">
                    {JSON.stringify(latestResponse, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 font-mono text-xs">
                <Code2 className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                No request dispatched yet.
                <br />
                Click <span className="text-cyan-400">Send 1 Req</span> or select a scenario to test.
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Stream History Table */}
      <Card
        title="Session Traffic Feed"
        subtitle={`Tracking the last ${simulationFeed.length} simulated requests in this session`}
        icon={Terminal}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-cyber-border text-slate-400">
                <th className="pb-2 px-2">REQ ID</th>
                <th className="pb-2 px-2">CLIENT</th>
                <th className="pb-2 px-2">METHOD</th>
                <th className="pb-2 px-2">ENDPOINT</th>
                <th className="pb-2 px-2">STATUS</th>
                <th className="pb-2 px-2">FSM STATE</th>
                <th className="pb-2 px-2">RESULT</th>
                <th className="pb-2 px-2 text-right">TIME</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40">
              {simulationFeed.length > 0 ? (
                simulationFeed.map((req, idx) => (
                  <tr key={`${req.requestId || idx}-${idx}`} className="hover:bg-cyber-card/30">
                    <td className="py-2 px-2 text-cyan-400 font-bold">{req.requestId || `sim_${idx}`}</td>
                    <td className="py-2 px-2 text-slate-300">{req.clientId || selectedClientId}</td>
                    <td className="py-2 px-2">
                      <MethodBadge method={req.method || method} />
                    </td>
                    <td className="py-2 px-2 text-slate-200 truncate max-w-[200px]" title={req.endpoint || endpoint}>
                      {req.endpoint || endpoint}
                    </td>
                    <td className="py-2 px-2">
                      <StatusBadge statusCode={req.statusCode || req.responseStatus} />
                    </td>
                    <td className="py-2 px-2">
                      <FsmBadge state={req.fsmState} />
                    </td>
                    <td className="py-2 px-2 font-bold text-[11px] text-slate-200">
                      {req.processingResult}
                    </td>
                    <td className="py-2 px-2 text-right text-slate-400">
                      {req.createdAt ? new Date(req.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Session stream empty.
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
