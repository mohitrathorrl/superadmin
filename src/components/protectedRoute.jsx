// components/ProtectedRoute.jsx

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/authStore"
import Spinner from "@/components/ui/spinner"

export default function ProtectedRoute({ children, roles = [] }) {
  const router = useRouter()

  const token = useAuthStore((s) => s.token)
  const isTokenValid = useAuthStore((s) => s.isTokenValid)
  const hasRole = useAuthStore((s) => s.hasRole)
  const hydrated = useAuthStore((s) => s.hydrated)
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    if (!hydrated) return

    // ✅ Check if token exists and is valid
    if (!token || !isTokenValid()) {
      console.warn("Invalid or expired token, redirecting to login")
      logout() // Clear state
      router.replace("/login")
      return
    }

    // ✅ Check role permissions
    if (roles.length && !hasRole(roles)) {
      router.replace("/unauthorized")
    }
  }, [hydrated, token, isTokenValid, roles, hasRole, logout, router])

  // ⛔ Loading state while hydrating
  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size={32} />
        <span className="ml-2 text-sm text-gray-500">Loading...</span>
      </div>
    )
  }

  // ⛔ Block render if invalid
  if (!token || !isTokenValid()) return null
  if (roles.length && !hasRole(roles)) return null

  return children
}
