"use client"

import { useEffect, useState, useRef } from "react"
import { Edit2, Trash2, Plus, X } from "lucide-react"
import { toast } from "sonner"

import Spinner from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import SlideToConfirm from "@/components/ui/SlideToConfirm"

const loanAmounts = [
  5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000,
  60000, 70000, 80000, 90000, 100000
]

export default function LMSSettingsPage() {
  const [companies, setCompanies] = useState([])
  const [selectedCompany, setSelectedCompany] = useState("")
  const [currentSetting, setCurrentSetting] = useState(null)
  const [selectedAmount, setSelectedAmount] = useState("")
  
  const [loading, setLoading] = useState(true)
  const [companiesLoading, setCompaniesLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)

  // 🔥 Slide confirmation modals
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const modalRef = useRef(null)

  /* ================= MODAL CLOSE ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (showSaveConfirmModal || showDeleteModal) &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        closeConfirmationModals()
      }
    }

    if (showSaveConfirmModal || showDeleteModal) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showSaveConfirmModal, showDeleteModal])

  const closeConfirmationModals = () => {
    setShowSaveConfirmModal(false)
    setShowDeleteModal(false)
    setSaving(false)
  }

  // Fetch companies from /api/brands
  const fetchCompanies = async () => {
    try {
      setCompaniesLoading(true)
      const res = await fetch("/api/brands")
      const json = await res.json()
      if (!res.ok) throw new Error(json.message)
      
      const list = json.data || []
      setCompanies(list)
      if (list.length > 0) {
        setSelectedCompany(list[0].id.toString())
      }
    } catch (err) {
      toast.error("Failed to load companies")
    } finally {
      setCompaniesLoading(false)
    }
  }

  // Fetch setting for selected company
  const fetchSettingByCompany = async (companyId) => {
    if (!companyId) {
      setCurrentSetting(null)
      setSelectedAmount("")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`/api/lms-settings?company_id=${companyId}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.message)
      
      setCurrentSetting(json.data)
      setSelectedAmount(json.data?.maxamount?.toString() || "")
    } catch (err) {
      toast.error("Failed to load setting")
      setCurrentSetting(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  useEffect(() => {
    if (selectedCompany) {
      fetchSettingByCompany(selectedCompany)
    }
  }, [selectedCompany])

  /* ================= 🔥 VALIDATE & OPEN SAVE CONFIRMATION ================= */
  const handleSaveClick = () => {
    if (!selectedAmount) {
      return toast.error("Select amount")
    }

    // ✅ Open slide confirmation
    setShowSaveConfirmModal(true)
  }

  /* ================= 🔥 SAVE WITH CONFIRMATION ================= */
  const confirmSave = async () => {
    try {
      setSaving(true)
      const res = await fetch("/api/lms-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: parseInt(selectedCompany),
          max_amount: parseInt(selectedAmount),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      toast.success(currentSetting ? "Updated!" : "Added!")
      setShowModal(false)
      closeConfirmationModals()
      fetchSettingByCompany(selectedCompany)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  /* ================= 🔥 DELETE WITH CONFIRMATION ================= */
  const handleDeleteClick = () => {
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      setSaving(true)
      const res = await fetch(`/api/lms-settings?company_id=${selectedCompany}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      toast.success("Deleted!")
      closeConfirmationModals()
      fetchSettingByCompany(selectedCompany)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (companiesLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size={28} />
      </div>
    )
  }

  const getSelectedCompanyName = () => {
    return companies.find((c) => c.id.toString() === selectedCompany)?.name || "Company"
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">LMS Settings</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Set maximum download amount per company
          </p>
        </div>
        
        <Button 
          className="btn-primary gap-2" 
          onClick={() => setShowModal(true)}
          disabled={!selectedCompany || currentSetting}
        >
          <Plus className="h-4 w-4" />
          Add Setting
        </Button>
      </div>

      {/* COMPANY DROPDOWN */}
      <div className="surface p-6">
        <label className="text-sm font-medium text-zinc-700 block mb-2">
          Select Company
        </label>
        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="w-full md:w-80 h-11 rounded-xl border border-zinc-300 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black"
        >
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name} ({company.code})
            </option>
          ))}
        </select>
      </div>

      {/* SETTINGS TABLE */}
      <div className="surface overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size={24} />
          </div>
        ) : !selectedCompany ? (
          <div className="py-12 text-center text-zinc-500">
            <p className="text-lg font-medium">Please select a company</p>
            <p className="mt-2 text-sm">Choose from dropdown to view settings</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Company</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Download Limit</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {currentSetting ? (
                  <tr className="hover:bg-zinc-50">
                    <td className="px-6 py-4 text-sm font-medium">
                      {currentSetting.name} ({currentSetting.code})
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-green-50 text-green-700 px-3 py-1 rounded-lg font-mono font-semibold">
                        ₹{Number(currentSetting.maxamount).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <button
                        onClick={() => setShowModal(true)}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleDeleteClick}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={3} className="py-10 text-center text-zinc-500">
                      No setting found. Click "Add Setting" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FORM MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden">
            
            {/* HEADER */}
            <div className="px-8 py-6 border-b bg-zinc-50">
              <h2 className="text-2xl font-semibold tracking-tight">
                {currentSetting ? "Update LMS Setting" : "Add LMS Setting"}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                {getSelectedCompanyName()}
              </p>
            </div>

            {/* BODY */}
            <div className="px-8 py-7">
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-2">
                  Download Amount <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedAmount}
                  onChange={(e) => setSelectedAmount(e.target.value)}
                  className="w-full h-11 rounded-xl border border-zinc-300 px-4 text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Select amount</option>
                  {loanAmounts.map((amount) => (
                    <option key={amount} value={amount}>
                      ₹{amount.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-8 py-6 border-t bg-zinc-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedAmount(currentSetting?.maxamount?.toString() || "")
                }}
                className="h-10 px-6 rounded-xl border border-zinc-300 text-sm text-zinc-700 hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveClick}
                disabled={!selectedAmount}
                className="h-10 px-8 rounded-xl bg-black  !text-white  text-white text-sm font-medium hover:bg-black/90 disabled:opacity-60"
              >
                {currentSetting ? "Update Setting" : "Add Setting"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 🔥 SLIDE CONFIRMATION MODALS ===================== */}

      {/* 🟢 SAVE/UPDATE CONFIRMATION MODAL */}
      {showSaveConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div ref={modalRef} className="surface max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Confirm {currentSetting ? 'Update' : 'Add'} Setting
              </h2>
              <button onClick={closeConfirmationModals} className="p-1 hover:bg-zinc-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-medium text-green-900">
                You are about to {currentSetting ? 'update' : 'set'} download limit:
              </p>
              <div className="mt-3 space-y-2 text-sm text-green-700">
                <div className="flex justify-between">
                  <span className="font-medium">Company:</span>
                  <span>{getSelectedCompanyName()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Download Limit:</span>
                  <span className="font-mono text-green-800 font-semibold">
                    ₹{Number(selectedAmount).toLocaleString('en-IN')}
                  </span>
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
                  text={`Slide to ${currentSetting ? 'update' : 'add'} setting`}
                  successText={currentSetting ? "Updating..." : "Adding..."}
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
              onClick={closeConfirmationModals}
              className="w-full px-4 py-2.5 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 🔴 DELETE CONFIRMATION MODAL */}
      {showDeleteModal && currentSetting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div ref={modalRef} className="surface max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-red-600">Confirm Delete</h2>
              <button onClick={closeConfirmationModals} className="p-1 hover:bg-zinc-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm font-medium text-red-900">
                ⚠️ You are about to delete LMS setting:
              </p>
              <div className="mt-3 space-y-2 text-sm text-red-700">
                <div className="flex justify-between">
                  <span className="font-medium">Company:</span>
                  <span>{currentSetting.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Download Limit:</span>
                  <span className="font-mono font-semibold">₹{Number(currentSetting.maxamount).toLocaleString()}</span>
                </div>
              </div>
              <p className="text-xs text-red-600 mt-3">
                This action cannot be undone.
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
                  text="Slide to delete"
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
              onClick={closeConfirmationModals}
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
