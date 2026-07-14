import z from "zod";

export const createCoupounSchema = z.object({
    code: z.string().min(1, "Coupon code is required").transform((val) => val.toUpperCase().trim()),
    discountType: z.enum(["flat", "percent"]),
    value: z.number().nonnegative("Coupon value must be non-negative"),
    usageLimit: z.number().int().nonnegative("Usage limit must be a non-negative integer"),
    expiresAt: z.coerce.date().refine((date) => date > new Date(), {
        message: "Expiration date must be in the future",
    }),
    createdBy: z.string().min(1, "Created by (admin ID) is required"),
})

export const updateCouponSchema = z.object({
    code: z.string().min(1, "Coupon code is required").transform((val) => val.toUpperCase().trim()).optional(),
    discountType: z.enum(["flat", "percent"]).optional(),
    value: z.number().nonnegative("Coupon value must be non-negative").optional(),
    usageLimit: z.number().int().nonnegative("Usage limit must be a non-negative integer").optional(),
    expiresAt: z.coerce.date().refine((date) => date > new Date(), {
        message: "Expiration date must be in the future",
    }).optional(),
    active: z.boolean().optional(),
})