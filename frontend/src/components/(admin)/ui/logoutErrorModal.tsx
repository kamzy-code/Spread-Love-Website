import { motion } from "framer-motion";
import { XCircle, CheckCircle, } from "lucide-react";

export default function LogoutErrorModal({
  setShowModal,
}: {
  setShowModal: () => void;
}) {
  return (
    <div>
      <div
        className="fixed z-50 bg-black/50 top-0 left-0 right-0 bottom-0"
        onClick={() => setShowModal()}
      ></div>

      <div className="fixed z-50 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
        <div className="w-75 md:w-auto max-w-2xl text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="card p-8"
          >
            {(
              <div>
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-4">Error</h3>
                <p className="text-gray-700 mb-6">
                  There was an error logging you out, Please try again.
                </p>
              </div>
            ) }

            <button
              onClick={() => setShowModal()}
              className="btn-secondary flex items-center justify-center mx-auto"
            >
              Close
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
