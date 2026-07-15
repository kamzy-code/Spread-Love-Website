export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// Dashboard
export interface dashboardFilterContextType {
  appliedFilterType: string;
  appliedFetchParam: string;
  appliedDate?: string;
  appliedStartDate?: string;
  appliedEndDate?: string;
  repId?: string;
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
  _id: string;
  bookingId: string;
  callerName: string;
  callerPhone: string;
  callerEmail?: string;
  relationship: string;
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
  callRecording?: string;
  callRecordingURL?: string;
  contactConsent?: string;
  confirmationMailsent?: boolean;
  paymentStatus: string;
  paymentReference?: string;
  assignedRep?: any; // populated rep data
  createdAt: string;
}

// v2 booking creation (multi-recipient checkout flow)
export interface BookingCaller {
  name: string;
  phone: string;
  email: string;
  gender: "male" | "female" | "prefer_not_to_say" | "";
  relationship: string;
}

export interface BookingRecipient {
  recipientName: string;
  recipientPhone: string;
  country: string;
  occassion: string;
  callType: string;
  callDate: string;
  price: number;
  message?: string;
  specialInstruction?: string;
  callRecording?: "yes" | "no";
}

export interface CreateBookingPayload {
  caller: BookingCaller;
  recipients: BookingRecipient[];
  contactConsent?: "yes" | "no";
  couponCode?: string;
}

export interface CreateBookingResponse {
  message: string;
  bookingId: string;
  paymentURL: string;
}

export interface CouponValidationResponse {
  valid: boolean;
  message?: string;
  discountAmount?: number;
  newTotal?: number;
}

// Local form state — same shape as the API types above, minus fields that
// are derived rather than user-entered (e.g. recipient price is computed
// from occassion/callType/country, not typed in).
export type CallerFormState = BookingCaller;
export type RecipientFormState = Omit<BookingRecipient, "price">;

export interface BookingFilters {
  status?: string;
  callType?: string;
  occassion?: string;
  country?: string;
  assignedRep?: string;
  singleDate?: string;
  filterType?: FilterType;
  fetchParam?: string;
  startDate?: string;
  endDate?: string;
  sortParam?: string;
  sortOrder?: "1" | "-1";
  search?: string;
  page?: number;
  limit?: number;
  confirmationMailsent?: boolean;
  paymentStatus?: string;
  paymentURL?: string;
}

export type BookingFilterContex = BookingFilters & {
  setPage: (newPage: number) => void;
};

export type Rep = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
};

export type RepFilter = {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit: number;
};

export type RepFiltercontext = RepFilter & {
  setPage: (newPage: number) => void;
};

// Logs
export interface LogFile {
  name: string;
  size: number;
  createdAt: string;
}
