"use client"

import { useEffect, useState, useRef } from "react"
import { Plus, Edit2, Trash2, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import Spinner from "@/components/ui/spinner"
import SlideToConfirm from "@/components/ui/SlideToConfirm"

export default function FOIRManagePage() {
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
    category: "",
    parameter: "",
    s25_35: "",
    s35_50: "",
    s50: "",
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
    setErrors({})
  }

  /* ================= LOAD BRANDS ================= */
  const fetchBrands = async () => {
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
  }

  /* ================= FETCH FOIR BY BRAND ================= */
  const fetchFOIR = async (brandId) => {
    if (!brandId) {
      setRows([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`/api/foir?company_id=${brandId}`)
      const json = await res.json()
      
      if (!res.ok) throw new Error(json.message)
      
      setRows(json.data || [])
    } catch (err) {
      toast.error(err.message || "Failed to load FOIR rules")
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
      fetchFOIR(selectedBrand)
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
      category: "",
      parameter: "",
      s25_35: "",
      s35_50: "",
      s50: "",
    })
    setErrors({})
    setShowModal(true)
  }

  const openEdit = (row) => {
    setEditingId(row.id)
    setForm({
      company_id: row.company_id.toString(),
      category: row.category,
      parameter: row.parameter,
      s25_35: row.moreThanEqualsto_25k_and_lessThan35k,
      s35_50: row.moreThanEqualsto_35k_and_lessThan50k,
      s50: row.moreThanEqualsto_50k,
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

    if (!form.category?.trim()) {
      newErrors.category = "Category is required"
    }

    if (!form.parameter?.trim()) {
      newErrors.parameter = "Parameter is required"
    }

    // Optional: Validate percentage values
    if (form.s25_35 && (isNaN(parseFloat(form.s25_35)) || parseFloat(form.s25_35) < 0 || parseFloat(form.s25_35) > 100)) {
      newErrors.s25_35 = "Must be between 0 and 100"
    }

    if (form.s35_50 && (isNaN(parseFloat(form.s35_50)) || parseFloat(form.s35_50) < 0 || parseFloat(form.s35_50) > 100)) {
      newErrors.s35_50 = "Must be between 0 and 100"
    }

    if (form.s50 && (isNaN(parseFloat(form.s50)) || parseFloat(form.s50) < 0 || parseFloat(form.s50) > 100)) {
      newErrors.s50 = "Must be between 0 and 100"
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

      const res = await fetch("/api/foir", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          company_id: parseInt(form.company_id),
          category: form.category.trim(),
          parameter: form.parameter.trim(),
          moreThanEqualsto_25k_and_lessThan35k: form.s25_35 || 0,
          moreThanEqualsto_35k_and_lessThan50k: form.s35_50 || 0,
          moreThanEqualsto_50k: form.s50 || 0,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      toast.success(editingId ? "FOIR rule updated successfully" : "FOIR rule added successfully")
      closeAllModals()
      fetchFOIR(selectedBrand)
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

      const res = await fetch(`/api/foir?id=${deleteContext.id}`, { method: "DELETE" })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.message)
      
      toast.success("FOIR rule deleted successfully")
      closeAllModals()
      fetchFOIR(selectedBrand)
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
          <h1 className="text-3xl font-bold">FOIR Configuration</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Salary based FOIR rules
          </p>
        </div>

        <Button 
          className="btn-primary gap-2" 
          onClick={openAdd}
          disabled={!selectedBrand}
        >
          <Plus className="h-4 w-4" />
          Add FOIR
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
            <p className="mt-2 text-sm">Choose a brand from the dropdown above to view FOIR rules</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Parameter</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">25–35k</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">35–50k</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">50k+</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {rows.length > 0 ? (
                  rows.map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-50">
                      <td className="px-6 py-4 text-sm font-medium">{r.category}</td>
                      <td className="px-6 py-4 text-sm text-zinc-600">{r.parameter}</td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {r.moreThanEqualsto_25k_and_lessThan35k}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                          {r.moreThanEqualsto_35k_and_lessThan50k}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">
                          {r.moreThanEqualsto_50k}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(r)}
                            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                            title="Edit FOIR Rule"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(r)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                            title="Delete FOIR Rule"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-zinc-500">
                      No FOIR rules found for this brand. Click "Add FOIR" to create one.
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
                {editingId ? "Edit FOIR Rule" : "Add FOIR Rule"}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Configure salary-based FOIR limits for{" "}
                {selectedBrandData?.name || "selected brand"}
              </p>
            </div>

            {/* BODY */}
            <div className="px-8 py-7 space-y-6">

              {/* CATEGORY */}
              <div>
                <label className="text-sm font-medium text-zinc-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.category}
                  onChange={(e) => {
                    setForm({ ...form, category: e.target.value })
                    setErrors({ ...errors, category: null })
                  }}
                  placeholder="CAT A"
                  className={`mt-2 w-full h-11 rounded-xl border px-4 text-sm focus:outline-none focus:ring-2 ${
                    errors.category
                      ? "border-red-500 focus:ring-red-500"
                      : "border-zinc-300 focus:ring-black"
                  }`}
                />
                {errors.category && (
                  <p className="mt-1 text-xs text-red-500">{errors.category}</p>
                )}
              </div>

              {/* PARAMETER */}
              <div>
                <label className="text-sm font-medium text-zinc-700">
                  Parameter <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.parameter}
                  onChange={(e) => {
                    setForm({ ...form, parameter: e.target.value })
                    setErrors({ ...errors, parameter: null })
                  }}
                  placeholder="Official Mail + Owned House"
                  className={`mt-2 w-full h-11 rounded-xl border px-4 text-sm focus:outline-none focus:ring-2 ${
                    errors.parameter
                      ? "border-red-500 focus:ring-red-500"
                      : "border-zinc-300 focus:ring-black"
                  }`}
                />
                {errors.parameter && (
                  <p className="mt-1 text-xs text-red-500">{errors.parameter}</p>
                )}
              </div>

              {/* SALARY SLABS */}
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-2">
                  Salary Slabs (%)
                </label>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={form.s25_35}
                      onChange={(e) => {
                        setForm({ ...form, s25_35: e.target.value })
                        setErrors({ ...errors, s25_35: null })
                      }}
                      placeholder="0"
                      className={`w-full h-11 rounded-xl border px-3 text-sm text-center focus:outline-none focus:ring-2 ${
                        errors.s25_35
                          ? "border-red-500 focus:ring-red-500"
                          : "border-zinc-300 focus:ring-black"
                      }`}
                    />
                    <p className="mt-1 text-xs text-center text-zinc-500">25–35k</p>
                    {errors.s25_35 && (
                      <p className="mt-1 text-xs text-center text-red-500">{errors.s25_35}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={form.s35_50}
                      onChange={(e) => {
                        setForm({ ...form, s35_50: e.target.value })
                        setErrors({ ...errors, s35_50: null })
                      }}
                      placeholder="0"
                      className={`w-full h-11 rounded-xl border px-3 text-sm text-center focus:outline-none focus:ring-2 ${
                        errors.s35_50
                          ? "border-red-500 focus:ring-red-500"
                          : "border-zinc-300 focus:ring-black"
                      }`}
                    />
                    <p className="mt-1 text-xs text-center text-zinc-500">35–50k</p>
                    {errors.s35_50 && (
                      <p className="mt-1 text-xs text-center text-red-500">{errors.s35_50}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={form.s50}
                      onChange={(e) => {
                        setForm({ ...form, s50: e.target.value })
                        setErrors({ ...errors, s50: null })
                      }}
                      placeholder="0"
                      className={`w-full h-11 rounded-xl border px-3 text-sm text-center focus:outline-none focus:ring-2 ${
                        errors.s50
                          ? "border-red-500 focus:ring-red-500"
                          : "border-zinc-300 focus:ring-black"
                      }`}
                    />
                    <p className="mt-1 text-xs text-center text-zinc-500">50k+</p>
                    {errors.s50 && (
                      <p className="mt-1 text-xs text-center text-red-500">{errors.s50}</p>
                    )}
                  </div>
                </div>
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
                {editingId ? "You are about to update FOIR rule:" : "You are about to add FOIR rule:"}
              </p>
              <div className="space-y-2 text-sm text-green-700">
                <div className="flex justify-between">
                  <span className="font-medium">Brand:</span>
                  <span>{selectedBrandData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Category:</span>
                  <span className="font-bold">{form.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Parameter:</span>
                  <span>{form.parameter}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="font-medium mb-2">Salary Slabs:</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-green-100 p-2 rounded text-center">
                      <div className="font-medium">25-35k</div>
                      <div className="font-bold">{form.s25_35 || 0}%</div>
                    </div>
                    <div className="bg-green-100 p-2 rounded text-center">
                      <div className="font-medium">35-50k</div>
                      <div className="font-bold">{form.s35_50 || 0}%</div>
                    </div>
                    <div className="bg-green-100 p-2 rounded text-center">
                      <div className="font-medium">50k+</div>
                      <div className="font-bold">{form.s50 || 0}%</div>
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
                ⚠️ You are about to delete this FOIR rule:
              </p>
              <div className="space-y-2 text-sm text-red-700">
                <div className="flex justify-between">
                  <span className="font-medium">Category:</span>
                  <span className="font-bold">{deleteContext.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Parameter:</span>
                  <span>{deleteContext.parameter}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-red-200">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-red-100 p-2 rounded text-center">
                      <div className="font-medium">25-35k</div>
                      <div className="font-bold">{deleteContext.moreThanEqualsto_25k_and_lessThan35k}%</div>
                    </div>
                    <div className="bg-red-100 p-2 rounded text-center">
                      <div className="font-medium">35-50k</div>
                      <div className="font-bold">{deleteContext.moreThanEqualsto_35k_and_lessThan50k}%</div>
                    </div>
                    <div className="bg-red-100 p-2 rounded text-center">
                      <div className="font-medium">50k+</div>
                      <div className="font-bold">{deleteContext.moreThanEqualsto_50k}%</div>
                    </div>
                  </div>
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
