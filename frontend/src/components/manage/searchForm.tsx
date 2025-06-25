"use client";
import React, { useState, useEffect } from "react";
import { Send } from "lucide-react";
import BookingDetails from "@/components/manage/bookingDetails";

export default function SearchForm() {
  const [mounted, setMounted] = useState(false);

  const [bookingID, setBookingID] = useState("");
  const [booking, setBooking] = useState<any>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      if (bookingID.toUpperCase().includes("SL")) {
        setBooking(mockBooking);
      } else {
        setBooking(null);
      }
      setIsSubmitting(false);
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "scheduled":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Mock booking data
  const mockBooking = {
    id: "SL12345678",
    caller_name: "John Smith",
    caller_email: "john@example.com",
    recipient_name: "Sarah Johnson",
    recipient_phone: "+1 (555) 123-4567",
    country: "United States",
    occassion: "Anniversary Wishes",
    call_type: "regular",
    call_date: "2024-02-15",
    preferredTime: "14:00",
    message: "Happy birthday Sarah! Hope your day is filled with love and joy.",
    special_instruction: "call at night",
    status: "rejected",
    assignedRep: "Emily Rodriguez",
    createdAt: "2024-02-10",
    price: "$15",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      if (bookingID.toUpperCase().includes("SL")) {
        setBooking(mockBooking);
      } else {
        setBooking(null);
      }

      setIsSubmitting(false);
    }, 3000);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Avoid SSR
  return (
    <div>
      {/* form */}
      <section className="gradient-background-soft py-20">
        <div className=" container-max section-padding px-10 flex justify-center">
          <div className="card p-8 w-full md:w-[70%] lg:w-[60%] flex flex-col items-center justify-center text-center">
            <h2 className="gradient-text text-3xl font-semibold  pb-2">
              {" "}
              Find Your Booking
            </h2>

            <p className="text-gray-700 mb-4">
              {" "}
              Enter the booking ID you received in your confirmation email
            </p>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 text-brand-start w-full"
            >
              <div className="flex flex-row items-center lg:px-10 w-full gap-4">
                <div className="flex flex-col flex-1 space-y-2">
                  <input
                    className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400"
                    type="text"
                    name="name"
                    value={bookingID}
                    onChange={(e) => {
                      setBookingID(e.target.value);
                    }}
                    required
                    placeholder="enter your Booking ID (SLN123456)"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Searching..." : "Search"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* booking details */}
      {booking && <BookingDetails data={booking}></BookingDetails>}
    </div>
  );
}
