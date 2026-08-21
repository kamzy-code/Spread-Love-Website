"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { RatingTemplate, RatingTemplateFormValues, RatingCriterion } from "@/lib/types";
import { useCreateRatingTemplate, useUpdateRatingTemplate } from "@/hooks/useRatingTemplates";
import { deepEqual } from "@/lib/hasBookingChanged";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

const emptyCriterion: RatingCriterion = { key: "", label: "", scaleType: "pass_fail" };

const emptyForm: RatingTemplateFormValues = {
  name: "",
  criteria: [{ ...emptyCriterion }],
};

const toFormValues = (template: RatingTemplate): RatingTemplateFormValues => ({
  name: template.name,
  criteria: template.criteria,
  passFailThreshold: template.passFailThreshold,
});

export default function RatingTemplateFormModal({
  template,
  onClose,
}: {
  template?: RatingTemplate;
  onClose: () => void;
}) {
  const isEditing = !!template;
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<RatingTemplateFormValues>(
    template ? toFormValues(template) : emptyForm,
  );
  const [errorMessage, setErrorMessage] = useState("");

  useLockBodyScroll();

  const createMutation = useCreateRatingTemplate();
  const updateMutation = useUpdateRatingTemplate(template?._id ?? "");
  const mutation = isEditing ? updateMutation : createMutation;

  useEffect(() => {
    if (mutation.isSuccess) {
      queryClient.invalidateQueries({ queryKey: ["ratingTemplates"] });
      queryClient.invalidateQueries({ queryKey: ["ratingTemplate", "active"] });
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutation.isSuccess]);

  const hasNotChanged = isEditing && deepEqual(formData, toFormValues(template));

  const updateCriterion = (index: number, patch: Partial<RatingCriterion>) => {
    setFormData((prev) => ({
      ...prev,
      criteria: prev.criteria.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    }));
  };

  const addCriterion = () => {
    setFormData((prev) => ({ ...prev, criteria: [...prev.criteria, { ...emptyCriterion }] }));
  };

  const removeCriterion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      criteria: prev.criteria.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (hasNotChanged) {
      onClose();
      return;
    }

    try {
      await mutation.mutateAsync(formData);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to save rating template",
      );
    }
  };

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full md:w-[70%] lg:w-[50%] max-h-[90%] overflow-y-auto bg-white rounded-xl shadow-lg">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-8 w-full flex flex-col items-center justify-center"
        >
          <X
            className="w-5 h-5 md:h-8 md:w-8 text-gray-700 absolute right-6 top-6 hover:scale-120 transition cursor-pointer"
            onClick={onClose}
          />

          <div className="text-center py-2">
            <h2 className="text-xl md:text-2xl font-bold gradient-text">
              {isEditing ? "Edit Rating Template" : "Create Rating Template"}
            </h2>
            <p className="text-sm md:text-[1rem] text-gray-700">
              {isEditing ? `Editing ${template.name}` : "Define a new QC review checklist"}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 text-brand-start w-full py-4 text-start"
          >
            <div className="flex flex-col space-y-2">
              <label className="text-gray-700 font-medium">Template Name:</label>
              <input
                className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
                placeholder="e.g. Standard QC v1"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-gray-700 font-medium">Criteria:</label>
                <button
                  type="button"
                  className="text-sm text-brand-end flex items-center gap-1"
                  onClick={addCriterion}
                >
                  <Plus className="h-4 w-4" /> Add criterion
                </button>
              </div>

              <div className="space-y-3">
                {formData.criteria.map((criterion, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          type="text"
                          placeholder="Key (e.g. audio_clarity)"
                          value={criterion.key}
                          onChange={(e) => updateCriterion(index, { key: e.target.value })}
                          required
                        />
                        <input
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          type="text"
                          placeholder="Label shown to reviewer"
                          value={criterion.label}
                          onChange={(e) => updateCriterion(index, { label: e.target.value })}
                          required
                        />
                        <select
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          value={criterion.scaleType}
                          onChange={(e) =>
                            updateCriterion(index, {
                              scaleType: e.target.value as RatingCriterion["scaleType"],
                              min: e.target.value === "numeric" ? (criterion.min ?? 1) : undefined,
                              max: e.target.value === "numeric" ? (criterion.max ?? 5) : undefined,
                            })
                          }
                        >
                          <option value="pass_fail">Pass / Fail</option>
                          <option value="numeric">Numeric scale</option>
                        </select>

                        {criterion.scaleType === "numeric" && (
                          <div className="flex gap-2">
                            <input
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-1/2"
                              type="number"
                              placeholder="Min"
                              value={criterion.min ?? ""}
                              onChange={(e) =>
                                updateCriterion(index, { min: Number(e.target.value) })
                              }
                              required
                            />
                            <input
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-1/2"
                              type="number"
                              placeholder="Max"
                              value={criterion.max ?? ""}
                              onChange={(e) =>
                                updateCriterion(index, { max: Number(e.target.value) })
                              }
                              required
                            />
                          </div>
                        )}
                      </div>

                      {formData.criteria.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCriterion(index)}
                          className="text-red-500 hover:text-red-700 mt-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-gray-700 font-medium">
                Overall Pass/Fail Threshold (optional):
              </label>
              <input
                className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
                type="number"
                value={formData.passFailThreshold ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    passFailThreshold: e.target.value === "" ? undefined : Number(e.target.value),
                  }))
                }
                placeholder="Only relevant if numeric criteria roll up into one score"
              />
            </div>

            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

            <button
              type="submit"
              disabled={mutation.isPending || hasNotChanged}
              className="btn-primary rounded-lg w-full h-12 flex items-center justify-center disabled:opacity-50"
            >
              {mutation.isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Template"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
