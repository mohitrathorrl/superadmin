// lib/security/rateLimiter.js - Rate Limiting Implementation

// In-memory store for rate limiting (use Redis in production for scalability)
const requestStore = new Map();

/**
 * Clean up old entries every 5 minutes
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestStore.entries()) {
    if (now - data.resetTime > 0) {
      requestStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limiter configuration
 */
const RATE_LIMITS = {
  // OTP sending: 5 requests per 15 minutes
  otp: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  },
  // Login attempts: 10 requests per 15 minutes
  login: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
  },
  // General API: 100 requests per 15 minutes
  api: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
  },
};

/**
 * Check if request should be rate limited
 * @param {string} identifier - IP address or user ID
 * @param {string} type - Rate limit type (otp, login, api)
 * @returns {Object} { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(identifier, type = 'api') {
  const config = RATE_LIMITS[type] || RATE_LIMITS.api;
  const key = `${type}:${identifier}`;
  const now = Date.now();
  
  let requestData = requestStore.get(key);
  
  // Initialize or reset if window expired
  if (!requestData || now - requestData.resetTime > config.windowMs) {
    requestData = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }
  
  // Increment counter
  requestData.count++;
  requestStore.set(key, requestData);
  
  const allowed = requestData.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - requestData.count);
  
  return {
    allowed,
    remaining,
    resetTime: requestData.resetTime,
    retryAfter: Math.ceil((requestData.resetTime - now) / 1000),
  };
}

/**
 * Get client identifier (IP address)
 * @param {Request} request - Next.js request object
 * @returns {string} Client identifier
 */
export function getClientIdentifier(request) {
  // Try to get real IP from various headers (for proxy/load balancer scenarios)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIp || cfConnectingIp || 'unknown';
}

/**
 * Create rate limit response
 * @param {Object} limitInfo - Rate limit info
 * @returns {Response} Rate limit exceeded response
 */
export function createRateLimitResponse(limitInfo) {
  return new Response(
    JSON.stringify({
      success: false,
      message: 'Too many requests. Please try again later.',
      retryAfter: limitInfo.retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': limitInfo.retryAfter.toString(),
        'X-RateLimit-Limit': RATE_LIMITS.api.maxRequests.toString(),
        'X-RateLimit-Remaining': limitInfo.remaining.toString(),
        'X-RateLimit-Reset': new Date(limitInfo.resetTime).toISOString(),
      },
    }
  );
}
