const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api`;

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
}

async function apiRequest(endpoint: string, options: ApiOptions = {}) {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// --- Auth ---
export const authApi = {
  register: (name: string, email: string, password: string) =>
    apiRequest("/auth/register", { method: "POST", body: { name, email, password } }),

  login: (email: string, password: string) =>
    apiRequest("/auth/login", { method: "POST", body: { email, password } }),

  getMe: (token: string) =>
    apiRequest("/auth/me", { token }),
};

// --- Trips ---
export const tripsApi = {
  create: (token: string, data: { destination: string; startingPoint: string; currency: string; days: number; budgetType: string; interests: string[] }) =>
    apiRequest("/trips", { method: "POST", body: data, token }),

  getAll: (token: string) =>
    apiRequest("/trips", { token }),

  getById: (token: string, id: string) =>
    apiRequest(`/trips/${id}`, { token }),

  delete: (token: string, id: string) =>
    apiRequest(`/trips/${id}`, { method: "DELETE", token }),

  regenerateDay: (token: string, id: string, dayNumber: number, userRequest: string) =>
    apiRequest(`/trips/${id}/regenerate-day`, {
      method: "PUT",
      body: { dayNumber, userRequest },
      token,
    }),

  addActivity: (token: string, id: string, dayNumber: number, timeSlot?: string) =>
    apiRequest(`/trips/${id}/add-activity`, {
      method: "PUT",
      body: { dayNumber, timeSlot },
      token,
    }),

  removeActivity: (token: string, id: string, dayNumber: number, activityId: string) =>
    apiRequest(`/trips/${id}/remove-activity`, {
      method: "PUT",
      body: { dayNumber, activityId },
      token,
    }),

  updatePackingItem: (token: string, id: string, categoryIndex: number, itemIndex: number, packed: boolean) =>
    apiRequest(`/trips/${id}/packing-list`, {
      method: "PUT",
      body: { categoryIndex, itemIndex, packed },
      token,
    }),
};
