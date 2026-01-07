/**
 * Security Utilities - DSA-Based Implementations
 * Production-grade security functions with optimized data structures
 */

import crypto from "crypto"
import bcrypt from "bcryptjs"

/**
 * Password hashing using bcrypt
 * Time: O(2^cost) - intentionally slow for security
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12) // cost factor = 12
  return bcrypt.hash(password, salt)
}

/**
 * Password verification
 */
export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash)
}

/**
 * Trie-based password strength checker
 * Common passwords stored in Trie for O(m) lookup where m = password length
 */
class PasswordTrie {
  constructor() {
    this.root = {}
  }

  insert(word) {
    let node = this.root
    for (const char of word) {
      if (!node[char]) node[char] = {}
      node = node[char]
    }
    node.isEnd = true
  }

  search(word) {
    let node = this.root
    for (const char of word) {
      if (!node[char]) return false
      node = node[char]
    }
    return node.isEnd === true
  }
}

// Common passwords list (top 100)
const commonPasswordsTrie = new PasswordTrie()
const commonPasswords = [
  "password", "123456", "12345678", "qwerty", "abc123",
  "monkey", "1234567", "letmein", "trustno1", "dragon",
  "baseball", "iloveyou", "master", "sunshine", "ashley",
  "bailey", "passw0rd", "shadow", "123123", "654321",
  "superman", "qazwsx", "michael", "football", "welcome",
  "jesus", "ninja", "mustang", "password1", "123456789",
  "adobe123", "admin", "1234567890", "photoshop", "1234",
  "12345", "pussy", "liverpool", "london", "1qaz2wsx",
  "biteme", "test", "demo", "changeme", "temp123"
]
commonPasswords.forEach(pwd => commonPasswordsTrie.insert(pwd))

/**
 * Enhanced password strength validator
 * Uses Trie for common password check: O(m)
 * Character frequency check: O(n)
 */
export function validatePasswordStrength(password) {
  const errors = []
  
  // Length check
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters")
  }
  
  // Common password check using Trie - O(m)
  if (commonPasswordsTrie.search(password.toLowerCase())) {
    errors.push("Password is too common")
  }
  
  // Character variety checks
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  
  if (!hasUpper) errors.push("Must contain uppercase letter")
  if (!hasLower) errors.push("Must contain lowercase letter")
  if (!hasNumber) errors.push("Must contain number")
  if (!hasSpecial) errors.push("Must contain special character")
  
  // Sequential characters check (using sliding window)
  const hasSequential = /(.)\1{2,}/.test(password)
  if (hasSequential) {
    errors.push("Avoid repeating characters")
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: calculateStrength(password)
  }
}

function calculateStrength(password) {
  let score = 0
  if (password.length >= 8) score += 20
  if (password.length >= 12) score += 20
  if (password.length >= 16) score += 10
  if (/[A-Z]/.test(password)) score += 15
  if (/[a-z]/.test(password)) score += 15
  if (/[0-9]/.test(password)) score += 10
  if (/[!@#$%^&*]/.test(password)) score += 10
  
  if (score >= 80) return "strong"
  if (score >= 60) return "medium"
  return "weak"
}

/**
 * Secure random token generator
 * Cryptographically secure random bytes
 */
export function generateSecureToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex")
}

/**
 * HMAC-based token signature
 * Prevents token tampering
 */
export function signToken(data, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(data))
    .digest("hex")
}

export function verifyTokenSignature(data, signature, secret) {
  const expectedSignature = signToken(data, secret)
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

/**
 * XSS prevention - sanitize HTML
 * Uses Set for O(1) lookup of dangerous tags
 */
const dangerousTags = new Set([
  "script", "iframe", "object", "embed", "link", 
  "style", "form", "input", "button", "meta"
])

export function sanitizeHTML(html) {
  if (typeof html !== "string") return ""
  return html.replace(/<(\w+)[^>]*>/g, (match, tag) => {
    if (dangerousTags.has(tag.toLowerCase())) {
      return ""
    }
    return match
  })
}

/**
 * SQL injection prevention helper
 * Escapes dangerous characters
 */
export function sanitizeSQLInput(input) {
  if (typeof input !== "string") return input
  return input
    .replace(/'/g, "''")
    .replace(/;/g, "")
    .replace(/--/g, "")
    .replace(/\/\*/g, "")
    .replace(/\*\//g, "")
}

/**
 * Session management with LRU Cache
 * O(1) for get/set operations
 */
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.cache = new Map()
  }

  get(key) {
    if (!this.cache.has(key)) return null
    const value = this.cache.get(key)
    // Move to end (most recently used)
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.capacity) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }

  delete(key) {
    return this.cache.delete(key)
  }

  has(key) {
    return this.cache.has(key)
  }

  clear() {
    this.cache.clear()
  }
}

export const sessionCache = new LRUCache(1000) // Store 1000 active sessions

/**
 * CSRF Token Generation and Validation
 */
export function generateCSRFToken() {
  return generateSecureToken(32)
}

export function validateCSRFToken(token, storedToken) {
  if (!token || !storedToken) return false
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(storedToken)
  )
}

/**
 * Input validation helpers
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone) {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/
  return phoneRegex.test(phone)
}

export function sanitizeString(str, maxLength = 255) {
  if (typeof str !== "string") return ""
  return str
    .trim()
    .slice(0, maxLength)
    .replace(/[<>"']/g, "")
}
