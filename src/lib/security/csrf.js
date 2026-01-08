// lib/security/csrf.js - CSRF Token Management (Edge Runtime Compatible)

/**
 * Generate a cryptographically secure CSRF token
 * Uses Web Crypto API instead of Node.js crypto for Edge Runtime compatibility
 * @returns {string} CSRF token
 */
export function generateCSRFToken() {
  // Use Web Crypto API (works in Edge Runtime)
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  
  // Convert to hex string
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify CSRF token matches the stored token
 * @param {string} token - Token from request header
 * @param {string} storedToken - Token from cookie
 * @returns {boolean} True if tokens match
 */
export function verifyCSRFToken(token, storedToken) {
  if (!token || !storedToken) return false;
  
  // Simple constant-time comparison
  if (token.length !== storedToken.length) return false;
  
  let mismatch = 0;
  for (let i = 0; i < token.length; i++) {
    mismatch |= token.charCodeAt(i) ^ storedToken.charCodeAt(i);
  }
  
  return mismatch === 0;
}

/**
 * Generate a session-specific CSRF token
 * @param {string} sessionId - User session identifier
 * @returns {string} Session-bound CSRF token
 */
export async function generateSessionCSRFToken(sessionId) {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const timestamp = Date.now().toString();
  const data = `${sessionId}-${timestamp}-${secret}`;
  
  // Use Web Crypto API for hashing (Edge Runtime compatible)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback: simple hash
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

/**
 * Validate origin header against allowed origins
 * @param {string} origin - Origin header from request
 * @param {string} host - Host header from request
 * @returns {boolean} True if origin is allowed
 */
export function validateOrigin(origin, host) {
  if (!origin) return true; // Allow same-origin requests without Origin header
  
  const allowedOrigins = [
    `https://${host}`,
    `http://${host}`,
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean);
  
  return allowedOrigins.some(allowed => origin.startsWith(allowed));
}

/**
 * Validate referer header
 * @param {string} referer - Referer header from request
 * @param {string} host - Host header from request
 * @returns {boolean} True if referer is valid
 */
export function validateReferer(referer, host) {
  if (!referer) return true; // Some browsers don't send Referer
  
  try {
    const refererUrl = new URL(referer);
    return refererUrl.host === host || refererUrl.host === 'localhost:3000';
  } catch {
    return false;
  }
}
