const AbuseAlert = require('../models/AbuseAlert');

/**
 * @desc    Get all abuse alerts with filters
 * @route   GET /api/alerts
 * @access  Private
 */
const getAlerts = async (req, res, next) => {
  try {
    const { severity, resolutionStatus, clientId, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (severity) query.severity = severity.toUpperCase();
    if (resolutionStatus) query.resolutionStatus = resolutionStatus.toUpperCase();
    if (clientId) query.clientId = clientId;

    if (search) {
      query.$or = [
        { alertId: { $regex: search, $options: 'i' } },
        { clientId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await AbuseAlert.countDocuments(query);
    const alerts = await AbuseAlert.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Summary count for quick filter pills
    const [critical, high, medium, low, unresolved] = await Promise.all([
      AbuseAlert.countDocuments({ severity: 'CRITICAL', resolutionStatus: 'UNRESOLVED' }),
      AbuseAlert.countDocuments({ severity: 'HIGH', resolutionStatus: 'UNRESOLVED' }),
      AbuseAlert.countDocuments({ severity: 'MEDIUM', resolutionStatus: 'UNRESOLVED' }),
      AbuseAlert.countDocuments({ severity: 'LOW', resolutionStatus: 'UNRESOLVED' }),
      AbuseAlert.countDocuments({ resolutionStatus: 'UNRESOLVED' }),
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      counts: { critical, high, medium, low, unresolved },
      alerts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resolve or update resolution status of an alert
 * @route   PUT /api/alerts/:id/resolve
 * @access  Private
 */
const resolveAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolutionStatus = 'RESOLVED' } = req.body;

    const alert = await AbuseAlert.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { alertId: id }],
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: `Alert not found for ID: ${id}`,
      });
    }

    alert.resolutionStatus = resolutionStatus.toUpperCase();
    alert.resolvedBy = req.admin?.username || 'admin';
    alert.resolvedAt = new Date();
    await alert.save();

    res.json({
      success: true,
      message: `Alert ${alert.alertId} updated to status "${alert.resolutionStatus}"`,
      alert,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlerts,
  resolveAlert,
};
