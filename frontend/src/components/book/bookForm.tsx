"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { services, callType } from "../services/serviceList";
import CreateErrorModal from "./errorModal";
import { useMutation } from "@tanstack/react-query";
import { countries } from "@/lib/countries";
import { useSendBookingConfirmation } from "@/hooks/useBookings";
import {
  useInitializeTransaction,
  useVerifyTransaction,
} from "@/hooks/usePayment";
import { Booking } from "@/lib/types";
import { generateBookingID, createBooking } from "@/lib/apiClient";
import { FormField, FormSelect, FormTextArea } from "./FormFields";
import { BookingSuccess } from "./BookingSuccess";
import { BookingError } from "./BookingError";

type BookingStatus = "idle" | "completed" | "error" | "pending";
type ServiceType = "regular" | "special";

export default function BookingForm() {
  const searchParams = useSearchParams();
  const occassion = searchParams.get("occassion") || "";
  const call_type = searchParams.get("call_type") || "";
  const reference = searchParams.get("reference") || "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [bookingId, setBookingId] = useState("");

  const [formData, setFormData] = useState<Partial<Booking>>({
    callerName: "",
    callerPhone: "",
    callerEmail: "",
    relationship: "",
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

  // Memoized price calculation
  const price = useMemo(() => {
    const selectedService = services.find(
      (service) => service.title === formData.occassion
    );
    if (!selectedService) return "";

    return formData.country === "Nigeria"
      ? selectedService.type[formData.callType as ServiceType].localPrice
      : selectedService.type[formData.callType as ServiceType]
          .internationalPrice;
  }, [formData.occassion, formData.callType, formData.country]);

  // Update price when memoized value changes
  useEffect(() => {
    if (formData.price !== price) {
      setFormData((prev) => ({ ...prev, price }));
    }
  }, [price]);

  const mutation = useMutation({
    mutationFn: (updatedData: Partial<Booking>) => createBooking(updatedData),
    onSuccess: async (data) => {
      if (data && data.bookingId) {
        setBookingId(data.bookingId);
        await initializeTransactionMutation.mutateAsync(data.bookingId);
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
    email: formData.callerEmail as string,
    price: formData.price as string,
  });
  const verifyTransactionMutation = useVerifyTransaction(reference as string);

  // Consolidated form change handler
  const handleOnChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  // Simplified checkbox handler
  const handleCheckboxChange = useCallback((field: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field as keyof Booking] === "yes" ? "no" : "yes",
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = await generateBookingID();
      const id = data?.ID;
      if (!id) {
        setErrorMessage("Failed to generate booking ID.");
        setBookingStatus("error");
        setIsSubmitting(false);
        setShowErrorModal(true);
        return;
      }

      setBookingId(id);
      await mutation.mutateAsync({ bookingId: id, ...formData });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error);
        setErrorMessage(error.message);
        setBookingStatus("error");
        setIsSubmitting(false);
        setShowErrorModal(true);
      }
    }
  };

  // Consolidated initialization effects
  useEffect(() => {
    if (occassion) {
      setFormData((prev) => ({ ...prev, occassion }));
    }
    if (call_type) {
      setFormData((prev) => ({ ...prev, callType: call_type }));
    }
    if (reference) {
      verifyTransactionMutation.mutate();
    }
  }, [reference, occassion, call_type]);

  // Handle payment success redirect
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

  // Handle transaction verification and confirmation email
  useEffect(() => {
    if (!verifyTransactionMutation.isSuccess) return;

    const { data, booking: bookingData } = verifyTransactionMutation.data;
    const booking: Booking = bookingData;

    if (
      data.status === "success" &&
      booking &&
      booking.paymentStatus === "paid"
    ) {
      setBookingId(booking.bookingId);
      setBookingStatus("completed");

      // Send confirmation email if not already sent
      if (!booking.confirmationMailsent) {
        sendConfirmationMailMutation.mutateAsync().catch((error) => {
          console.error(error.message || "Failed to send confirmation email");
        });
      }
    } else {
      setErrorMessage("Booking failed - payment unsuccessful");
      setBookingStatus("error");
    }
  }, [verifyTransactionMutation.isSuccess]);

  // Handle verification errors
  useEffect(() => {
    if (verifyTransactionMutation.error) {
      setErrorMessage(
        verifyTransactionMutation.error.message ||
          "Error verifying transaction. Please try again."
      );
      setBookingStatus("error");
    }
  }, [verifyTransactionMutation.error]);
  return (
    <div>
      {(mutation.error || bookingStatus === "error") && showErrorModal && (
        <CreateErrorModal
          setShowModal={() => setShowErrorModal(false)}
          error={mutation.error ? mutation.error.message : errorMessage}
        />
      )}
      <section className="container-max section-padding flex justify-center py-20 px-7 md:px-10 sm:px-25 lg:px-50">
        <div
          className={`${
            reference && bookingStatus !== "completed" ? "" : "card"
          } p-6 md:p-8 ${reference ? "w-full md:w-[70%]" : "w-full"}`}
        >
          {reference ? (
            <div>
              {bookingStatus === "completed" ? (
                <BookingSuccess bookingId={bookingId} />
              ) : bookingStatus === "error" ? (
                <BookingError
                  error={errorMessage}
                  bookingId={bookingId}
                  onRetry={() => {
                    setBookingStatus("pending");
                    setErrorMessage("");
                    verifyTransactionMutation.mutateAsync();
                  }}
                />
              ) : (
                <div className="w-full flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-end"></div>
                </div>
              )}
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-6 text-brand-start"
            >
              {/* Personal and Recipient info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Personal info */}
                <div>
                  <h2 className="gradient-text text-2xl font-semibold mb-4 pb-2">
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      label="Name *"
                      name="callerName"
                      value={formData.callerName || ""}
                      onChange={handleOnChange}
                      placeholder="Your full name"
                      required
                    />

                    <FormField
                      label="Phone *"
                      name="callerPhone"
                      type="tel"
                      value={formData.callerPhone || ""}
                      onChange={handleOnChange}
                      placeholder="+234 123 456 7890"
                      required
                    />

                    <FormField
                      label="Email *"
                      name="callerEmail"
                      type="email"
                      value={formData.callerEmail || ""}
                      onChange={handleOnChange}
                      placeholder="your.email@example.com"
                      required
                    />

                    <FormField
                      label="Relationship *"
                      name="relationship"
                      value={formData.relationship || ""}
                      onChange={handleOnChange}
                      placeholder="Who are you to the recipient?"
                      required
                    />
                  </div>
                </div>

                {/* Recipient Info */}
                <div>
                  <h2 className="gradient-text text-2xl font-semibold mb-4 pb-2">
                    Recipient Information
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      label="Recipients Name *"
                      name="recipientName"
                      value={formData.recipientName || ""}
                      onChange={handleOnChange}
                      placeholder="Who should we call?"
                      required
                    />

                    <FormField
                      label="Phone *"
                      name="recipientPhone"
                      value={formData.recipientPhone || ""}
                      onChange={handleOnChange}
                      placeholder="+234 801 234 5678"
                      required
                    />

                    <FormSelect
                      label="Recipient Country *"
                      name="country"
                      value={formData.country || ""}
                      onChange={handleOnChange}
                      options={countries.map((country) => ({
                        value: country,
                        label: country,
                      }))}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Call Details */}
              <div>
                <h2 className="gradient-text text-2xl font-semibold mb-4 pb-2">
                  Call Details
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FormSelect
                    label="Occasion *"
                    name="occassion"
                    value={formData.occassion || ""}
                    onChange={handleOnChange}
                    options={[
                      { value: "", label: "Select Occasion" },
                      ...services.map((service) => ({
                        value: service.title,
                        label: service.title,
                      })),
                    ]}
                    required
                  />

                  <FormSelect
                    label="Call Type *"
                    name="callType"
                    value={formData.callType || ""}
                    onChange={handleOnChange}
                    options={callType.map((type) => ({
                      value: type.id,
                      label: type.name,
                    }))}
                    required
                  />

                  <FormField
                    label="Preferred Date *"
                    name="callDate"
                    type="date"
                    value={formData.callDate || ""}
                    onChange={handleOnChange}
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              {/* Personal Touch */}
              <div>
                <h2 className="gradient-text text-2xl font-semibold mb-4 pb-2">
                  Personal Touch
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <FormTextArea
                    label="Message *"
                    name="message"
                    value={formData.message || ""}
                    onChange={handleOnChange}
                    placeholder="What would you like us to say? Indicate 'None' if you don't have any special message"
                    required
                    rows={5}
                  />

                  <FormTextArea
                    label="Special Instructions (Optional) *"
                    name="specialInstruction"
                    value={formData.specialInstruction || ""}
                    onChange={handleOnChange}
                    placeholder="Any special requests we should know about?"
                    rows={3}
                  />
                </div>
              </div>

              {/* Contact Consent */}
              <div className="py-2 flex justify-between">
                <label className="flex flex-row items-center">
                  <input
                    type="checkbox"
                    checked={formData.contactConsent === "yes"}
                    onChange={() => handleCheckboxChange("contactConsent")}
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
                    onChange={() => handleCheckboxChange("callRecording")}
                    name="callRecording"
                    className="rounded border-gray-300 text-brand-end focus:ring-brand-end"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I want a recording of my call.
                  </span>
                </label>
              </div>

              {/* Pricing summary */}
              {formData.occassion && (
                <div className="mt-6 p-4 md:p-6 gradient-background-soft space-y-2">
                  <h3 className="font-semibold">Pricing Summary</h3>
                  <div className="flex justify-between">
                    <h2 className="text-sm sm:text-md md:text-lg font-bold text-brand-end max-w-[50%] md:max-w-full">{`${
                      formData.occassion
                    } (${
                      formData.callType === "regular" ? "Regular" : "Special"
                    })`}</h2>
                    <div className="flex flex-row">
                      <h2 className="text-sm sm:text-md md:text-lg font-bold text-brand-end">
                        N{formData.price}
                      </h2>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit button */}
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
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

              <div className="flex flex-col w-full items-center justify-center gap-2">
                <p className="text-sm font-medium italic text-gray-700 text-center mt-2 md:w-[80%]">
                  Note: All international calls are made via WhatsApp. Please
                  provide a valid WhatsApp number for easy contact.
                </p>
                <p className="text-sm font-medium italic text-gray-700 text-center mt-2 md:w-[80%]">
                  Songs performed during the call session are selected by our
                  team. They are sung live to create a more personal and
                  engaging experience.
                </p>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
