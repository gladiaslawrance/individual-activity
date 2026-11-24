const mongoose = require('mongoose');

const abuseAlertSchema = new mongoose.Schema(
  {
    alertId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    clientId: {
      type: String,
      required: true,
      index: true,
    },
    clientName: {
      type: String,
      default: 'Unknown Client',
    },
    ipAddress: {
      type: String,
      required: true,
    },
    abuseType: {
      type: String,
      enum: [
        'EXCESSIVE_REQUESTS',
        'RAPID_BURST_FLOODING',
        'POST_THROTTLE_VIOLATION',
        'BLOCKED_CLIENT_ATTEMPT',
        'MALFORMED_ENDPOINT',
        'SUSPICIOUS_PAYLOAD',
        'PATH_TRAVERSAL_ATTEMPT',
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    resolutionStatus: {
      type: String,
      enum: ['UNRESOLVED', 'ACKNOWLEDGED', 'RESOLVED'],
      default: 'UNRESOLVED',
      index: true,
    },
    resolvedBy: {
      type: String,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

abuseAlertSchema.index({ severity: 1, resolutionStatus: 1, createdAt: -1 });

module.exports = mongoose.model('AbuseAlert', abuseAlertSchema);
