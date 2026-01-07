"use client"

import { useEffect, useState, useRef } from "react"
import { Plus, Trash2, Edit2, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import Spinner from "@/components/ui/spinner"
import SlideToConfirm from "@/components/ui/SlideToConfirm"
import { USER_API } from "@/lib/api-endpoint"
import { apiClient } from "@/lib/api-client"

const emptyForm = {
  name: "",
  email: "",
  role: "superadmin",
  is_active: 1,
}

export default function UserConfigPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  // 🔥 Slide confirmation modals
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteContext, setDeleteContext] = useState(null)

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
    setDeleteContext(null)
    setSaving(false)
  }

  /* =========================
     FETCH USERS
  ========================= */
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await apiClient(USER_API.LIST)

      const mapped = (res.data || []).map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        is_active: u.is_active,
        created_at: u.created_at,
        is_root: Number(u.is_root),
        role: Number(u.is_root) === 1 ? "root" : "admin",
      }))

      setUsers(mapped)
    } catch (err) {
      toast.error(err.message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  /* =========================
     ADD / EDIT
  ========================= */
  const handleAdd = () => {
    setEditingUser(null)
    setFormData(emptyForm)
    setShowModal(true)
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
    })
    setShowModal(true)
  }

  /* ================= 🔥 VALIDATE & OPEN SAVE CONFIRMATION ================= */
  const handleSaveClick = () => {
    if (!formData.name || !formData.email) {
      toast.error("Name and email required")
      return
    }

    // ✅ Open slide confirmation
    setShowSaveConfirmModal(true)
  }

  /* ================= 🔥 SAVE WITH CONFIRMATION ================= */
  const confirmSave = async () => {
    try {
      setSaving(true)

      if (editingUser) {
        await apiClient(USER_API.UPDATE, {
          method: "PUT",
          body: {
            id: editingUser.id,
            ...formData,
          },
        })
        toast.success("User updated")
      } else {
        await apiClient(USER_API.ADD, {
          method: "POST",
          body: formData,
        })
        toast.success("User created")
      }

      setShowModal(false)
      closeConfirmationModals()
      fetchUsers()
    } catch (err) {
      toast.error(err.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }

  /* ================= 🔥 DELETE WITH CONFIRMATION ================= */
  const handleDeleteClick = (user) => {
    setDeleteContext(user)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!deleteContext) return

    try {
      setSaving(true)
      await apiClient(USER_API.DELETE(deleteContext.id), { method: "DELETE" })
      toast.success("User deleted")
      closeConfirmationModals()
      fetchUsers()
    } catch (err) {
      toast.error(err.message || "Delete failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="mt-1 text-sm text-zinc-600">Manage admins and roles</p>
        </div>
        <Button className="btn-primary gap-2" onClick={handleAdd}>
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* TABLE */}
      <div className="surface overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size={28} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-zinc-500">
                      No users found
                    </td>
                  </tr>
                )}

                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4 text-sm font-medium">{u.name}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{u.email}</td>
                    <td className="px-6 py-4 text-sm capitalize">{u.role}</td>
                    <td className="px-6 py-4 text-sm">
                      {u.is_active ? (
                        <span className="text-green-600 font-medium">Active</span>
                      ) : (
                        <span className="text-red-600 font-medium">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      {u.is_root === 0 ? (
                        <>
                          <button
                            onClick={() => handleEdit(u)}
                            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteClick(u)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-zinc-400">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FORM MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">

            {/* HEADER */}
            <div className="px-8 py-6 border-b bg-zinc-50">
              <h2 className="text-2xl font-semibold tracking-tight">
                {editingUser ? "Edit User" : "Add User"}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Manage user access & status
              </p>
            </div>

            {/* BODY */}
            <div className="px-8 py-7 space-y-5">

              {/* NAME */}
              <div>
                <label className="text-sm font-medium text-zinc-700">
                  Full Name
                </label>
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="John Doe"
                  className="mt-2 w-full h-11 rounded-xl border border-zinc-300 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="text-sm font-medium text-zinc-700">
                  Email Address
                </label>
                <input
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="john@company.com"
                  className="mt-2 w-full h-11 rounded-xl border border-zinc-300 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* STATUS */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  checked={formData.is_active === 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_active: e.target.checked ? 1 : 0,
                    })
                  }
                  className="h-4 w-4 rounded border-zinc-300"
                />
                <div>
                  <p className="text-sm font-medium">Active User</p>
                  <p className="text-xs text-zinc-500">
                    User can login & access dashboard
                  </p>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-8 py-6 border-t bg-zinc-50 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="h-10 px-6 rounded-xl border border-zinc-300 text-sm text-zinc-700 hover:bg-zinc-100"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveClick}
                className="h-10 px-8 rounded-xl bg-black  !text-white  text-white text-sm font-medium hover:bg-black/90"
              >
                Save User
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
                Confirm {editingUser ? 'Update' : 'Add'} User
              </h2>
              <button onClick={closeConfirmationModals} className="p-1 hover:bg-zinc-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-medium text-green-900">
                You are about to {editingUser ? 'update' : 'create'} user:
              </p>
              <div className="mt-3 space-y-2 text-sm text-green-700">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span className={formData.is_active === 1 ? "text-green-700 font-semibold" : "text-red-600 font-semibold"}>
                    {formData.is_active === 1 ? "Active" : "Inactive"}
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
                  text={`Slide to ${editingUser ? 'update' : 'add'} user`}
                  successText={editingUser ? "Updating..." : "Adding..."}
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
      {showDeleteModal && deleteContext && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div ref={modalRef} className="surface max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-red-600">Confirm Delete User</h2>
              <button onClick={closeConfirmationModals} className="p-1 hover:bg-zinc-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm font-medium text-red-900">
                ⚠️ You are about to delete user:
              </p>
              <div className="mt-3 space-y-2 text-sm text-red-700">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{deleteContext.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{deleteContext.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Role:</span>
                  <span className="capitalize">{deleteContext.role}</span>
                </div>
              </div>
              <p className="text-xs text-red-600 mt-3">
                This action cannot be undone. User will lose all access immediately.
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
                  text="Slide to delete user"
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
