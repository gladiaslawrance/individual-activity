/**
 * Abuse Detection Module
 * Analyzes traffic patterns, detects anomalies and malicious signatures,
 * and generates categorized Abuse Alerts with severity metrics in MongoDB.
 */

const { v4: uuidv4 } = require('uuid');
const AbuseAlert = require('../models/AbuseAlert');

const SEVERITY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

const ABUSE_TYPES = {
  EXCESSIVE_REQUESTS: 'EXCESSIVE_REQUESTS',
  RAPID_BURST_FLOODING: 'RAPID_BURST_FLOODING',
  POST_THROTTLE_VIOLATION: 'POST_THROTTLE_VIOLATION',
  BLOCKED_CLIENT_ATTEMPT: 'BLOCKED_CLIENT_ATTEMPT',
  MALFORMED_ENDPOINT: 'MALFORMED_ENDPOINT',
  SUSPICIOUS_PAYLOAD: 'SUSPICIOUS_PAYLOAD',
  PATH_TRAVERSAL_ATTEMPT: 'PATH_TRAVERSAL_ATTEMPT',
};

/**
 * Checks for burst flooding: interval between successive client requests
 */
const checkBurstCondition = (client) => {
  if (!client.lastRequestTime) return false;
  const elapsedMs = Date.now() - new Date(client.lastRequestTime).getTime();
  // If successive requests arrive within 120ms from same client
  return elapsedMs < 120;
};

/**
 * Evaluates request characteristics and generates an alert if abuse pattern is matched
 */
const evaluateAndRecordAbuse = async ({
  client,
  ipAddress,
  endpoint,
  method,
  payload,
  processingResult,
  validationResult,
  rateLimitResult,
}) => {
  let detectedType = null;
  let severity = null;
  let description = null;

  const clientId = client?.clientId || 'unregistered_client';
  const clientName = client?.name || 'External Caller';
  const ip = ipAddress || client?.ipAddress || '127.0.0.1';

  // 1. Critical: Requests originating from BLOCKED clients
  if (processingResult === 'BLOCKED_CLIENT' || client?.currentState === 'BLOCKED') {
    detectedType = ABUSE_TYPES.BLOCKED_CLIENT_ATTEMPT;
    severity = SEVERITY_LEVELS.CRITICAL;
    description = `Blocked client ${clientId} attempted unauthorized invocation on ${method} ${endpoint}`;
  }
  // 2. High/Critical: Path Traversal or Direct Attack Vectors
  else if (validationResult?.isSecurityViolation) {
    detectedType = ABUSE_TYPES.PATH_TRAVERSAL_ATTEMPT;
    severity = SEVERITY_LEVELS.CRITICAL;
    description = `Potential exploit vector or traversal pattern detected on path: "${endpoint}"`;
  }
  // 3. High: Requests attempted while actively Throttled
  else if (processingResult === 'THROTTLED') {
    detectedType = ABUSE_TYPES.POST_THROTTLE_VIOLATION;
    severity = SEVERITY_LEVELS.HIGH;
    description = `Client ${clientId} bypassed client-side delay and spammed API during active cooldown (${rateLimitResult?.cooldownRemainingSeconds || 30}s remaining)`;
  }
  // 4. High: Malicious or Script Injected Payload
  else if (validationResult?.isPayloadSecurityViolation) {
    detectedType = ABUSE_TYPES.SUSPICIOUS_PAYLOAD;
    severity = SEVERITY_LEVELS.HIGH;
    description = `Injected script tags or malicious payload detected in body for ${method} ${endpoint}`;
  }
  // 5. Medium: Rate limit ceiling violated (429)
  else if (processingResult === 'RATE_LIMITED') {
    detectedType = ABUSE_TYPES.EXCESSIVE_REQUESTS;
    severity = SEVERITY_LEVELS.MEDIUM;
    description = `Client exceeded max configured sliding window rate limit (${rateLimitResult?.currentWindowCount || 0}/${rateLimitResult?.limit || 20} requests)`;
  }
  // 6. Medium: Rapid burst flooding
  else if (client && checkBurstCondition(client)) {
    detectedType = ABUSE_TYPES.RAPID_BURST_FLOODING;
    severity = SEVERITY_LEVELS.MEDIUM;
    description = `High-frequency micro-burst detected: client issued sequential request in <120ms`;
  }
  // 7. Low/Medium: Malformed endpoint or invalid structure
  else if (processingResult === 'MALFORMED_ENDPOINT') {
    detectedType = ABUSE_TYPES.MALFORMED_ENDPOINT;
    severity = SEVERITY_LEVELS.LOW;
    description = `Client dispatched request with malformed or illegal URL format: "${endpoint}"`;
  }
  // 8. Low: Malformed JSON payload
  else if (processingResult === 'MALFORMED_PAYLOAD') {
    detectedType = ABUSE_TYPES.SUSPICIOUS_PAYLOAD;
    severity = SEVERITY_LEVELS.LOW;
    description = `Malformed or corrupted JSON body sent to ${method} ${endpoint}`;
  }

  // If abuse detected, store in MongoDB
  if (detectedType) {
    const alert = new AbuseAlert({
      alertId: `alert_${uuidv4().substring(0, 8)}`,
      clientId,
      clientName,
      ipAddress: ip,
      abuseType: detectedType,
      severity,
      description,
      resolutionStatus: 'UNRESOLVED',
    });

    await alert.save();
    return alert;
  }

  return null;
};

module.exports = {
  SEVERITY_LEVELS,
  ABUSE_TYPES,
  evaluateAndRecordAbuse,
};
