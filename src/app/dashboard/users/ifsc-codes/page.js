"use client"

import { useEffect, useState, useRef } from "react"
import { Plus, Trash2, Edit2, X, Search } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"

import { Input } from "@/components/ui/input"
import Spinner from "@/components/ui/spinner"
import SlideToConfirm from "@/components/ui/SlideToConfirm"

/* =========================
   CONSTANTS
========================= */
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/
const LIMIT = 10

export default function IFSCCodesPage() {
  const [codes, setCodes] = useState([])
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)
  const [tableLoading, setTableLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteContext, setDeleteContext] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const [fetchingIFSC, setFetchingIFSC] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    code: "",
    bank: "",
    branch: "",
    address: "",
    city: "",
    district: "",
    state: "",
  })

  const modalRef = useRef(null)

  /* =========================
     MODAL CLOSE ON OUTSIDE CLICK
  ========================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (showModal || showConfirmModal || showDeleteModal) &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        closeAllModals()
      }
    }

    if (showModal || showConfirmModal || showDeleteModal) {
      document.addEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "unset"
    }
  }, [showModal, showConfirmModal, showDeleteModal])

  const closeAllModals = () => {
    setShowModal(false)
    setShowConfirmModal(false)
    setShowDeleteModal(false)
    setDeleteContext(null)
    setEditingId(null)
    setFormData({
      code: "",
      bank: "",
      branch: "",
      address: "",
      city: "",
      district: "",
      state: "",
    })
    setErrors({})
    setFetchingIFSC(false)
    setSaving(false)
  }

  const resetModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({
      code: "",
      bank: "",
      branch: "",
      address: "",
      city: "",
      district: "",
      state: "",
    })
    setErrors({})
    setFetchingIFSC(false)
  }

  /* =========================
     RAZORPAY IFSC FETCH WITH VALIDATION
  ========================= */
  const fetchIFSCFromRazorpay = async (ifsc) => {
    if (!IFSC_REGEX.test(ifsc)) {
      setErrors(prev => ({ ...prev, code: "Invalid IFSC format (e.g., HDFC0001234)" }))
      return
    }

    try {
      setFetchingIFSC(true)
      setErrors(prev => ({ ...prev, code: null }))

      const res = await fetch(`https://ifsc.razorpay.com/${ifsc}`)
      if (!res.ok) throw new Error("IFSC not found")

      const d = await res.json()

      setFormData((prev) => ({
        ...prev,
        bank: d.BANK || "",
        branch: d.BRANCH || "",
        address: d.ADDRESS || "",
        city: d.CITY || "",
        district: d.DISTRICT || "",
        state: d.STATE || "",
      }))

      toast.success("Bank details fetched successfully")
      setErrors({})
    } catch (err) {
      setErrors(prev => ({ ...prev, code: "IFSC not found. Please enter details manually" }))
      toast.error("Unable to fetch IFSC details")
    } finally {
      setFetchingIFSC(false)
    }
  }

  /* =========================
     FETCH LIST
  ========================= */
  const fetchBanks = async (pageNo = 1, search = "") => {
    try {
      setTableLoading(true)
      const res = await fetch(
        `/api/ifsc?page=${pageNo}&limit=${LIMIT}&search=${encodeURIComponent(search)}`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      setCodes(
        data.data.map((b) => ({
          id: b.id,
          code: b.ifsc,
          bank: b.name,
          branch: b.branch,
          address: b.address,
          city: b.city,
          district: b.district,
          state: b.state,
        }))
      )

      setPage(pageNo)
      setHasNext(data.hasNext)
    } catch (err) {
      toast.error(err.message || "Failed to load IFSC data")
    } finally {
      setTableLoading(false)
      setSearchLoading(false)
    }
  }

  useEffect(() => {
    fetchBanks(1, "")
  }, [])

  /* =========================
     SEARCH
  ========================= */
  const handleSearch = () => {
    if (searchLoading) return
    setSearchLoading(true)
    fetchBanks(1, searchQuery.trim())
  }

  /* =========================
     VALIDATION LOGIC
  ========================= */
  const validateForm = () => {
    const newErrors = {}
    const { code, bank, branch, address, city, district, state } = formData

    if (!code?.trim()) {
      newErrors.code = "IFSC code is required"
    } else if (!IFSC_REGEX.test(code.trim())) {
      newErrors.code = "Invalid IFSC format (First 4 letters + 0 + 6 alphanumeric)"
    }

    if (!bank?.trim()) {
      newErrors.bank = "Bank name is required"
    } else if (bank.trim().length < 3) {
      newErrors.bank = "Bank name must be at least 3 characters"
    }

    if (!branch?.trim()) {
      newErrors.branch = "Branch name is required"
    } else if (branch.trim().length < 2) {
      newErrors.branch = "Branch name must be at least 2 characters"
    }

    if (!address?.trim()) {
      newErrors.address = "Address is required"
    } else if (address.trim().length < 5) {
      newErrors.address = "Address must be at least 5 characters"
    }

    if (!city?.trim()) {
      newErrors.city = "City is required"
    } else if (city.trim().length < 2) {
      newErrors.city = "City name must be at least 2 characters"
    }

    if (!district?.trim()) {
      newErrors.district = "District is required"
    } else if (district.trim().length < 2) {
      newErrors.district = "District name must be at least 2 characters"
    }

    if (!state?.trim()) {
      newErrors.state = "State is required"
    } else if (state.trim().length < 2) {
      newErrors.state = "State name must be at least 2 characters"
    }

    return newErrors
  }

  /* =========================
     OPEN CONFIRMATION MODAL
  ========================= */
  const handleSaveClick = () => {
    const validationErrors = validateForm()
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      toast.error(Object.values(validationErrors)[0])
      return
    }

    setShowModal(false)
    setShowConfirmModal(true)
  }

  /* =========================
     SAVE WITH CONFIRMATION
  ========================= */
  const confirmSave = async () => {
    const { code, bank, branch, address, city, district, state } = formData

    try {
      setSaving(true)
      const res = await fetch(
        editingId ? `/api/ifsc?id=${editingId}` : "/api/ifsc",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ifsc: code.trim().toUpperCase(),
            name: bank.trim(),
            branch: branch.trim(),
            address: address.trim(),
            city: city.trim(),
            district: district.trim(),
            state: state.trim(),
          }),
        }
      )

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      toast.success(editingId ? "IFSC updated successfully" : "IFSC added successfully")
      closeAllModals()
      fetchBanks(page, searchQuery)
    } catch (err) {
      toast.error(err.message || "Operation failed")
    } finally {
      setSaving(false)
    }
  }

  /* =========================
     DELETE WITH CONFIRMATION
  ========================= */
  const handleDeleteClick = (code) => {
    setDeleteContext(code)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!deleteContext) return

    try {
      setSaving(true)
      const res = await fetch(`/api/ifsc?id=${deleteContext.id}`, { method: "DELETE" })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.message)
      
      toast.success("IFSC deleted successfully")
      closeAllModals()
      fetchBanks(page, searchQuery)
    } catch (err) {
      toast.error(err.message || "Delete failed")
    } finally {
      setSaving(false)
    }
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">IFSC Management</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Manage bank IFSC codes and branches
        </p>
      </div>

      {/* ACTION BAR */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 w-full sm:w-[420px]">
          <Input
            placeholder="Search IFSC / bank / branch / city"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={searchLoading}
            className="h-9 w-9 border rounded-md flex items-center justify-center hover:bg-zinc-50"
          >
            {searchLoading ? <Spinner size={16} /> : <Search size={16} />}
          </button>
        </div>

        <Button className="btn-primary gap-2" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Add IFSC
        </Button>
      </div>

      {/* TABLE */}
      <div className="surface relative overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50">
              <TableHead className="px-6 py-3">IFSC</TableHead>
              <TableHead className="px-6 py-3">Bank</TableHead>
              <TableHead className="px-6 py-3">Branch</TableHead>
              <TableHead className="px-6 py-3">City</TableHead>
              <TableHead className="px-6 py-3 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {codes.map((row) => (
              <TableRow key={row.id} className="hover:bg-zinc-50">
                <TableCell className="px-6 py-4 font-mono">
                  {row.code}
                </TableCell>
                <TableCell className="px-6 py-4">{row.bank}</TableCell>
                <TableCell className="px-6 py-4">{row.branch}</TableCell>
                <TableCell className="px-6 py-4">{row.city}</TableCell>
                <TableCell className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      setEditingId(row.id)
                      setFormData(row)
                      setShowModal(true)
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(row)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {tableLoading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <Spinner size={28} />
          </div>
        )}

        {!tableLoading && codes.length === 0 && (
          <div className="py-12 text-center text-zinc-500">
            No IFSC codes found. Click "Add IFSC" to create one.
          </div>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => fetchBanks(page - 1, searchQuery)}
        >
          Previous
        </Button>
        <span className="text-sm">Page {page}</span>
        <Button
          variant="outline"
          disabled={!hasNext}
          onClick={() => fetchBanks(page + 1, searchQuery)}
        >
          Next
        </Button>
      </div>

      {/* ================= ADD/EDIT FORM MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div ref={modalRef} className="w-full max-w-[560px] rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}
            <div className="flex items-start justify-between px-6 py-5 border-b">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">
                  {editingId ? "Edit IFSC Code" : "Add IFSC Code"}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Bank IFSC details used for transactions
                </p>
              </div>

              <button
                onClick={resetModal}
                className="text-zinc-400 hover:text-zinc-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* BODY */}
            <div className="px-6 py-6 space-y-5">

              {/* IFSC */}
              <div>
                <label className="text-xs font-medium text-zinc-600">
                  IFSC CODE <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    value={formData.code}
                    onChange={(e) => {
                      const v = e.target.value.toUpperCase()
                      setFormData({ ...formData, code: v })
                      setErrors({ ...errors, code: null })

                      if (v.length === 11) {
                        fetchIFSCFromRazorpay(v)
                      }
                    }}
                    placeholder="HDFC0001234"
                    className={`mt-2 w-full h-11 rounded-xl border px-4 pr-10 font-mono text-sm tracking-wider focus:outline-none ${
                      errors.code
                        ? "border-red-500 focus:border-red-500"
                        : "border-zinc-300 focus:border-black"
                    }`}
                    maxLength={11}
                  />
                  
                  {fetchingIFSC && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-1">
                      <Spinner size={16} />
                    </div>
                  )}
                </div>

                {errors.code ? (
                  <p className="mt-1 text-xs text-red-500">{errors.code}</p>
                ) : (
                  <p className="mt-1 text-xs text-zinc-400">
                    11 character IFSC code (auto-fetches bank details)
                  </p>
                )}
              </div>

              {/* BANK + BRANCH */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-zinc-600">
                    BANK NAME <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={formData.bank}
                    onChange={(e) => {
                      setFormData({ ...formData, bank: e.target.value })
                      setErrors({ ...errors, bank: null })
                    }}
                    className={`mt-2 w-full h-11 rounded-xl border px-4 text-sm focus:outline-none ${
                      errors.bank
                        ? "border-red-500 focus:border-red-500"
                        : "border-zinc-300 focus:border-black"
                    }`}
                    placeholder="HDFC Bank"
                  />
                  {errors.bank && (
                    <p className="mt-1 text-xs text-red-500">{errors.bank}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-600">
                    BRANCH <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={formData.branch}
                    onChange={(e) => {
                      setFormData({ ...formData, branch: e.target.value })
                      setErrors({ ...errors, branch: null })
                    }}
                    className={`mt-2 w-full h-11 rounded-xl border px-4 text-sm focus:outline-none ${
                      errors.branch
                        ? "border-red-500 focus:border-red-500"
                        : "border-zinc-300 focus:border-black"
                    }`}
                    placeholder="Andheri East"
                  />
                  {errors.branch && (
                    <p className="mt-1 text-xs text-red-500">{errors.branch}</p>
                  )}
                </div>
              </div>

              {/* ADDRESS */}
              <div>
                <label className="text-xs font-medium text-zinc-600">
                  ADDRESS <span className="text-red-500">*</span>
                </label>
                <input
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value })
                    setErrors({ ...errors, address: null })
                  }}
                  className={`mt-2 w-full h-11 rounded-xl border px-4 text-sm focus:outline-none ${
                    errors.address
                      ? "border-red-500 focus:border-red-500"
                      : "border-zinc-300 focus:border-black"
                  }`}
                  placeholder="Full branch address"
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-red-500">{errors.address}</p>
                )}
              </div>

              {/* CITY / DISTRICT / STATE */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { key: "city", label: "CITY" },
                  { key: "district", label: "DISTRICT" },
                  { key: "state", label: "STATE" }
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-xs font-medium text-zinc-600">
                      {field.label} <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={formData[field.key]}
                      onChange={(e) => {
                        setFormData({ ...formData, [field.key]: e.target.value })
                        setErrors({ ...errors, [field.key]: null })
                      }}
                      className={`mt-2 w-full h-11 rounded-xl border px-4 text-sm focus:outline-none ${
                        errors[field.key]
                          ? "border-red-500 focus:border-red-500"
                          : "border-zinc-300 focus:border-black"
                      }`}
                    />
                    {errors[field.key] && (
                      <p className="mt-1 text-xs text-red-500">{errors[field.key]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-3 px-6 py-5 border-t bg-zinc-50 rounded-b-2xl">
              <button
                onClick={resetModal}
                className="h-10 px-6 rounded-xl border border-zinc-300 text-sm text-zinc-700 hover:bg-zinc-100"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveClick}
                disabled={fetchingIFSC}
                className="h-10 px-8 rounded-xl bg-black  !text-white text-white text-sm font-medium hover:bg-black/90 disabled:opacity-60"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SAVE CONFIRMATION MODAL ================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="surface max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-green-600">
                {editingId ? "Confirm Update" : "Confirm Add"}
              </h2>
              <button onClick={closeAllModals} className="p-1 hover:bg-zinc-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-medium text-green-900 mb-3">
                {editingId ? "You are about to update IFSC code:" : "You are about to add new IFSC code:"}
              </p>
              <div className="space-y-2 text-sm text-green-700">
                <div className="flex justify-between">
                  <span className="font-medium">IFSC:</span>
                  <span className="font-mono font-bold">{formData.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Bank:</span>
                  <span className="font-bold">{formData.bank}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Branch:</span>
                  <span>{formData.branch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">City:</span>
                  <span>{formData.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">State:</span>
                  <span>{formData.state}</span>
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
                  onConfirm={confirmSave}
                  text={editingId ? "Slide to update IFSC" : "Slide to add IFSC"}
                  successText={editingId ? "Updating..." : "Adding..."}
                  customColors={{
                    bgColor: "#dbfce7",
                    progressBg: "rgba(34, 197, 94, 0.3)",
                    buttonBg: "#22c55e",
                    buttonHover: "#16a34a",
                    textColor: "#15803d",
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

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {showDeleteModal && deleteContext && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="surface max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-red-600">Confirm Delete</h2>
              <button onClick={closeAllModals} className="p-1 hover:bg-zinc-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm font-medium text-red-900 mb-3">
                ⚠️ You are about to delete this IFSC code:
              </p>
              <div className="space-y-2 text-sm text-red-700">
                <div className="flex justify-between">
                  <span className="font-medium">IFSC:</span>
                  <span className="font-mono font-bold">{deleteContext.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Bank:</span>
                  <span className="font-bold">{deleteContext.bank}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Branch:</span>
                  <span>{deleteContext.branch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">City:</span>
                  <span>{deleteContext.city}</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-red-600 font-medium">
                This action cannot be undone!
              </p>
            </div>

            <div className="pt-2">
              {saving ? (
                <div className="flex items-center justify-center h-12 bg-zinc-100 rounded-xl">
                  <Spinner size={20} />
                </div>
              ) : (
                <SlideToConfirm
                  onConfirm={confirmDelete}
                  text="Slide to delete IFSC"
                  successText="Deleting..."
                  customColors={{
                    bgColor: "#fee2e2",
                    progressBg: "rgba(239, 68, 68, 0.3)",
                    buttonBg: "#ef4444",
                    buttonHover: "#dc2626",
                    textColor: "#991b1b",
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
