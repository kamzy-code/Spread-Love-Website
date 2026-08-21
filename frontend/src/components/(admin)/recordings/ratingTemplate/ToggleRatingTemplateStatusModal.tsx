import { motion } from "framer-motion";
import { Ban, CheckCircle } from "lucide-react";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

export default function ToggleRatingTemplateStatusModal({
  templateName,
  action,
  onCancel,
  onConfirm,
  isPending,
  errorMessage,
}: {
  templateName: string;
  action: "activate" | "deactivate";
  onCancel: () => void;
  onConfirm: () => void;
  isPending: boolean;
  errorMessage?: string;
}) {
  const isActivating = action === "activate";
  useLockBodyScroll();

  return (
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
            {isActivating ? (
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            ) : (
              <Ban className="h-16 w-16 text-red-500 mx-auto mb-4" />
            )}
            <h3 className="text-2xl font-semibold mb-4">
              {isActivating ? "Activate Template" : "Deactivate Template"}
            </h3>
            <p className="text-gray-700 mb-6">
              {isActivating
                ? `Make "${templateName}" the live QC template? Whatever's currently active will be deactivated.`
                : `Deactivate "${templateName}"? No template will be active for QC ratings until another one is activated.`}
            </p>

            {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

            <div className="w-full flex justify-center items-center gap-4">
              <button
                onClick={onCancel}
                className="btn-secondary flex items-center justify-center mx-auto"
              >
                Cancel
              </button>

              <button
                onClick={onConfirm}
                disabled={isPending}
                className="btn-primary flex items-center justify-center mx-auto disabled:opacity-50"
              >
                {isPending ? "Saving..." : "Confirm"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
