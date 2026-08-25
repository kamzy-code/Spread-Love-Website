"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Recording, RatingCriterion, RecordingRatingValue } from "@/lib/types";
import { useActiveRatingTemplate } from "@/hooks/useRatingTemplates";
import { useSubmitRating, useInvalidateRecordings } from "@/hooks/useRecordings";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import MiniLoader from "../ui/miniLoader";

const TIER_LABEL: Record<string, string> = {
  poor: "Poor",
  fair: "Fair",
  good: "Good",
  excellent: "Excellent",
};

type FormValue = string | string[];

// Reviewed recordings are pinned to the criteria snapshot taken at their
// first rating (see recordingModel.ts) — never the live active template,
// which may have changed since. Unreviewed recordings render against
// whatever template is currently active.
const criteriaSource = (recording: Recording, activeCriteria?: RatingCriterion[]) =>
  recording.reviewed ? recording.ratingCriteriaSnapshot : activeCriteria;

const initialValues = (recording: Recording, criteria: RatingCriterion[]): Record<string, FormValue> => {
  const byKey = new Map((recording.ratingValues ?? []).map((rv) => [rv.criterionKey, rv.value]));
  const values: Record<string, FormValue> = {};
  for (const criterion of criteria) {
    const existing = byKey.get(criterion.key);
    if (existing !== undefined) {
      values[criterion.key] = existing;
    } else if (criterion.type === "options" && criterion.multiple) {
      values[criterion.key] = [];
    } else {
      values[criterion.key] = "";
    }
  }
  return values;
};

export default function RateRecordingModal({
  recording,
  bookingId,
  recipientId,
  onClose,
}: {
  recording: Recording;
  bookingId: string;
  recipientId: string;
  onClose: () => void;
}) {
  useLockBodyScroll();
  const invalidate = useInvalidateRecordings();
  const submitRating = useSubmitRating(recording._id);
  const { data: activeTemplate, isLoading: isLoadingTemplate } = useActiveRatingTemplate();

  const criteria = criteriaSource(recording, activeTemplate?.criteria) ?? [];
  const [values, setValues] = useState<Record<string, FormValue>>({});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (criteria.length > 0) {
      setValues(initialValues(recording, criteria));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteria.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // React re-dispatches bubbling native events (like this form's submit)
    // along the REACT component tree, not the DOM tree — so even portaled
    // into document.body, this would otherwise still reach and submit the
    // booking-details page's own <form> (RecordingsPanel's parent).
    e.stopPropagation();
    setErrorMessage("");

    const ratingValues: RecordingRatingValue[] = criteria
      .map((c) => ({ criterionKey: c.key, value: values[c.key] }))
      .filter((rv) => (Array.isArray(rv.value) ? rv.value.length > 0 : rv.value !== ""));

    try {
      await submitRating.mutateAsync(ratingValues);
      invalidate(bookingId, recipientId);
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save rating");
    }
  };

  const toggleMultiValue = (key: string, optionValue: string) => {
    setValues((prev) => {
      const current = Array.isArray(prev[key]) ? (prev[key] as string[]) : [];
      const next = current.includes(optionValue)
        ? current.filter((v) => v !== optionValue)
        : [...current, optionValue];
      return { ...prev, [key]: next };
    });
  };

  // Portalled to the document body — this modal is triggered from
  // RecordingsPanel, which sits inside the booking-details "Update Booking
  // Info" <form>. Rendering inline would nest <form> inside <form> (invalid
  // HTML, breaks submit semantics); a portal escapes that DOM subtree.
  return createPortal(
    <div className="fixed z-50 inset-0 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full md:w-[70%] lg:w-[55%] max-h-[90%] overflow-y-auto bg-white rounded-xl shadow-lg">
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
              {recording.reviewed ? "Edit Call Rating" : "Rate Call Recording"}
            </h2>
          </div>

          {isLoadingTemplate && !recording.reviewed ? (
            <div className="py-12 flex justify-center">
              <MiniLoader></MiniLoader>
            </div>
          ) : criteria.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">
              No active rating template — ask a superadmin to activate one before rating calls.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-5 text-brand-start w-full py-4 text-start"
            >
              {criteria.map((criterion) => (
                <div key={criterion.key} className="space-y-2">
                  <label className="text-gray-700 font-medium">{criterion.label}</label>

                  {criterion.type === "text" && (
                    <textarea
                      className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
                      rows={3}
                      value={(values[criterion.key] as string) ?? ""}
                      onChange={(e) =>
                        setValues((prev) => ({ ...prev, [criterion.key]: e.target.value }))
                      }
                    />
                  )}

                  {criterion.type === "options" && !criterion.multiple && (
                    <div className="flex flex-wrap gap-3">
                      {(criterion.options ?? []).map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 text-sm border border-gray-300 rounded-lg px-3 py-2 cursor-pointer has-[:checked]:border-brand-end has-[:checked]:bg-brand-end/10"
                        >
                          <input
                            type="radio"
                            name={criterion.key}
                            checked={values[criterion.key] === option.value}
                            onChange={() =>
                              setValues((prev) => ({ ...prev, [criterion.key]: option.value }))
                            }
                          />
                          {option.label}
                          <span className="text-xs text-gray-500">({TIER_LABEL[option.tier]})</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {criterion.type === "options" && criterion.multiple && (
                    <div className="flex flex-wrap gap-3">
                      {(criterion.options ?? []).map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 text-sm border border-gray-300 rounded-lg px-3 py-2 cursor-pointer has-[:checked]:border-brand-end has-[:checked]:bg-brand-end/10"
                        >
                          <input
                            type="checkbox"
                            checked={
                              Array.isArray(values[criterion.key]) &&
                              (values[criterion.key] as string[]).includes(option.value)
                            }
                            onChange={() => toggleMultiValue(criterion.key, option.value)}
                          />
                          {option.label}
                          <span className="text-xs text-gray-500">({TIER_LABEL[option.tier]})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

              <button
                type="submit"
                disabled={submitRating.isPending}
                className="btn-primary rounded-lg w-full h-12 flex items-center justify-center disabled:opacity-50"
              >
                {submitRating.isPending ? "Saving..." : "Save Rating"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>,
    document.body,
  );
}
