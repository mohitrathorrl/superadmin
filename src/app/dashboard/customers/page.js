"use client"

import { useState } from "react"
import { Plus, Search, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

const customers = [
  {
    id: 1,
    name: "Acme Corporation",
    email: "contact@acme.com",
    joined: "2025-01-15",
    status: "active",
    payouts: 12,
    totalAmount: "$45,230",
  },
  {
    id: 2,
    name: "Global Services Ltd",
    email: "hello@globalservices.com",
    joined: "2025-02-20",
    status: "active",
    payouts: 8,
    totalAmount: "$32,150",
  },
  {
    id: 3,
    name: "Tech Innovations Inc",
    email: "info@techinno.com",
    joined: "2025-03-10",
    status: "inactive",
    payouts: 5,
    totalAmount: "$15,670",
  },
  {
    id: 4,
    name: "Finance Plus",
    email: "support@financeplus.com",
    joined: "2025-04-05",
    status: "active",
    payouts: 15,
    totalAmount: "$67,890",
  },
]

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="mt-1 text-sm text-zinc-600">Manage your customer accounts and payouts</p>
        </div>
        <Button className="btn-primary gap-2">
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 py-2 text-sm placeholder:text-zinc-500 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      {/* Customers Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {filtered.map((customer) => (
          <div key={customer.id} className="surface p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold">{customer.name}</h3>
                <p className="mt-0.5 text-sm text-zinc-600">{customer.email}</p>
              </div>
              <button className="rounded-lg p-1 hover:bg-zinc-100">
                <MoreVertical className="h-4 w-4 text-zinc-400" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
              <div>
                <p className="text-xs text-zinc-600">Status</p>
                <p className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  customer.status === "active"
                    ? "bg-green-50 text-green-700"
                    : "bg-zinc-100 text-zinc-700"
                }`}>
                  {customer.status}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-600">Payouts</p>
                <p className="mt-1 font-semibold">{customer.payouts}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-600">Total</p>
                <p className="mt-1 font-semibold">{customer.totalAmount}</p>
              </div>
            </div>

            <div className="mt-4 border-t pt-4 text-xs text-zinc-500">Joined {customer.joined}</div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-lg border border-dashed border-zinc-300 py-12 text-center">
          <p className="text-sm text-zinc-600">No customers found matching your search</p>
        </div>
      )}
    </div>
  )
}
