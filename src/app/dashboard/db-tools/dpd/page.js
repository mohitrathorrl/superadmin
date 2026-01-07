"use client"

import { useEffect, useState, useRef } from "react"
import { Plus, Edit2, Trash2, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import Spinner from "@/components/ui/spinner"
import SlideToConfirm from "@/components/ui/SlideToConfirm"
import { DPD_API } from "@/lib/api-endpoint"
import { BRAND_API } from "@/lib/api-endpoint"

export default function DPDManagePage() {
  const [brands, setBrands] = useState([])
  const [selectedBrand, setSelectedBrand] = useState("")
  
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [brandsLoading, setBrandsLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteContext, setDeleteContext] = useState(null)
  const [editingId, setEditingId] = useState(null)

  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    company_id: "",
    name: "",
    start_dpd: "",
    end_dpd: "",
    percentage: "",
  })

  const modalRef = useRef(null)

  /* ================= MODAL CLOSE ON OUTSIDE CLICK ================= */
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
    setSaving(false)
  }

  /* ================= LOAD BRANDS ================= */
  const fetchBrands = async () => {
    try {
      setBrandsLoading(true)
      const res = await fetch(BRAND_API.LIST)
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
  }

  /* ================= FETCH DPD BY BRAND ================= */
  const fetchDPD = async (brandId) => {
    if (!brandId) {
      setRows([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`${DPD_API.LIST}?company_id=${brandId}`)
      const json = await res.json()
      
      if (!res.ok) throw new Error(json.message)
      
      setRows(json.data || [])
    } catch (err) {
      toast.error(err.message || "Failed to load DPD rules")
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    if (selectedBrand) {
      fetchDPD(selectedBrand)
    }
  }, [selectedBrand])

  /* ================= ADD / EDIT ================= */
  const openAdd = () => {
    if (!selectedBrand) {
      toast.error("Please select a brand first")
      return
    }
    
    setEditingId(null)
    setForm({
      company_id: selectedBrand,
      name: "",
      start_dpd: "",
      end_dpd: "",
      percentage: "",
    })
    setErrors({})
    setShowModal(true)
  }

  const openEdit = (row) => {
    setEditingId(row.id)
    setForm({
      company_id: row.company_id.toString(),
      name: row.name,
      start_dpd: row.start_dpd,
      end_dpd: row.end_dpd,
      percentage: row.percentage,
    })
    setErrors({})
    setShowModal(true)
  }

  /* ================= VALIDATION ================= */
  const validateForm = () => {
    const newErrors = {}

    if (!form.company_id) {
      newErrors.company_id = "Brand is required"
    }

    if (!form.name?.trim()) {
      newErrors.name = "Name is required"
    } else if (form.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters"
    }

    if (form.start_dpd === "" || form.start_dpd === null || form.start_dpd === undefined) {
      newErrors.start_dpd = "Start DPD is required"
    } else if (isNaN(parseInt(form.start_dpd))) {
      newErrors.start_dpd = "Start DPD must be a number"
    }

    if (form.end_dpd === "" || form.end_dpd === null || form.end_dpd === undefined) {
      newErrors.end_dpd = "End DPD is required"
    } else if (isNaN(parseInt(form.end_dpd))) {
      newErrors.end_dpd = "End DPD must be a number"
    }

    if (!newErrors.start_dpd && !newErrors.end_dpd) {
      if (parseInt(form.start_dpd) > parseInt(form.end_dpd)) {
        newErrors.end_dpd = "End DPD must be greater than or equal to Start DPD"
      }
    }

    if (form.percentage === "" || form.percentage === null || form.percentage === undefined) {
      newErrors.percentage = "Percentage is required"
    } else {
      const pct = parseFloat(form.percentage)
      if (isNaN(pct)) {
        newErrors.percentage = "Percentage must be a number"
      } else if (pct < 0 || pct > 500) {
        newErrors.percentage = "Percentage must be between 0 and 500"
      }
    }

    return newErrors
  }

  /* ================= OPEN CONFIRMATION MODAL ================= */
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

  /* ================= SAVE WITH CONFIRMATION ================= */
  const confirmSave = async () => {
    try {
      setSaving(true)

      const res = await fetch(editingId ? DPD_API.UPDATE : DPD_API.ADD, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          company_id: parseInt(form.company_id),
          name: form.name.trim(),
          start_dpd: parseInt(form.start_dpd),
          end_dpd: parseInt(form.end_dpd),
          percentage: parseFloat(form.percentage),
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      toast.success(editingId ? "DPD rule updated successfully" : "DPD rule added successfully")
      closeAllModals()
      setErrors({})
      fetchDPD(selectedBrand)
    } catch (err) {
      toast.error(err.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }

  /* ================= DELETE WITH CONFIRMATION ================= */
  const handleDeleteClick = (row) => {
    setDeleteContext(row)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!deleteContext) return

    try {
      setSaving(true)

      const res = await fetch(DPD_API.DELETE(deleteContext.id), { method: "DELETE" })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.message)
      
      toast.success("DPD rule deleted successfully")
      closeAllModals()
      fetchDPD(selectedBrand)
    } catch (err) {
      toast.error(err.message || "Delete failed")
    } finally {
      setSaving(false)
    }
  }

  /* ================= LOADING STATE ================= */
  if (brandsLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size={28} />
      </div>
    )
  }

  const selectedBrandData = brands.find((b) => b.id.toString() === form.company_id)

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">DPD Configuration</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Days Past Due (DPD) based approval percentage rules
          </p>
        </div>

        <Button 
          className="btn-primary gap-2" 
          onClick={openAdd}
          disabled={!selectedBrand}
        >
          <Plus className="h-4 w-4" />
          Add DPD Rule
        </Button>
      </div>

      {/* BRAND SELECTOR */}
      <div className="surface p-6">
        <label className="text-sm font-medium text-zinc-700 block mb-2">
          Select Brand
        </label>
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="w-full md:w-80 h-11 rounded-xl border border-zinc-300 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">Select a brand</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name} ({brand.code})
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="surface overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size={24} />
          </div>
        ) : !selectedBrand ? (
          <div className="py-12 text-center text-zinc-500">
            <p className="text-lg font-medium">Please select a brand</p>
            <p className="mt-2 text-sm">Choose a brand from the dropdown above to view DPD rules</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Start DPD</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">End DPD</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Percentage</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {rows.length > 0 ? (
                  rows.map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-50">
                      <td className="px-6 py-4 text-sm font-medium">{r.name}</td>
                      <td className="px-6 py-4 text-sm text-center font-mono">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {r.start_dpd}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center font-mono">
                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                          {r.end_dpd}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center font-mono">
                        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">
                          {r.percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(r)}
                            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                            title="Edit DPD Rule"
                          >
                            <Edit2 className="h-4 w-4"/>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(r)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                            title="Delete DPD Rule"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-zinc-500">
                      No DPD rules found for this brand. Click "Add DPD Rule" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===================== ADD/EDIT FORM MODAL ===================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div ref={modalRef} className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden">

            {/* HEADER */}
            <div className="px-8 py-6 border-b bg-zinc-50">
              <h2 className="text-2xl font-semibold tracking-tight">
                {editingId ? "Edit DPD Rule" : "Add DPD Rule"}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Configure Days Past Due (DPD) approval percentage for{" "}
                {selectedBrandData?.name || "selected brand"}
              </p>
            </div>

            {/* BODY */}
            <div className="px-8 py-7 space-y-6">

              {/* NAME */}
              <div>
                <label className="text-sm font-medium text-zinc-700">
                  Rule Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value })
                    setErrors({ ...errors, name: null })
                  }}
                  placeholder="Between 1 to 5 DPD"
                  className={`mt-2 w-full h-11 rounded-xl border px-4 text-sm focus:outline-none focus:ring-2 ${
                    errors.name
                      ? "border-red-500 focus:ring-red-500"
                      : "border-zinc-300 focus:ring-black"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              {/* DPD RANGE */}
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-2">
                  DPD Range <span className="text-red-500">*</span>
                </label>

                <div className="grid grid-cols-2 gap-4">
                  {/* Start DPD */}
                  <div>
                    <input
                      type="number"
                      value={form.start_dpd}
                      onChange={(e) => {
                        setForm({ ...form, start_dpd: e.target.value })
                        setErrors({ ...errors, start_dpd: null })
                      }}
                      placeholder="Start DPD"
                      className={`w-full h-11 rounded-xl border px-4 text-sm text-center focus:outline-none focus:ring-2 ${
                        errors.start_dpd
                          ? "border-red-500 focus:ring-red-500"
                          : "border-zinc-300 focus:ring-black"
                      }`}
                    />
                    {errors.start_dpd && (
                      <p className="mt-1 text-xs text-red-500">{errors.start_dpd}</p>
                    )}
                  </div>

                  {/* End DPD */}
                  <div>
                    <input
                      type="number"
                      value={form.end_dpd}
                      onChange={(e) => {
                        setForm({ ...form, end_dpd: e.target.value })
                        setErrors({ ...errors, end_dpd: null })
                      }}
                      placeholder="End DPD"
                      className={`w-full h-11 rounded-xl border px-4 text-sm text-center focus:outline-none focus:ring-2 ${
                        errors.end_dpd
                          ? "border-red-500 focus:ring-red-500"
                          : "border-zinc-300 focus:ring-black"
                      }`}
                    />
                    {errors.end_dpd && (
                      <p className="mt-1 text-xs text-red-500">{errors.end_dpd}</p>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  ℹ️ Start DPD must be less than or equal to End DPD
                </p>
              </div>

              {/* PERCENTAGE */}
              <div>
                <label className="text-sm font-medium text-zinc-700">
                  Approval Percentage (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  step="0.01"
                  value={form.percentage}
                  onChange={(e) => {
                    setForm({ ...form, percentage: e.target.value })
                    setErrors({ ...errors, percentage: null })
                  }}
                  placeholder="100"
                  className={`mt-2 w-full h-11 rounded-xl border px-4 text-sm focus:outline-none focus:ring-2 ${
                    errors.percentage
                      ? "border-red-500 focus:ring-red-500"
                      : "border-zinc-300 focus:ring-black"
                  }`}
                />
                {errors.percentage ? (
                  <p className="mt-1 text-xs text-red-500">{errors.percentage}</p>
                ) : (
                  <p className="mt-1 text-xs text-zinc-500">
                    Enter percentage between 0 and 500
                  </p>
                )}
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-8 py-6 border-t bg-zinc-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setErrors({})
                }}
                className="h-10 px-6 rounded-xl border border-zinc-300 text-sm text-zinc-700 hover:bg-zinc-100"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveClick}
                className="h-10 px-8 rounded-xl bg-black !text-white text-white text-sm font-medium hover:bg-black/90"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== SAVE CONFIRMATION MODAL ===================== */}
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
                {editingId ? "You are about to update DPD rule:" : "You are about to add DPD rule:"}
              </p>
              <div className="space-y-2 text-sm text-green-700">
                <div className="flex justify-between">
                  <span className="font-medium">Brand:</span>
                  <span>{selectedBrandData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Rule Name:</span>
                  <span className="font-bold">{form.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">DPD Range:</span>
                  <span className="font-mono">{form.start_dpd} to {form.end_dpd}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Percentage:</span>
                  <span className="font-bold">{form.percentage}%</span>
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
                  text={editingId ? "Slide to update rule" : "Slide to add rule"}
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

      {/* ===================== DELETE CONFIRMATION MODAL ===================== */}
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
                ⚠️ You are about to delete this DPD rule:
              </p>
              <div className="space-y-2 text-sm text-red-700">
                <div className="flex justify-between">
                  <span className="font-medium">Rule Name:</span>
                  <span className="font-bold">{deleteContext.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">DPD Range:</span>
                  <span className="font-mono">{deleteContext.start_dpd} to {deleteContext.end_dpd}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Percentage:</span>
                  <span className="font-bold">{deleteContext.percentage}%</span>
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
                  text="Slide to delete rule"
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
