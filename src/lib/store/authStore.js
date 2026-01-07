// lib/store/authStore.js

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { verifyToken } from "@/lib/services/jwt"

let logoutTimer = null // ✅ Global timer outside store

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      hydrated: false,
      expiresAt: null,

      /* =========================
         LOGIN
      ========================= */
     // lib/store/authStore.js - Line 16 change karo

login: ({ user, token, expiresIn = 3600 }) => { // ✅ Default 3600 seconds
  const expiresAt = Date.now() + expiresIn * 1000
  set({ user, token, expiresAt })
  
  console.log(`✅ Logged in. Auto logout in ${expiresIn} seconds`)
  
  // ✅ START TIMER
  startLogoutTimer(expiresIn)
},

      /* =========================
         LOGOUT
      ========================= */
      logout: async () => {
        console.log("🚪 Logging out...")
        
        // Clear timer
        if (logoutTimer) {
          clearTimeout(logoutTimer)
          logoutTimer = null
        }

        try {
          await fetch("/api/auth/logout", { method: "POST" })
        } catch (e) {
          console.error("Logout API failed:", e)
        }
        
        // Clear state
        set({ user: null, token: null, expiresAt: null })
      },

      /* =========================
         CHECK TOKEN VALIDITY
      ========================= */
      isTokenValid: () => {
        const { token, expiresAt } = get()

        if (!token || !expiresAt) {
          return false
        }

        // Client-side expiry check
        if (Date.now() >= expiresAt) {
          console.warn("⏰ Token expired (client)")
          return false
        }

        // JWT verification
        try {
          verifyToken(token)
          return true
        } catch (err) {
          console.warn("❌ Token invalid:", err.message)
          return false
        }
      },

      /* =========================
         ROLE CHECK
      ========================= */
      hasRole: (roles = []) => {
        const user = get().user
        if (!user) return false
        return roles.includes(user.role)
      },
    }),
    {
      name: "super-auth",

      /* =========================
         ON LOAD VALIDATION
      ========================= */
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log("🔄 Rehydrating auth state...")

          // Check if token is still valid
          if (state.token && state.expiresAt) {
            const remainingMs = state.expiresAt - Date.now()
            
            if (remainingMs <= 0) {
              console.warn("⏰ Token expired on load")
              state.user = null
              state.token = null
              state.expiresAt = null
            } else {
              const remainingSec = Math.floor(remainingMs / 1000)
              console.log(`✅ Token valid. ${remainingSec}s remaining`)
              
              // Restart timer with remaining time
              startLogoutTimer(remainingSec)
            }
          }
          
          state.hydrated = true
        }
      },
    }
  )
)

/* =========================
   GLOBAL LOGOUT TIMER FUNCTION
========================= */
function startLogoutTimer(seconds) {
  // Clear existing timer
  if (logoutTimer) {
    clearTimeout(logoutTimer)
  }

  console.log(`⏰ Starting logout timer: ${seconds} seconds`)

  logoutTimer = setTimeout(() => {
    console.warn("⏰ AUTO LOGOUT - Session expired!")
    
    // Get store instance
    const store = useAuthStore.getState()
    
    // Logout
    store.logout()
    
    // Redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/login?expired=true"
    }
  }, seconds * 1000)
}
