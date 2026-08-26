"use client";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

export default function DeleteRecordingModal({
  onCancel,
  onConfirm,
  isPending,
  errorMessage,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  isPending: boolean;
  errorMessage?: string;
}) {
  useLockBodyScroll();

  // Portalled to document.body, and both buttons explicitly typed — this
  // modal is triggered from RecordingsPanel, a DOM descendant of the
  // booking-details "Update Booking Info" <form>. A <button> with no type
  // defaults to type="submit"; without the portal, clicking either button
  // here would natively submit that outer form (see RateRecordingModal.tsx
  // for the same class of bug in the rating form).
  return createPortal(
    <div>
      <div className="fixed z-50 bg-black/50 top-0 left-0 right-0 bottom-0"></div>

      <div className="fixed z-50 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
        <div className="w-75 md:w-auto max-w-2xl text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="card p-8 md:min-w-sm"
          >
            <Trash2 className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-4">Delete Recording</h3>
            <p className="text-gray-700 mb-6">
              Delete this recording? Its audio file(s) will be permanently removed from
              storage. This can&apos;t be undone.
            </p>

            {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

            <div className="w-full flex justify-center items-center gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="btn-secondary flex items-center justify-center mx-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={isPending}
                className="rounded-lg px-6 py-2.5 bg-red-500 text-white font-medium hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center mx-auto"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
