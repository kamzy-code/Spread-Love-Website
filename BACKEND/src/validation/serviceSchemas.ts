import z from "zod";

const pricingSchema = z.object({
  features: z.array(z.string()),
  localPrice: z.number().nonnegative("Price must be non-negative"),
  internationalPrice: z.number().nonnegative("Price must be non-negative"),
});

export const createServiceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  thumbnail: z.string().min(1, "Thumbnail is required"),
  iconKey: z.enum([
    "cake",
    "heart",
    "users",
    "graduationCap",
    "partyPopper",
    "gift",
    "phone",
    "sun",
  ]),
  regular: pricingSchema,
  special: pricingSchema,
});

const pricingUpdateSchema = z.object({
  features: z.array(z.string()).optional(),
  localPrice: z.number().nonnegative("Price must be non-negative").optional(),
  internationalPrice: z.number().nonnegative("Price must be non-negative").optional(),
});

export const updateServicePricingSchema = z
  .object({
    regular: pricingUpdateSchema.optional(),
    special: pricingUpdateSchema.optional(),
  })
  .refine((data) => data.regular || data.special, {
    message: "At least one of regular or special pricing is required",
  });

export const getAllServicesQuerySchema = z.object({
  category: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  search: z.string().optional(),
  page: z.string().regex(/^\d+$/, "page must be a number").optional(),
  limit: z.string().regex(/^\d+$/, "limit must be a number").optional(),
});

export const updateServiceDetailsSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  thumbnail: z.string().min(1).optional(),
  iconKey: z
    .enum(["cake", "heart", "users", "graduationCap", "partyPopper", "gift", "phone", "sun"])
    .optional(),
});
