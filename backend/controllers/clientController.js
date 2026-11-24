const Client = require('../models/Client');
const APIRequest = require('../models/APIRequest');
const { generateClientId, generateApiKey } = require('../utils/keyGenerator');
const { validateClientId, validateApiKey } = require('../utils/regexValidator');
const { transitionClientState, FSM_STATES } = require('../services/fsmService');
const { getSystemSettings, getSlidingWindowCount } = require('../services/rateLimiterService');

/**
 * @desc    Get all clients with search and filter
 * @route   GET /api/clients
 * @access  Private
 */
const getClients = async (req, res, next) => {
  try {
    const { search, state, status, sort = '-createdAt' } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { clientId: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (state && ['NORMAL', 'WARNED', 'THROTTLED', 'BLOCKED'].includes(state.toUpperCase())) {
      query.currentState = state.toUpperCase();
    }

    if (status) {
      query.status = status;
    }

    const clients = await Client.find(query).sort(sort);

    // Attach real-time sliding window counts for dashboard freshness
    const settings = await getSystemSettings();
    const enrichedClients = await Promise.all(
      clients.map(async (client) => {
        const clientObj = client.toObject();
        const activeWindowCount = await getSlidingWindowCount(
          client.clientId,
          settings.timeWindow || 60
        );
        clientObj.activeWindowCount = activeWindowCount;
        return clientObj;
      })
    );

    res.json({
      success: true,
      count: enrichedClients.length,
      clients: enrichedClients,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single client by ID or clientId
 * @route   GET /api/clients/:id
 * @access  Private
 */
const getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = await Client.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { clientId: id }],
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: `Client not found for ID: ${id}`,
      });
    }

    const settings = await getSystemSettings();
    const activeWindowCount = await getSlidingWindowCount(client.clientId, settings.timeWindow || 60);

    const clientObj = client.toObject();
    clientObj.activeWindowCount = activeWindowCount;

    res.json({
      success: true,
      client: clientObj,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register new client with auto-generated API Key
 * @route   POST /api/clients
 * @access  Private
 */
const createClient = async (req, res, next) => {
  try {
    const { name, email, ipAddress, requestLimit = 20, customClientId, customApiKey } = req.body;

    if (!name || !email || !ipAddress) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and IP address are required fields',
      });
    }

    // Assign or validate Client ID
    let finalClientId = customClientId || generateClientId();
    const clientIdValidation = validateClientId(finalClientId);
    if (!clientIdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: clientIdValidation.error,
      });
    }

    // Check uniqueness
    const existingClient = await Client.findOne({ clientId: finalClientId });
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: `Client with ID "${finalClientId}" already exists`,
      });
    }

    // Assign or validate API Key
    let finalApiKey = customApiKey || generateApiKey();
    const apiKeyValidation = validateApiKey(finalApiKey);
    if (!apiKeyValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: apiKeyValidation.error,
      });
    }

    const newClient = new Client({
      clientId: finalClientId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      apiKey: finalApiKey,
      ipAddress: ipAddress.trim(),
      requestLimit: Number(requestLimit) || 20,
      currentState: FSM_STATES.NORMAL,
      requestCount: 0,
      violationCount: 0,
    });

    await newClient.save();

    res.status(201).json({
      success: true,
      message: 'Client registered successfully',
      client: newClient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update client details
 * @route   PUT /api/clients/:id
 * @access  Private
 */
const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, ipAddress, requestLimit, status } = req.body;

    const client = await Client.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { clientId: id }],
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: `Client not found for ID: ${id}`,
      });
    }

    if (name) client.name = name.trim();
    if (email) client.email = email.trim().toLowerCase();
    if (ipAddress) client.ipAddress = ipAddress.trim();
    if (requestLimit !== undefined) client.requestLimit = Math.max(1, Number(requestLimit));
    if (status && ['active', 'suspended', 'revoked'].includes(status)) client.status = status;

    await client.save();

    res.json({
      success: true,
      message: 'Client updated successfully',
      client,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete client
 * @route   DELETE /api/clients/:id
 * @access  Private
 */
const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = await Client.findOneAndDelete({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { clientId: id }],
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: `Client not found for ID: ${id}`,
      });
    }

    res.json({
      success: true,
      message: `Client ${client.name} (${client.clientId}) deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get request history for an individual client
 * @route   GET /api/clients/:id/history
 * @access  Private
 */
const getClientHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = await Client.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { clientId: id }],
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: `Client not found for ID: ${id}`,
      });
    }

    const { limit = 50, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const requests = await APIRequest.find({ clientId: client.clientId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await APIRequest.countDocuments({ clientId: client.clientId });

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
 * @desc    Admin manual unblock operation
 * @route   POST /api/clients/:id/unblock
 * @access  Private
 */
const unblockClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = await Client.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { clientId: id }],
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: `Client not found for ID: ${id}`,
      });
    }

    const settings = await getSystemSettings();
    const result = await transitionClientState({
      client,
      slidingWindowCount: 0,
      settings,
      isManualUnblock: true,
      triggeredBy: 'ADMIN',
      overrideReason: `Admin (${req.admin?.username || 'admin'}) manually restored client access to NORMAL`,
    });

    res.json({
      success: true,
      message: `Client ${client.name} has been manually unblocked and restored to NORMAL state.`,
      fsmResult: result,
      client,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset client rate-limit counters & cooldown
 * @route   POST /api/clients/:id/reset-counter
 * @access  Private
 */
const resetClientCounters = async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = await Client.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { clientId: id }],
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: `Client not found for ID: ${id}`,
      });
    }

    client.requestCount = 0;
    client.violationCount = 0;
    client.cooldownUntil = null;
    client.currentState = FSM_STATES.NORMAL;
    await client.save();

    res.json({
      success: true,
      message: `Counters reset for client ${client.name}`,
      client,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientHistory,
  unblockClient,
  resetClientCounters,
};
