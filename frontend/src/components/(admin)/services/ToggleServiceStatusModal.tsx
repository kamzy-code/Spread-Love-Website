import { motion } from "framer-motion";
import { Ban, CheckCircle } from "lucide-react";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

export default function ToggleServiceStatusModal({
  serviceTitle,
  action,
  onCancel,
  onConfirm,
  isPending,
}: {
  serviceTitle: string;
  action: "deactivate" | "reactivate";
  onCancel: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  const isDeactivating = action === "deactivate";
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
            {isDeactivating ? (
              <Ban className="h-16 w-16 text-red-500 mx-auto mb-4" />
            ) : (
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            )}
            <h3 className="text-2xl font-semibold mb-4">
              {isDeactivating ? "Deactivate Service" : "Reactivate Service"}
            </h3>
            <p className="text-gray-700 mb-6">
              {isDeactivating
                ? `Hide ${serviceTitle} from the services page and booking form?`
                : `Make ${serviceTitle} bookable again?`}
            </p>

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
