import React from "react";
import { useRouter } from "next/navigation";

interface BookingSuccessProps {
  bookingId: string;
}

export const BookingSuccess: React.FC<BookingSuccessProps> = ({ bookingId }) => {
  const router = useRouter();

  return (
    <div className="w-full text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="text-3xl font-bold gradient-text pb-2 mb-4">
       {`You're All Set to Spread Love!`}
      </h1>
      <p className="text-gray-600 mb-6">
        {`Your surprise call has been booked successfully. We'll make sure it's
        absolutely perfect!`}
      </p>

      <div className="gradient-background-soft p-4 rounded-lg mb-6">
        <p className="text-sm text-gray-600 mb-2">Your Booking ID:</p>
        <p className="text-2xl font-bold text-brand-end">{bookingId}</p>
      </div>
      <p className="text-sm text-gray-600 mb-6">
       {` Save this ID to manage your booking. We'll also send confirmation
        details to your email.`}
      </p>

      <div className="space-y-3">
        <button
          onClick={() => {
            router.replace("/book");
          }}
          className="w-full btn-primary"
        >
          Book Another Call
        </button>

        <button
          onClick={() => window.open(`/manage?id=${bookingId}`, "_blank")}
          className="w-full btn-secondary"
        >
          Manage This Booking
        </button>
      </div>
    </div>
  );
};
