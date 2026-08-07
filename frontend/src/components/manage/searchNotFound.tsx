import { motion } from "framer-motion";
import { MessageCircle, XCircle } from "lucide-react";
import { NETWORK_ERROR_MESSAGE } from "@/lib/apiClient";

export default function BookingNotFound({
  id,
  error,
}: {
  id: string;
  error: string;
}) {
  const getBookingErrorCopy = (
    error: string,
    id?: string
  ): { title: string; body: string } => {
    switch (error) {
      case NETWORK_ERROR_MESSAGE:
        return {
          title: "Connection Error",
          body: "We couldn't connect to the server. Please check your internet connection and try again.",
        };
      case "Booking not found":
        return {
          title: "Booking Not Found",
          body: `We couldn't find a booking with ID "${
            id ?? ""
          }". Please check your booking ID and try again.`,
        };
      case "Booking ID required":
        return {
          title: "Booking ID Required",
          body: "Please enter a booking ID to search for your booking.",
        };
      default:
        return {
          title: "Something Went Wrong",
          body: error || "An unexpected error occurred. Please try again.",
        };
    }
  };

  const { title, body } = getBookingErrorCopy(error, id);

  return (
    <section className="py-12 bg-white">
      <div className="container-max section-padding">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="card p-8"
          >
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-4">{title}</h3>
            <p className="text-gray-700 mb-6">{body}</p>
            <button
              onClick={() =>
                window.open(
                  "https://wa.me/+2349017539148?text=Hi! I need help with Spread Love services.",
                  "_blank"
                )
              }
              className="btn-primary flex items-center justify-center mx-auto"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Contact Support
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
