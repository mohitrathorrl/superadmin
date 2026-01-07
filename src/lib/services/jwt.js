// lib/services/jwt.js

import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "super-ultra-secure-secret-123"
const JWT_EXPIRES_IN = "1h" // ✅ 1 hour for production

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined")
}

/* =========================
   SIGN TOKEN
========================= */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

/* =========================
   VERIFY TOKEN
========================= */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new Error("Session expired")
    }
    if (err.name === "JsonWebTokenError") {
      throw new Error("Invalid token")
    }
    throw err
  }
}

/* =========================
   DECODE TOKEN
========================= */
export function decodeToken(token) {
  return jwt.decode(token)
}
