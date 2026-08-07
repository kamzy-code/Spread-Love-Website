import { z } from "zod";

// Tolerant on purpose — every field is optional since the admin UI only
// sends the filters actually in use, matching the existing hand-parsed
// convention in customerController rather than hard-rejecting a request
// for omitting a filter.
export const getAllCustomersQuerySchema = z.object({
  tier: z.enum(["new", "regular", "vip", "diamond"]).optional(),
  search: z.string().optional(),
  filterType: z.enum(["daily", "weekly", "monthly", "yearly", "custom"]).optional(),
  singleDate: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  fetchParam: z.enum(["callDate", "bookingDate"]).optional(),
  page: z.string().regex(/^\d+$/, "page must be a number").optional(),
  limit: z.string().regex(/^\d+$/, "limit must be a number").optional(),
  sortParam: z.string().optional(),
  sortOrder: z.enum(["1", "-1"]).optional(),
});

export const exportCustomersCsvQuerySchema = getAllCustomersQuerySchema.pick({
  tier: true,
  search: true,
  filterType: true,
  singleDate: true,
  startDate: true,
  endDate: true,
  fetchParam: true,
});
