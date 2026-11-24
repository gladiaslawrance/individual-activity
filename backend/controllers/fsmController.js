const StateTransition = require('../models/StateTransition');
const Client = require('../models/Client');
const { FSM_STATES, FSM_STATE_METADATA } = require('../services/fsmService');

/**
 * Formal State Transition Table definitions matching the backend FSM engine
 */
const FSM_TRANSITION_TABLE = [
  {
    currentState: 'NORMAL (S0)',
    condition: 'Requests < 70% of limit in window',
    nextState: 'NORMAL (S0)',
    action: 'Allow request (HTTP 200). Baseline usage.',
    ruleId: 'R1',
  },
  {
    currentState: 'NORMAL (S0)',
    condition: '70% <= Requests < 100% of limit in window',
    nextState: 'WARNED (S1)',
    action: 'Allow request (HTTP 200). Set warning flag in response header.',
    ruleId: 'R2',
  },
  {
    currentState: 'NORMAL (S0)',
    condition: 'Requests >= 100% of limit in window',
    nextState: 'THROTTLED (S2)',
    action: 'Reject request (HTTP 429). Trigger cooldown timer (e.g. 30s). Log violation.',
    ruleId: 'R3',
  },
  {
    currentState: 'NORMAL (S0)',
    condition: 'Accumulated violations >= auto-block threshold (e.g. 3)',
    nextState: 'BLOCKED (S3)',
    action: 'Reject request (HTTP 403). Revoke access immediately. Critical alert.',
    ruleId: 'R4',
  },
  {
    currentState: 'WARNED (S1)',
    condition: 'Requests < 70% in sliding window (traffic slows down)',
    nextState: 'NORMAL (S0)',
    action: 'Allow request (HTTP 200). Clear warning flag.',
    ruleId: 'R5',
  },
  {
    currentState: 'WARNED (S1)',
    condition: '70% <= Requests < 100% of limit',
    nextState: 'WARNED (S1)',
    action: 'Allow request (HTTP 200). Maintain warning state.',
    ruleId: 'R6',
  },
  {
    currentState: 'WARNED (S1)',
    condition: 'Requests reach 100% of limit',
    nextState: 'THROTTLED (S2)',
    action: 'Reject request (HTTP 429). Enter cooldown window. Increment violations.',
    ruleId: 'R7',
  },
  {
    currentState: 'WARNED (S1)',
    condition: 'Severe abuse / repeated rate violations >= auto-block threshold',
    nextState: 'BLOCKED (S3)',
    action: 'Reject request (HTTP 403). Permanent security lock until admin unblock.',
    ruleId: 'R8',
  },
  {
    currentState: 'THROTTLED (S2)',
    condition: 'Incoming request received during active cooldown window',
    nextState: 'THROTTLED (S2)',
    action: 'Reject request (HTTP 429). Remain throttled. Increment violation counter.',
    ruleId: 'R9',
  },
  {
    currentState: 'THROTTLED (S2)',
    condition: 'Cooldown expires AND request count in window < 70%',
    nextState: 'NORMAL (S0)',
    action: 'Allow request (HTTP 200). Full recovery to standard operation.',
    ruleId: 'R10',
  },
  {
    currentState: 'THROTTLED (S2)',
    condition: 'Cooldown expires AND request count in window between 70% and 99%',
    nextState: 'WARNED (S1)',
    action: 'Allow request (HTTP 200). Transition to warned state.',
    ruleId: 'R11',
  },
  {
    currentState: 'THROTTLED (S2)',
    condition: 'Cooldown expires BUT request rate still >= 100% (or violations >= threshold)',
    nextState: 'BLOCKED (S3)',
    action: 'Reject request (HTTP 403). Transition to BLOCKED for persistent spamming.',
    ruleId: 'R12',
  },
  {
    currentState: 'BLOCKED (S3)',
    condition: 'Any incoming request from client',
    nextState: 'BLOCKED (S3)',
    action: 'Reject immediately (HTTP 403 Forbidden). Generate Critical Abuse Alert.',
    ruleId: 'R13',
  },
  {
    currentState: 'BLOCKED (S3)',
    condition: 'Administrator manually executes unblock operation',
    nextState: 'NORMAL (S0)',
    action: 'Restore client to NORMAL. Reset cooldown & violation counters.',
    ruleId: 'R14',
  },
];

/**
 * @desc    Get FSM states metadata and current client count per state
 * @route   GET /api/fsm/states
 * @access  Private
 */
const getFsmStates = async (req, res, next) => {
  try {
    const counts = await Client.aggregate([
      { $group: { _id: '$currentState', count: { $sum: 1 } } },
    ]);

    const activeCounts = {
      NORMAL: 0,
      WARNED: 0,
      THROTTLED: 0,
      BLOCKED: 0,
    };

    counts.forEach((c) => {
      if (activeCounts[c._id] !== undefined) {
        activeCounts[c._id] = c.count;
      }
    });

    res.json({
      success: true,
      initialState: 'NORMAL',
      states: Object.keys(FSM_STATES).map((key) => ({
        ...FSM_STATE_METADATA[key],
        activeClientCount: activeCounts[key] || 0,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get formal FSM transition rules & state transition matrix
 * @route   GET /api/fsm/transitions
 * @access  Private
 */
const getFsmTransitions = async (req, res, next) => {
  try {
    res.json({
      success: true,
      transitionTable: FSM_TRANSITION_TABLE,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get historical state transitions log
 * @route   GET /api/fsm/history
 * @access  Private
 */
const getFsmHistory = async (req, res, next) => {
  try {
    const { clientId, toState, fromState, page = 1, limit = 20 } = req.query;
    const query = {};

    if (clientId) query.clientId = clientId;
    if (toState) query.toState = toState.toUpperCase();
    if (fromState) query.fromState = fromState.toUpperCase();

    const skip = (Number(page) - 1) * Number(limit);
    const total = await StateTransition.countDocuments(query);
    const history = await StateTransition.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      history,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFsmStates,
  getFsmTransitions,
  getFsmHistory,
  FSM_TRANSITION_TABLE,
};
