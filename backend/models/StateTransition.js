const mongoose = require('mongoose');

const stateTransitionSchema = new mongoose.Schema(
  {
    transitionId: {
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
      default: '',
    },
    fromState: {
      type: String,
      enum: ['NORMAL', 'WARNED', 'THROTTLED', 'BLOCKED'],
      required: true,
    },
    toState: {
      type: String,
      enum: ['NORMAL', 'WARNED', 'THROTTLED', 'BLOCKED'],
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
    },
    triggeredBy: {
      type: String,
      enum: ['SYSTEM', 'ADMIN', 'SIMULATOR'],
      default: 'SYSTEM',
    },
    metrics: {
      requestCount: { type: Number, default: 0 },
      limit: { type: Number, default: 20 },
      windowSeconds: { type: Number, default: 60 },
      violationCount: { type: Number, default: 0 },
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

stateTransitionSchema.index({ clientId: 1, timestamp: -1 });

module.exports = mongoose.model('StateTransition', stateTransitionSchema);
