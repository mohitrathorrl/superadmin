/**
 * JWT Utility Functions using jose library
 * Production-grade JWT handling for authentication
 */

import { SignJWT, jwtVerify } from "jose"

const getSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables")
  }
  return new TextEncoder().encode(secret)
}

/**
 * Generate JWT token with user data
 * @param {Object} payload - User data to encode in token
 * @param {string} expirationTime - Token expiration (e.g., '24h', '7d')
 * @returns {Promise<string>} JWT token
 */
export async function generateToken(payload, expirationTime = "24h") {
  try {
    const secret = getSecret()
    
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expirationTime)
      .sign(secret)
    
    return token
  } catch (error) {
    console.error("JWT Generation Error:", error)
    throw new Error("Failed to generate token")
  }
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @returns {Promise<Object>} Decoded payload
 */
export async function verifyToken(token) {
  try {
    const secret = getSecret()
    
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    })
    
    return payload
  } catch (error) {
    console.error("JWT Verification Error:", error.message)
    throw new Error("Invalid or expired token")
  }
}

/**
 * Extract user ID from token
 * @param {string} token - JWT token
 * @returns {Promise<string|null>} User ID or null
 */
export async function getUserIdFromToken(token) {
  try {
    const payload = await verifyToken(token)
    return payload.userId || payload.uid || null
  } catch (error) {
    return null
  }
}

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {Promise<boolean>} True if expired
 */
export async function isTokenExpired(token) {
  try {
    await verifyToken(token)
    return false
  } catch (error) {
    return true
  }
}

/**
 * Refresh token (generate new token with same payload)
 * @param {string} oldToken - Existing JWT token
 * @param {string} expirationTime - New expiration time
 * @returns {Promise<string>} New JWT token
 */
export async function refreshToken(oldToken, expirationTime = "24h") {
  try {
    const payload = await verifyToken(oldToken)
    
    // Remove JWT standard claims before re-signing
    const { exp, iat, ...userPayload } = payload
    
    return await generateToken(userPayload, expirationTime)
  } catch (error) {
    throw new Error("Failed to refresh token")
  }
}
