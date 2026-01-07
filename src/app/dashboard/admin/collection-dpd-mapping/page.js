"use client"

import { useEffect, useState, useRef } from "react"
import { Power, UserCheck, Globe, X, Plus, Pencil } from "lucide-react"
import { toast } from "sonner"

import Spinner from "@/components/ui/spinner"
import SlideToConfirm from "@/components/ui/SlideToConfirm"
import { COLLECTION_DPD_API, BRAND_API } from "@/lib/api-endpoint"

export default function CollectionDPDMappingPage() {
  const [brands, setBrands] = useState([])
  const [users, setUsers] = useState([])
  const [mappings, setMappings] = useState([])
  const [dpdCategories, setDpdCategories] = useState([])

  const [selectedBrand, setSelectedBrand] = useState("all")
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [selectedUser, setSelectedUser] = useState("")
  
  // Custom range modal
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [customStartDPD, setCustomStartDPD] = useState("")
  const [customEndDPD, setCustomEndDPD] = useState("")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // 🔥 Modal states
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showToggleModal, setShowToggleModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [toggleContext, setToggleContext] = useState(null)
  const [editContext, setEditContext] = useState(null)

  // Edit form state
  const [editCategoryId, setEditCategoryId] = useState("")
  const [editUserId, setEditUserId] = useState("")

  const modalRef = useRef(null)

  /* ================= MODAL CLOSE ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (showSaveModal || showToggleModal || showCustomModal || showEditModal) &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        closeAllModals()
      }
    }

    if (showSaveModal || showToggleModal || showCustomModal || showEditModal) {
      document.addEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "unset"
    }
  }, [showSaveModal, showToggleModal, showCustomModal, showEditModal])

  const closeAllModals = () => {
    setShowSaveModal(false)
    setShowToggleModal(false)
    setShowCustomModal(false)
    setShowEditModal(false)
    setToggleContext(null)
    setEditContext(null)
    setSaving(false)
  }

  /* ================= FETCH DATA ================= */
  const fetchBrands = async () => {
    const res = await fetch(BRAND_API.LIST)
    const json = await res.json()
    if (json.success) {
      setBrands(json.data || [])
    }
  }

  const fetchUsers = async () => {
    const res = await fetch(COLLECTION_DPD_API.USERS)
    const json = await res.json()
    setUsers(json.data || [])
  }

  const fetchCategories = async () => {
    const res = await fetch("/api/collection-dpd/categories")
    const json = await res.json()
    setDpdCategories(json.data || [])
  }

  const fetchMappings = async (brandId) => {
    const url = brandId === "all" 
      ? COLLECTION_DPD_API.LIST 
      : `${COLLECTION_DPD_API.LIST}?company_id=${brandId}`
    
    const res = await fetch(url)
    const json = await res.json()
    setMappings(json.data || [])
  }

  useEffect(() => {
    Promise.all([fetchBrands(), fetchUsers(), fetchCategories()])
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (selectedBrand) {
      setLoading(true)
      fetchMappings(selectedBrand)
        .catch(() => toast.error("Failed to load mappings"))
        .finally(() => setLoading(false))
    }
  }, [selectedBrand])

  /* ================= 🔥 ADD CUSTOM CATEGORY (Auto-generates CS code) ================= */
  const handleAddCustomCategory = async () => {
    if (customStartDPD === "" || customEndDPD === "" || isNaN(customStartDPD) || isNaN(customEndDPD)) {
      return toast.error("Valid DPD range is required")
    }

    if (Number(customStartDPD) > Number(customEndDPD)) {
      return toast.error("Start DPD must be less than or equal to End DPD")
    }

    try {
      setSaving(true)

      const res = await fetch("/api/collection-dpd/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_dpd: Number(customStartDPD),
          end_dpd: Number(customEndDPD),
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.message)

      toast.success(json.message)
      setShowCustomModal(false)
      setCustomStartDPD("")
      setCustomEndDPD("")
      fetchCategories()
    } catch (err) {
      toast.error(err.message || "Failed to add custom category")
    } finally {
      setSaving(false)
    }
  }

  /* ================= 🔥 VALIDATE & OPEN SAVE MODAL ================= */
  const handleSaveClick = () => {
    if (!selectedCategoryId) {
      return toast.error("Please select DPD category")
    }

    if (!selectedUser) {
      return toast.error("Please select a collection officer")
    }

    setShowSaveModal(true)
  }

  /* ================= 🔥 SAVE MAPPING WITH CONFIRMATION ================= */
  const confirmSave = async () => {
    try {
      setSaving(true)

      const payload = {
        company_id: selectedBrand,
        dpd_category_id: selectedCategoryId,
        assigned_user_id: selectedUser,
      }

      const res = await fetch(COLLECTION_DPD_API.ADD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.message)

      toast.success(json.message || "Saved successfully")
      resetForm()
      fetchMappings(selectedBrand)
      closeAllModals()
    } catch (err) {
      toast.error(err.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }

  /* ================= 🔥 EDIT MAPPING ================= */
  const handleEditClick = (mapping) => {
    setEditContext(mapping)
    setEditCategoryId(mapping.dpd_category_id.toString())
    setEditUserId(mapping.assigned_user_id.toString())
    setShowEditModal(true)
  }

  const confirmEdit = async () => {
    if (!editCategoryId) {
      return toast.error("Please select DPD category")
    }

    if (!editUserId) {
      return toast.error("Please select a collection officer")
    }

    try {
      setSaving(true)

      const payload = {
        id: editContext.id,
        company_id: editContext.company_id,
        dpd_category_id: editCategoryId,
        assigned_user_id: editUserId,
        active: editContext.active,
      }

      const res = await fetch(COLLECTION_DPD_API.UPDATE, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.message)

      toast.success(json.message)
      fetchMappings(selectedBrand)
      closeAllModals()
    } catch (err) {
      toast.error(err.message || "Update failed")
    } finally {
      setSaving(false)
    }
  }

  /* ================= 🔥 TOGGLE ACTIVE/INACTIVE ================= */
  const handleToggleClick = (mapping) => {
    setToggleContext(mapping)
    setShowToggleModal(true)
  }

  const confirmToggle = async () => {
    if (!toggleContext) return

    try {
      setSaving(true)

      const newStatus = toggleContext.active === 1 ? 0 : 1

      const res = await fetch(COLLECTION_DPD_API.UPDATE, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: toggleContext.id,
          active: newStatus,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.message)

      toast.success(json.message)
      fetchMappings(selectedBrand)
      closeAllModals()
    } catch (err) {
      toast.error(err.message || "Toggle failed")
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setSelectedCategoryId("")
    setSelectedUser("")
  }

  /* ================= LOADING ================= */
  if (loading && !brands.length) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size={28} />
      </div>
    )
  }

  const selectedCategory = dpdCategories.find(c => c.id.toString() === selectedCategoryId)
  const editSelectedCategory = dpdCategories.find(c => c.id.toString() === editCategoryId)

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Collection DPD Mapping</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Assign collection officers to DPD categories (CS1, CS2, CS3, CS4, etc.)
          </p>
        </div>
        <button
          onClick={() => setShowCustomModal(true)}
          className="h-10 px-4 rounded-xl bg-zinc-800  !text-white text-white text-sm font-medium hover:bg-zinc-900 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Custom Range
        </button>
      </div>

      {/* BRAND SELECTOR */}
      <div className="surface p-6">
        <label className="text-sm font-medium text-zinc-700 block mb-2">
          Select Brand
        </label>
        <select
          value={selectedBrand}
          onChange={(e) => {
            setSelectedBrand(e.target.value)
            resetForm()
          }}
          className="w-72 h-11 rounded-xl border border-zinc-300 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="all">All Brands (Global)</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.code})
            </option>
          ))}
        </select>
      </div>

      {/* FORM */}
      <div className="surface p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* DPD Category */}
          <div>
            <label className="text-sm font-medium text-zinc-700 block mb-1">
              DPD Category
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full h-11 rounded-xl border border-zinc-300 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Select category</option>
              {dpdCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.dpd_category} - {cat.dpd_range}
                </option>
              ))}
            </select>
          </div>

          {/* DPD Range Display */}
          <div>
            <label className="text-sm font-medium text-zinc-700 block mb-1">
              DPD Range
            </label>
            <input
              type="text"
              disabled
              value={selectedCategory ? `${selectedCategory.start_dpd} to ${selectedCategory.end_dpd}` : ""}
              placeholder="Select category first"
              className="w-full h-11 rounded-xl border border-zinc-300 px-4 text-sm bg-zinc-100 focus:outline-none"
            />
          </div>

          {/* Collection Officer */}
          <div>
            <label className="text-sm font-medium text-zinc-700 block mb-1">
              Collection Officer
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full h-11 rounded-xl border border-zinc-300 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Select officer</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.roles})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSaveClick}
          disabled={saving}
          className="h-11 px-8 rounded-xl bg-black  !text-white text-white text-sm font-medium hover:bg-black/90 disabled:opacity-60"
        >
          Add Mapping
        </button>
      </div>

      {/* TABLE */}
      <div className="surface overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size={24} />
          </div>
        ) : mappings.length === 0 ? (
          <div className="py-12 text-center text-zinc-500">
            <UserCheck className="h-12 w-12 mx-auto mb-3 text-zinc-400" />
            <p className="text-lg font-medium">No mappings found</p>
            <p className="mt-2 text-sm">
              Add a DPD mapping using the form above
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Brand</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">CS Code</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">DPD Range</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Collection Officer</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Role</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {mappings.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4">
                      {m.company_id ? (
                        <>
                          <div className="text-sm font-medium">{m.brand_name}</div>
                          <div className="text-xs text-zinc-500">{m.brand_code}</div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-zinc-600" />
                          <span className="text-sm font-medium text-black">All Brands</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded text-sm font-bold">
                        {m.dpd_category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded font-mono text-xs">
                        {m.start_dpd} to {m.end_dpd}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">{m.user_name}</div>
                      <div className="text-xs text-zinc-500">{m.designation}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">
                        {m.user_roles}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {m.active === 1 ? (
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-1 rounded text-xs font-medium">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(m)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                          title="Edit mapping"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleClick(m)}
                          className={`p-2 rounded-lg ${
                            m.active === 1 
                              ? 'hover:bg-red-50 text-red-600' 
                              : 'hover:bg-green-50 text-green-600'
                          }`}
                          title={m.active === 1 ? 'Deactivate' : 'Activate'}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===================== 🔥 CUSTOM CATEGORY MODAL ===================== */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div ref={modalRef} className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b bg-zinc-50">
              <h2 className="text-2xl font-semibold tracking-tight">Add Custom DPD Range</h2>
              <p className="mt-1 text-sm text-zinc-500">System will auto-generate CS code (e.g., CS5, CS6)</p>
            </div>

            <div className="px-8 py-7 space-y-5">
              <div>
                <label className="text-sm font-medium text-zinc-700">Start DPD</label>
                <input
                  type="number"
                  value={customStartDPD}
                  onChange={(e) => setCustomStartDPD(e.target.value)}
                  placeholder="e.g., 100"
                  className="mt-2 w-full h-11 rounded-xl border border-zinc-300 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700">End DPD</label>
                <input
                  type="number"
                  value={customEndDPD}
                  onChange={(e) => setCustomEndDPD(e.target.value)}
                  placeholder="e.g., 150"
                  className="mt-2 w-full h-11 rounded-xl border border-zinc-300 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {customStartDPD && customEndDPD && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                  <p className="text-sm text-indigo-900">
                    <strong>Preview:</strong> System will create a new CS code for range <span className="font-mono">{customStartDPD} to {customEndDPD}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="px-8 py-6 border-t bg-zinc-50 flex justify-end gap-3">
              <button
                onClick={() => setShowCustomModal(false)}
                className="h-10 px-6 rounded-xl border border-zinc-300 text-sm text-zinc-700 hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomCategory}
                disabled={saving}
                className="h-10 px-8 rounded-xl bg-black !text-white text-white text-sm font-medium hover:bg-black/90 disabled:opacity-60"
              >
                {saving ? "Adding..." : "Add Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 🔥 SAVE CONFIRMATION MODAL ===================== */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="surface max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Confirm Add Mapping</h2>
              <button onClick={closeAllModals} className="p-1 hover:bg-zinc-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-medium text-green-900">
                You are about to add DPD mapping:
              </p>
              <div className="mt-3 space-y-2 text-sm text-green-700">
                <div className="flex justify-between">
                  <span className="font-medium">Brand:</span>
                  <span>{selectedBrand === "all" ? "All Brands (Global)" : brands.find(b => b.id.toString() === selectedBrand)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">CS Code:</span>
                  <span className="font-bold">{selectedCategory?.dpd_category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Range:</span>
                  <span className="font-mono">{selectedCategory?.start_dpd} to {selectedCategory?.end_dpd} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Officer:</span>
                  <span>{users.find(u => u.id.toString() === selectedUser)?.name}</span>
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
                  text="Slide to add mapping"
                  successText="Adding..."
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

      {/* ===================== 🔥 EDIT MAPPING MODAL ===================== */}
      {showEditModal && editContext && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="surface max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-blue-600">Edit Mapping</h2>
              <button onClick={closeAllModals} className="p-1 hover:bg-zinc-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm font-medium text-blue-900 mb-3">
                Editing mapping for: <strong>{editContext.company_id ? editContext.brand_name : "All Brands"}</strong>
              </p>

              <div className="space-y-4">
                {/* DPD Category */}
                <div>
                  <label className="text-sm font-medium text-blue-900 block mb-2">
                    DPD Category
                  </label>
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    className="w-full h-10 rounded-lg border border-blue-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {dpdCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.dpd_category} - {cat.dpd_range}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DPD Range Display */}
                {editSelectedCategory && (
                  <div className="text-xs text-blue-700 bg-blue-100 px-3 py-2 rounded">
                    Range: <span className="font-mono font-bold">{editSelectedCategory.start_dpd} to {editSelectedCategory.end_dpd} days</span>
                  </div>
                )}

                {/* Collection Officer */}
                <div>
                  <label className="text-sm font-medium text-blue-900 block mb-2">
                    Collection Officer
                  </label>
                  <select
                    value={editUserId}
                    onChange={(e) => setEditUserId(e.target.value)}
                    className="w-full h-10 rounded-lg border border-blue-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select officer</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.roles})
                      </option>
                    ))}
                  </select>
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
                  onConfirm={confirmEdit}
                  text="Slide to update mapping"
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

      {/* ===================== 🔥 TOGGLE CONFIRMATION MODAL ===================== */}
      {showToggleModal && toggleContext && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="surface max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-bold ${toggleContext.active === 1 ? 'text-red-600' : 'text-green-600'}`}>
                Confirm {toggleContext.active === 1 ? 'Deactivate' : 'Activate'}
              </h2>
              <button onClick={closeAllModals} className="p-1 hover:bg-zinc-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className={`border rounded-xl p-4 ${toggleContext.active === 1 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <p className={`text-sm font-medium ${toggleContext.active === 1 ? 'text-red-900' : 'text-green-900'}`}>
                {toggleContext.active === 1 ? '⚠️ You are about to deactivate:' : '✓ You are about to activate:'}
              </p>
              <div className={`mt-3 space-y-2 text-sm ${toggleContext.active === 1 ? 'text-red-700' : 'text-green-700'}`}>
                <div className="flex justify-between">
                  <span className="font-medium">Brand:</span>
                  <span>{toggleContext.company_id ? toggleContext.brand_name : "All Brands"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">CS Code:</span>
                  <span className="font-bold">{toggleContext.dpd_category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Range:</span>
                  <span className="font-mono">{toggleContext.start_dpd} to {toggleContext.end_dpd} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Officer:</span>
                  <span>{toggleContext.user_name}</span>
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
                  onConfirm={confirmToggle}
                  text={`Slide to ${toggleContext.active === 1 ? 'deactivate' : 'activate'}`}
                  successText={toggleContext.active === 1 ? "Deactivating..." : "Activating..."}
                  customColors={
                    toggleContext.active === 1
                      ? {
                          bgColor: "#fee2e2",
                          progressBg: "rgba(239, 68, 68, 0.3)",
                          buttonBg: "#ef4444",
                          buttonHover: "#dc2626",
                          textColor: "#991b1b",
                        }
                      : {
                          bgColor: "#dbfce7",
                          progressBg: "rgba(34, 197, 94, 0.3)",
                          buttonBg: "#22c55e",
                          buttonHover: "#16a34a",
                          textColor: "#15803d",
                        }
                  }
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
