// components/layout/topbar.jsx

"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Menu, LogOut } from "lucide-react"

import Spinner from "@/components/ui/spinner"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Sidebar } from "./sidebar"
import { useAuthStore } from "@/lib/store/authStore"

// 🔥 IMPORTANT: Dialog imports for Sheet accessibility
import {
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export function Topbar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false) // ✅ Fix hydration

  // ✅ Fix hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Extract name from email
  const getDisplayName = () => {
    if (user?.name && user.name !== "Root Super Admin") {
      return user.name
    }

    if (user?.email) {
      const emailUsername = user.email.split("@")[0]
      const nameParts = emailUsername.split(".")
      
      return nameParts
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    }

    return "User"
  }

  const handleLogout = async () => {
    if (loading) return
    setLoading(true)

    const id = toast.loading("Logging out...")
    await logout()

    toast.success("See you soon!", { id })
    
    // Redirect after small delay
    setTimeout(() => {
      window.location.href = "/login"
    }, 500)
  }

  // ✅ Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="sticky top-4 z-40">
        <div className="surface2 flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center rounded-xl border bg-white px-3 py-2 shadow-sm">
              <p className="text-sm font-semibold text-zinc-900">Loading...</p>
            </div>
          </div>
          <button className="btn-primary flex items-center gap-2 px-3 py-2.5 text-sm" disabled>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="sticky top-4 z-40">
      <div className="surface2 flex items-center justify-between px-4 py-3">

        {/* ================= LEFT ================= */}
        <div className="flex items-center gap-4">

          {/* MOBILE SIDEBAR */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="p-1.5">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-64 p-0">
                <div className="sr-only">
                  <DialogTitle>Sidebar Navigation</DialogTitle>
                  <DialogDescription>
                    Main application navigation menu
                  </DialogDescription>
                </div>

                <div className="mt-4">
                  <Sidebar />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* USER NAME (DESKTOP) - SIMPLE & CLEAN */}
          <div className="hidden sm:flex items-center rounded-xl border bg-white px-5 py-2 shadow-sm">
            <p className="text-sm font-semibold text-zinc-900">
              {getDisplayName()}
            </p>
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <button
          onClick={handleLogout}
          disabled={loading}
          className="btn-primary flex items-center gap-2 px-3 py-2.5 text-sm"
        >
          {loading ? <Spinner size={16} /> : <LogOut className="h-4 w-4" />}
          <span className="hidden sm:inline">
            {loading ? "Logging out..." : "Logout"}
          </span>
        </button>

      </div>
    </div>
  )
}
