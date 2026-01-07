"use client"

import { useEffect, useState, useRef } from "react"
import { RefreshCw, Check, X, Plus, Trash2, Edit2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

import Spinner from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import SlideToConfirm from "@/components/ui/SlideToConfirm"
import { 
  API_MAPPING_API, 
  BRAND_API, 
  PROVIDER_API, 
  SERVICE_API,
  CREDENTIAL_API,
  PROVIDER_SERVICE_API 
} from "@/lib/api-endpoint"

export default function ApiMappingPage() {
  // Main state
  const [brands, setBrands] = useState([])
  const [selectedBrand, setSelectedBrand] = useState("")
  const [data, setData] = useState({ brand: null, credentials: [], providers: [] })
  
  // Loading states
  const [loading, setLoading] = useState(false)
  const [brandsLoading, setBrandsLoading] = useState(true)
  const [updating, setUpdating] = useState({})
  const [saving, setSaving] = useState(false)

  // Services & Providers
  const [services, setServices] = useState([])
  const [providers, setProviders] = useState([])
  const [providerServices, setProviderServices] = useState([])

  // Modal states
  const [showAddProviderModal, setShowAddProviderModal] = useState(false)
  const [showEditProviderModal, setShowEditProviderModal] = useState(false)
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [showEditServiceModal, setShowEditServiceModal] = useState(false)
  const [showAddAPIModal, setShowAddAPIModal] = useState(false)
  const [showProviderServicesModal, setShowProviderServicesModal] = useState(false)
  const [showSettingsTab, setShowSettingsTab] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteContext, setDeleteContext] = useState(null)
  
  // 🔥 Toggle & Provider Change confirmation modals
  const [showToggleModal, setShowToggleModal] = useState(false)
  const [toggleContext, setToggleContext] = useState(null)
  const [showProviderChangeModal, setShowProviderChangeModal] = useState(false)
  const [providerChangeContext, setProviderChangeContext] = useState(null)

  // Form states
  const [newProvider, setNewProvider] = useState({ name: "", active: true })
  const [editProvider, setEditProvider] = useState(null)
  const [newService, setNewService] = useState({ service_name: "", active: true })
  const [editService, setEditService] = useState(null)
  const [newAPI, setNewAPI] = useState({
    api_name: "",
    service_id: "",
    provider_id: "",
    api_url: "",
    username: "",
    password: "",
    api_token: "",
  })
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [selectedProviderId, setSelectedProviderId] = useState(null)

  const modalRef = useRef(null)

  /* ================= MODAL CLOSE ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (showAddProviderModal || showEditProviderModal || showAddServiceModal || 
         showEditServiceModal || showAddAPIModal || showProviderServicesModal || 
         showDeleteModal || showToggleModal || showProviderChangeModal) &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        closeAllModals()
      }
    }

    if (showAddProviderModal || showEditProviderModal || showAddServiceModal || 
        showEditServiceModal || showAddAPIModal || showProviderServicesModal || 
        showDeleteModal || showToggleModal || showProviderChangeModal) {
      document.addEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "unset"
    }
  }, [showAddProviderModal, showEditProviderModal, showAddServiceModal, showEditServiceModal, 
      showAddAPIModal, showProviderServicesModal, showDeleteModal, showToggleModal, showProviderChangeModal])

  const closeAllModals = () => {
    setShowAddProviderModal(false)
    setShowEditProviderModal(false)
    setShowAddServiceModal(false)
    setShowEditServiceModal(false)
    setShowAddAPIModal(false)
    setShowProviderServicesModal(false)
    setShowDeleteModal(false)
    setShowToggleModal(false)
    setShowProviderChangeModal(false)
    setDeleteContext(null)
    setToggleContext(null)
    setProviderChangeContext(null)
    setSaving(false)
    setNewProvider({ name: "", active: true })
    setEditProvider(null)
    setNewService({ service_name: "", active: true })
    setEditService(null)
    setNewAPI({
      api_name: "",
      service_id: "",
      provider_id: "",
      api_url: "",
      username: "",
      password: "",
      api_token: "",
    })
    setSelectedProvider(null)
    setSelectedProviderId(null)
  }

  /* ================= FETCH FUNCTIONS ================= */
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

  const fetchServices = async () => {
    try {
      const res = await fetch(SERVICE_API.LIST)
      const json = await res.json()
      
      if (!res.ok) throw new Error(json.message)
      
      setServices(json.data || [])
    } catch (err) {
      console.error("Failed to load services:", err)
    }
  }

  const fetchProviders = async () => {
    try {
      const res = await fetch(PROVIDER_API.LIST)
      const json = await res.json()
      
      if (!res.ok) throw new Error(json.message)
      
      setProviders(json.data || [])
    } catch (err) {
      console.error("Failed to load providers:", err)
    }
  }

  const fetchProviderServices = async () => {
    try {
      const res = await fetch(PROVIDER_SERVICE_API.LIST)
      const json = await res.json()
      
      if (!res.ok) throw new Error(json.message)
      
      setProviderServices(json.data || [])
    } catch (err) {
      console.error("Failed to load provider services:", err)
    }
  }

  const fetchMappings = async (brandId) => {
    if (!brandId) {
      setData({ brand: null, credentials: [], providers: [] })
      return
    }

    try {
      setLoading(true)
      
      const res = await fetch(API_MAPPING_API.LIST(brandId))
      const json = await res.json()
      
      if (!res.ok) throw new Error(json.message)
      
      setData(json.data || { brand: null, credentials: [], providers: [] })
    } catch (err) {
      toast.error(err.message || "Failed to load mappings")
      setData({ brand: null, credentials: [], providers: [] })
    } finally {
      setLoading(false)
    }
  }

  /* ================= SERVICE CRUD ================= */
  const handleAddService = async () => {
    if (!newService.service_name) {
      toast.error("Service name is required")
      return
    }

    try {
      setSaving(true)
      const res = await fetch(SERVICE_API.ADD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          service_name: newService.service_name,
          active: newService.active ? 1 : 0,
        }),
      })
      
      const json = await res.json()
      if (!res.ok) throw new Error(json.message)
      
      toast.success("Service added successfully")
      closeAllModals()
      fetchServices()
    } catch (err) {
      toast.error(err.message || "Failed to add service")
    } finally {
      setSaving(false)
    }
  }

  const handleEditService = async () => {
    if (!editService.service_name) {
      toast.error("Service name is required")
      return
    }

    try {
      setSaving(true)
      const res = await fetch(SERVICE_API.UPDATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: editService.id,
          service_name: editService.service_name,
          active: editService.active ? 1 : 0,
        }),
      })
      
      const json = await res.json()
      if (!res.ok) throw new Error(json.message)
      
      toast.success("Service updated successfully")
      closeAllModals()
      fetchServices()
    } catch (err) {
      toast.error(err.message || "Failed to update service")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteService = async (serviceId) => {
    try {
      setSaving(true)
      const res = await fetch(SERVICE_API.DELETE(serviceId), {
        method: "DELETE",
      })
      
      const json = await res.json()
      if (!res.ok) throw new Error(json.message)
      
      toast.success("Service deleted successfully")
      closeAllModals()
      fetchServices()
    } catch (err) {
      toast.error(err.message || "Failed to delete service")
    } finally {
      setSaving(false)
    }
  }

  /* ================= PROVIDER CRUD ================= */
  const handleAddProvider = async () => {
    if (!newProvider.name) {
      toast.error("Provider name is required")
      return
    }

    try {
      setSaving(true)
      const res = await fetch(PROVIDER_API.ADD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          name: newProvider.name,
          active: newProvider.active ? 1 : 0,
        }),
      })
      
      const json = await res.json()
      if (!res.ok) throw new Error(json.message)
      
      toast.success("Provider added successfully")
      closeAllModals()
      fetchProviders()
      fetchMappings(selectedBrand)
    } catch (err) {
      toast.error(err.message || "Failed to add provider")
    } finally {
      setSaving(false)
    }
  }

  const handleEditProvider = async () => {
    if (!editProvider.name) {
      toast.error("Provider name is required")
      return
    }

    try {
      setSaving(true)
      const res = await fetch(PROVIDER_API.UPDATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: editProvider.id,
          name: editProvider.name,
          active: editProvider.active ? 1 : 0,
        }),
      })
      
      const json = await res.json()
      if (!res.ok) throw new Error(json.message)
      
      toast.success("Provider updated successfully")
      closeAllModals()
      fetchProviders()
    } catch (err) {
      toast.error(err.message || "Failed to update provider")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProvider = async (providerId) => {
    try {
      setSaving(true)
      const res = await fetch(PROVIDER_API.DELETE(providerId), {
        method: "DELETE",
      })
      
      const json = await res.json()
      if (!res.ok) throw new Error(json.message)
      
      toast.success("Provider deleted successfully")
      closeAllModals()
      fetchProviders()
      fetchMappings(selectedBrand)
    } catch (err) {
      toast.error(err.message || "Failed to delete provider")
    } finally {
      setSaving(false)
    }
  }

  /* ================= PROVIDER SERVICE MAPPING ================= */
  const handleAddServiceToProvider = async (serviceId) => {
    if (!selectedProviderId) {
      toast.error("Please select a provider")
      return
    }

    try {
      const res = await fetch(PROVIDER_SERVICE_API.ADD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_id: selectedProviderId,
          service_id: serviceId,
        }),
      })
      
      const json = await res.json()
      if (!res.ok) throw new Error(json.message)
      
      toast.success("Service added to provider")
      fetchProviderServices()
    } catch (err) {
      toast.error(err.message || "Failed to add service")
    }
  }

  const handleRemoveServiceFromProvider = async (mappingId) => {
    try {
      setSaving(true)
      const res = await fetch(PROVIDER_SERVICE_API.DELETE(mappingId), {
        method: "DELETE",
      })
      
      const json = await res.json()
      if (!res.ok) throw new Error(json.message)
      
      toast.success("Service removed from provider")
      closeAllModals()
      fetchProviderServices()
    } catch (err) {
      toast.error(err.message || "Failed to remove service")
    } finally {
      setSaving(false)
    }
  }

  /* ================= 🔥 TOGGLE MAPPING WITH CONFIRMATION ================= */
  const openToggleModal = (credential, enable) => {
    setToggleContext({ credential, enable })
    setShowToggleModal(true)
  }

  const confirmToggleMapping = async () => {
    if (!toggleContext) return

    const { credential, enable } = toggleContext
    const key = `toggle_${credential.credential_id}`
    
    try {
      setSaving(true)
      setUpdating(prev => ({ ...prev, [key]: true }))

      const res = await fetch(API_MAPPING_API.TOGGLE_MAPPING, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_mapping",
          credential_id: credential.credential_id,
          brand_id: parseInt(selectedBrand),
          provider_id: enable ? credential.default_provider_id : null,
          enable: enable,
        }),
      })
      
      const json = await res.json()
      
      if (!res.ok) throw new Error(json.message)
      
      toast.success(json.message)
      fetchMappings(selectedBrand)
      closeAllModals()
    } catch (err) {
      toast.error(err.message || "Failed to update mapping")
    } finally {
      setSaving(false)
      setUpdating(prev => {
        const updated = { ...prev }
        delete updated[key]
        return updated
      })
    }
  }

  /* ================= 🔥 CHANGE PROVIDER WITH CONFIRMATION ================= */
  const openProviderChangeModal = (credential, newProviderId) => {
    // Don't open if same provider selected
    if (parseInt(newProviderId) === credential.current_provider_id) return
    
    const newProviderName = data.providers.find(p => p.id === parseInt(newProviderId))?.name
    setProviderChangeContext({ credential, newProviderId, newProviderName })
    setShowProviderChangeModal(true)
  }

  const confirmProviderChange = async () => {
    if (!providerChangeContext) return

    const { credential, newProviderId } = providerChangeContext
    const key = `provider_${credential.credential_id}`

    try {
      setSaving(true)
      setUpdating(prev => ({ ...prev, [key]: true }))

      const res = await fetch(API_MAPPING_API.CHANGE_PROVIDER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_provider",
          mapping_id: credential.mapping_id,
          provider_id: parseInt(newProviderId),
        }),
      })
      
      const json = await res.json()
      
      if (!res.ok) throw new Error(json.message)
      
      toast.success(json.message)
      fetchMappings(selectedBrand)
      closeAllModals()
    } catch (err) {
      toast.error(err.message || "Failed to change provider")
      // Revert to original provider on error
      fetchMappings(selectedBrand)
    } finally {
      setSaving(false)
      setUpdating(prev => {
        const updated = { ...prev }
        delete updated[key]
        return updated
      })
    }
  }

  /* ================= ADD API ================= */
  const handleAddAPI = async () => {
    if (!newAPI.api_name || !newAPI.service_id || !newAPI.provider_id) {
      toast.error("API name, service, and provider are required")
      return
    }

    try {
      setSaving(true)
      const res = await fetch(CREDENTIAL_API.ADD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_name: newAPI.api_name,
          service_id: parseInt(newAPI.service_id),
          company_id: 1,
          brand_id: parseInt(selectedBrand),
          provider_id: parseInt(newAPI.provider_id),
          api_url: newAPI.api_url || null,
          username: newAPI.username || null,
          password: newAPI.password || null,
          api_token: newAPI.api_token || null,
        }),
      })
      
      const json = await res.json()
      
      if (!res.ok) throw new Error(json.message)
      
      toast.success("API added successfully")
      closeAllModals()
      fetchMappings(selectedBrand)
    } catch (err) {
      toast.error(err.message || "Failed to add API")
    } finally {
      setSaving(false)
    }
  }

  /* ================= DELETE API ================= */
  const handleDeleteAPI = async (credentialId) => {
    try {
      setSaving(true)
      const res = await fetch(CREDENTIAL_API.DELETE(credentialId), {
        method: "DELETE",
      })
      
      const json = await res.json()
      
      if (!res.ok) throw new Error(json.message)
      
      toast.success("API deleted successfully")
      closeAllModals()
      fetchMappings(selectedBrand)
    } catch (err) {
      toast.error(err.message || "Failed to delete API")
    } finally {
      setSaving(false)
    }
  }

  /* ================= DELETE MODAL TRIGGERS ================= */
  const openDeleteModal = (type, item) => {
    setDeleteContext({ type, item })
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!deleteContext) return

    const { type, item } = deleteContext

    switch (type) {
      case "service":
        await handleDeleteService(item.id)
        break
      case "provider":
        await handleDeleteProvider(item.id)
        break
      case "api":
        await handleDeleteAPI(item)
        break
      case "providerService":
        await handleRemoveServiceFromProvider(item)
        break
      default:
        break
    }
  }

  // Initialize
  useEffect(() => {
    fetchBrands()
    fetchServices()
    fetchProviders()
    fetchProviderServices()
  }, [])

  useEffect(() => {
    if (selectedBrand) {
      fetchMappings(selectedBrand)
    }
  }, [selectedBrand])

  if (brandsLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size={28} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* TABS */}
      <div className="flex gap-2 border-b border-zinc-300">
        <button
          onClick={() => setShowSettingsTab(false)}
          className={`px-4 py-2 font-medium transition-colors ${
            !showSettingsTab
              ? "border-b-2 border-black text-black"
              : "text-zinc-600 hover:text-black"
          }`}
        >
          API Mapping
        </button>
        <button
          onClick={() => setShowSettingsTab(true)}
          className={`px-4 py-2 font-medium transition-colors ${
            showSettingsTab
              ? "border-b-2 border-black text-black"
              : "text-zinc-600 hover:text-black"
          }`}
        >
          Settings
        </button>
      </div>

      {/* API MAPPING TAB */}
      {!showSettingsTab && (
        <>
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">API Provider Mapping</h1>
              <p className="mt-1 text-sm text-zinc-600">
                Enable/disable APIs and change providers for your brand
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button 
                className="btn-primary gap-2" 
                onClick={() => setShowAddAPIModal(true)}
                disabled={!selectedBrand}
              >
                <Plus className="h-4 w-4" />
                Add API
              </Button>
              <Button 
                className="btn-secondary gap-2" 
                onClick={() => fetchMappings(selectedBrand)}
                disabled={loading || !selectedBrand}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
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

          {/* API MAPPINGS TABLE */}
          <div className="surface overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner size={24} />
              </div>
            ) : !selectedBrand ? (
              <div className="py-12 text-center text-zinc-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-base sm:text-lg font-medium">Please select a brand</p>
                <p className="mt-2 text-sm">Choose a brand from the dropdown above</p>
              </div>
            ) : data.credentials.length === 0 ? (
              <div className="py-12 text-center text-zinc-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-base sm:text-lg font-medium">No APIs found</p>
                <p className="mt-2 text-sm">Click "Add API" to create one</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Service</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">API Name</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold">Status</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold">Provider</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {data.credentials.map((cred) => (
                      <tr key={cred.credential_id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium">
                          {cred.service_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-600">
                          {cred.api_name || "Default API"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {cred.is_mapped === 1 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                              <Check className="h-3 w-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-zinc-100 text-zinc-700">
                              <X className="h-3 w-3" />
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {cred.is_mapped === 1 ? (
                            <select
                              value={cred.current_provider_id}
                              onChange={(e) => openProviderChangeModal(cred, e.target.value)}
                              disabled={updating[`provider_${cred.credential_id}`]}
                              className="h-9 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                            >
                              {data.providers.map((provider) => (
                                <option key={provider.id} value={provider.id}>
                                  {provider.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-sm text-zinc-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={cred.is_mapped === 1}
                                onChange={(e) => openToggleModal(cred, e.target.checked)}
                                disabled={updating[`toggle_${cred.credential_id}`]}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                            </label>
                            
                            <button
                              onClick={() => openDeleteModal("api", cred.credential_id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                              title="Delete API"
                            >
                              <Trash2 className="h-4 w-4 text-red-600 group-hover:text-red-700" />
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
        </>
      )}

      {/* SETTINGS TAB */}
      {showSettingsTab && (
        <div className="space-y-6">
          {/* SERVICES SECTION */}
          <div className="surface p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Services Management</h2>
              <Button 
                className="btn-primary gap-2 text-sm" 
                onClick={() => setShowAddServiceModal(true)}
              >
                <Plus className="h-4 w-4" />
                Add Service
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Service Name</th>
                    <th className="px-4 py-2 text-center font-semibold">Status</th>
                    <th className="px-4 py-2 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-2">{service.service_name}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          service.active 
                            ? "bg-green-100 text-green-700" 
                            : "bg-zinc-100 text-zinc-700"
                        }`}>
                          {service.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => {
                              setEditService(service)
                              setShowEditServiceModal(true)
                            }}
                            className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => openDeleteModal("service", service)}
                            className="p-1.5 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PROVIDERS SECTION */}
          <div className="surface p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Providers Management</h2>
              <Button 
                className="btn-primary gap-2 text-sm" 
                onClick={() => setShowAddProviderModal(true)}
              >
                <Plus className="h-4 w-4" />
                Add Provider
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Provider Name</th>
                    <th className="px-4 py-2 text-center font-semibold">Status</th>
                    <th className="px-4 py-2 text-center font-semibold">Services</th>
                    <th className="px-4 py-2 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {providers.map((provider) => {
                    const provServices = providerServices.filter(ps => ps.provider_id === provider.id)
                    return (
                      <tr key={provider.id} className="hover:bg-zinc-50">
                        <td className="px-4 py-2">{provider.name}</td>
                        <td className="px-4 py-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            provider.active 
                              ? "bg-green-100 text-green-700" 
                              : "bg-zinc-100 text-zinc-700"
                          }`}>
                            {provider.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center text-sm text-zinc-600">
                          {provServices.length} services
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => {
                                setSelectedProviderId(provider.id)
                                setSelectedProvider(provider)
                                setShowProviderServicesModal(true)
                              }}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            >
                              Manage Services
                            </button>
                            <button
                              onClick={() => {
                                setEditProvider(provider)
                                setShowEditProviderModal(true)
                              }}
                              className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => openDeleteModal("provider", provider)}
                              className="p-1.5 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 🔥 ALL MODALS WITH SLIDE CONFIRMATIONS ===================== */}
      
      {/* 🟢/🟠 TOGGLE MAPPING CONFIRMATION MODAL */}
      {showToggleModal && toggleContext && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="surface max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Confirm {toggleContext.enable ? 'Enable' : 'Disable'}</h2>
              <button onClick={() => closeAllModals()} className="p-1 hover:bg-zinc-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className={`${toggleContext.enable ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'} border rounded-xl p-4`}>
              <p className="text-sm font-medium text-zinc-900">
                You are about to {toggleContext.enable ? 'enable' : 'disable'}:
              </p>
              <p className="text-sm text-zinc-700 mt-2">
                <strong>{toggleContext.credential.service_name}</strong> - {toggleContext.credential.api_name || "Default API"}
              </p>
              {toggleContext.enable && (
                <p className="text-xs text-green-700 mt-1">
                  ✓ This will activate the API for this brand.
                </p>
              )}
              {!toggleContext.enable && (
                <p className="text-xs text-orange-700 mt-1">
                  ⚠ This will deactivate the API for this brand.
                </p>
              )}
            </div>

            <div className="pt-2">
              {saving ? (
                <div className="flex items-center justify-center h-12 bg-zinc-100 rounded-xl">
                  <Spinner size={20} />
                </div>
              ) : (
                <SlideToConfirm
                  onConfirm={confirmToggleMapping}
                  text={`Slide to ${toggleContext.enable ? 'enable' : 'disable'}`}
                  successText={toggleContext.enable ? "Enabling..." : "Disabling..."}
                  customColors={toggleContext.enable ? {
                    bgColor: "#dbfce7",
                    progressBg: "rgba(34, 197, 94, 0.3)",
                    buttonBg: "#22c55e",
                    buttonHover: "#16a34a",
                    textColor: "#15803d",
                  } : {
                    bgColor: "#fed7aa",
                    progressBg: "rgba(249, 115, 22, 0.3)",
                    buttonBg: "#f97316",
                    buttonHover: "#ea580c",
                    textColor: "#9a3412",
                  }}
                />
              )}
            </div>

            <button
              onClick={() => closeAllModals()}
              className="w-full px-4 py-2.5 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 🔵 PROVIDER CHANGE CONFIRMATION MODAL */}
      {showProviderChangeModal && providerChangeContext && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="surface max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Confirm Provider Change</h2>
              <button onClick={() => closeAllModals()} className="p-1 hover:bg-zinc-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm font-medium text-blue-900">
                You are about to change provider:
              </p>
              <p className="text-sm text-blue-700 mt-2">
                <strong>{providerChangeContext.credential.service_name}</strong> - {providerChangeContext.credential.api_name || "Default API"}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                New Provider: <strong>{providerChangeContext.newProviderName}</strong>
              </p>
            </div>

            <div className="pt-2">
              {saving ? (
                <div className="flex items-center justify-center h-12 bg-zinc-100 rounded-xl">
                  <Spinner size={20} />
                </div>
              ) : (
                <SlideToConfirm
                  onConfirm={confirmProviderChange}
                  text="Slide to change provider"
                  successText="Changing..."
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
              onClick={() => closeAllModals()}
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
              <button onClick={() => closeAllModals()} className="p-1 hover:bg-zinc-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm font-medium text-red-900">
                ⚠️ You are about to delete:
              </p>
              <p className="text-sm text-red-700 mt-2">
                {deleteContext.type === "service" && <strong>{deleteContext.item.service_name}</strong>}
                {deleteContext.type === "provider" && <strong>{deleteContext.item.name}</strong>}
                {deleteContext.type === "api" && <strong>API</strong>}
                {deleteContext.type === "providerService" && <strong>Service mapping</strong>}
              </p>
              <p className="text-xs text-red-600 mt-1">
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
              onClick={() => closeAllModals()}
              className="w-full px-4 py-2.5 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 🟢 ADD PROVIDER MODAL */}
      {showAddProviderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="surface max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Add Provider</h2>
              <button onClick={() => closeAllModals()} className="p-1 hover:bg-zinc-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700 block mb-2">
                Provider Name
              </label>
              <input
                type="text"
                value={newProvider.name}
                onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                className="w-full h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="e.g., Digitap"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newProvider.active}
                  onChange={(e) => setNewProvider({ ...newProvider, active: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-zinc-700">Active</span>
              </label>
            </div>

            <div className="pt-2">
              {saving ? (
                <div className="flex items-center justify-center h-12 bg-zinc-100 rounded-xl">
                  <Spinner size={20} />
                </div>
              ) : (
                <SlideToConfirm
                  onConfirm={handleAddProvider}
                  text="Slide to add provider"
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
              onClick={() => closeAllModals()}
              className="w-full px-4 py-2.5 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 🟢 EDIT PROVIDER MODAL */}
      {showEditProviderModal && editProvider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="surface max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Edit Provider</h2>
              <button onClick={() => closeAllModals()} className="p-1 hover:bg-zinc-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700 block mb-2">
                Provider Name
              </label>
              <input
                type="text"
                value={editProvider.name}
                onChange={(e) => setEditProvider({ ...editProvider, name: e.target.value })}
                className="w-full h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editProvider.active}
                  onChange={(e) => setEditProvider({ ...editProvider, active: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-zinc-700">Active</span>
              </label>
            </div>

            <div className="pt-2">
              {saving ? (
                <div className="flex items-center justify-center h-12 bg-zinc-100 rounded-xl">
                  <Spinner size={20} />
                </div>
              ) : (
                <SlideToConfirm
                  onConfirm={handleEditProvider}
                  text="Slide to update provider"
                  successText="Updating..."
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
              onClick={() => closeAllModals()}
              className="w-full px-4 py-2.5 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 🟢 ADD SERVICE MODAL */}
      {showAddServiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="surface max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Add Service</h2>
              <button onClick={() => closeAllModals()} className="p-1 hover:bg-zinc-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700 block mb-2">
                Service Name
              </label>
              <input
                type="text"
                value={newService.service_name}
                onChange={(e) => setNewService({ ...newService, service_name: e.target.value })}
                className="w-full h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="e.g., Email Verification"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newService.active}
                  onChange={(e) => setNewService({ ...newService, active: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-zinc-700">Active</span>
              </label>
            </div>

            <div className="pt-2">
              {saving ? (
                <div className="flex items-center justify-center h-12 bg-zinc-100 rounded-xl">
                  <Spinner size={20} />
                </div>
              ) : (
                <SlideToConfirm
                  onConfirm={handleAddService}
                  text="Slide to add service"
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
              onClick={() => closeAllModals()}
              className="w-full px-4 py-2.5 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 🟢 EDIT SERVICE MODAL */}
      {showEditServiceModal && editService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="surface max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Edit Service</h2>
              <button onClick={() => closeAllModals()} className="p-1 hover:bg-zinc-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700 block mb-2">
                Service Name
              </label>
              <input
                type="text"
                value={editService.service_name}
                onChange={(e) => setEditService({ ...editService, service_name: e.target.value })}
                className="w-full h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editService.active}
                  onChange={(e) => setEditService({ ...editService, active: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-zinc-700">Active</span>
              </label>
            </div>

            <div className="pt-2">
              {saving ? (
                <div className="flex items-center justify-center h-12 bg-zinc-100 rounded-xl">
                  <Spinner size={20} />
                </div>
              ) : (
                <SlideToConfirm
                  onConfirm={handleEditService}
                  text="Slide to update service"
                  successText="Updating..."
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
              onClick={() => closeAllModals()}
              className="w-full px-4 py-2.5 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 🟢 ADD API MODAL */}
      {showAddAPIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="surface max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Add API</h2>
              <button onClick={() => closeAllModals()} className="p-1 hover:bg-zinc-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-2">
                  API Name
                </label>
                <input
                  type="text"
                  value={newAPI.api_name}
                  onChange={(e) => setNewAPI({ ...newAPI, api_name: e.target.value })}
                  className="w-full h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g., Primary Email API"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-2">
                  Service
                </label>
                <select
                  value={newAPI.service_id}
                  onChange={(e) => setNewAPI({ ...newAPI, service_id: e.target.value })}
                  className="w-full h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Select service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.service_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-2">
                  Provider
                </label>
                <select
                  value={newAPI.provider_id}
                  onChange={(e) => setNewAPI({ ...newAPI, provider_id: e.target.value })}
                  className="w-full h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Select provider</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-2">
                  API URL
                </label>
                <input
                  type="text"
                  value={newAPI.api_url}
                  onChange={(e) => setNewAPI({ ...newAPI, api_url: e.target.value })}
                  className="w-full h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="https://api.example.com/v1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={newAPI.username}
                  onChange={(e) => setNewAPI({ ...newAPI, username: e.target.value })}
                  className="w-full h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={newAPI.password}
                  onChange={(e) => setNewAPI({ ...newAPI, password: e.target.value })}
                  className="w-full h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-2">
                  API Token
                </label>
                <input
                  type="text"
                  value={newAPI.api_token}
                  onChange={(e) => setNewAPI({ ...newAPI, api_token: e.target.value })}
                  className="w-full h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div className="pt-2">
              {saving ? (
                <div className="flex items-center justify-center h-12 bg-zinc-100 rounded-xl">
                  <Spinner size={20} />
                </div>
              ) : (
                <SlideToConfirm
                  onConfirm={handleAddAPI}
                  text="Slide to add API"
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
              onClick={() => closeAllModals()}
              className="w-full px-4 py-2.5 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 🔵 PROVIDER SERVICES MODAL */}
      {showProviderServicesModal && selectedProvider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="surface max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Manage Services - {selectedProvider.name}</h2>
              <button onClick={() => closeAllModals()} className="p-1 hover:bg-zinc-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-zinc-700 mb-2">Available Services</h3>
                <div className="space-y-2">
                  {services.map((service) => {
                    const isLinked = providerServices.some(
                      ps => ps.provider_id === selectedProviderId && ps.service_id === service.id
                    )
                    const mapping = providerServices.find(
                      ps => ps.provider_id === selectedProviderId && ps.service_id === service.id
                    )

                    return (
                      <div key={service.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                        <span className="text-sm font-medium">{service.service_name}</span>
                        {isLinked ? (
                          <button
                            onClick={() => openDeleteModal("providerService", mapping.id)}
                            className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddServiceToProvider(service.id)}
                            className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => closeAllModals()}
              className="w-full px-4 py-2.5 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
