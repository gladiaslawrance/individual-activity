const Client = require('../models/Client');
const APIRequest = require('../models/APIRequest');
const AbuseAlert = require('../models/AbuseAlert');

/**
 * @desc    Get top overview metrics for dashboard cards
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    const [
      totalRequests,
      activeClients,
      blockedClients,
      throttledClients,
      warnedClients,
      abuseAlerts,
      requestsLastMinute,
    ] = await Promise.all([
      APIRequest.countDocuments(),
      Client.countDocuments({ status: 'active' }),
      Client.countDocuments({ currentState: 'BLOCKED' }),
      Client.countDocuments({ currentState: 'THROTTLED' }),
      Client.countDocuments({ currentState: 'WARNED' }),
      AbuseAlert.countDocuments({ resolutionStatus: 'UNRESOLVED' }),
      APIRequest.countDocuments({ createdAt: { $gte: oneMinuteAgo } }),
    ]);

    res.json({
      success: true,
      stats: {
        totalRequests,
        activeClients,
        blockedClients,
        throttledClients,
        warnedClients,
        abuseAlerts,
        requestsPerMinute: requestsLastMinute,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get chart telemetry and recent activity list
 * @route   GET /api/dashboard/activity
 * @access  Private
 */
const getDashboardActivity = async (req, res, next) => {
  try {
    // 1. FSM Client State Distribution
    const stateCounts = await Client.aggregate([
      { $group: { _id: '$currentState', count: { $sum: 1 } } },
    ]);

    const fsmStateDistribution = [
      { state: 'NORMAL', count: 0, fill: '#10B981' },
      { state: 'WARNED', count: 0, fill: '#F59E0B' },
      { state: 'THROTTLED', count: 0, fill: '#F97316' },
      { state: 'BLOCKED', count: 0, fill: '#EF4444' },
    ];

    stateCounts.forEach((item) => {
      const match = fsmStateDistribution.find((s) => s.state === item._id);
      if (match) match.count = item.count;
    });

    // 2. Normal vs Abusive Requests Breakdown
    const [normalCount, throttledCount, blockedCount, invalidCount] = await Promise.all([
      APIRequest.countDocuments({ responseStatus: 200 }),
      APIRequest.countDocuments({ responseStatus: 429 }),
      APIRequest.countDocuments({ responseStatus: 403 }),
      APIRequest.countDocuments({ responseStatus: 400 }),
    ]);

    const requestBreakdown = [
      { name: 'Normal (200 OK)', value: normalCount, color: '#00F0FF' },
      { name: 'Throttled (429)', value: throttledCount, color: '#F97316' },
      { name: 'Blocked (403)', value: blockedCount, color: '#EF4444' },
      { name: 'Malformed / Regex Err (400)', value: invalidCount, color: '#A855F7' },
    ];

    // 3. Top Active Clients
    const clientActivityDistribution = await APIRequest.aggregate([
      { $group: { _id: '$clientId', totalRequests: { $sum: 1 } } },
      { $sort: { totalRequests: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: 'clientId',
          as: 'clientDoc',
        },
      },
      {
        $project: {
          clientId: '$_id',
          totalRequests: 1,
          name: { $arrayElemAt: ['$clientDoc.name', 0] },
          currentState: { $arrayElemAt: ['$clientDoc.currentState', 0] },
        },
      },
    ]);

    // 4. Requests Over Time (last 12 time slices or intervals)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const timelineData = await APIRequest.aggregate([
      { $match: { createdAt: { $gte: twentyFourHoursAgo } } },
      {
        $group: {
          _id: {
            hour: { $hour: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          total: { $sum: 1 },
          normal: {
            $sum: { $cond: [{ $eq: ['$responseStatus', 200] }, 1, 0] },
          },
          abusive: {
            $sum: { $cond: [{ $in: ['$responseStatus', [400, 403, 429]] }, 1, 0] },
          },
          firstTime: { $first: '$createdAt' },
        },
      },
      { $sort: { '_id.day': 1, '_id.hour': 1 } },
      { $limit: 12 },
    ]);

    const formattedTimeline = timelineData.map((d) => ({
      time: new Date(d.firstTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      total: d.total,
      normal: d.normal,
      abusive: d.abusive,
    }));

    // If timeline is empty (fresh database), seed with reasonable default structure
    const finalTimeline =
      formattedTimeline.length > 0
        ? formattedTimeline
        : [
            { time: '10:00', total: 12, normal: 11, abusive: 1 },
            { time: '11:00', total: 24, normal: 20, abusive: 4 },
            { time: '12:00', total: 35, normal: 28, abusive: 7 },
            { time: '13:00', total: 18, normal: 17, abusive: 1 },
            { time: '14:00', total: 42, normal: 30, abusive: 12 },
          ];

    // 5. Recent Activity Feed (last 10 requests)
    const recentActivity = await APIRequest.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      charts: {
        fsmStateDistribution,
        requestBreakdown,
        clientActivityDistribution,
        requestsOverTime: finalTimeline,
      },
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getDashboardActivity,
};
