/**
 * Sliding Window Rate Limiting Engine
 * Uses MongoDB timestamped request history to calculate precise sliding window counts.
 * Synchronizes with the Finite State Machine (FSM) to throttle or block abusive clients.
 */

const APIRequest = require('../models/APIRequest');
const SystemSetting = require('../models/SystemSetting');
const { FSM_STATES, transitionClientState } = require('./fsmService');

// In-memory cache for system settings to minimize repeated DB queries
let cachedSettings = null;
let settingsCacheTime = 0;
const CACHE_TTL_MS = 5000;

/**
 * Retrieves the active system rate limiting settings
 */
const getSystemSettings = async () => {
  const now = Date.now();
  if (cachedSettings && now - settingsCacheTime < CACHE_TTL_MS) {
    return cachedSettings;
  }

  let settings = await SystemSetting.findOne({ key: 'global_rate_limit_config' });
  if (!settings) {
    settings = await SystemSetting.create({
      key: 'global_rate_limit_config',
      requestLimit: 20,
      timeWindow: 60,
      warningThreshold: 70,
      throttlingThreshold: 100,
      cooldownDuration: 30,
      autoBlockThreshold: 3,
      simulationInterval: 500,
    });
  }

  cachedSettings = settings.toObject();
  settingsCacheTime = now;
  return cachedSettings;
};

/**
 * Invalidates settings cache when admin updates settings
 */
const invalidateSettingsCache = () => {
  cachedSettings = null;
};

/**
 * Calculates current request count for a client within the sliding time window
 */
const getSlidingWindowCount = async (clientId, windowSeconds = 60) => {
  const windowStart = new Date(Date.now() - windowSeconds * 1000);
  const count = await APIRequest.countDocuments({
    clientId,
    createdAt: { $gte: windowStart },
  });
  return count;
};

/**
 * Checks client rate limit against sliding window and governs FSM transitions
 *
 * @param {Object} client - Client mongoose document
 * @param {Object} customSettings - Optional override settings
 * @returns {Object} Rate limit assessment result
 */
const evaluateRateLimit = async (client, customSettings = null) => {
  const settings = customSettings || (await getSystemSettings());
  const now = new Date();
  const limit = client.requestLimit || settings.requestLimit || 20;
  const timeWindow = settings.timeWindow || 60;

  // 1. If client is already BLOCKED: Immediate rejection with HTTP 403
  if (client.currentState === FSM_STATES.BLOCKED) {
    return {
      allowed: false,
      httpStatus: 403,
      processingResult: 'BLOCKED_CLIENT',
      reason: 'Client is BLOCKED due to excessive abuse. Contact administrator for unblock.',
      fsmState: FSM_STATES.BLOCKED,
      currentWindowCount: await getSlidingWindowCount(client.clientId, timeWindow),
      limit,
      remaining: 0,
      client,
    };
  }

  // 2. If client is in active THROTTLED cooldown: Reject with HTTP 429
  if (client.currentState === FSM_STATES.THROTTLED) {
    const isUnderCooldown = client.cooldownUntil && new Date(client.cooldownUntil) > now;
    if (isUnderCooldown) {
      const cooldownRemainingSeconds = Math.ceil(
        (new Date(client.cooldownUntil).getTime() - now.getTime()) / 1000
      );

      // Increment violation count for hitting endpoint while throttled
      client.violationCount = (client.violationCount || 0) + 1;
      
      // Auto-escalate to BLOCKED if threshold reached
      if (client.violationCount >= settings.autoBlockThreshold) {
        const fsmResult = await transitionClientState({
          client,
          slidingWindowCount: limit + client.violationCount,
          settings,
          triggeredBy: 'SYSTEM',
          overrideReason: `Client exceeded maximum abuse violations while throttled (${client.violationCount}/${settings.autoBlockThreshold})`,
        });

        return {
          allowed: false,
          httpStatus: 403,
          processingResult: 'BLOCKED_CLIENT',
          reason: `Violated throttling cooldown. Auto-blocked: reached ${client.violationCount} violations.`,
          fsmState: FSM_STATES.BLOCKED,
          currentWindowCount: await getSlidingWindowCount(client.clientId, timeWindow),
          limit,
          remaining: 0,
          fsmResult,
          client,
        };
      }

      await client.save();

      return {
        allowed: false,
        httpStatus: 429,
        processingResult: 'THROTTLED',
        reason: `Client is THROTTLED. Cooldown active for another ${cooldownRemainingSeconds}s.`,
        fsmState: FSM_STATES.THROTTLED,
        cooldownRemainingSeconds,
        currentWindowCount: await getSlidingWindowCount(client.clientId, timeWindow),
        limit,
        remaining: 0,
        client,
      };
    }
  }

  // 3. Query actual sliding window count
  const currentWindowCount = await getSlidingWindowCount(client.clientId, timeWindow);

  // 4. Check if the upcoming request would exceed the limit
  if (currentWindowCount >= limit) {
    // Transition client to THROTTLED or BLOCKED
    const fsmResult = await transitionClientState({
      client,
      slidingWindowCount: currentWindowCount + 1,
      settings,
      triggeredBy: 'SYSTEM',
    });

    return {
      allowed: false,
      httpStatus: fsmResult.currentState === FSM_STATES.BLOCKED ? 403 : 429,
      processingResult: fsmResult.currentState === FSM_STATES.BLOCKED ? 'BLOCKED_CLIENT' : 'RATE_LIMITED',
      reason: fsmResult.reason,
      fsmState: fsmResult.currentState,
      currentWindowCount: currentWindowCount + 1,
      limit,
      remaining: 0,
      fsmResult,
      client,
    };
  }

  // 5. Request is within limit. Evaluate if state should update (e.g. NORMAL -> WARNED, or recovery from THROTTLED -> NORMAL)
  const fsmResult = await transitionClientState({
    client,
    slidingWindowCount: currentWindowCount + 1,
    settings,
    triggeredBy: 'SYSTEM',
  });

  const remaining = Math.max(0, limit - (currentWindowCount + 1));

  return {
    allowed: true,
    httpStatus: 200,
    processingResult: 'SUCCESS',
    reason: fsmResult.reason,
    fsmState: fsmResult.currentState,
    currentWindowCount: currentWindowCount + 1,
    limit,
    remaining,
    fsmResult,
    client,
  };
};

module.exports = {
  getSystemSettings,
  invalidateSettingsCache,
  getSlidingWindowCount,
  evaluateRateLimit,
};
