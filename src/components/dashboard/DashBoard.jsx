"use client"

import { useEffect, useState } from "react"
import {
  Users,
  Database,
  Activity,
  CheckCircle,
} from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/context/auth-context"
import Spinner from "@/components/ui/spinner"

import DashboardPage from "@/components/dashboard/DashboardPage"

/* =========================
   CARD CONFIG
========================= */
const cards = [
 
  {
    key: "activeUsers",
    label: "Active Users",
    icon: CheckCircle,
  },
  {
    key: "totalIFSC",
    label: "Total IFSC Records",
    icon: Database,
  },
  {
    key: "totalOperations",
    label: "Total Operations",
    icon: Activity,
  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  /* =========================
     FETCH DASHBOARD STATS
  ========================= */
  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/dashboard/stats")
      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      setStats(data.data)
    } catch (err) {
      toast.error(err.message || "Failed to load dashboard stats")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <div className="space-y-8">
      {/* =========================
          HEADER
      ========================= */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Role:{" "}
          <span className="font-semibold capitalize">
            {user?.role}
          </span>
        </p>
      </div>

      {/* =========================
          STATS
      ========================= */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.key} className="surface p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-600">
                    {card.label}
                  </p>
                  <Icon className="h-4 w-4 text-zinc-400" />
                </div>

                <p className="mt-3 text-2xl font-semibold">
                  {stats?.[card.key]?.toLocaleString() ?? 0}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* =========================
          INFO
      ========================= */}
      <div className="surface p-6">
        <h2 className="text-lg font-semibold">
          System Overview
        </h2>
        <p className="mt-2 text-sm text-zinc-600 max-w-2xl">
          This dashboard shows real-time system statistics including
          users, IFSC master data, and platform operations.
          All values are fetched securely from the backend.
        </p>
      </div>
    </div>
  )
}