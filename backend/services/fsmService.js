/**
 * Finite State Machine (FSM) Service
 * Implements a deterministic Finite State Machine to govern client rate-limiting access.
 * States:
 *   S0 = NORMAL (Unrestricted access within standard usage quotas)
 *   S1 = WARNED (Client has reached 70% threshold of configured limit)
 *   S2 = THROTTLED (Client has reached or exceeded 100% limit, enters temporary cooldown)
 *   S3 = BLOCKED (Client has committed repeated severe abuse; access revoked until manual unblock)
 */

const { v4: uuidv4 } = require('uuid');
const StateTransition = require('../models/StateTransition');

const FSM_STATES = {
  NORMAL: 'NORMAL',
  WARNED: 'WARNED',
  THROTTLED: 'THROTTLED',
  BLOCKED: 'BLOCKED',
};

// Formal state definitions with descriptions and security action policies
const FSM_STATE_METADATA = {
  [FSM_STATES.NORMAL]: {
    name: 'NORMAL',
    code: 'S0',
    description: 'Standard operational state. Request count is below 70% of limit.',
    allowed: true,
    httpStatus: 200,
    accentColor: '#10B981', // green
  },
  [FSM_STATES.WARNED]: {
    name: 'WARNED',
    code: 'S1',
    description: 'Usage warning. Request count is between 70% and 99% of limit.',
    allowed: true,
    httpStatus: 200,
    accentColor: '#F59E0B', // amber
  },
  [FSM_STATES.THROTTLED]: {
    name: 'THROTTLED',
    code: 'S2',
    description: 'Rate limit exceeded. Temporary rejection with HTTP 429 during cooldown window.',
    allowed: false,
    httpStatus: 429,
    accentColor: '#F97316', // orange
  },
  [FSM_STATES.BLOCKED]: {
    name: 'BLOCKED',
    code: 'S3',
    description: 'Access suspended due to severe or repeated violations. HTTP 403 Forbidden.',
    allowed: false,
    httpStatus: 403,
    accentColor: '#EF4444', // red
  },
};

/**
 * Deterministic Transition Function
 * Evaluates the next state based on current state, sliding window count, cooldown, and violations.
 *
 * @param {Object} params
 * @param {Object} params.client - Client document
 * @param {number} params.slidingWindowCount - Requests in the current time window
 * @param {Object} params.settings - System settings (requestLimit, warningThreshold, cooldownDuration, autoBlockThreshold)
 * @param {boolean} params.isManualUnblock - Whether this is an explicit admin unblock command
 * @param {string} params.overrideReason - Custom reason if provided
 * @returns {Object} { nextState, stateChanged, reason, cooldownUntil, violationIncrement }
 */
