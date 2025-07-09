
export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// Dashboard
export interface dashboardFilterContextType {
  appliedFilterType: string;
  appliedDate?: string;
  appliedStartDate?: string;
  appliedEndDate?: string;
}

// Auth
export type AdminUser = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  _id: string;
};

export type AuthStatus =
  | "idle"
  | "checking"
  | "authenticated"
  | "unauthenticated"
  | "error";

export interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (body: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  authStatus: AuthStatus;
   reload: () => Promise<void>;
}

// Bookings
export type FilterType = "daily" | "weekly" | "monthly" | "yearly" | "custom";

export interface Booking {
  _id: string,
  bookingId: string;
  callerName: string;
  callerPhone: string;
  callerEmail?: string;
  recipientName: string;
  recipientPhone: string;
  country: string;
  occassion: string;
  callType: string;
  callDate: string;
  price: string;
  message?: string;
  specialInstruction?: string;
  status?: string;
  assignedRep?: any; // populated rep data
  createdAt: string;
  // add more fields as needed
}

export interface BookingFilters {
  status?: string;
  callType?: string;
  occassion?: string;
  country?: string;
  assignedRep?: string;
  singleDate?: string;
  filterType?: FilterType;
  startDate?: string;
  endDate?: string;
  sortParam?: string;
  sortOrder?: "1" | "-1";
  search?: string; 
  page?: number;
  limit?: number;
}


export type BookingFilterContex = BookingFilters & {
  setPage: (newPage: number) => void;
};