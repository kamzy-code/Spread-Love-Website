import { z } from "zod";

// `weight` is deliberately not accepted here — the server derives it from
// `tier` (ratingTemplateService's TIER_WEIGHTS lookup)
const ratingOptionInputSchema = z.object({
  value: z.string().min(1, "Option value is required"),
  label: z.string().min(1, "Option label is required"),
  tier: z.enum(["poor", "fair", "good", "excellent"]),
});

const ratingCriterionInputSchema = z
  .object({
    key: z.string().min(1, "Criterion key is required"),
    label: z.string().min(1, "Criterion label is required"),
    type: z.enum(["options", "text"]),
    multiple: z.boolean().optional(),
    options: z.array(ratingOptionInputSchema).optional(),
  })
  .refine((c) => c.type !== "options" || (c.options && c.options.length > 0), {
    message: "Options criteria require at least one option",
    path: ["options"],
  })
  .refine((c) => c.type !== "text" || !c.options, {
    message: "Text criteria cannot have options",
    path: ["options"],
  })
  .refine(
    (c) =>
      c.type !== "options" ||
      !c.options ||
      new Set(c.options.map((o) => o.value)).size === c.options.length,
    { message: "Option values must be unique within a criterion", path: ["options"] },
  );

const criteriaArraySchema = z
  .array(ratingCriterionInputSchema)
  .min(1, "At least one criterion is required")
  .refine(
    (criteria) => new Set(criteria.map((c) => c.key)).size === criteria.length,
    { message: "Criterion keys must be unique within a template" },
  );

export const createRatingTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  criteria: criteriaArraySchema,
});

// Activation is a separate endpoint (ratingTemplateRoute.ts's :id/activate)
// — deliberately not accepted here, so "exactly one active template" only
// has one code path that can ever flip it.
export const updateRatingTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  criteria: criteriaArraySchema.optional(),
});
