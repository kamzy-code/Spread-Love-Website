"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BookingDetails from "@/components/manage/bookingDetails";
import BookingNotFound from "./searchNotFound";
import { useQuery } from "@tanstack/react-query";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
// Fetch Request
const getBooking = async (bookingId: string) => {
  const response = await fetch(`${apiUrl}/booking/${bookingId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  if (!response.ok) {
    // Attach status and statusText for more context if needed
    throw new Error(data.message || response.statusText || "Unknown error");
  }
  return data;
};

export default function SearchForm() {
  const [mounted, setMounted] = useState(false);
  const [bookingID, setBookingID] = useState("");
  const [searchID, setSearchID] = useState("");

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
    status: "unsuccessful",
    assignedRep: "Emily Rodriguez",
    createdAt: "2024-02-10",
    price: "3000",
  };

  // useQuery to manage get booking fetch request
  const { data, error, isFetching, refetch } = useQuery({
    queryKey: ["booking", searchID],
    queryFn: () => getBooking(searchID),
    enabled: !!searchID,
  });

  // submit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchID === bookingID) {
      // If searching for the same ID, force refetch
      refetch();
    } else {
      setSearchID(bookingID);
    }
  };

  // mount the component
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document
      .getElementById("booking-details")
      ?.scrollIntoView({ behavior: "smooth" });
  }, [data]);

  if (!mounted) return null; // Avoid SSR

  return (
    <div>
      {/* form */}
      <section className="gradient-background-soft py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className=" container-max section-padding px-10 flex justify-center"
        >
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
              <div className="flex flex-col md:flex-row items-center lg:px-10 w-full gap-4">
                <div className="flex flex-col flex-1 w-full space-y-2">
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
                  disabled={isFetching}
                >
                  {isFetching ? "Searching..." : "Search"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </section>

      <section id="booking-details">
        {/* booking details */}
        {data?.booking && (
          <BookingDetails
            data={data?.booking}
            key={searchID + (isFetching ? "-fetching" : "")}
          ></BookingDetails>
        )}

        {error && <BookingNotFound id={searchID} error={error.message}></BookingNotFound>}
      </section>
    </div>
  );
}
