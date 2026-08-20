import { AdminRevenueEntry, RevenueTrendResponse } from "@/types/revenueTrend";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

function authHeaders(token?: string): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchRevenueTrends(
  startDate: string
): Promise<RevenueTrendResponse> {
  const url = `${API_BASE}/api/v1/revenue_trends?start_date=${encodeURIComponent(startDate)}`;
  const response = await fetch(url, { cache: "no-store", credentials: "include" });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      body.errors?.join(", ") || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return response.json();
}

export async function adminLogin(email: string, password: string) {
  const response = await fetch(`${API_BASE}/api/v1/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(body.errors?.join(", ") || "Login failed", response.status);
  }

  return response.json();
}

export async function adminLogout() {
  await fetch(`${API_BASE}/api/v1/admin/login`, {
    method: "DELETE",
    credentials: "include",
  });
}

export async function fetchRevenueEntries(token?: string): Promise<AdminRevenueEntry[]> {
  const response = await fetch(`${API_BASE}/api/v1/admin/revenue_entries`, {
    headers: authHeaders(token),
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new ApiError("Failed to load entries", response.status);
  }

  const body = await response.json();
  return Array.isArray(body) ? body : body.data;
}

export async function createRevenueEntry(
  token: string | undefined,
  payload: Record<string, unknown>
) {
  const response = await fetch(`${API_BASE}/api/v1/admin/revenue_entries`, {
    method: "POST",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ revenue_entry: payload }),
    credentials: "include",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(body.errors?.join(", ") || "Create failed", response.status);
  }

  return response.json();
}

export async function updateRevenueEntry(
  token: string | undefined,
  id: number,
  payload: Record<string, unknown>
) {
  const response = await fetch(`${API_BASE}/api/v1/admin/revenue_entries/${id}`, {
    method: "PATCH",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ revenue_entry: payload }),
    credentials: "include",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(body.errors?.join(", ") || "Update failed", response.status);
  }

  return response.json();
}

export async function deleteRevenueEntry(token: string | undefined, id: number) {
  const response = await fetch(`${API_BASE}/api/v1/admin/revenue_entries/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
    credentials: "include",
  });

  if (!response.ok) {
    throw new ApiError("Delete failed", response.status);
  }
}
