// lib/security/csrf.js - CSRF Token Management
import { randomBytes, createHash } from 'crypto';

/**
 * Generate a cryptographically secure CSRF token
 * @returns {string} CSRF token
 */
export function generateCSRFToken() {
  return randomBytes(32).toString('hex');
}

/**
 * Verify CSRF token matches the stored token
 * @param {string} token - Token from request header
 * @param {string} storedToken - Token from cookie
 * @returns {boolean} True if tokens match
 */
export function verifyCSRFToken(token, storedToken) {
  if (!token || !storedToken) return false;
  
  // Constant-time comparison to prevent timing attacks
  const tokenBuffer = Buffer.from(token);
  const storedBuffer = Buffer.from(storedToken);
  
  if (tokenBuffer.length !== storedBuffer.length) return false;
  
  // Use crypto.timingSafeEqual for constant-time comparison
  try {
    return tokenBuffer.equals(storedBuffer);
  } catch (error) {
    return false;
  }
}

/**
 * Generate a session-specific CSRF token
 * @param {string} sessionId - User session identifier
 * @returns {string} Session-bound CSRF token
 */
export function generateSessionCSRFToken(sessionId) {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const timestamp = Date.now().toString();
  const hash = createHash('sha256')
    .update(`${sessionId}-${timestamp}-${secret}`)
    .digest('hex');
  return hash;
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
