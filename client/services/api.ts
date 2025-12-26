import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Vehicle,
  Payment,
  ApiResponse,
} from "@shared/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Helper: get token
const getAuthToken = () => localStorage.getItem("authToken");

// ✅ Helper: normalize any "id" to string ObjectId
const normalizeId = (id: any): string => {
  if (!id) throw new Error("Missing id");

  if (typeof id === "string") return id;

  if (typeof id === "object") {
    const v =
      id._id?.toString?.() ??
      id._id ??
      id.id?.toString?.() ??
      id.id ??
      id.value?.toString?.() ??
      id.value;

    if (typeof v === "string") return v;
  }

  const s = String(id);
  if (s === "[object Object]") {
    throw new Error("Invalid id: received object instead of string (_id)");
  }
  return s;
};

// ✅ fetch helper
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const msg = payload?.message || payload?.error || "Request failed";
    throw new Error(msg);
  }

  return payload;
};

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getMe: async (): Promise<AuthResponse> => fetchWithAuth("/auth/me"),

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
  },
};

// Vehicle API
export const vehicleApi = {
  create: async (data: Vehicle): Promise<ApiResponse<Vehicle>> => {
    return fetchWithAuth("/vehicles", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getAll: async (params?: {
    vehicleType?: "syrian" | "foreign";
    status?: string;
    search?: string;
  }): Promise<ApiResponse<Vehicle[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.vehicleType) queryParams.append("vehicleType", params.vehicleType);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);

    const query = queryParams.toString();
    return fetchWithAuth(`/vehicles${query ? `?${query}` : ""}`);
  },

  getById: async (id: any): Promise<ApiResponse<Vehicle>> => {
    const vid = normalizeId(id);
    return fetchWithAuth(`/vehicles/${vid}`);
  },

  update: async (id: any, data: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> => {
    const vid = normalizeId(id);
    return fetchWithAuth(`/vehicles/${vid}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: any): Promise<ApiResponse> => {
    const vid = normalizeId(id);
    return fetchWithAuth(`/vehicles/${vid}`, {
      method: "DELETE",
    });
  },
};

// Payment API
export const paymentApi = {
  create: async (data: Payment): Promise<ApiResponse<Payment>> => {
    return fetchWithAuth("/payments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getAll: async (params?: { status?: string; search?: string }): Promise<ApiResponse<Payment[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);

    const query = queryParams.toString();
    return fetchWithAuth(`/payments${query ? `?${query}` : ""}`);
  },

  getById: async (id: any): Promise<ApiResponse<Payment>> => {
    const pid = normalizeId(id);
    return fetchWithAuth(`/payments/${pid}`);
  },
};


// ✅ Meta API (makes / models / colors)
export const metaApi = {
  getMakes: async (): Promise<string[]> => {
    const payload = await fetchWithAuth("/meta/makes");
    // متوقع يرجع {success:true, data:[...]} أو array مباشر
    return Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
  },

  getModels: async (make: string): Promise<string[]> => {
    const qs = new URLSearchParams();
    qs.set("make", make);
    const payload = await fetchWithAuth(`/meta/models?${qs.toString()}`);
    return Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
  },

  getColors: async (): Promise<Array<{ _id: string; name: string; ccid?: number }>> => {
    const payload = await fetchWithAuth("/meta/colors");
    return Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
  },
};
