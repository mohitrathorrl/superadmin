"use client"

import { useEffect, useState } from "react"
import { Edit2, Save, X, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import Spinner from "@/components/ui/spinner"
import SlideToConfirm from "@/components/ui/SlideToConfirm"
import { WEBSITE_SETTINGS_API } from "@/lib/api-endpoint"

const KEY_MAP = {
  WHATSAPP_NO: "whatsapp_no",
  INSTAGRAM: "instagram",
  CARE_NO: "care_no",
  SUPPORT_EMAIL: "care_support_email",
  FACEBOOK: "facebook",
  TELEGRAM: "telegram",
  LINKEDIN: "linkedin",
  YOUTUBE: "youtube",
}

export default function WebsiteConfigPage() {
  const [brands, setBrands] = useState([])
  const [selectedBrand, setSelectedBrand] = useState("")
  
  const [configs, setConfigs] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState("edit")
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ key: "", value: "", description: "" })
  
  const [loading, setLoading] = useState(true)
  const [brandsLoading, setBrandsLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  /* ========================= LOAD BRANDS ========================= */
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

  /* ========================= FETCH WEBSITE SETTINGS BY BRAND ========================= */
  const fetchSettings = async (brandId) => {
    if (!brandId) {
      setConfigs([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`${WEBSITE_SETTINGS_API.GET}?company_id=${brandId}`)
      const json = await res.json()
      const d = json.data || {}

      setConfigs([
        { id: 1, key: "WHATSAPP_NO", value: d.whatsapp_no ?? "", description: "WhatsApp number" },
        { id: 2, key: "INSTAGRAM", value: d.instagram ?? "", description: "Instagram link" },
        { id: 3, key: "CARE_NO", value: d.care_no ?? "", description: "Customer care number" },
        { id: 4, key: "SUPPORT_EMAIL", value: d.care_support_email ?? "", description: "Support email" },
        { id: 5, key: "FACEBOOK", value: d.facebook ?? "", description: "Facebook link" },
        { id: 6, key: "TELEGRAM", value: d.telegram ?? "", description: "Telegram link" },
        { id: 7, key: "LINKEDIN", value: d.linkedin ?? "", description: "LinkedIn link" },
        { id: 8, key: "YOUTUBE", value: d.youtube ?? "", description: "YouTube link" },
      ])
    } catch (err) {
      toast.error("Failed to load website settings")
      setConfigs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    if (selectedBrand) {
      fetchSettings(selectedBrand)
    }
  }, [selectedBrand])

  /* ========================= EDIT ========================= */
  const handleEdit = (config) => {
    setEditingId(config.id)
    setFormData(config)
    setModalType("edit")
    setShowModal(true)
  }

  /* ========================= SAVE / DELETE (PUT API) ========================= */
  const savePayload = async (updatedConfigs) => {
    const payload = { company_id: parseInt(selectedBrand) }

    updatedConfigs.forEach((c) => {
      const column = KEY_MAP[c.key]
      if (column) payload[column] = c.value
    })

    const res = await fetch(WEBSITE_SETTINGS_API.UPDATE, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) throw new Error(data.message)
  }

  const handleSave = async () => {
    if (!selectedBrand) {
      toast.error("Please select a brand first")
      return
    }

    if (!formData.value?.trim()) {
      toast.error("Value is required")
      return
    }

    try {
      setSaving(true)

      const updated = configs.map((c) =>
        c.id === editingId ? { ...c, value: formData.value } : c
      )

      await savePayload(updated)
      setConfigs(updated)
      toast.success("Updated successfully")
      setShowModal(false)
    } catch (err) {
      toast.error(err.message || "Update failed")
    } finally {
      setSaving(false)
    }
  }

  const handleRowDelete = (config) => {
    setEditingId(config.id)
    setFormData(config)
    setModalType("delete")
    setShowModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedBrand) {
      toast.error("Please select a brand first")
      return
    }

    try {
      setSaving(true)

      const updated = configs.map((c) =>
        c.id === editingId ? { ...c, value: "" } : c
      )

      await savePayload(updated)
      setConfigs(updated)
      toast.success(`${formData.key} cleared`)
      setShowModal(false)
    } catch (err) {
      toast.error(err.message || "Delete failed")
    } finally {
      setSaving(false)
    }
  }

  /* ========================= LOADING STATE ========================= */
  if (brandsLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size={28} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Website Config</h1>
        <p className="mt-1 text-sm text-zinc-600">Manage website settings</p>
      </div>

      {/* BRAND DROPDOWN */}
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
            <p className="mt-2 text-sm">Choose a brand from the dropdown above to view settings</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Key</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Value</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Description</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {configs.map((config) => (
                  <tr key={config.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4 text-sm font-medium">{config.key}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600 max-w-[420px] truncate">
                      {config.value || <span className="text-zinc-400">—</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      {config.description}
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(config)}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                        title="Edit Setting"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleRowDelete(config)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                        title="Clear Value"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {configs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-zinc-500">
                      No configuration found for this brand
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL - CONSISTENT WITH USER MANAGEMENT */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">

            {/* HEADER */}
            <div className="px-8 py-6 border-b bg-zinc-50">
              <h2 className={`text-2xl font-semibold tracking-tight ${modalType === "delete" ? "text-red-600" : ""}`}>
                {modalType === "edit" ? "Edit Config" : "Clear Value"}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                {brands.find((b) => b.id.toString() === selectedBrand)?.name || "Selected brand"}
              </p>
            </div>

            {/* BODY */}
            <div className="px-8 py-7 space-y-5">
              {/* DELETE MODE - SHOW WARNING */}
              {modalType === "delete" && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-red-900">
                    ⚠️ You are about to clear this value:
                  </p>
                  <p className="text-sm text-red-700 mt-2">
                    <strong>{formData.key}</strong>
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Current: {formData.value || "Empty"}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-zinc-700">Key</label>
                <input
                  disabled
                  value={formData.key}
                  className="mt-2 w-full h-11 rounded-xl border border-zinc-300 px-4 text-sm bg-zinc-100 focus:outline-none"
                />
              </div>

              {/* EDIT MODE - SHOW VALUE INPUT */}
              {modalType === "edit" && (
                <div>
                  <label className="text-sm font-medium text-zinc-700">Value</label>
                  <input
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    placeholder={`Enter ${formData.description.toLowerCase()}`}
                    className="mt-2 w-full h-11 rounded-xl border border-zinc-300 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-zinc-700">Description</label>
                <input
                  disabled
                  value={formData.description}
                  className="mt-2 w-full h-11 rounded-xl border border-zinc-300 px-4 text-sm bg-zinc-100 focus:outline-none"
                />
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-8 py-6 border-t bg-zinc-50 space-y-3">
              {saving ? (
                <div className="flex items-center justify-center h-12 bg-zinc-100 rounded-xl">
                  <Spinner size={20} />
                </div>
              ) : (
                <>
                  {modalType === "edit" ? (
                    <SlideToConfirm
                      onConfirm={handleSave}
                      text="Slide to save changes"
                      successText="Saving..."
                      customColors={{
                        bgColor: "#dbfce7",
                        progressBg: "rgba(34, 197, 94, 0.3)",
                        buttonBg: "#22c55e",
                        buttonHover: "#16a34a",
                        textColor: "#15803d",
                      }}
                    />
                  ) : (
                    <SlideToConfirm
                      onConfirm={handleDeleteConfirm}
                      text="Slide to clear value"
                      successText="Clearing..."
                      customColors={{
                        bgColor: "#fee2e2",
                        progressBg: "rgba(239, 68, 68, 0.3)",
                        buttonBg: "#ef4444",
                        buttonHover: "#dc2626",
                        textColor: "#991b1b",
                      }}
                    />
                  )}
                </>
              )}

              <button
                onClick={() => setShowModal(false)}
                className="w-full h-10 px-6 rounded-xl border border-zinc-300 text-sm text-zinc-700 hover:bg-zinc-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
