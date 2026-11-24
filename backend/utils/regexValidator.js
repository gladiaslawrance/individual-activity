/**
 * Regex Validation Module
 * Provides strict regular expression validations for endpoints, HTTP methods,
 * Client IDs, API Keys, and Request Payloads.
 */

const REGEX_PATTERNS = {
  // Must begin with /, allowed URL path chars, no consecutive slashes
  ENDPOINT_SAFE_CHARS: /^\/[a-zA-Z0-9_.\-\/~%]*$/,
  // Traversal attacks: ../ or ..\ or encoded variations %2e%2e
  PATH_TRAVERSAL: /(\.\.|\%2e\%2e|\/etc\/|\/proc\/|windows\/system32|cmd\.exe|\/bin\/sh)/i,
  // Disallow double slashes //
  CONSECUTIVE_SLASHES: /\/{2,}/,
  // HTTP Methods: Only GET, POST, PUT, DELETE
  HTTP_METHOD: /^(GET|POST|PUT|DELETE)$/,
  // Client ID format: alphanumeric, underscore, hyphen (4-40 chars), optionally prefixed with client_
  CLIENT_ID: /^(client_)?[a-zA-Z0-9_\-]{4,40}$/,
  // API Key format: sec_ or key_ followed by 20-64 hex/alphanumeric chars
  API_KEY: /^(sec|key)_[a-zA-Z0-9]{20,64}$/,
  // Dangerous payload inspection
  SCRIPT_TAG: /<script\b[^>]*>([\s\S]*?)<\/script>/i,
  SQL_INJECTION: /(\b(UNION|SELECT|INSERT|DELETE|UPDATE|DROP|TABLE)\b.*--)|(\bALTER\b.*\bTABLE\b)/i,
};

/**
 * Validates an API endpoint against security criteria and URL specifications
 */
const validateEndpoint = (endpoint) => {
  if (!endpoint || typeof endpoint !== 'string') {
    return {
      isValid: false,
      error: 'Endpoint path must be a non-empty string starting with "/"',
      pattern: '^/[a-zA-Z0-9_.-/~%]*$',
    };
  }

  const trimmed = endpoint.trim();

  if (!trimmed.startsWith('/')) {
    return {
      isValid: false,
      error: 'Endpoint must begin with a forward slash ("/")',
      pattern: '^/',
    };
  }

  if (REGEX_PATTERNS.CONSECUTIVE_SLASHES.test(trimmed)) {
    return {
      isValid: false,
      error: 'Malformed endpoint: consecutive forward slashes ("//") are not permitted',
      pattern: 'No consecutive slashes',
    };
  }

  if (REGEX_PATTERNS.PATH_TRAVERSAL.test(trimmed)) {
    return {
      isValid: false,
      error: 'Security alert: Path traversal sequence (../, %2e%2e, system files) detected in endpoint',
      pattern: 'Path traversal forbidden',
      isSecurityViolation: true,
    };
  }

  if (!REGEX_PATTERNS.ENDPOINT_SAFE_CHARS.test(trimmed)) {
    return {
      isValid: false,
      error: 'Endpoint contains invalid URL path characters. Only alphanumeric, -, _, ., / are permitted.',
      pattern: '^[a-zA-Z0-9_.-/~%]*$',
    };
  }

  return { isValid: true, sanitized: trimmed };
};

/**
 * Validates HTTP method
 */
const validateMethod = (method) => {
  if (!method || typeof method !== 'string') {
    return {
      isValid: false,
      error: 'HTTP Method must be specified',
      pattern: '^(GET|POST|PUT|DELETE)$',
    };
  }

  const upperMethod = method.toUpperCase().trim();
  if (!REGEX_PATTERNS.HTTP_METHOD.test(upperMethod)) {
    return {
      isValid: false,
      error: `Invalid HTTP method "${method}". Allowed methods are: GET, POST, PUT, DELETE`,
      pattern: '^(GET|POST|PUT|DELETE)$',
    };
  }

  return { isValid: true, method: upperMethod };
};

/**
 * Validates Client ID format
 */
const validateClientId = (clientId) => {
  if (!clientId || typeof clientId !== 'string') {
    return {
      isValid: false,
      error: 'Client ID must be a non-empty string',
      pattern: '^(client_)?[a-zA-Z0-9_-]{4,40}$',
    };
  }

  if (!REGEX_PATTERNS.CLIENT_ID.test(clientId.trim())) {
    return {
      isValid: false,
      error: 'Client ID format invalid. Must be 4-40 alphanumeric characters, hyphens or underscores.',
      pattern: '^(client_)?[a-zA-Z0-9_-]{4,40}$',
    };
  }

  return { isValid: true, clientId: clientId.trim() };
};

/**
 * Validates API Key format
 */
const validateApiKey = (apiKey) => {
  if (!apiKey || typeof apiKey !== 'string') {
    return {
      isValid: false,
      error: 'API Key must be a non-empty string',
      pattern: '^(sec|key)_[a-zA-Z0-9]{20,64}$',
    };
  }

  if (!REGEX_PATTERNS.API_KEY.test(apiKey.trim())) {
    return {
      isValid: false,
      error: 'API Key format invalid. Expected format: sec_xxxxxxxx... or key_xxxxxxxx...',
      pattern: '^(sec|key)_[a-zA-Z0-9]{20,64}$',
    };
  }

  return { isValid: true, apiKey: apiKey.trim() };
};

/**
 * Validates JSON Request Payload
 */
const validatePayload = (payload) => {
  if (payload === null || payload === undefined || payload === '') {
    return { isValid: true, parsed: null };
  }

  let parsed = payload;
  let strRepresentation = '';

  if (typeof payload === 'string') {
    strRepresentation = payload;
    try {
      parsed = JSON.parse(payload);
    } catch (e) {
      return {
        isValid: false,
        error: `Malformed JSON payload: ${e.message}`,
        pattern: 'Valid JSON format',
      };
    }
  } else if (typeof payload === 'object') {
    try {
      strRepresentation = JSON.stringify(payload);
    } catch (e) {
      return {
        isValid: false,
        error: 'Unserializable object payload',
      };
    }
  }

  // Check for dangerous XSS/Script patterns
  if (REGEX_PATTERNS.SCRIPT_TAG.test(strRepresentation)) {
    return {
      isValid: false,
      error: 'Malicious payload detected: Script tags are prohibited',
      isSecurityViolation: true,
    };
  }

  return { isValid: true, parsed };
};

module.exports = {
  REGEX_PATTERNS,
  validateEndpoint,
  validateMethod,
  validateClientId,
  validateApiKey,
  validatePayload,
};
