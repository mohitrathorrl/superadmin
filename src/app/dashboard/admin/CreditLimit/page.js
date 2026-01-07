"use client"

import { useEffect, useState, useRef } from "react"
import { Edit2, Trash2, X } from "lucide-react"
import { toast } from "sonner"

import Spinner from "@/components/ui/spinner"
import SlideToConfirm from "@/components/ui/SlideToConfirm"
import { CREDIT_LIMIT_API } from "@/lib/api-endpoint"

export default function CreditLimitPage() {
  const [users, setUsers] = useState([])
  const [rows, setRows] = useState([])

  const [selectedUser, setSelectedUser] = useState("")
  const [limit, setLimit] = useState("")
  const [editingId, setEditingId] = useState(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // 🔥 Modal states for slide confirmations
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteContext, setDeleteContext] = useState(null)

  const modalRef = useRef(null)

  /* ================= MODAL CLOSE ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (showSaveModal || showDeleteModal) &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        closeAllModals()
      }
    }

    if (showSaveModal || showDeleteModal) {
      document.addEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "unset"
    }
  }, [showSaveModal, showDeleteModal])

  const closeAllModals = () => {
    setShowSaveModal(false)
    setShowDeleteModal(false)
    setDeleteContext(null)
    setSaving(false)
  }

  /* ================= FETCH ================= */
  const fetchUsers = async () => {
    const res = await fetch(CREDIT_LIMIT_API.USERS)
    const json = await res.json()
    setUsers(json.data || [])
  }

  const fetchLimits = async () => {
    const res = await fetch(CREDIT_LIMIT_API.ASSIGNED_LIST)
    const json = await res.json()
    setRows(json.data || [])
  }

  useEffect(() => {
    Promise.all([fetchUsers(), fetchLimits()])
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false))
  }, [])

  /* ================= 🔥 VALIDATE & OPEN SAVE MODAL ================= */
  const handleSaveClick = () => {
    if (!editingId && !selectedUser) {
      return toast.error("Please select a user")
    }

    if (limit === "" || isNaN(limit) || Number(limit) < 0) {
      return toast.error("Credit limit must be 0 or greater")
    }

    // ✅ Open confirmation modal
    setShowSaveModal(true)
  }

  /* ================= 🔥 SAVE WITH CONFIRMATION ================= */
  const confirmSave = async () => {
    try {
      setSaving(true)

      const res = await fetch(
        editingId ? CREDIT_LIMIT_API.UPDATE : CREDIT_LIMIT_API.ADD,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            editingId
              ? { id: editingId, max_limit: Number(limit) }
              : { user_id: selectedUser, max_limit: Number(limit) }
          ),
        }
      )

      const json = await res.json()
      if (!res.ok) throw new Error(json.message)

      toast.success(json.message || "Saved successfully")
      resetForm()
      fetchLimits()
      closeAllModals()
    } catch (err) {
      toast.error(err.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }

  /* ================= 🔥 DELETE WITH CONFIRMATION ================= */
  const handleDeleteClick = (row) => {
    setDeleteContext(row)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!deleteContext) return

    try {
      setSaving(true)
      const res = await fetch(`${CREDIT_LIMIT_API.ASSIGNED_LIST}?id=${deleteContext.id}`, {
        method: "DELETE",
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.message)

      toast.success("Credit limit deleted")
      fetchLimits()
      closeAllModals()
    } catch (err) {
      toast.error(err.message || "Delete failed")
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setSelectedUser("")
    setLimit("")
    setEditingId(null)
  }

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size={28} />
      </div>
    )
  }

  // Get selected user name for modal display
  const getSelectedUserName = () => {
    if (editingId) {
      const row = rows.find(r => r.id === editingId)
      return row?.name || "User"
    }
    const user = users.find(u => u.id.toString() === selectedUser)
    return user?.name || "User"
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Credit Limit</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Assign and manage credit limits for users
          </p>
        </div>
      </div>

      {/* ADD / EDIT */}
      <div className="surface p-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-sm font-medium text-zinc-700 block mb-1">
            Select User
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            disabled={!!editingId}
            className="w-72 h-11 rounded-xl border border-zinc-300 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:bg-zinc-100"
          >
            <option value="">Select user</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-700 block mb-1">
            Max Credit Limit
          </label>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="500000"
            className="w-56 h-11 rounded-xl border border-zinc-300 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <button
          onClick={handleSaveClick}
          disabled={saving}
          className="h-11 px-8 rounded-xl bg-black !text-white  text-white text-sm font-medium hover:bg-black/90 disabled:opacity-60"
        >
          {editingId ? "Update Limit" : "Add Limit"}
        </button>

        {editingId && (
          <button
            onClick={resetForm}
            className="h-11 px-6 rounded-xl border border-zinc-300 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            Cancel
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="surface overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-12 text-center text-zinc-500">
            <p className="text-lg font-medium">No credit limits found</p>
            <p className="mt-2 text-sm">
              Add a credit limit using the form above
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    User
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">
                    Credit Limit
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4 text-sm font-medium">
                      {r.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-center font-mono">
                      <span className="bg-green-50 text-green-700 px-3 py-1 rounded">
                        ₹ {r.max_limit}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingId(r.id)
                          setSelectedUser(r.user_id)
                          setLimit(r.max_limit)
                        }}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(r)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===================== 🔥 MODALS WITH SLIDE CONFIRMATIONS ===================== */}

      {/* 🟢 SAVE/UPDATE CONFIRMATION MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="surface max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Confirm {editingId ? 'Update' : 'Add'} Credit Limit
              </h2>
              <button onClick={closeAllModals} className="p-1 hover:bg-zinc-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-medium text-green-900">
                You are about to {editingId ? 'update' : 'set'} credit limit:
              </p>
              <div className="mt-3 space-y-2 text-sm text-green-700">
                <div className="flex justify-between">
                  <span className="font-medium">User:</span>
                  <span>{getSelectedUserName()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Credit Limit:</span>
                  <span className="font-mono text-green-800">₹ {Number(limit).toLocaleString('en-IN')}</span>
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
                  text={`Slide to ${editingId ? 'update' : 'add'} limit`}
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

      {/* 🔴 DELETE CONFIRMATION MODAL */}
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
              <p className="text-sm font-medium text-red-900">
                ⚠️ You are about to delete credit limit:
              </p>
              <div className="mt-3 space-y-2 text-sm text-red-700">
                <div className="flex justify-between">
                  <span className="font-medium">User:</span>
                  <span>{deleteContext.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Credit Limit:</span>
                  <span className="font-mono">₹ {deleteContext.max_limit}</span>
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
