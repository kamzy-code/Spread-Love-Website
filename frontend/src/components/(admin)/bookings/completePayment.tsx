import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

export default function CompletePaymentModal({
  paymentLink,
  setShowPaymentModal,
}: {
  paymentLink: string;
  setShowPaymentModal: (val: boolean) => void;
}) {
  const [linkCopied, setLinkCopied] = useState(false);

  return (
    <div className="">
      <div
        className="fixed z-50 inset-0 flex items-center justify-center bg-black/50"
        onClick={() => setShowPaymentModal(false)}
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-[90%] md:w-[70%] lg:w-[40%] max-h-[90%] bg-white rounded-xl shadow-lg  p-8 flex flex-col items-center justify-center "
          onClick={(e) => e.stopPropagation()}
        >
          <X
            className="w-5 h-5 md:h-8 md:w-8 text-gray-700 absolute right-5 top-5 hover:scale-120 transition"
            onClick={() => setShowPaymentModal(false)}
          ></X>

          <div className="text-center space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">Complete Payment</h2>

            <div className="flex flex-col gap-2 items-center justify-center">
              <p className="text-brand-start font-bold">{paymentLink}</p>
              <button
                className="btn-primary disabled:opacity-50 "
                disabled={linkCopied}
                onClick={() => {
                  navigator.clipboard.writeText(paymentLink);
                  setLinkCopied(true);
                  setTimeout(() => {
                    setLinkCopied(false);
                  }, 1500);
                }}
              >
                {linkCopied ? `Copied` : `Copy Link`}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
