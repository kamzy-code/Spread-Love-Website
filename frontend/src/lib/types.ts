export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

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

export interface AdminAuthHook {
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

export interface BookingCallerData {
  name: string;
  phone: string;
  email: string;
  gender?: "male" | "female" | "prefer_not_to_say";
  relationship?: string;
}

export interface BookingRecipientData {
  _id: string;
  recipientName: string;
  recipientPhone: string;
  country: string;
  occassion: string;
  callType: string;
  callDate: string;
  price: number;
  message?: string;
  specialInstruction?: string;
  callStatus?: string;
  callRecording?: string;
  callRecordingURL?: string;
}

export interface Booking {
  _id: string;
  bookingId: string;

  // v1 legacy flat fields — present on documents created before the schema
  // refactor; optional since v2 bookings never set them. Read via caller/
  // recipients below instead, with these only as a fallback for un-migrated docs.
  callerName?: string;
  callerPhone?: string;
  callerEmail?: string;
  relationship?: string;
  recipientName?: string;
  recipientPhone?: string;
  country?: string;
  occassion?: string;
  callType?: string;
  callDate?: string;
  price?: string;
  message?: string;
  specialInstruction?: string;
  status?: string;
  callRecording?: string;
  callRecordingURL?: string;

  // v2 nested shape
  caller?: BookingCallerData;
  recipients?: BookingRecipientData[];
  bookingStatus?: "pending" | "in_progress" | "completed";
  totalPrice?: number;
  couponCode?: string;
  discountAmount?: number;
  reuseCount?: number;
  duplicateOfPaid?: boolean;
  customerTier?: "new" | "regular" | "vip" | "diamond";

