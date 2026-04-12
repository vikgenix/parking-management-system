const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const API_PREFIX = "/api";
const API_URL = API_BASE_URL + API_PREFIX;

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) =>
    fetchApi("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  logout: () => fetchApi("/auth/logout", { method: "DELETE" }),
  verify: () => fetchApi("/auth/verify"),
  refresh: () => fetchApi("/auth/refresh"),
};

// ── Vehicles ──────────────────────────────────────────────────────────────────
export interface Vehicle {
  id: string;
  licensePlate: string;
  model: string | null;
  userId: string;
  createdAt?: string;
}

export const vehicleApi = {
  getVehicles: (): Promise<{ vehicles: Array<Vehicle> }> =>
    fetchApi("/vehicle"),
  getVehicleById: (id: string): Promise<{ vehicle: Vehicle }> =>
    fetchApi(`/vehicle/${id}`),
  registerVehicle: (data: { licencePlate: string; model?: string }) =>
    fetchApi("/vehicle", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  // Backend: DELETE /vehicle with vehicleId in request body
  deleteVehicle: (vehicleId: string) =>
    fetchApi("/vehicle", {
      method: "DELETE",
      body: JSON.stringify({ vehicleId }),
    }),
};

// ── Dashboard Stats ───────────────────────────────────────────────────────────
export interface DashboardStats {
  totalRevenueToday: number;
  activeBookings: number;
  vehiclesParked: number;
  availableSlots: number;
  totalSlots: number;
}

// ── Recent Bookings ───────────────────────────────────────────────────────────
export interface RecentBooking {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
  vehicle: { id: string; licensePlate: string; model: string | null };
  slot: { id: string; slotCode: string; floorId: string };
}

// ── User ─────────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
}

// ── Parking ───────────────────────────────────────────────────────────────────
export interface ParkingLot {
  id: string;
  name: string;
  address: string;
  createdAt: string;
}

export interface Floor {
  id: string;
  name: string;
  level: number;
  parkingLotId: string;
  createdAt: string;
}

export interface Slot {
  id: string;
  slotCode: string;
  slotType: "standard" | "compact" | "handicapped" | "ev_charging";
  status: "available" | "reserved" | "occupied" | "inactive";
  floorId: string;
  createdAt: string;
}

// ── Admin API ─────────────────────────────────────────────────────────────────
export const adminApi = {
  // Dashboard
  getDashboardStats: (): Promise<{ stats: DashboardStats }> =>
    fetchApi("/admin/stats"),
  getRecentBookings: (limit = 10): Promise<{ bookings: RecentBooking[] }> =>
    fetchApi(`/admin/bookings/recent?limit=${limit}`),

  // Users
  getUsers: (): Promise<{ users: AdminUser[] }> => fetchApi("/admin/user"),

  // Parking Lots
  createParkingLot: (data: { name: string; address: string }) =>
    fetchApi("/admin/parking-lot", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteParkingLot: (id: string) =>
    fetchApi(`/admin/parking-lot/${id}`, { method: "DELETE" }),

  // Floors
  createFloor: (data: { name: string }) =>
    fetchApi("/admin/floor", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteFloor: (id: string) =>
    fetchApi(`/admin/floor/${id}`, { method: "DELETE" }),

  // Slots
  createSlot: (data: {
    slotCode: string;
    floorId: string;
    slotType?: "standard" | "compact" | "handicapped" | "ev_charging";
    status?: "available" | "reserved" | "occupied" | "inactive";
  }) =>
    fetchApi("/admin/slot", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteSlot: (id: string) =>
    fetchApi(`/admin/slot/${id}`, { method: "DELETE" }),
};

// ── Booking API ─────────────────────────────────────────────────────────────
export const bookingApi = {
  getAvailableSlots: (): Promise<{ slots: Array<Slot & { floor: { name: string; level: number; parkingLot: { name: string } } }> }> =>
    fetchApi("/booking/available-slots"),
  
  createBooking: (data: { vehicleId: string; slotId: string; startTime: string; endTime: string }) =>
    fetchApi("/booking", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  
  getMyBookings: (): Promise<{ bookings: any[] }> => fetchApi("/booking/my-bookings"),
  
  payBooking: (id: string) =>
    fetchApi(`/booking/${id}/pay`, { method: "POST" }),
};

