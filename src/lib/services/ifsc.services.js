import { apiClient } from "@/lib/api-client";
import { BANK_API } from "@/lib/api-endpoints";

/* ---------- GET BANK LIST ---------- */
export function getBanks({ page = 1, limit = 10, ifsc } = {}) {
  const params = new URLSearchParams({
    page,
    limit,
  });

  if (ifsc) params.append("ifsc", ifsc);

  return apiClient(`${BANK_API.LIST}?${params.toString()}`);
}

/* ---------- ADD BANK ---------- */
export function addBank(payload) {
  return apiClient(BANK_API.ADD, {
    method: "POST",
    body: payload,
  });
}

/* ---------- UPDATE BANK ---------- */
export function updateBank(id, payload) {
  return apiClient(BANK_API.UPDATE(id), {
    method: "PUT",
    body: payload,
  });
}

/* ---------- DELETE BANK ---------- */
export function deleteBank(id) {
  return apiClient(BANK_API.DELETE(id), {
    method: "DELETE",
  });
}