  // shared / unchanged across v1 and v2
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

// Customer self-service update (PUT /booking/:bookingId/update) — deliberately
// a smaller, all-partial field set. Mirrors updateBookingByCustomerSchema on
// the backend: no callStatus/price/occassion — those are rep/system-owned or
// price-determining, never customer-editable after the fact.
export interface CustomerUpdateCaller {
  name?: string;
  phone?: string;
  email?: string;
  gender?: "male" | "female" | "prefer_not_to_say";
  relationship?: string;
}

export interface CustomerUpdateRecipient {
  _id: string;
  recipientName?: string;
  recipientPhone?: string;
  country?: string;
  callDate?: string;
  message?: string;
  specialInstruction?: string;
}

export interface CustomerBookingUpdatePayload {
  caller?: CustomerUpdateCaller;
  recipients?: CustomerUpdateRecipient[];
}

// Admin correction (PUT /booking/admin/:bookingId) — broader than the
// customer-safe payload above: occassion/callType/price/callRecordingURL are
// editable since admins are trusted staff fixing genuine data-entry mistakes,
// not the price-manipulation surface the customer schema guards against.
export interface AdminUpdateCaller {
  name?: string;
  phone?: string;
  email?: string;
  gender?: "male" | "female" | "prefer_not_to_say";
  relationship?: string;
}

export interface AdminUpdateRecipient {
  _id: string;
  recipientName?: string;
  recipientPhone?: string;
  country?: string;
  occassion?: string;
  callType?: string;
  callDate?: string;
  price?: number;
  message?: string;
  specialInstruction?: string;
  callRecordingURL?: string;
}

export interface AdminBookingUpdatePayload {
  caller?: AdminUpdateCaller;
  recipients?: AdminUpdateRecipient[];
}

export interface BookingFilters {
  status?: string;
  bookingStatus?: string;
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

// Customers
export type CustomerTier = "new" | "regular" | "vip" | "diamond";

export type Customer = {
  _id: string;
  email: string;
  name: string;
  phone: string;
  completedBookings: number;
  tier: CustomerTier;
  lastBookingAt?: string;
  createdAt: string;
};

export type CustomerFilter = {
  tier?: CustomerTier | "";
  search?: string;
  page?: number;
  limit: number;
  // "" = all time — the customer directory's natural default, unlike
  // booking/dashboard views which default to a period.
  filterType?: FilterType | "";
  singleDate?: string;
  startDate?: string;
  endDate?: string;
  fetchParam?: string;
};

// Logs
export interface LogFile {
  name: string;
  size: number;
  createdAt: string;
}

// Audit log — superadmin-only view of admin-made edits to protected fields
export type AuditEntity = "booking" | "service" | "coupon" | "rep";

export type AuditLogEntry = {
  _id: string;
  entity: AuditEntity;
  entityId: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: { _id: string; firstName: string; lastName: string; email: string } | string | null;
  createdAt: string;
};

// Coupons
export type DiscountType = "flat" | "percent";

export type Coupon = {
  _id: string;
  code: string;
  discountType: DiscountType;
  value: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
  createdBy: string;
  createdAt: string;
};

export type CouponFormValues = {
  code: string;
  discountType: DiscountType;
  value: number;
  usageLimit: number;
  expiresAt: string;
};

export type CouponFilter = {
  discountType?: string;
  status?: string;
  search?: string;
  page?: number;
  limit: number;
};

// Services
export type ServiceIconKey =
  | "cake"
  | "heart"
  | "users"
  | "graduationCap"
  | "partyPopper"
  | "gift"
  | "phone"
  | "sun";

export type ServicePricing = {
  features: string[];
  localPrice: number;
  internationalPrice: number;
};

export type Service = {
  _id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  iconKey: ServiceIconKey;
  regular: ServicePricing;
  special: ServicePricing;
  active: boolean;
  createdAt: string;
};

export type ServicePricingUpdate = {
  regular?: Partial<ServicePricing>;
  special?: Partial<ServicePricing>;
};

export type ServiceDetailsUpdate = Partial<
  Pick<Service, "title" | "description" | "category" | "thumbnail" | "iconKey">
>;

export type ServiceCreatePayload = Pick<
  Service,
  "title" | "description" | "category" | "thumbnail" | "iconKey"
> & {
  regular: ServicePricing;
  special: ServicePricing;
};

export type ServiceFilter = {
  category?: string;
  status?: string;
  search?: string;
  page?: number;
  limit: number;
};

// Recordings
export type RecordingStatus = "pending_upload" | "uploaded" | "expired" | "deleted";
export type DeliveryChannelStatus = "not_sent" | "sent" | "failed";

export interface RecordingFile {
  _id: string;
  s3Key: string;
  s3Bucket: string;
  mimeType: string;
  fileSize: number;
  partNumber: number;
  uploadedAt: string;
}

export interface DeliveryStatus {
  status: DeliveryChannelStatus;
  sentAt?: string;
  error?: string;
  providerMessageId?: string;
}

export interface RecordingRatingValue {
  criterionKey: string;
  value: string | string[];
}

export interface Recording {
  _id: string;
  booking: string;
  recipientId?: string;
  uploadedBy: string;
  files: RecordingFile[];
  status: RecordingStatus;
  locked: boolean;
  expiresAt: string;
  deletedAt?: string;
  deletedBy?: string;
  reviewed: boolean;
  reviewedAt?: string;
  // reviewedBy/ratingCriteriaSnapshot/ratingValues/approvedBy/score are the
  // QC judgment itself — listRecordings redacts all five for call reps
  // (recordingService.withScore), who can see that their own recording was
  // reviewed/approved but not the rating details or who wrote them. Always
  // present for superadmin/salesrep, and always present (score possibly
  // null) on the rate/approve/unapprove responses, which call reps can
  // never reach.
  reviewedBy?: string;
  ratingTemplate?: string;
  // Frozen copy of the template's criteria as of the first rating — what
  // RateRecordingModal renders against once a recording has been reviewed.
  ratingCriteriaSnapshot?: RatingCriterion[];
  ratingValues?: RecordingRatingValue[];
  approved: boolean;
  approvedAt?: string;
  approvedBy?: string;
  score?: RecordingScore | null;
  emailDelivery: DeliveryStatus;
  whatsappDelivery: DeliveryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RecordingScoredCriterion {
  criterionKey: string;
  label: string;
  type: CriterionType;
  value?: string | string[];
  weight?: number;
}

export interface RecordingScore {
  criteria: RecordingScoredCriterion[];
  averageWeight: number | null;
  overallScorePercent: number | null;
}

// Rating Templates
export type RatingTier = "poor" | "fair" | "good" | "excellent";
export type CriterionType = "options" | "text";

// As returned by the API — includes the server-derived `weight` per option.
export interface RatingOption {
  value: string;
  label: string;
  tier: RatingTier;
  weight: number;
}

export interface RatingCriterion {
  key: string;
  label: string;
  type: CriterionType;
  // options-only: select-many (checklist) vs select-one. Ignored for "text".
  multiple?: boolean;
  // Present when type === "options", absent for "text".
  options?: RatingOption[];
}

export interface RatingTemplate {
  _id: string;
  name: string;
  active: boolean;
  criteria: RatingCriterion[];
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// The form/write shape never sends `weight` — the server derives it from
// `tier` (see ratingTemplateService.ts's TIER_WEIGHTS), so a template author
// can't submit a tier/weight mismatch. Same shape for create and update —
// the backend rejects `active` on both, activation is its own endpoint
// (useActivateRatingTemplate).
export interface RatingOptionInput {
  value: string;
  label: string;
  tier: RatingTier;
}

export interface RatingCriterionInput {
  key: string;
  label: string;
  type: CriterionType;
  multiple?: boolean;
  options?: RatingOptionInput[];
}

export type RatingTemplateFormValues = {
  name: string;
  criteria: RatingCriterionInput[];
};
