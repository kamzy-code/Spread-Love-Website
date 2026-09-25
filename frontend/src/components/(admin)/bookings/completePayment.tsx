import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { useSendPaymentLinkEmail } from "@/hooks/usePayment";

export default function CompletePaymentModal({
  paymentLink,
  bookingId,
  callerPhone,
  setShowPaymentModal,
}: {
  paymentLink: string;
  bookingId: string;
  callerPhone?: string;
  setShowPaymentModal: (val: boolean) => void;
}) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [currentLink, setCurrentLink] = useState(paymentLink);
  const sendEmailMutation = useSendPaymentLinkEmail();
  useLockBodyScroll();

  // Emails the customer the live link. The backend regenerates the reference
  // when the previous payment failed, so the returned URL can differ from the
  // one shown — refresh the copy/WhatsApp link with it.
  const handleSendEmail = async () => {
    setSendError(null);
    try {
      const result = await sendEmailMutation.mutateAsync(bookingId);
      const freshLink = result?.data?.authorization_url;
      if (freshLink) setCurrentLink(freshLink);
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    } catch (error) {
      setSendError(
        error instanceof Error ? error.message : "Failed to send payment link email"
      );
    }
  };

  // No backend call — wa.me opens WhatsApp with the message prefilled; the
  // admin confirms the send from their phone/WhatsApp Web.
  const handleSendWhatsApp = () => {
    if (!callerPhone || !currentLink) return;
    const message = `Hi! Complete your payment for booking ${bookingId} using this secure link: ${currentLink}`;
    const phone = callerPhone.replace(/[\s-]/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

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
              <p className="text-brand-start font-bold break-all">{currentLink}</p>
              <button
                className="btn-primary disabled:opacity-50 "
                disabled={linkCopied}
                onClick={() => {
                  navigator.clipboard.writeText(currentLink);
                  setLinkCopied(true);
                  setTimeout(() => {
                    setLinkCopied(false);
                  }, 1500);
                }}
              >
                {linkCopied ? `Copied` : `Copy Link`}
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-2">
              <button
                type="button"
                className="flex-1 text-sm border border-brand-end text-brand-end rounded-lg py-2 hover:bg-brand-end hover:text-white transition disabled:opacity-50"
                disabled={sendEmailMutation.isPending}
                onClick={handleSendEmail}
              >
                {sendEmailMutation.isPending ? "Sending..." : "Send via Email"}
              </button>

              {callerPhone && (
                <button
                  type="button"
                  className="flex-1 text-sm border border-green-500 text-green-600 rounded-lg py-2 hover:bg-green-500 hover:text-white transition"
                  onClick={handleSendWhatsApp}
                >
                  Send via WhatsApp
                </button>
              )}
            </div>

            {emailSent && (
              <p className="text-xs text-green-600">
                Payment link sent to the caller&apos;s email.
              </p>
            )}
            {sendError && <p className="text-xs text-red-600">{sendError}</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}