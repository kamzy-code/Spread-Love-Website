import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

export default function DeleteConfirmationModal({
  setShowDeleteModal: setShowDeleteModal,
  setConfirmDelete,
  resetDeletedBooking,
  bookingID,
}: {
  setShowDeleteModal: (val: boolean) => void;
  setConfirmDelete: (val: boolean) => void;
  resetDeletedBooking: () => void;
  bookingID: string;
}) {
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
            {
              <div>
                <Trash2 className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-4">Delete Booking</h3>
                <p className="text-gray-700 mb-6">
                  {`Delete Booking ${bookingID}`}.
                </p>
              </div>
            }

            <div className="w-full flex justify-center items-center gap-4">
              <button
                onClick={() => {
                  resetDeletedBooking();
                  setConfirmDelete(false);
                  setShowDeleteModal(false);
                }}
                className="btn-secondary flex items-center justify-center mx-auto"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setConfirmDelete(true);
                  setShowDeleteModal(false);
                }}
                className="btn-primary flex items-center justify-center mx-auto"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
