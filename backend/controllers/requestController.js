const { v4: uuidv4 } = require('uuid');
const Client = require('../models/Client');
const APIRequest = require('../models/APIRequest');
const {
  validateEndpoint,
  validateMethod,
  validatePayload,
} = require('../utils/regexValidator');
const { evaluateRateLimit } = require('../services/rateLimiterService');
const { evaluateAndRecordAbuse } = require('../services/abuseDetectionService');

/**
 * Helper to process a single simulated request through the full security pipeline
 */
const processSimulatedRequest = async ({
  clientId,
  endpoint = '/api/v1/resource',
  method = 'GET',
  payload = null,
  customRequestId = null,
  ipAddress = null,
}) => {
  const startTime = Date.now();
  const requestId = customRequestId || `req_${uuidv4().substring(0, 8)}`;

  // 1. Fetch Client
  const client = await Client.findOne({ clientId });
  if (!client) {
    return {
      success: false,
      statusCode: 404,
      requestId,
      processingResult: 'CLIENT_NOT_FOUND',
      error: `Client with ID "${clientId}" does not exist in registry`,
    };
  }

  const clientIp = ipAddress || client.ipAddress || '127.0.0.1';

  // 2. Regex Validation: HTTP Method
  const methodCheck = validateMethod(method);
  if (!methodCheck.isValid) {
    const errorResult = {
      requestId,
      clientId: client.clientId,
      ipAddress: clientIp,
      endpoint,
      method: method || 'UNKNOWN',
      payload: null,
      responseStatus: 400,
      processingResult: 'INVALID_METHOD',
      fsmState: client.currentState,
      responseTimeMs: Date.now() - startTime,
    };

    const savedRequest = await APIRequest.create(errorResult);
    const alert = await evaluateAndRecordAbuse({
      client,
      ipAddress: clientIp,
      endpoint,
      method,
      processingResult: 'INVALID_METHOD',
      validationResult: methodCheck,
    });

    return {
      success: false,
      statusCode: 400,
      requestId,
      fsmState: client.currentState,
      processingResult: 'INVALID_METHOD',
      error: methodCheck.error,
      pattern: methodCheck.pattern,
      alertGenerated: !!alert,
      request: savedRequest,
    };
  }

  // 3. Regex Validation: Endpoint format & Path Traversal
  const endpointCheck = validateEndpoint(endpoint);
  if (!endpointCheck.isValid) {
    const errorResult = {
      requestId,
      clientId: client.clientId,
      ipAddress: clientIp,
      endpoint,
      method: methodCheck.method,
      payload: null,
      responseStatus: 400,
      processingResult: 'MALFORMED_ENDPOINT',
      fsmState: client.currentState,
      responseTimeMs: Date.now() - startTime,
    };

    const savedRequest = await APIRequest.create(errorResult);
    const alert = await evaluateAndRecordAbuse({
      client,
      ipAddress: clientIp,
      endpoint,
      method: methodCheck.method,
      processingResult: 'MALFORMED_ENDPOINT',
      validationResult: endpointCheck,
    });

    return {
      success: false,
      statusCode: 400,
      requestId,
      fsmState: client.currentState,
      processingResult: 'MALFORMED_ENDPOINT',
      error: endpointCheck.error,
      pattern: endpointCheck.pattern,
      alertGenerated: !!alert,
      request: savedRequest,
    };
  }

  // 4. Regex Validation: Payload Structure
  const payloadCheck = validatePayload(payload);
  if (!payloadCheck.isValid) {
    const errorResult = {
      requestId,
      clientId: client.clientId,
      ipAddress: clientIp,
      endpoint: endpointCheck.sanitized,
      method: methodCheck.method,
      payload: typeof payload === 'string' ? payload.slice(0, 200) : payload,
      responseStatus: 400,
      processingResult: 'MALFORMED_PAYLOAD',
      fsmState: client.currentState,
      responseTimeMs: Date.now() - startTime,
    };

    const savedRequest = await APIRequest.create(errorResult);
    const alert = await evaluateAndRecordAbuse({
      client,
      ipAddress: clientIp,
      endpoint: endpointCheck.sanitized,
      method: methodCheck.method,
      processingResult: 'MALFORMED_PAYLOAD',
      validationResult: payloadCheck,
    });

    return {
      success: false,
      statusCode: 400,
      requestId,
      fsmState: client.currentState,
      processingResult: 'MALFORMED_PAYLOAD',
      error: payloadCheck.error,
      alertGenerated: !!alert,
      request: savedRequest,
    };
  }

  // 5. Sliding-Window Rate Limit & FSM State Evaluation
  const rateLimitResult = await evaluateRateLimit(client);

  // 6. Record the request in MongoDB
  const responseTimeMs = Date.now() - startTime;
  const recordedRequest = new APIRequest({
    requestId,
    clientId: client.clientId,
    ipAddress: clientIp,
    endpoint: endpointCheck.sanitized,
    method: methodCheck.method,
    payload: payloadCheck.parsed,
    responseStatus: rateLimitResult.httpStatus,
    processingResult: rateLimitResult.processingResult,
    fsmState: rateLimitResult.fsmState,
    responseTimeMs,
  });

  await recordedRequest.save();

  // 7. Update client last request time and total request count
  client.lastRequestTime = new Date();
  client.requestCount = (client.requestCount || 0) + 1;
  await client.save();

  // 8. Trigger Abuse Detection Analysis
  const alert = await evaluateAndRecordAbuse({
    client,
    ipAddress: clientIp,
    endpoint: endpointCheck.sanitized,
    method: methodCheck.method,
    payload: payloadCheck.parsed,
    processingResult: rateLimitResult.processingResult,
    rateLimitResult,
  });

  return {
    success: rateLimitResult.allowed,
    statusCode: rateLimitResult.httpStatus,
    requestId,
    fsmState: rateLimitResult.fsmState,
    processingResult: rateLimitResult.processingResult,
    reason: rateLimitResult.reason,
    rateLimit: {
      limit: rateLimitResult.limit,
      currentWindowCount: rateLimitResult.currentWindowCount,
      remaining: rateLimitResult.remaining,
      cooldownRemainingSeconds: rateLimitResult.cooldownRemainingSeconds || 0,
    },
    alertGenerated: !!alert,
    request: recordedRequest,
  };
};

