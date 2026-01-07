const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/* =========================
   BANK / IFSC APIs
========================= */
export const BANK_API = {
  LIST: `${API_BASE}/api/ifsc`,                       
  ADD: `${API_BASE}/api/ifsc`,                         
  UPDATE: (id) => `${API_BASE}/api/ifsc?id=${id}`,    
  DELETE: (id) => `${API_BASE}/api/ifsc?id=${id}`,    
};  

/* =========================
   AUTH / LOGIN APIs 
========================= */
export const AUTH_API = {
  SEND_OTP: `${API_BASE}/api/auth/send-otp`,           // POST
  VERIFY_OTP: `${API_BASE}/api/auth/verify-otp`,       // POST
  LOGOUT: `${API_BASE}/api/auth/logout`,               // POST
};

/* =========================
   USERS / SUPERADMIN APIs
========================= */
export const USER_API = {
  LIST: `${API_BASE}/api/users`,                       // GET
  ADD: `${API_BASE}/api/users`,                        // POST
  UPDATE: `${API_BASE}/api/users`,                     // PUT
  DELETE: (id) => `${API_BASE}/api/users?id=${id}`,    // DELETE
};

/* =========================
   WEBSITE SETTINGS APIs
========================= */
export const WEBSITE_SETTINGS_API = {
  GET: `${API_BASE}/api/website-settings`,             // GET
  UPDATE: `${API_BASE}/api/website-settings`,          // PUT
};

/* =========================
   FOIR CONFIG APIs
========================= */
export const FOIR_API = {
  LIST: `${API_BASE}/api/foir`,                        // GET
  ADD: `${API_BASE}/api/foir`,                         // POST
  UPDATE: `${API_BASE}/api/foir`,                      // PUT
  DELETE: (id) => `${API_BASE}/api/foir?id=${id}`,     // DELETE
};

/* =========================
   DPD CONFIG APIs
========================= */
export const DPD_API = {
  LIST: `${API_BASE}/api/dpd`,                         // GET
  ADD: `${API_BASE}/api/dpd`,                          // POST
  UPDATE: `${API_BASE}/api/dpd`,                       // PUT
  DELETE: (id) => `${API_BASE}/api/dpd?id=${id}`,      // DELETE
};

/* =========================
   NBFC (MASTER COMPANIES) APIs
========================= */
export const NBFC_API = {
  LIST: `${API_BASE}/api/nbfc`,                        // GET
  ADD: `${API_BASE}/api/nbfc`,                         // POST
  UPDATE: `${API_BASE}/api/nbfc`,                      // PUT
  DELETE: (id) => `${API_BASE}/api/nbfc?id=${id}`,     // DELETE
};

/* =========================
   BRAND (MASTER BRANDS) APIs
========================= */
export const BRAND_API = {
  LIST: `${API_BASE}/api/brands`,                      // GET
  ADD: `${API_BASE}/api/brands`,                       // POST
  UPDATE: `${API_BASE}/api/brands`,                    // PUT
  DELETE: (id) => `${API_BASE}/api/brands?id=${id}`,   // DELETE
};

/* =========================
   CREDIT LIMIT APIs
========================= */
export const CREDIT_LIMIT_API = {
  USERS: `${API_BASE}/api/creditlimit`,                // GET → users dropdown
  ASSIGNED_LIST: `${API_BASE}/api/creditlimit/assigned`, // GET → table
  ADD: `${API_BASE}/api/creditlimit/assigned`,         // POST
  UPDATE: `${API_BASE}/api/creditlimit/assigned`,      // PUT
};

/* =========================
   LMS SETTINGS APIs ⭐ NEW
========================= */
export const LMS_SETTINGS_API = {
  LIST: `${API_BASE}/api/lms-settings`,                // GET ?company_id=1
  ADD: `${API_BASE}/api/lms-settings`,                 // POST
  UPDATE: `${API_BASE}/api/lms-settings`,              // PUT
  DELETE: (id) => `${API_BASE}/api/lms-settings?id=${id}`, // DELETE
};

/* =========================
   CREDENTIALS APIs
========================= */
export const CREDENTIAL_API = {
  LIST: (cid) => `${API_BASE}/api/credentials?company_id=${cid}`,
  ADD: `${API_BASE}/api/credentials`,
  UPDATE: `${API_BASE}/api/credentials`,
  DELETE: (id) => `${API_BASE}/api/credentials?id=${id}`,
};

/* =========================
   LEADS MANAGEMENT APIs
========================= */
export const LEADS_API = {
  LIST: `${API_BASE}/api/leads`,                       // GET with filters + pagination
  GET_STATUSES: `${API_BASE}/api/leads`,               // POST with action: "get_statuses"
  UPDATE_STATUS: `${API_BASE}/api/leads`,              // POST with action: "update_status"
};

/* =========================
   API PROVIDER MAPPING APIs
========================= */
export const API_MAPPING_API = {
  LIST: (brand_id) => `${API_BASE}/api/api-mapping?brand_id=${brand_id}`, // GET
  TOGGLE_MAPPING: `${API_BASE}/api/api-mapping`,       // POST with action: "toggle_mapping"
  CHANGE_PROVIDER: `${API_BASE}/api/api-mapping`,      // POST with action: "change_provider"
};

/* =========================
   PROVIDERS APIs
========================= */
export const PROVIDER_API = {
  LIST: `${API_BASE}/api/providers`,                   // GET
  ADD: `${API_BASE}/api/providers`,                    // POST
  UPDATE: `${API_BASE}/api/providers`,                 // PUT
  DELETE: (id) => `${API_BASE}/api/providers?id=${id}`, // DELETE
};

/* =========================
   SERVICES APIs
========================= */
export const SERVICE_API = {
  LIST: `${API_BASE}/api/services`,                    // GET
  ADD: `${API_BASE}/api/services`,                     // POST with action: "add"
  UPDATE: `${API_BASE}/api/services`,                  // POST with action: "update"
  DELETE: (id) => `${API_BASE}/api/services?id=${id}`, // DELETE
};

/* =========================
   PROVIDER-SERVICES MAPPING APIs
========================= */
export const PROVIDER_SERVICE_API = {
  LIST: `${API_BASE}/api/provider-services`,           // GET
  BY_PROVIDER: (providerId) => `${API_BASE}/api/provider-services?provider_id=${providerId}`, // GET
  ADD: `${API_BASE}/api/provider-services`,            // POST
  DELETE: (id) => `${API_BASE}/api/provider-services?id=${id}`, // DELETE
};

export const COLLECTION_DPD_API = {
  USERS: `${API_BASE}/api/collection-dpd`,           // GET → collection officers dropdown
  LIST: `${API_BASE}/api/collection-dpd/mapping`,    // GET → table data
  ADD: `${API_BASE}/api/collection-dpd/mapping`,     // POST
  UPDATE: `${API_BASE}/api/collection-dpd/mapping`,  // PUT
  DELETE: (id) => `${API_BASE}/api/collection-dpd/mapping?id=${id}`, // DELETE
};
/* =========================
   FUTURE (OPTIONAL)
========================= */
// export const ROLE_API = {}
// export const PERMISSION_API = {}
// export const SIDEBAR_API = {}
