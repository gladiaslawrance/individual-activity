const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'global_rate_limit_config',
    },
    requestLimit: {
      type: Number,
      required: true,
      default: 20,
      min: [1, 'Request limit must be at least 1'],
    },
    timeWindow: {
      type: Number,
      required: true,
      default: 60,
      min: [5, 'Time window must be at least 5 seconds'],
    },
    warningThreshold: {
      type: Number,
      required: true,
      default: 70,
      min: [1, 'Warning threshold must be at least 1%'],
      max: [99, 'Warning threshold must be less than 100%'],
    },
    throttlingThreshold: {
      type: Number,
      required: true,
      default: 100,
      min: [50, 'Throttling threshold must be at least 50%'],
    },
    cooldownDuration: {
      type: Number,
      required: true,
      default: 30,
      min: [5, 'Cooldown duration must be at least 5 seconds'],
    },
    autoBlockThreshold: {
      type: Number,
      required: true,
      default: 3,
      min: [1, 'Auto block threshold must be at least 1 violation'],
    },
    simulationInterval: {
      type: Number,
      required: true,
      default: 500,
      min: [50, 'Simulation interval must be at least 50ms'],
    },
    updatedBy: {
      type: String,
      default: 'system',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
