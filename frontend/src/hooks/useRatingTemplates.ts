import { useQuery, useMutation } from "@tanstack/react-query";
import { RatingTemplate, RatingTemplateFormValues } from "@/lib/types";
import { apiCall } from "@/lib/apiClient";

// superadmin-only list — template management, not the rating form's source
// of truth (see useActiveRatingTemplate for that).
export const useRatingTemplates = () => {
  return useQuery({
    queryKey: ["ratingTemplates"],
    queryFn: async ({ signal }) => {
      const data = await apiCall("/rating-templates", { signal });
      return data.templates as RatingTemplate[];
    },
    staleTime: 1000 * 60,
  });
};

// The one read a sales rep can also make — what the QC rating form (2.6)
// actually renders against. `template` is null when nothing is active yet.
export const useActiveRatingTemplate = () => {
  return useQuery({
    queryKey: ["ratingTemplate", "active"],
    queryFn: async ({ signal }) => {
      const data = await apiCall("/rating-templates/active", { signal });
      return data.template as RatingTemplate | null;
    },
    staleTime: 1000 * 60,
  });
};

export const useCreateRatingTemplate = () => {
  return useMutation({
    mutationFn: (body: RatingTemplateFormValues) =>
      apiCall("/rating-templates", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
};

export const useUpdateRatingTemplate = (templateId: string) => {
  return useMutation({
    mutationFn: (body: Partial<RatingTemplateFormValues>) =>
      apiCall(`/rating-templates/${templateId}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
  });
};

export const useActivateRatingTemplate = () => {
  return useMutation({
    mutationFn: (templateId: string) =>
      apiCall(`/rating-templates/${templateId}/activate`, { method: "PUT" }),
  });
};

export const useDeactivateRatingTemplate = () => {
  return useMutation({
    mutationFn: (templateId: string) =>
      apiCall(`/rating-templates/${templateId}/deactivate`, { method: "PUT" }),
  });
};
