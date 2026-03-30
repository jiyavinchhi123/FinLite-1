const API_BASE = "http://localhost:8080/api";

async function handleJson(res) {
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || "Request failed");
  }
  return text ? JSON.parse(text) : {};
}

export async function fetchSummary() {
  const res = await fetch(`${API_BASE}/summary`);
  return handleJson(res);
}

export async function addMoneyIn(payload) {
  const res = await fetch(`${API_BASE}/money-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJson(res);
}

export async function updateMoneyIn(id, payload) {
  const res = await fetch(`${API_BASE}/money-in/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJson(res);
}

export async function deleteMoneyIn(id) {
  const res = await fetch(`${API_BASE}/money-in/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
}

export async function addMoneyOut(payload) {
  const res = await fetch(`${API_BASE}/money-out`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJson(res);
}

export async function updateMoneyOut(id, payload) {
  const res = await fetch(`${API_BASE}/money-out/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJson(res);
}

export async function deleteMoneyOut(id) {
  const res = await fetch(`${API_BASE}/money-out/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
}

export async function loginUser(payload) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJson(res);
}

export async function registerUser(payload) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJson(res);
}

export async function createCompany(payload) {
  const res = await fetch(`${API_BASE}/companies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJson(res);
}

export async function getCompanyByOwner(ownerId) {
  const res = await fetch(`${API_BASE}/company/by-owner/${ownerId}`);
  if (res.status === 404) return null;
  return handleJson(res);
}

export async function updateCompany(id, payload) {
  const res = await fetch(`${API_BASE}/company/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJson(res);
}

export async function createCustomer(payload) {
  const res = await fetch(`${API_BASE}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJson(res);
}

export async function updateCustomer(id, payload) {
  const res = await fetch(`${API_BASE}/customers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJson(res);
}

export async function deleteCustomer(id) {
  const res = await fetch(`${API_BASE}/customers/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
}

export async function fetchCustomers(companyId) {
  const query = companyId ? `?companyId=${companyId}` : "";
  const res = await fetch(`${API_BASE}/customers${query}`);
  return handleJson(res);
}

export async function fetchIncome(companyId) {
  const query = companyId ? `?companyId=${companyId}` : "";
  const res = await fetch(`${API_BASE}/income${query}`);
  return handleJson(res);
}

export async function fetchExpense(companyId) {
  const query = companyId ? `?companyId=${companyId}` : "";
  const res = await fetch(`${API_BASE}/expense${query}`);
  return handleJson(res);
}

export async function createSupplier(payload) {
  const res = await fetch(`${API_BASE}/suppliers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJson(res);
}

export async function updateSupplier(id, payload) {
  const res = await fetch(`${API_BASE}/suppliers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJson(res);
}

export async function deleteSupplier(id) {
  const res = await fetch(`${API_BASE}/suppliers/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
}

export async function fetchSuppliers(companyId) {
  const query = companyId ? `?companyId=${companyId}` : "";
  const res = await fetch(`${API_BASE}/suppliers${query}`);
  return handleJson(res);
}

export async function analyzeSmartEntry(payload) {
  const res = await fetch("http://localhost:8000/smart-entry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJson(res);
}
