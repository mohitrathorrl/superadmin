// src/app/dashboard/page.js

"use client"

import { useEffect, useState } from "react"
import { 
  Building2, 
  Tag, 
  Landmark, 
  Users, 
  TrendingUp,
  Database,
  Wifi,
  Mail,
  Clock,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Spinner from "@/components/ui/spinner"

export default function DashboardOverview() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/dashboard/overview")
      const json = await res.json()

      if (!json.success) {
        throw new Error(json.message || "Failed to fetch data")
      }

      setData(json.data)
      setError(null)
    } catch (err) {
      console.error("Dashboard fetch error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spinner size={32} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p className="font-semibold">Error loading dashboard</p>
        </div>
        <p className="mt-1 text-sm">{error}</p>
        <button 
          className="mt-3 flex items-center gap-2 rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700" 
          onClick={fetchDashboardData}
        >
          Retry
        </button>
      </div>
    )
  }

  const { stats, systemStatus, recentActivity } = data || {}

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">SuperAdmin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome to Super  Admin Panel
        </p>
      </div>

      {/* Stats Grid - 5 cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <StatCard 
          title="NBFCs" 
          value={stats?.nbfcs} 
          icon={<Building2 className="h-5 w-5 text-blue-600" />}
          bgColor="bg-blue-50"
        />
        <StatCard 
          title="Brands" 
          value={stats?.brands} 
          icon={<Tag className="h-5 w-5 text-purple-600" />}
          bgColor="bg-purple-50"
        />
        <StatCard 
          title="IFSC Codes" 
          value={stats?.ifscCodes} 
          icon={<Landmark className="h-5 w-5 text-green-600" />}
          bgColor="bg-green-50"
        />
        <StatCard 
          title="Admin Users" 
          value={stats?.users} 
          icon={<Users className="h-5 w-5 text-orange-600" />}
          bgColor="bg-orange-50"
        />
        <StatCard 
          title="Total Leads" 
          value={stats?.totalLeads} 
          icon={<TrendingUp className="h-5 w-5 text-red-600" />}
          bgColor="bg-red-50"
        />
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatusItem 
              label="Database" 
              status={systemStatus?.database}
              icon={<Database className="h-4 w-4" />}
            />
            <StatusItem 
              label="API" 
              status={systemStatus?.api}
              icon={<Wifi className="h-4 w-4" />}
            />
            <StatusItem 
              label="Email" 
              status={systemStatus?.email}
              icon={<Mail className="h-4 w-4" />}
            />
            <StatusItem 
              label="Last Backup" 
              status={new Date(systemStatus?.lastBackup).toLocaleString("en-IN", {
                dateStyle: "short",
                timeStyle: "short"
              })}
              icon={<Clock className="h-4 w-4" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Lead Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Leads
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity?.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-mono text-xs">
                        #{activity.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {activity.name}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                          {activity.brandCode || activity.brand}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {activity.email}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {activity.mobile}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              No recent leads
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ title, value, icon, bgColor }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={`rounded-lg p-2 ${bgColor}`}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value?.toLocaleString("en-IN") || 0}
        </div>
      </CardContent>
    </Card>
  )
}

function StatusItem({ label, status, icon }) {
  const isActive = status === "active" || status === "operational"
  
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <span className={isActive ? "text-green-600" : "text-zinc-400"}>
          {icon}
        </span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className={`text-xs font-medium ${isActive ? "text-green-600" : "text-zinc-600"}`}>
        {isActive && <span className="mr-1">●</span>}
        {status}
      </span>
    </div>
  )
}
