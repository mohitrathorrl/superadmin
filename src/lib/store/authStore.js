// lib/store/authStore.js - Production Ready (No Console Logs)

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { verifyToken } from "@/lib/services/jwt"

let logoutTimer = null

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      hydrated: false,
      expiresAt: null,

      login: ({ user, token, expiresIn = 3600 }) => {
        const expiresAt = Date.now() + expiresIn * 1000
        set({ user, token, expiresAt })
        startLogoutTimer(expiresIn)
      },

      logout: async () => {
        if (logoutTimer) {
          clearTimeout(logoutTimer)
          logoutTimer = null
        }

        try {
          await fetch("/api/auth/logout", { method: "POST" })
        } catch (e) {
          // Silent fail
        }
        
        set({ user: null, token: null, expiresAt: null })
      },

      isTokenValid: () => {
        const { token, expiresAt } = get()

        if (!token || !expiresAt) {
          return false
        }

        if (Date.now() >= expiresAt) {
          return false
        }

        try {
          verifyToken(token)
          return true
        } catch (err) {
          return false
        }
      },

      hasRole: (roles = []) => {
        const user = get().user
        if (!user) return false
        return roles.includes(user.role)
      },
    }),
    {
      name: "super-auth",

      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.token && state.expiresAt) {
            const remainingMs = state.expiresAt - Date.now()
            
            if (remainingMs <= 0) {
              state.user = null
              state.token = null
              state.expiresAt = null
            } else {
              const remainingSec = Math.floor(remainingMs / 1000)
              startLogoutTimer(remainingSec)
            }
          }
          
          state.hydrated = true
        }
      },
    }
  )
)

function startLogoutTimer(seconds) {
  if (logoutTimer) {
    clearTimeout(logoutTimer)
  }

  logoutTimer = setTimeout(() => {
    const store = useAuthStore.getState()
    store.logout()
    
    if (typeof window !== "undefined") {
      window.location.href = "/login?expired=true"
    }
  }, seconds * 1000)
}
