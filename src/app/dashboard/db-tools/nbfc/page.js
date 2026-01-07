"use client"

import { useEffect, useState, useRef } from "react"
import { Plus, Edit2, Trash2, X } from "lucide-react"
import { toast } from "sonner"

import Spinner from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import SlideToConfirm from "@/components/ui/SlideToConfirm"

const emptyNBFC = {
  name: "",
  code: "",
  registration_no: "",
  address_line1: "",
  address_line2: "",
  pin_code: "",
  grievance_officer_details: "",
}

const emptyBrand = {
  name: "",
  code: "",
  domain_name: "",
  address_line1: "",
  address_line2: "",
  pin_code: "",
  nbfc_id: "",
}

export default function NBFCBrandPage() {
  const [nbfcs, setNbfcs] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [modal, setModal] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteContext, setDeleteContext] = useState(null)
  const [editingId, setEditingId] = useState(null)

  const [nbfcForm, setNbfcForm] = useState(emptyNBFC)
  const [brandForm, setBrandForm] = useState(emptyBrand)
  const [errors, setErrors] = useState({})

  const modalRef = useRef(null)

  /* ================= MODAL CLOSE ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (modal || showConfirmModal || showDeleteModal) &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        closeAllModals()
      }
    }

    if (modal || showConfirmModal || showDeleteModal) {
      document.addEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "unset"
    }
  }, [modal, showConfirmModal, showDeleteModal])

  const closeAllModals = () => {
    setModal(null)
    setShowConfirmModal(false)
    setShowDeleteModal(false)
    setDeleteContext(null)
    setEditingId(null)
    setNbfcForm(emptyNBFC)
    setBrandForm(emptyBrand)
    setErrors({})
    setSaving(false)
  }

  const resetModal = () => {
    setModal(null)
    setEditingId(null)
    setNbfcForm(emptyNBFC)
    setBrandForm(emptyBrand)
    setErrors({})
  }

  /* ================= LOAD ================= */
  const loadData = async () => {
    try {
      setLoading(true)
      const [n, b] = await Promise.all([
        fetch("/api/nbfc").then(r => r.json()),
        fetch("/api/brands").then(r => r.json()),
      ])
      setNbfcs(n.data || [])
      setBrands(b.data || [])
    } catch {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  /* ================= VALIDATION ================= */
  const validateNBFC = () => {
    const f = nbfcForm
    const newErrors = {}
    
    if (!f.name?.trim()) newErrors.name = "NBFC name is required"
    if (!f.code?.trim()) newErrors.code = "NBFC code is required"
    if (!f.registration_no?.trim()) newErrors.registration_no = "Registration number is required"
    if (!f.address_line1?.trim()) newErrors.address_line1 = "Address line 1 is required"
    if (!f.address_line2?.trim()) newErrors.address_line2 = "Address line 2 is required"
    if (!f.pin_code?.trim()) newErrors.pin_code = "Pin code is required"
    else if (!/^\d{6}$/.test(f.pin_code.trim())) newErrors.pin_code = "Pin code must be 6 digits"
    if (!f.grievance_officer_details?.trim()) newErrors.grievance_officer_details = "Grievance officer details required"

    return newErrors
  }

  const validateBrand = () => {
    const f = brandForm
    const newErrors = {}

    if (!f.name?.trim()) newErrors.name = "Brand name is required"
    if (!f.code?.trim()) newErrors.code = "Brand code is required"
    if (!f.domain_name?.trim()) {
      newErrors.domain_name = "Domain name is required"
    } else {
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/
      if (!domainRegex.test(f.domain_name.trim())) {
        newErrors.domain_name = "Invalid domain format"
      }
    }
    if (!f.nbfc_id) newErrors.nbfc_id = "Please select an NBFC"
    if (!f.address_line1?.trim()) newErrors.address_line1 = "Address line 1 is required"
    if (!f.pin_code?.trim()) newErrors.pin_code = "Pin code is required"
    else if (!/^\d{6}$/.test(f.pin_code.trim())) newErrors.pin_code = "Pin code must be 6 digits"

    return newErrors
  }

  /* ================= OPEN CONFIRMATION MODAL ================= */
  const handleSaveClick = () => {
    const validationErrors = modal === "NBFC" ? validateNBFC() : validateBrand()

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      toast.error(Object.values(validationErrors)[0])
      return
    }

    setModal(null)
    setShowConfirmModal(true)
  }

  /* ================= SAVE WITH CONFIRMATION ================= */
  const confirmSave = async () => {
    const isNBFC = modal === "NBFC" || (editingId && nbfcForm.name)
    
    try {
      setSaving(true)

      if (isNBFC) {
        const f = nbfcForm
        const res = await fetch("/api/nbfc", {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            ...f, 
            id: editingId,
            name: f.name.trim(),
            code: f.code.trim().toUpperCase(),
            registration_no: f.registration_no.trim(),
            pin_code: f.pin_code.trim(),
          }),
        })

        const data = await res.json()
        
        if (!res.ok) throw new Error(data.message || "Save failed")

        toast.success(editingId ? "NBFC updated successfully" : "NBFC added successfully")
      } else {
        const f = brandForm
        const res = await fetch("/api/brands", {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...f,
            nbfc_id: parseInt(f.nbfc_id),
            id: editingId,
            name: f.name.trim(),
            code: f.code.trim().toUpperCase(),
            domain_name: f.domain_name.trim().toLowerCase(),
            pin_code: f.pin_code.trim(),
          }),
        })

        const data = await res.json()
        
        if (!res.ok) throw new Error(data.message || "Save failed")

        toast.success(editingId ? "Brand updated successfully" : "Brand added successfully")
      }

      closeAllModals()
      loadData()
    } catch (error) {
      toast.error(error.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }

  /* ================= DELETE WITH CONFIRMATION ================= */
  const handleDeleteClick = (type, item) => {
    setDeleteContext({ type, item })
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!deleteContext) return

    const { type, item } = deleteContext

    try {
      setSaving(true)

      const endpoint = type === "NBFC" ? `/api/nbfc?id=${item.id}` : `/api/brands?id=${item.id}`
      const res = await fetch(endpoint, { method: "DELETE" })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.message || "Delete failed")
      
      toast.success(`${type} deleted successfully`)
      closeAllModals()
      loadData()
    } catch (error) {
      toast.error(error.message || "Delete failed")
    } finally {
      setSaving(false)
    }
  }

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size={28} />
      </div>
    )
  }

  const selectedNBFC = nbfcs.find(n => n.id.toString() === brandForm.nbfc_id)

  return (
    <div className="space-y-10">
      {/* ================= NBFC TABLE ================= */}
      <div className="surface overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-xl font-bold">NBFC Management</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Manage Non-Banking Financial Companies</p>
          </div>
          <Button className="btn-primary gap-2" onClick={() => {
            setModal("NBFC")
            setEditingId(null)
            setNbfcForm(emptyNBFC)
            setErrors({})
          }}>
            <Plus className="h-4 w-4" /> Add NBFC
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Code</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Registration No</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {nbfcs.map(n => (
                <tr key={n.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">{n.name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">
                    <span className="font-mono bg-zinc-100 px-2 py-1 rounded">{n.code}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{n.registration_no}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingId(n.id)
                          setNbfcForm(n)
                          setModal("NBFC")
                          setErrors({})
                        }}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                        title="Edit NBFC"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick("NBFC", n)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                        title="Delete NBFC"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {nbfcs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-zinc-500">
                    No NBFC found. Click "Add NBFC" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= BRAND TABLE ================= */}
      <div className="surface overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-xl font-bold">Brand Management</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Manage brands mapped to NBFCs</p>
          </div>
          <Button className="btn-primary gap-2" onClick={() => {
            if (nbfcs.length === 0) {
              toast.error("Please add an NBFC first")
              return
            }
            setModal("BRAND")
            setEditingId(null)
            setBrandForm(emptyBrand)
            setErrors({})
          }}>
            <Plus className="h-4 w-4" /> Add Brand
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Brand</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Code</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Domain</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">NBFC</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {brands.map(b => (
                <tr key={b.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">{b.name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">
                    <span className="font-mono bg-zinc-100 px-2 py-1 rounded">{b.code}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 font-mono">{b.domain_name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">
                    {b.nbfc_name ? (
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                        {b.nbfc_name}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingId(b.id)
                          setBrandForm(b)
                          setModal("BRAND")
                          setErrors({})
                        }}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                        title="Edit Brand"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick("BRAND", b)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                        title="Delete Brand"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {brands.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-zinc-500">
                    No Brand found. Click "Add Brand" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= ADD/EDIT FORM MODAL ================= */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div ref={modalRef} className="w-full max-w-[520px] rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">
                  {editingId ? "Edit" : "Add"} {modal}
                </h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {modal === "NBFC" ? "NBFC master details" : "Brand details mapped with NBFC"}
                </p>
              </div>
              <button onClick={resetModal} className="text-zinc-400 hover:text-zinc-700">
                <X size={18} />
              </button>
            </div>

            {/* BODY */}
            <div className="px-5 py-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">

              {/* ===== NBFC FORM ===== */}
              {modal === "NBFC" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-zinc-600">
                        NAME <span className="text-red-500">*</span>
                      </label>
                      <input
                        placeholder="Konak Commercial"
                        className={`mt-1.5 h-9 w-full rounded-lg border px-3 text-sm focus:outline-none ${
                          errors.name ? "border-red-500" : "border-zinc-300 focus:border-black"
                        }`}
                        value={nbfcForm.name}
                        onChange={(e) => {
                          setNbfcForm({ ...nbfcForm, name: e.target.value })
                          setErrors({ ...errors, name: null })
                        }}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-zinc-600">
                        CODE <span className="text-red-500">*</span>
                      </label>
                      <input
                        placeholder="KC"
                        className={`mt-1.5 h-9 w-full rounded-lg border px-3 text-sm uppercase font-mono focus:outline-none ${
                          errors.code ? "border-red-500" : "border-zinc-300 focus:border-black"
                        }`}
                        value={nbfcForm.code}
                        onChange={(e) => {
                          setNbfcForm({ ...nbfcForm, code: e.target.value })
                          setErrors({ ...errors, code: null })
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-zinc-600">
                      REGISTRATION NO <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="08.00080"
                      className={`mt-1.5 h-9 w-full rounded-lg border px-3 text-sm focus:outline-none ${
                        errors.registration_no ? "border-red-500" : "border-zinc-300 focus:border-black"
                      }`}
                      value={nbfcForm.registration_no}
                      onChange={(e) => {
                        setNbfcForm({ ...nbfcForm, registration_no: e.target.value })
                        setErrors({ ...errors, registration_no: null })
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-zinc-600">
                      ADDRESS LINE 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="C-53, LGF, Shivalik"
                      className={`mt-1.5 h-9 w-full rounded-lg border px-3 text-sm focus:outline-none ${
                        errors.address_line1 ? "border-red-500" : "border-zinc-300 focus:border-black"
                      }`}
                      value={nbfcForm.address_line1}
                      onChange={(e) => {
                        setNbfcForm({ ...nbfcForm, address_line1: e.target.value })
                        setErrors({ ...errors, address_line1: null })
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-zinc-600">
                      ADDRESS LINE 2 <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="Malviya Nagar"
                      className={`mt-1.5 h-9 w-full rounded-lg border px-3 text-sm focus:outline-none ${
                        errors.address_line2 ? "border-red-500" : "border-zinc-300 focus:border-black"
                      }`}
                      value={nbfcForm.address_line2}
                      onChange={(e) => {
                        setNbfcForm({ ...nbfcForm, address_line2: e.target.value })
                        setErrors({ ...errors, address_line2: null })
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-zinc-600">
                      PIN CODE <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="110017"
                      className={`mt-1.5 h-9 w-full rounded-lg border px-3 text-sm font-mono focus:outline-none ${
                        errors.pin_code ? "border-red-500" : "border-zinc-300 focus:border-black"
                      }`}
                      value={nbfcForm.pin_code}
                      maxLength={6}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '')
                        setNbfcForm({ ...nbfcForm, pin_code: val })
                        setErrors({ ...errors, pin_code: null })
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-zinc-600">
                      GRIEVANCE OFFICER <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="Name, Mobile, Address"
                      className={`mt-1.5 h-16 w-full rounded-lg border px-3 py-2 text-sm resize-none focus:outline-none ${
                        errors.grievance_officer_details ? "border-red-500" : "border-zinc-300 focus:border-black"
                      }`}
                      value={nbfcForm.grievance_officer_details}
                      onChange={(e) => {
                        setNbfcForm({ ...nbfcForm, grievance_officer_details: e.target.value })
                        setErrors({ ...errors, grievance_officer_details: null })
                      }}
                    />
                  </div>
                </>
              )}

              {/* ===== BRAND FORM ===== */}
              {modal === "BRAND" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-zinc-600">
                        NAME <span className="text-red-500">*</span>
                      </label>
                      <input
                        placeholder="SalaryKart"
                        className={`mt-1.5 h-9 w-full rounded-lg border px-3 text-sm focus:outline-none ${
                          errors.name ? "border-red-500" : "border-zinc-300 focus:border-black"
                        }`}
                        value={brandForm.name}
                        onChange={(e) => {
                          setBrandForm({ ...brandForm, name: e.target.value })
                          setErrors({ ...errors, name: null })
                        }}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-zinc-600">
                        CODE <span className="text-red-500">*</span>
                      </label>
                      <input
                        placeholder="SK"
                        className={`mt-1.5 h-9 w-full rounded-lg border px-3 text-sm uppercase font-mono focus:outline-none ${
                          errors.code ? "border-red-500" : "border-zinc-300 focus:border-black"
                        }`}
                        value={brandForm.code}
                        onChange={(e) => {
                          setBrandForm({ ...brandForm, code: e.target.value })
                          setErrors({ ...errors, code: null })
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-zinc-600">
                      DOMAIN <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="salarykart.com"
                      className={`mt-1.5 h-9 w-full rounded-lg border px-3 text-sm lowercase font-mono focus:outline-none ${
                        errors.domain_name ? "border-red-500" : "border-zinc-300 focus:border-black"
                      }`}
                      value={brandForm.domain_name}
                      onChange={(e) => {
                        setBrandForm({ ...brandForm, domain_name: e.target.value })
                        setErrors({ ...errors, domain_name: null })
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-zinc-600">
                      NBFC <span className="text-red-500">*</span>
                    </label>
                    <select
                      className={`mt-1.5 h-9 w-full rounded-lg border px-3 text-sm focus:outline-none ${
                        errors.nbfc_id ? "border-red-500" : "border-zinc-300 focus:border-black"
                      }`}
                      value={brandForm.nbfc_id}
                      onChange={(e) => {
                        setBrandForm({ ...brandForm, nbfc_id: e.target.value })
                        setErrors({ ...errors, nbfc_id: null })
                      }}
                    >
                      <option value="">Choose...</option>
                      {nbfcs.map((nbfc) => (
                        <option key={nbfc.id} value={nbfc.id}>
                          {nbfc.name} ({nbfc.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-zinc-600">
                      ADDRESS LINE 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="C-53, LGF, Shivalik"
                      className={`mt-1.5 h-9 w-full rounded-lg border px-3 text-sm focus:outline-none ${
                        errors.address_line1 ? "border-red-500" : "border-zinc-300 focus:border-black"
                      }`}
                      value={brandForm.address_line1}
                      onChange={(e) => {
                        setBrandForm({ ...brandForm, address_line1: e.target.value })
                        setErrors({ ...errors, address_line1: null })
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-zinc-600">ADDRESS LINE 2</label>
                    <input
                      placeholder="Optional"
                      className="mt-1.5 h-9 w-full rounded-lg border border-zinc-300 px-3 text-sm focus:border-black focus:outline-none"
                      value={brandForm.address_line2}
                      onChange={(e) => setBrandForm({ ...brandForm, address_line2: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-zinc-600">
                      PIN CODE <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="110017"
                      className={`mt-1.5 h-9 w-full rounded-lg border px-3 text-sm font-mono focus:outline-none ${
                        errors.pin_code ? "border-red-500" : "border-zinc-300 focus:border-black"
                      }`}
                      value={brandForm.pin_code}
                      maxLength={6}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '')
                        setBrandForm({ ...brandForm, pin_code: val })
                        setErrors({ ...errors, pin_code: null })
                      }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-2 px-5 py-3 border-t bg-zinc-50 rounded-b-2xl">
              <button
                onClick={resetModal}
                className="h-9 px-5 rounded-lg border border-zinc-300 text-xs text-zinc-700 hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveClick}
                className="h-9 px-6 rounded-lg bg-black  !text-white text-white text-xs font-medium hover:bg-black/90"
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
                {editingId 
                  ? `You are about to update ${nbfcForm.name ? "NBFC" : "Brand"}:`
                  : `You are about to add new ${nbfcForm.name ? "NBFC" : "Brand"}:`
                }
              </p>
              <div className="space-y-2 text-sm text-green-700">
                {nbfcForm.name ? (
                  <>
                    <div className="flex justify-between">
                      <span className="font-medium">Name:</span>
                      <span className="font-bold">{nbfcForm.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Code:</span>
                      <span className="font-mono font-bold">{nbfcForm.code.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Registration:</span>
                      <span>{nbfcForm.registration_no}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Pin Code:</span>
                      <span className="font-mono">{nbfcForm.pin_code}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="font-medium">Name:</span>
                      <span className="font-bold">{brandForm.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Code:</span>
                      <span className="font-mono font-bold">{brandForm.code.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Domain:</span>
                      <span className="font-mono">{brandForm.domain_name.toLowerCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">NBFC:</span>
                      <span>{selectedNBFC?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Pin Code:</span>
                      <span className="font-mono">{brandForm.pin_code}</span>
                    </div>
                  </>
                )}
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
                  text={editingId ? "Slide to update" : "Slide to add"}
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
                ⚠️ You are about to delete this {deleteContext.type}:
              </p>
              <div className="space-y-2 text-sm text-red-700">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span className="font-bold">{deleteContext.item.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Code:</span>
                  <span className="font-mono font-bold">{deleteContext.item.code}</span>
                </div>
                {deleteContext.type === "NBFC" && (
                  <div className="flex justify-between">
                    <span className="font-medium">Registration:</span>
                    <span>{deleteContext.item.registration_no}</span>
                  </div>
                )}
                {deleteContext.type === "BRAND" && (
                  <div className="flex justify-between">
                    <span className="font-medium">Domain:</span>
                    <span className="font-mono">{deleteContext.item.domain_name}</span>
                  </div>
                )}
              </div>
              <p className="mt-3 text-xs text-red-600 font-medium">
                {deleteContext.type === "NBFC" 
                  ? "This may affect associated brands!"
                  : "This action cannot be undone!"
                }
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
                  text={`Slide to delete ${deleteContext.type.toLowerCase()}`}
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
