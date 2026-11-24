const crypto = require('crypto');

/**
 * Generate a unique Client ID
 * Format: client_<12 random hex characters>
 */
const generateClientId = () => {
  const randomHex = crypto.randomBytes(6).toString('hex');
  return `client_${randomHex}`;
};

/**
 * Generate a secure API Key
 * Format: sec_<32 random hex characters>
 */
const generateApiKey = () => {
  const randomHex = crypto.randomBytes(16).toString('hex');
  return `sec_${randomHex}`;
};

module.exports = {
  generateClientId,
  generateApiKey,
};
