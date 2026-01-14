import React from "react";
import { XCircle } from "lucide-react";

interface BookingErrorProps {
  error: string;
  bookingId: string;
  onRetry: () => void;
}

export const BookingError: React.FC<BookingErrorProps> = ({
  error,
//   bookingId,
  onRetry,
}) => {
  return (
    <div className="w-full text-center">
      <div className="w-full flex justify-center mb-2">
        <XCircle className="text-red-500 h-16 w-16" />
      </div>
      <h1 className="text-3xl font-bold gradient-text pb-2 mb-4">
        Booking Failed
      </h1>
      <p className="text-gray-600 mb-6">{error}</p>

      {error === "Error verifying transaction. Please try again." ? (
        <button onClick={onRetry} className="w-full btn-primary">
          Try again
        </button>
      ) : (
        <button onClick={() => window.location.href = "/book"} className="w-full btn-primary">
          Back to Booking
        </button>
      )}
    </div>
  );
};