/**
 * @desc    Simulate single API Request
 * @route   POST /api/requests/simulate
 * @access  Private
 */
const simulateRequest = async (req, res, next) => {
  try {
    const { clientId, endpoint, method, payload, customRequestId, ipAddress } = req.body;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: 'Client ID is required for simulation',
      });
    }

    const result = await processSimulatedRequest({
      clientId,
      endpoint,
      method,
      payload,
      customRequestId,
      ipAddress,
    });

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Simulate bulk API Requests (5, 10, 50, etc.)
 * @route   POST /api/requests/bulk
 * @access  Private
 */
const bulkSimulateRequests = async (req, res, next) => {
  try {
    const { clientId, endpoint, method, payload, count = 5 } = req.body;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: 'Client ID is required for bulk simulation',
      });
    }

    const maxCount = Math.min(Number(count) || 5, 100);
    const results = [];
    let succeeded = 0;
    let throttled = 0;
    let blocked = 0;
    let errors = 0;

    for (let i = 0; i < maxCount; i++) {
      const result = await processSimulatedRequest({
        clientId,
        endpoint,
        method,
        payload,
      });

      results.push({
        iteration: i + 1,
        statusCode: result.statusCode,
        fsmState: result.fsmState,
        processingResult: result.processingResult,
        reason: result.reason,
      });

      if (result.statusCode === 200) succeeded++;
      else if (result.statusCode === 429) throttled++;
      else if (result.statusCode === 403) blocked++;
      else errors++;
    }

    // Fetch current client snapshot
    const client = await Client.findOne({ clientId });

    res.json({
      success: true,
      summary: {
        totalSent: maxCount,
        succeeded,
        throttled,
        blocked,
        errors,
        finalFsmState: client?.currentState || 'NORMAL',
        violationCount: client?.violationCount || 0,
      },
      results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get request history with filtering and pagination
 * @route   GET /api/requests
 * @access  Private
 */
const getRequests = async (req, res, next) => {
  try {
    const {
      clientId,
      fsmState,
      processingResult,
      method,
      search,
      page = 1,
      limit = 20,
      startDate,
      endDate,
    } = req.query;

    const query = {};

    if (clientId) query.clientId = clientId;
    if (fsmState) query.fsmState = fsmState;
    if (processingResult) query.processingResult = processingResult;
    if (method) query.method = method.toUpperCase();

    if (search) {
      query.$or = [
        { requestId: { $regex: search, $options: 'i' } },
        { endpoint: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await APIRequest.countDocuments(query);
    const requests = await APIRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregated request statistics
 * @route   GET /api/requests/stats
 * @access  Private
 */
const getRequestStats = async (req, res, next) => {
  try {
    const total = await APIRequest.countDocuments();
    const successful = await APIRequest.countDocuments({ responseStatus: 200 });
    const throttled = await APIRequest.countDocuments({ responseStatus: 429 });
    const blocked = await APIRequest.countDocuments({ responseStatus: 403 });
    const validationErrors = await APIRequest.countDocuments({ responseStatus: 400 });

    res.json({
      success: true,
      stats: {
        total,
        successful,
        throttled,
        blocked,
        validationErrors,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  simulateRequest,
  bulkSimulateRequests,
  getRequests,
  getRequestStats,
};