const computeNextState = ({
  client,
  slidingWindowCount,
  settings,
  isManualUnblock = false,
  overrideReason = null,
}) => {
  const currentState = client.currentState || FSM_STATES.NORMAL;
  const now = new Date();
  const limit = client.requestLimit || settings.requestLimit || 20;
  const warningCount = Math.floor((settings.warningThreshold / 100) * limit);
  const autoBlockThreshold = settings.autoBlockThreshold || 3;
  const currentViolations = client.violationCount || 0;

  // Case 0: Admin Manual Unblock
  if (isManualUnblock) {
    return {
      nextState: FSM_STATES.NORMAL,
      stateChanged: currentState !== FSM_STATES.NORMAL,
      reason: overrideReason || 'Admin manually unblocked client and reset access security counters',
      cooldownUntil: null,
      resetViolations: true,
    };
  }

  // Case 1: Client is already BLOCKED
  if (currentState === FSM_STATES.BLOCKED) {
    return {
      nextState: FSM_STATES.BLOCKED,
      stateChanged: false,
      reason: 'Client remains in BLOCKED state until administrator review and manual unblock',
      cooldownUntil: null,
      resetViolations: false,
    };
  }

  // Check if violations warrant automated escalation to BLOCKED
  if (currentViolations >= autoBlockThreshold) {
    return {
      nextState: FSM_STATES.BLOCKED,
      stateChanged: currentState !== FSM_STATES.BLOCKED,
      reason: `Automated security block: Client accumulated ${currentViolations} violations (threshold: ${autoBlockThreshold})`,
      cooldownUntil: null,
      resetViolations: false,
    };
  }

  // Case 2: Client is currently THROTTLED
  if (currentState === FSM_STATES.THROTTLED) {
    const isUnderCooldown = client.cooldownUntil && new Date(client.cooldownUntil) > now;

    if (isUnderCooldown) {
      // Still in cooldown period
      return {
        nextState: FSM_STATES.THROTTLED,
        stateChanged: false,
        reason: `Client is currently in active cooldown until ${new Date(client.cooldownUntil).toISOString()}`,
        cooldownUntil: client.cooldownUntil,
        resetViolations: false,
        isCooldownActive: true,
      };
    }

    // Cooldown has expired: evaluate recovery based on sliding window count
    if (slidingWindowCount < warningCount) {
      return {
        nextState: FSM_STATES.NORMAL,
        stateChanged: true,
        reason: `Cooldown expired and request rate recovered below warning threshold (${slidingWindowCount}/${limit})`,
        cooldownUntil: null,
        resetViolations: false,
      };
    } else if (slidingWindowCount < limit) {
      return {
        nextState: FSM_STATES.WARNED,
        stateChanged: true,
        reason: `Cooldown expired; request rate currently elevated at warning level (${slidingWindowCount}/${limit})`,
        cooldownUntil: null,
        resetViolations: false,
      };
    } else {
      // Still at or exceeding limit after cooldown - escalate cooldown or violations
      const newCooldown = new Date(now.getTime() + settings.cooldownDuration * 1000);
      return {
        nextState: FSM_STATES.THROTTLED,
        stateChanged: false,
        reason: `Post-cooldown request rate still violates limit (${slidingWindowCount}/${limit}). Cooldown renewed.`,
        cooldownUntil: newCooldown,
        violationIncrement: 1,
      };
    }
  }

  // Case 3: Client is currently in NORMAL or WARNED
  if (slidingWindowCount >= limit) {
    // Reached or exceeded configured limit -> transition to THROTTLED
    const newCooldown = new Date(now.getTime() + settings.cooldownDuration * 1000);
    const newViolations = currentViolations + 1;

    if (newViolations >= autoBlockThreshold) {
      return {
        nextState: FSM_STATES.BLOCKED,
        stateChanged: true,
        reason: `Client exceeded rate limit and reached maximum violation limit (${newViolations}/${autoBlockThreshold})`,
        cooldownUntil: null,
        violationIncrement: 1,
      };
    }

    return {
      nextState: FSM_STATES.THROTTLED,
      stateChanged: true,
      reason: `Client reached rate limit (${slidingWindowCount}/${limit} reqs). Throttling initiated for ${settings.cooldownDuration}s.`,
      cooldownUntil: newCooldown,
      violationIncrement: 1,
    };
  }

  if (slidingWindowCount >= warningCount) {
    // Between 70% and 99% -> WARNED
    return {
      nextState: FSM_STATES.WARNED,
      stateChanged: currentState !== FSM_STATES.WARNED,
      reason: `Request volume reached ${settings.warningThreshold}% threshold (${slidingWindowCount}/${limit} reqs)`,
      cooldownUntil: null,
      resetViolations: false,
    };
  }

  // Below 70% -> NORMAL
  return {
    nextState: FSM_STATES.NORMAL,
    stateChanged: currentState !== FSM_STATES.NORMAL,
    reason: `Traffic within safe baseline capacity (< 70% of ${limit} reqs)`,
    cooldownUntil: null,
    resetViolations: false,
  };
};

/**
 * Executes state transition, updates client in database, and logs transition history
 */
const transitionClientState = async ({
  client,
  slidingWindowCount,
  settings,
  isManualUnblock = false,
  triggeredBy = 'SYSTEM',
  overrideReason = null,
}) => {
  const transitionPlan = computeNextState({
    client,
    slidingWindowCount,
    settings,
    isManualUnblock,
    overrideReason,
  });

  const fromState = client.currentState || FSM_STATES.NORMAL;
  const toState = transitionPlan.nextState;

  // Apply updates to client in-memory or prepared for save
  client.currentState = toState;
  if (transitionPlan.cooldownUntil !== undefined) {
    client.cooldownUntil = transitionPlan.cooldownUntil;
  }
  if (transitionPlan.resetViolations) {
    client.violationCount = 0;
  } else if (transitionPlan.violationIncrement) {
    client.violationCount = (client.violationCount || 0) + transitionPlan.violationIncrement;
  }

  // If state actually changed OR it was an explicit manual unblock, record state transition record
  if (transitionPlan.stateChanged || isManualUnblock) {
    const transitionRecord = new StateTransition({
      transitionId: `trans_${uuidv4().substring(0, 8)}`,
      clientId: client.clientId,
      clientName: client.name,
      fromState,
      toState,
      reason: transitionPlan.reason,
      triggeredBy,
      metrics: {
        requestCount: slidingWindowCount,
        limit: client.requestLimit || settings.requestLimit || 20,
        windowSeconds: settings.timeWindow || 60,
        violationCount: client.violationCount,
      },
      timestamp: new Date(),
    });

    await transitionRecord.save();
  }

  await client.save();

  return {
    currentState: toState,
    previousState: fromState,
    stateChanged: transitionPlan.stateChanged,
    reason: transitionPlan.reason,
    cooldownUntil: client.cooldownUntil,
    violationCount: client.violationCount,
    metadata: FSM_STATE_METADATA[toState],
  };
};

module.exports = {
  FSM_STATES,
  FSM_STATE_METADATA,
  computeNextState,
  transitionClientState,
};
