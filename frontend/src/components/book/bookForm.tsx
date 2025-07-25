"use client";
import React, { useState, useEffect } from "react";
import { services, callType } from "../services/serviceList";
import CreateErrorModal from "./errorModal";
import { useMutation } from "@tanstack/react-query";
import { countries } from "@/lib/countries";
import { useSendBookingConfirmation } from "@/hooks/useBookings";
import {
  useInitializeTransaction,
  useVerifyTransaction,
} from "@/hooks/usePayment";
import { XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Booking } from "@/lib/types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const getID = async () => {
  const response = await fetch(`${apiUrl}/booking/id/generate`, {
    method: "GET",
    credentials: "include",
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

const createBooking = async (body: any) => {
  const response = await fetch(`${apiUrl}/booking/create`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    // Attach status and statusText for more context if needed
    throw new Error(data.message || response.statusText || "Unknown error");
  }
  return data;
};

export default function BookingForm({
  occassion,
  call_type,
  reference,
}: {
  occassion?: string;
  call_type?: string;
  reference?: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBookingCompleted, setIsBookingCompleted] = useState(false);
  const [isError, setIsError] = useState(false);
  const [createBookingStatus, setCreateBookingStatus] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [bookingId, setBookingId] = useState("");
  type serviceType = "regular" | "special";

  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    callerName: "",
    callerPhone: "",
    callerEmail: "",
    recipientName: "",
    recipientPhone: "",
    country: "Nigeria",
    occassion: "",
    callType: "regular",
    callDate: "",
    price: "",
    message: "",
    specialInstruction: "",
    contactConsent: "no",
    callRecording: "no",
  });

  const mutation = useMutation({
    mutationFn: (updatedData) => createBooking(updatedData),
    onSuccess: async (data) => {
      if (data && data.bookingId) {
        setBookingId(data.bookingId);
        await initializeTransactionMutation.mutateAsync(data.bookingId);
        // setIsSubmitted(true);
      }
    },
    onError: (error) => {
      if (error) {
        setShowErrorModal(true);
      }
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const sendConfirmationMailMutation = useSendBookingConfirmation(
    reference as string
  );
  const initializeTransactionMutation = useInitializeTransaction({
    email: formData.callerEmail,
    price: formData.price,
  });
  const verifyTransactionMutation = useVerifyTransaction(reference as string);

  const handleOnChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Generate a random booking ID
    try {
      const data = await getID();
      const id = data?.ID;
      if (!id) {
        setIsError(true);
        setCreateBookingStatus("Failed to generate booking ID.");
        setIsSubmitting(false);
        setShowErrorModal(true);
        return;
      }

      setBookingId(id);
      await mutation.mutateAsync({ bookingId: id, ...formData } as any);
    } catch (error: any) {
      console.log(error);
      setIsError(true);
      setCreateBookingStatus(error.message);
      setIsSubmitting(false);
      setShowErrorModal(true);
    }
  };

  // set price
  useEffect(() => {
    let price = "";
    const selectedService = services.find(
      (service) => service.title === formData.occassion
    );
    if (selectedService) {
      price =
        formData.country === "Nigeria"
          ? selectedService.type[formData.callType as serviceType].localPrice
          : selectedService.type[formData.callType as serviceType]
              .internationalPrice;
    }
    // Only update if price actually changed to avoid render loops
    if (formData.price !== price) {
      setFormData((prev) => ({ ...prev, price }));
    }
  }, [formData.occassion, formData.callType, formData.country]);

  useEffect(() => {
    const verifyTransaction = async () => {
      try {
        verifyTransactionMutation.mutate();
      } catch (error: any) {
        console.error(error.message || "Failed to verify transaction");
      }
    };
    setMounted(true);
    if (occassion) {
      setFormData((prev) => ({ ...prev, occassion }));
    }

    if (call_type) {
      setFormData((prev) => ({ ...prev, callType: call_type }));
    }

    if (reference) {
      verifyTransaction();
    }
  }, []);

  useEffect(() => {
    if (initializeTransactionMutation.isSuccess) {
      const data: {
        authorization_url: string;
        access_code: string;
        reference: string;
      } = initializeTransactionMutation.data;

      window.location.href = data.authorization_url;
    }
  }, [initializeTransactionMutation.isSuccess]);

  useEffect(() => {
    const sendMail = async () => {
      try {
        await sendConfirmationMailMutation.mutateAsync();
      } catch (error: any) {
        console.error(error.message || "Failed to send confirmation email");
      }
    };

    if (verifyTransactionMutation.isSuccess) {
      const { data, booking: bookingData } = verifyTransactionMutation.data;

      const booking: Booking = bookingData;

      if (
        data.status === "success" &&
        booking &&
        booking.paymentStatus === "paid"
      ) {
        setBookingId(booking.bookingId);
        setIsBookingCompleted(true);

        if (!booking.confirmationMailsent) {
          sendMail();
        }
      } else {
        setCreateBookingStatus("Booking failed - payment unsuccessful");
        setIsError(true);
        setIsBookingCompleted(true);
      }
    }
  }, [verifyTransactionMutation.isSuccess]);

  useEffect(() => {
    if (verifyTransactionMutation.error) {
      setCreateBookingStatus("Error verifying transaction. Please try again.");
      setIsError(true);
      setIsBookingCompleted(true);
    }
  }, [verifyTransactionMutation.error]);

  if (!mounted) return null; // Avoid SSR
  return (
    <div>
      {(mutation.error || isError) && showErrorModal && (
        <CreateErrorModal
          setShowModal={() => setShowErrorModal(false)}
          error={mutation.error ? mutation.error.message : createBookingStatus}
        ></CreateErrorModal>
      )}
      <section className="container-max section-padding flex justify-center py-20 px-7 md:px-10 sm:px-25 lg:px-50">
        <div
          className={`${reference && !isBookingCompleted ? "" : "card"} p-6 md:p-8 ${
            reference ? "w-full md:w-[70%]" : "w-full"
          }`}
        >
          {reference ? (
            <div>
              {isBookingCompleted ? (
                <div className=" w-full text-center">
                  {isError ? (
                    <div className="w-full flex justify-center mb-2">
                      <XCircle className="text-red-500 h-16 w-16"></XCircle>
                    </div>
                  ) : (
                    <div className="text-6xl mb-6">🎉</div>
                  )}
                  <h1 className="text-3xl font-bold gradient-text pb-2 mb-4">
                    {isError
                      ? "Booking Failed"
                      : "You're All Set to Spread Love!"}
                  </h1>
                  <p className="text-gray-600 mb-6">
                    {isError
                      ? createBookingStatus
                      : "Your surprise call has been booked successfully. We'll make sure it's absolutely perfect!"}
                  </p>
                  {!isError && (
                    <div>
                      <div className="gradient-background-soft p-4 rounded-lg mb-6">
                        <p className="text-sm text-gray-600 mb-2">
                          Your Booking ID:
                        </p>
                        <p className="text-2xl font-bold text-brand-end">
                          {bookingId}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mb-6">
                        Save this ID to manage your booking. We'll also send
                        confirmation details to your email.
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {createBookingStatus ===
                    "Error verifying transaction. Please try again." ? (
                      <button
                        onClick={() => {
                          setIsBookingCompleted(false);
                          setCreateBookingStatus("");
                          verifyTransactionMutation.mutateAsync();
                        }}
                        className="w-full btn-primary"
                      >
                        Try again
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          router.replace("/book");
                        }}
                        className="w-full btn-primary"
                      >
                        Book Another Call
                      </button>
                    )}

                    {!isError && (
                      <button
                        onClick={() =>
                          window.open(`/manage?id=${bookingId}`, "_blank")
                        }
                        className="w-full btn-secondary"
                      >
                        Manage This Booking
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className=" w-full flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-end"></div>
                </div>
              )}
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-6 text-brand-start"
            >
              {/* Personal and Recipiet info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Personal info */}
                <div>
                  <h2 className="gradient-text text-2xl font-semibold mb-4 pb-2">
                    {" "}
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col space-y-2">
                      <label className="text-gray-700 font-medium">
                        Name *
                      </label>
                      <input
                        className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400"
                        type="text"
                        name="callerName"
                        value={formData.callerName}
                        onChange={handleOnChange}
                        required
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="flex flex-col space-y-2">
                      <label className="text-gray-700 font-medium">
                        Phone *
                      </label>
                      <input
                        className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400"
                        type="tel"
                        name="callerPhone"
                        value={formData.callerPhone}
                        onChange={handleOnChange}
                        required
                        placeholder="+234 123 456 7890"
                      />
                    </div>

                    <div className="flex flex-col space-y-2">
                      <label className="text-gray-700 font-medium">
                        Email *
                      </label>
                      <input
                        className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400"
                        type="email"
                        name="callerEmail"
                        value={formData.callerEmail}
                        onChange={handleOnChange}
                        required
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Recipient Info */}
                <div>
                  <h2 className="gradient-text text-2xl font-semibold mb-4 pb-2">
                    {" "}
                    Recipient Information
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col space-y-2">
                      <label className="text-gray-700 font-medium">
                        Recipients Name *
                      </label>
                      <input
                        className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400"
                        type="text"
                        name="recipientName"
                        value={formData.recipientName}
                        onChange={handleOnChange}
                        required
                        placeholder="who should we call?"
                      />
                    </div>

                    <div className="flex flex-col space-y-2">
                      <label className="text-gray-700 font-medium">
                        Phone *
                      </label>
                      <input
                        className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400"
                        type="text"
                        name="recipientPhone"
                        value={formData.recipientPhone}
                        onChange={handleOnChange}
                        required
                        placeholder="+234 801 234 5678"
                      />
                    </div>

                    <div className="flex flex-col space-y-2">
                      <label className="text-gray-700 font-medium">
                        Recipient Country *
                      </label>
                      <select
                        name="country"
                        id="country"
                        className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
                        onChange={handleOnChange}
                        value={formData.country}
                        required
                      >
                        {countries.map((country) => {
                          return (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call Details */}
              <div className="">
                <h2 className="gradient-text text-2xl font-semibold mb-4 pb-2">
                  {" "}
                  Call Details
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* occasion label */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">
                      Occassion *
                    </label>
                    <select
                      name="occassion"
                      id="occassion"
                      className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
                      onChange={handleOnChange}
                      value={formData.occassion}
                      required
                    >
                      <option value="">Select Occassion</option>
                      {services.map((service) => {
                        return (
                          <option key={service.id} value={service.title}>
                            {service.title}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Call Type */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">
                      Call Type *
                    </label>
                    <select
                      name="callType"
                      id="callType"
                      className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
                      onChange={handleOnChange}
                      value={formData.callType}
                      required
                    >
                      {callType.map((type) => {
                        return (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Date */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">
                      Preferred Date *
                    </label>
                    <input
                      className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400"
                      type="date"
                      name="callDate"
                      value={formData.callDate}
                      onChange={handleOnChange}
                      required
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
              </div>

              {/* Personal Touch */}
              <div className="">
                <h2 className="gradient-text text-2xl font-semibold mb-4 pb-2">
                  {" "}
                  Personal Touch
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {/* message */}

                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleOnChange}
                      required
                      rows={5}
                      placeholder="What would you like us to say? Share your heartfelt message"
                      className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 resize-none"
                    ></textarea>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">
                      Special Instructions(Optional) *
                    </label>
                    <textarea
                      name="specialInstruction"
                      value={formData.specialInstruction}
                      onChange={handleOnChange}
                      rows={3}
                      placeholder="Any Special requests, or important details we should know"
                      className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Contact Consent */}
              <div className="py-2 flex justify-between">
                <label className="flex flex-row items-center">
                  <input
                    type="checkbox"
                    checked={formData.contactConsent === "yes"}
                    onChange={(e) =>
                      formData.contactConsent === "yes"
                        ? setFormData((prev) => ({
                            ...prev,
                            contactConsent: "no",
                          }))
                        : setFormData((prev) => ({
                            ...prev,
                            contactConsent: "yes",
                          }))
                    }
                    name="contactConsent"
                    className="rounded border-gray-300 text-brand-end focus:ring-brand-end"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I agree to be contacted for updates about my booking and
                    future offers.
                  </span>
                </label>
              </div>

              {/* Call Recording */}
              <div className="py-2 flex justify-between">
                <label className="flex flex-row items-center">
                  <input
                    type="checkbox"
                    checked={formData.callRecording === "yes"}
                    onChange={(e) =>
                      formData.callRecording === "yes"
                        ? setFormData((prev) => ({
                            ...prev,
                            callRecording: "no",
                          }))
                        : setFormData((prev) => ({
                            ...prev,
                            callRecording: "yes",
                          }))
                    }
                    name="callRecording"
                    className="rounded border-gray-300 text-brand-end focus:ring-brand-end"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I want a recording of my call.
                  </span>
                </label>
              </div>

              {/* pricing summary */}
              {
                <div className="mt-6 p-4 md:p-6 gradient-background-soft space-y-2">
                  <h3 className="font-semibold">Pricing Summary</h3>
                  <div className="flex justify-between">
                    {formData.occassion && (
                      <h2 className="text-sm sm:text-md md:text-lg font-bold text-brand-end max-w-[50%] md:max-w-full">{`${
                        formData.occassion
                      } (${
                        formData.callType === "regular" ? "Regular" : "Special"
                      })`}</h2>
                    )}
                    {formData.occassion && (
                      <div className="flex flex-row">
                        <h2 className="text-sm sm:text-md md:text-lg font-bold text-brand-end">
                          N{formData.price}
                        </h2>
                      </div>
                    )}
                  </div>
                </div>
              }

              {/* submit button */}
              <div className="w-full flex justify-center">
                <button
                  type="submit"
                  className="btn-primary w-full md:w-[50%]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div>
                      <svg
                        className="animate-spin h-5 w-5 text-white mx-auto"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                      <span className="sr-only">Loading...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <p>Book my Call</p>
                    </div>
                  )}
                </button>
              </div>

              <div className="flex w-full justify-center">
                <p className="text-sm font-medium italic text-gray-700 text-center mt-2 md:w-[80%]">
                  {" "}
                  Note: Please note that songs performed during the call session
                  are selected by our team. This is because the songs are not
                  played from recordings but are sung live to create a more
                  personal and engaging experience.{" "}
                </p>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
