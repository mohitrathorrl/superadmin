// lib/auth/jwt.js - JWT Token with 1 HOUR Expiry
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-change-in-production-123456'
);

// Token expiry: 1 HOUR (not 24 hours)
const TOKEN_EXPIRY = '1h';

export async function generateToken(payload) {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(TOKEN_EXPIRY) // ✅ 1 hour only
      .sign(JWT_SECRET);
    
    return { success: true, token };
  } catch (error) {
    console.error('Token generation error:', error);
    return { success: false, error: error.message };
  }
}

export async function verifyToken(token) {
  try {
    if (!token) {
      return { success: false, error: 'No token provided' };
    }

    const verified = await jwtVerify(token, JWT_SECRET);
    
    return {
      success: true,
      payload: verified.payload
    };
  } catch (error) {
    if (error.code === 'ERR_JWT_EXPIRED') {
      return { success: false, error: 'Token expired', expired: true };
    }
    return { success: false, error: 'Invalid token' };
  }
}

export function getTokenExpiry() {
  return TOKEN_EXPIRY; // Returns '1h'
}