"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Search, Filter, X, Edit2, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

import Spinner from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import SlideToConfirm from "@/components/ui/SlideToConfirm"

export default function LeadsManagePage() {
  const [brands, setBrands] = useState([])
  const [selectedBrand, setSelectedBrand] = useState("")
  
  const [leads, setLeads] = useState([])
  const [statuses, setStatuses] = useState([])
  
  const [loading, setLoading] = useState(false)
  const [brandsLoading, setBrandsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [filters, setFilters] = useState({
    status: "",
    stage: "",
    search: "",
  })
  
  const [searchInput, setSearchInput] = useState("")
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  
  const [showFilters, setShowFilters] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [newStatusId, setNewStatusId] = useState("")

  const filterPanelRef = useRef(null)
  const filterButtonRef = useRef(null)
  const modalRef = useRef(null)

  /* ================= CLOSE FILTER ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showFilters &&
        filterPanelRef.current &&
        filterButtonRef.current &&
        !filterPanelRef.current.contains(event.target) &&
        !filterButtonRef.current.contains(event.target)
      ) {
        setShowFilters(false)
      }
    }

    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showFilters])

  /* ================= CLOSE MODAL ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (showEditModal || showConfirmModal) &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        closeAllModals()
      }
    }

    if (showEditModal || showConfirmModal) {
      document.addEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "unset"
    }
  }, [showEditModal, showConfirmModal])

  const closeAllModals = () => {
    setShowEditModal(false)
    setShowConfirmModal(false)
    setEditingLead(null)
    setNewStatusId("")
    setSaving(false)
  }

  /* ================= LOAD BRANDS ================= */
  const fetchBrands = useCallback(async () => {
    try {
      setBrandsLoading(true)
      const res = await fetch("/api/brands")
      const json = await res.json()
      
      if (!res.ok) throw new Error(json.message)
      
      const brandList = json.data || []
      setBrands(brandList)
      
      if (brandList.length > 0) {
        setSelectedBrand(brandList[0].id.toString())
      }
    } catch (err) {
      toast.error("Failed to load brands")
    } finally {
      setBrandsLoading(false)
    }
  }, [])

  /* ================= FETCH STATUSES ================= */
  const fetchStatuses = useCallback(async (brandId) => {
    if (!brandId) return
    
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get_statuses",
          company_id: parseInt(brandId),
        }),
      })
      const json = await res.json()
      
      if (!res.ok) throw new Error(json.message)
      
      setStatuses(json.data || [])
    } catch (err) {
      console.error("Failed to load statuses:", err)
    }
  }, [])

  /* ================= FETCH LEADS ================= */
  const fetchLeads = useCallback(async (brandId, filterParams = {}, page = 1) => {
    if (!brandId) {
      setLeads([])
      return
    }

    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        company_id: brandId,
        page: page.toString(),
        limit: "10",
        ...filterParams,
      })
      
      const res = await fetch(`/api/leads?${params}`)
      const json = await res.json()
      
      if (!res.ok) throw new Error(json.message)
      
      setLeads(json.data || [])
      setPagination(json.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 })
    } catch (err) {
      toast.error(err.message || "Failed to load leads")
      setLeads([])
    } finally {
      setLoading(false)
    }
  }, [])

  /* ================= OPEN EDIT MODAL ================= */
  const handleEditClick = (lead) => {
    setEditingLead(lead)
    setNewStatusId(lead.lead_status_id?.toString() || "")
    setShowEditModal(true)
  }

  /* ================= OPEN CONFIRMATION MODAL ================= */
  const handleUpdateClick = () => {
    if (!newStatusId) {
      toast.error("Please select a status")
      return
    }

    if (newStatusId === editingLead.lead_status_id?.toString()) {
      toast.error("Please select a different status")
      return
    }

    setShowEditModal(false)
    setShowConfirmModal(true)
  }

  /* ================= UPDATE STATUS WITH CONFIRMATION ================= */
  const confirmUpdate = async () => {
    try {
      setSaving(true)

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          lead_id: editingLead.id,
          new_status_id: parseInt(newStatusId),
        }),
      })
      
      const json = await res.json()
      
      if (!res.ok) throw new Error(json.message)
      
      toast.success("Status updated successfully")
      closeAllModals()
      fetchLeads(selectedBrand, filters, pagination.page)
    } catch (err) {
      toast.error(err.message || "Failed to update status")
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    fetchBrands()
  }, [fetchBrands])

  useEffect(() => {
    if (selectedBrand) {
      fetchStatuses(selectedBrand)
      fetchLeads(selectedBrand, filters, 1)
    }
  }, [selectedBrand, fetchStatuses, fetchLeads])

  /* ================= APPLY FILTERS ================= */
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    if (selectedBrand) {
      fetchLeads(selectedBrand, newFilters, 1)
    }
  }

  const handleSearch = () => {
    const trimmedSearch = searchInput.trim()
    const newFilters = { ...filters, search: trimmedSearch }
    setFilters(newFilters)
    
    if (selectedBrand) {
      fetchLeads(selectedBrand, newFilters, 1)
    }
  }

  const clearFilters = () => {
    setFilters({ status: "", stage: "", search: "" })
    setSearchInput("")
    if (selectedBrand) {
      fetchLeads(selectedBrand, {}, 1)
    }
  }

  /* ================= PAGINATION ================= */
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchLeads(selectedBrand, filters, newPage)
    }
  }

  /* ================= FORMAT HELPERS ================= */
  const getStatusBadgeColor = (status) => {
    const statusMap = {
      'CLOSED': 'bg-gray-100 text-gray-700',
      'SETTLED': 'bg-green-100 text-green-700',
      'DISBURSED': 'bg-blue-100 text-blue-700',
      'REJECT': 'bg-red-100 text-red-700',
      'SYSTEM-REJECT': 'bg-red-100 text-red-700',
      'CANCEL': 'bg-orange-100 text-orange-700',
      'LEAD-NEW': 'bg-purple-100 text-purple-700',
      'APPLICATION-NEW': 'bg-cyan-100 text-cyan-700',
    }
    return statusMap[status] || 'bg-zinc-100 text-zinc-700'
  }

  const getStageBadgeColor = (stage) => {
    if (!stage) return 'bg-zinc-100 text-zinc-700'
    if (stage.startsWith('S1')) return 'bg-yellow-100 text-yellow-700'
    if (stage.startsWith('S2')) return 'bg-orange-100 text-orange-700'
    if (stage.startsWith('S3')) return 'bg-cyan-100 text-cyan-700'
    if (stage.startsWith('S7')) return 'bg-red-100 text-red-700'
    if (stage.startsWith('S14')) return 'bg-green-100 text-green-700'
    return 'bg-zinc-100 text-zinc-700'
  }

  /* ================= LOADING STATE ================= */
  if (brandsLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size={28} />
      </div>
    )
  }

  const selectedStatus = statuses.find(s => s.id.toString() === newStatusId)
  const selectedBrandData = brands.find(b => b.id.toString() === selectedBrand)

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Leads Management</h1>
          <p className="mt-1 text-sm text-zinc-600">
            View, filter, and manage leads by brand, status, and stage
          </p>
        </div>

        <div ref={filterButtonRef}>
          <Button 
            className="btn-secondary gap-2 w-full sm:w-auto" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
      </div>

      {/* BRAND DROPDOWN */}
      <div className="surface p-4 sm:p-6">
        <label className="text-sm font-medium text-zinc-700 block mb-2">
          Select Brand
        </label>
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="w-full sm:w-80 h-11 rounded-xl border border-zinc-300 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
          disabled={loading}
        >
          <option value="">Select a brand</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name} ({brand.code})
            </option>
          ))}
        </select>
      </div>

      {/* FILTERS PANEL */}
      {showFilters && selectedBrand && (
        <div ref={filterPanelRef} className="surface p-4 sm:p-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
            >
              <X className="h-4 w-4" />
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* STATUS FILTER */}
            <div>
              <label className="text-sm font-medium text-zinc-700 block mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full h-10 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
                disabled={loading}
              >
                <option value="">All Statuses</option>
                {[...new Set(statuses.map(s => s.status_name))].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* STAGE FILTER */}
            <div>
              <label className="text-sm font-medium text-zinc-700 block mb-2">
                Stage
              </label>
              <select
                value={filters.stage}
                onChange={(e) => handleFilterChange("stage", e.target.value)}
                className="w-full h-10 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
                disabled={loading}
              >
                <option value="">All Stages</option>
                {[...new Set(statuses.map(s => s.status_stage))].map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>

            {/* SEARCH */}
            <div>
              <label className="text-sm font-medium text-zinc-700 block mb-2">
                Search (Lead ID / Mobile / PAN / Email)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search..."
                    className="w-full h-10 rounded-lg border border-zinc-300 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-4 h-10 bg-black text-white !text-white rounded-lg hover:bg-zinc-800 flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEADS TABLE */}
      <div className="surface overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size={24} />
          </div>
        ) : !selectedBrand ? (
          <div className="py-12 text-center text-zinc-500">
            <p className="text-base sm:text-lg font-medium">Please select a brand</p>
            <p className="mt-2 text-sm">Choose a brand from the dropdown above to view leads</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="py-12 text-center text-zinc-500">
            <p className="text-base sm:text-lg font-medium">No leads found</p>
            <p className="mt-2 text-sm">Try adjusting your filters or search</p>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="block lg:hidden">
              <div className="divide-y">
                {leads.map((lead) => (
                  <div key={lead.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono font-semibold">#{lead.id}</span>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusBadgeColor(lead.status)}`}>
                          {lead.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStageBadgeColor(lead.stage)}`}>
                          {lead.stage}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-zinc-500">Name: </span>
                        <span className="font-medium">
                          {[lead.first_name, lead.middle_name, lead.surname].filter(Boolean).join(" ") || "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Mobile: </span>
                        <span className="font-mono">{lead.mobile || "—"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Application No: </span>
                        <span className="font-mono text-xs">{lead.application_no || "—"}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleEditClick(lead)}
                      className="w-full px-3 py-2 bg-zinc-100 hover:bg-zinc-200 rounded text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit Status
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Lead ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Application No</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Mobile</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">Stage</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono font-semibold">
                        #{lead.id}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono">
                        {lead.application_no || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {[lead.first_name, lead.middle_name, lead.surname]
                          .filter(Boolean)
                          .join(" ") || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono">
                        {lead.mobile || "—"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusBadgeColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStageBadgeColor(lead.stage)}`}>
                          {lead.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleEditClick(lead)}
                          className="p-2 hover:bg-zinc-100 rounded transition-colors"
                        >
                          <Edit2 className="h-4 w-4 text-zinc-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {pagination.totalPages > 0 && (
              <div className="px-4 sm:px-6 py-4 border-t bg-zinc-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm text-zinc-600 text-center sm:text-left">
                  Showing <span className="font-semibold">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
                  <span className="font-semibold">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{" "}
                  <span className="font-semibold">{pagination.total}</span> leads
                </p>
                
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1 || loading}
                    className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-100 flex items-center gap-1 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>
                  
                  <span className="text-sm text-zinc-600 px-2">
                    {pagination.page}/{pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages || loading}
                    className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-100 flex items-center gap-1 transition-colors"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===================== EDIT STATUS MODAL ===================== */}
      {showEditModal && editingLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="surface max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Edit Lead Status</h2>
              <button
                onClick={closeAllModals}
                className="p-1 hover:bg-zinc-100 rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-zinc-500">Lead ID: </span>
                <span className="font-mono font-semibold">#{editingLead.id}</span>
              </div>
              <div>
                <span className="text-zinc-500">Name: </span>
                <span className="font-medium">
                  {[editingLead.first_name, editingLead.middle_name, editingLead.surname]
                    .filter(Boolean)
                    .join(" ") || "—"}
                </span>
              </div>
              <div>
                <span className="text-zinc-500">Current Status: </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(editingLead.status)}`}>
                  {editingLead.status}
                </span>
              </div>
              <div>
                <span className="text-zinc-500">Current Stage: </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStageBadgeColor(editingLead.stage)}`}>
                  {editingLead.stage}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700 block mb-2">
                Select New Status & Stage
              </label>
              <select
                value={newStatusId}
                onChange={(e) => setNewStatusId(e.target.value)}
                className="w-full h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Select Status</option>
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.status_name} ({s.status_stage})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleUpdateClick}
                className="flex-1 px-4 py-2.5 bg-black  !text-white text-white rounded-lg hover:bg-zinc-800 text-sm font-medium transition-colors"
              >
                Continue
              </button>
              <button
                onClick={closeAllModals}
                className="flex-1 px-4 py-2.5 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== CONFIRMATION MODAL ===================== */}
      {showConfirmModal && editingLead && selectedStatus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="surface max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-blue-600">Confirm Status Update</h2>
              <button onClick={closeAllModals} className="p-1 hover:bg-zinc-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm font-medium text-blue-900 mb-3">
                You are about to update lead status:
              </p>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex justify-between">
                  <span className="font-medium">Lead ID:</span>
                  <span className="font-mono font-bold">#{editingLead.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span className="font-bold">
                    {[editingLead.first_name, editingLead.middle_name, editingLead.surname]
                      .filter(Boolean)
                      .join(" ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Brand:</span>
                  <span>{selectedBrandData?.name}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">From:</span>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(editingLead.status)}`}>
                        {editingLead.status}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStageBadgeColor(editingLead.stage)}`}>
                        {editingLead.stage}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">To:</span>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(selectedStatus.status_name)}`}>
                        {selectedStatus.status_name}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStageBadgeColor(selectedStatus.status_stage)}`}>
                        {selectedStatus.status_stage}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              {saving ? (
                <div className="flex items-center justify-center h-12 bg-zinc-100 rounded-xl">
                  <Spinner size={20} />
                </div>
              ) : (
                <SlideToConfirm
                  onConfirm={confirmUpdate}
                  text="Slide to update status"
                  successText="Updating..."
                  customColors={{
                    bgColor: "#dbeafe",
                    progressBg: "rgba(59, 130, 246, 0.3)",
                    buttonBg: "#3b82f6",
                    buttonHover: "#2563eb",
                    textColor: "#1e40af",
                  }}
                />
              )}
            </div>

            <button
              onClick={closeAllModals}
              className="w-full px-4 py-2.5 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
