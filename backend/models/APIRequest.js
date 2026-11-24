const mongoose = require('mongoose');

const apiRequestSchema = new mongoose.Schema(
  {
    requestId: {
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
    ipAddress: {
      type: String,
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE'],
      required: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    responseStatus: {
      type: Number,
      required: true,
    },
    processingResult: {
      type: String,
      enum: [
        'SUCCESS',
        'RATE_LIMITED',
        'BLOCKED_CLIENT',
        'MALFORMED_ENDPOINT',
        'MALFORMED_PAYLOAD',
        'INVALID_METHOD',
        'THROTTLED',
      ],
      required: true,
    },
    fsmState: {
      type: String,
      enum: ['NORMAL', 'WARNED', 'THROTTLED', 'BLOCKED'],
      required: true,
      index: true,
    },
    responseTimeMs: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

apiRequestSchema.index({ clientId: 1, createdAt: -1 });
apiRequestSchema.index({ createdAt: -1 });
apiRequestSchema.index({ responseStatus: 1, createdAt: -1 });

module.exports = mongoose.model('APIRequest', apiRequestSchema);
