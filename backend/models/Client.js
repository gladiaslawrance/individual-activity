const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Client email is required'],
      trim: true,
      lowercase: true,
    },
    apiKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ipAddress: {
      type: String,
      required: [true, 'IP address is required'],
      trim: true,
    },
    requestCount: {
      type: Number,
      default: 0,
    },
    requestLimit: {
      type: Number,
      default: 20,
      min: [1, 'Request limit must be at least 1'],
    },
    currentState: {
      type: String,
      enum: ['NORMAL', 'WARNED', 'THROTTLED', 'BLOCKED'],
      default: 'NORMAL',
      index: true,
    },
    cooldownUntil: {
      type: Date,
      default: null,
    },
    violationCount: {
      type: Number,
      default: 0,
    },
    lastRequestTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'revoked'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast search & filtering
clientSchema.index({ currentState: 1, createdAt: -1 });

module.exports = mongoose.model('Client', clientSchema);
