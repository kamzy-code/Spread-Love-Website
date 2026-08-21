import { z } from "zod";

const ratingCriterionInputSchema = z
  .object({
    key: z.string().min(1, "Criterion key is required"),
    label: z.string().min(1, "Criterion label is required"),
    scaleType: z.enum(["numeric", "pass_fail"]),
    min: z.number().optional(),
    max: z.number().optional(),
  })
  .refine(
    (c) => c.scaleType !== "numeric" || (c.min !== undefined && c.max !== undefined && c.min < c.max),
    {
      message: "Numeric criteria require min and max, with min less than max",
      path: ["min"],
    },
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
  passFailThreshold: z.number().optional(),
});

export const updateRatingTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  criteria: criteriaArraySchema.optional(),
  passFailThreshold: z.number().optional(),
});
