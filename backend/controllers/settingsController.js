const SystemSetting = require('../models/SystemSetting');
const { invalidateSettingsCache } = require('../services/rateLimiterService');

/**
 * @desc    Get current system rate limiting & simulation settings
 * @route   GET /api/settings
 * @access  Private
 */
const getSettings = async (req, res, next) => {
  try {
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
        updatedBy: 'system',
      });
    }

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update system rate limiting & simulation settings
 * @route   PUT /api/settings
 * @access  Private
 */
const updateSettings = async (req, res, next) => {
  try {
    const {
      requestLimit,
      timeWindow,
      warningThreshold,
      throttlingThreshold,
      cooldownDuration,
      autoBlockThreshold,
      simulationInterval,
    } = req.body;

    // Validations
    if (requestLimit !== undefined && (isNaN(requestLimit) || Number(requestLimit) < 1)) {
      return res.status(400).json({
        success: false,
        message: 'Request limit must be a positive integer >= 1',
      });
    }

    if (timeWindow !== undefined && (isNaN(timeWindow) || Number(timeWindow) < 5)) {
      return res.status(400).json({
        success: false,
        message: 'Time window duration must be at least 5 seconds',
      });
    }

    if (
      warningThreshold !== undefined &&
      (isNaN(warningThreshold) || Number(warningThreshold) < 1 || Number(warningThreshold) > 99)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Warning threshold must be between 1% and 99%',
      });
    }

    if (
      throttlingThreshold !== undefined &&
      (isNaN(throttlingThreshold) || Number(throttlingThreshold) < 50)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Throttling threshold must be at least 50%',
      });
    }

    if (
      cooldownDuration !== undefined &&
      (isNaN(cooldownDuration) || Number(cooldownDuration) < 5)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Cooldown duration must be at least 5 seconds',
      });
    }

    if (
      autoBlockThreshold !== undefined &&
      (isNaN(autoBlockThreshold) || Number(autoBlockThreshold) < 1)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Auto block threshold must be at least 1 violation',
      });
    }

    if (
      simulationInterval !== undefined &&
      (isNaN(simulationInterval) || Number(simulationInterval) < 50)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Simulation interval must be at least 50ms',
      });
    }

    let settings = await SystemSetting.findOne({ key: 'global_rate_limit_config' });
    if (!settings) {
      settings = new SystemSetting({ key: 'global_rate_limit_config' });
    }

    if (requestLimit !== undefined) settings.requestLimit = Number(requestLimit);
    if (timeWindow !== undefined) settings.timeWindow = Number(timeWindow);
    if (warningThreshold !== undefined) settings.warningThreshold = Number(warningThreshold);
    if (throttlingThreshold !== undefined) settings.throttlingThreshold = Number(throttlingThreshold);
    if (cooldownDuration !== undefined) settings.cooldownDuration = Number(cooldownDuration);
    if (autoBlockThreshold !== undefined) settings.autoBlockThreshold = Number(autoBlockThreshold);
    if (simulationInterval !== undefined) settings.simulationInterval = Number(simulationInterval);

    settings.updatedBy = req.admin?.username || 'admin';
    await settings.save();

    // Invalidate memory cache so changes take effect immediately
    invalidateSettingsCache();

    res.json({
      success: true,
      message: 'System settings successfully updated',
      settings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
