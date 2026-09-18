import { Clock, Star, CheckCircle2 } from "lucide-react";
import { RecordingSummary } from "./types";

export type RecordingBadgeState = "pending_review" | "rated" | "approved";

export interface RecordingBadge {
  state: RecordingBadgeState;
  label: string;
}

// Shows the least-progressed state as the headline — a rep scanning the
// list cares most about what's NOT done yet. No badge at all when nothing's
// been uploaded, so the common case stays visually quiet.
export const getRecordingBadge = (
  summary: RecordingSummary | undefined,
  totalRecipients: number,
): RecordingBadge | null => {
  if (!summary || summary.uploaded === 0) return null;

  if (summary.uploaded > summary.reviewed) {
    return { state: "pending_review", label: `${summary.uploaded - summary.reviewed} pending review` };
  }

  if (summary.reviewed > 0 && summary.approved < summary.reviewed) {
    return { state: "rated", label: `${summary.reviewed} rated` };
  }

  return {
    state: "approved",
    label: summary.approved === totalRecipients ? "All approved" : `${summary.approved} approved`,
  };
};

export const getRecordingBadgeColor = (state: RecordingBadgeState): string => {
  switch (state) {
    case "pending_review":
      return "bg-amber-100 text-amber-800";
    case "rated":
      return "bg-blue-100 text-blue-800";
    case "approved":
      return "bg-green-100 text-green-800";
  }
};

export const getRecordingBadgeIcon = (state: RecordingBadgeState, resize?: boolean) => {
  const size = resize ? "h-3 w-3" : "h-5 w-5";
  switch (state) {
    case "pending_review":
      return <Clock className={`${size} text-amber-600`} />;
    case "rated":
      return <Star className={`${size} text-blue-600`} />;
    case "approved":
      return <CheckCircle2 className={`${size} text-green-600`} />;
  }
};
