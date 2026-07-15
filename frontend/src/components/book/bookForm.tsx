"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import CreateErrorModal from "./errorModal";
import { useSendBookingConfirmation } from "@/hooks/useBookings";
import { useVerifyTransaction } from "@/hooks/usePayment";
import { useBookingCheckout } from "@/hooks/useBookingCheckout";
import { useValidateCoupon } from "@/hooks/useCoupon";
import {
  CallerFormState,
  CouponValidationResponse,
  RecipientFormState,
} from "@/lib/types";
import { getPriceForRecipient } from "@/lib/pricing";
import {
  MESSAGE_WORD_LIMIT,
  SPECIAL_INSTRUCTION_WORD_LIMIT,
} from "@/lib/bookingOptions";
import { wordCount } from "@/lib/wordCount";
import { CallerFields } from "./CallerFields";
import { RecipientCard } from "./RecipientCard";
import { CheckoutSummary } from "./CheckoutSummary";
import { BookingSuccess } from "./BookingSuccess";
import { BookingError } from "./BookingError";
import { PageLoader } from "../ui/pageLoader";

type BookingStatus = "idle" | "completed" | "error" | "pending";
type Step = "details" | "summary";

const emptyCaller = (): CallerFormState => ({
  name: "",
  phone: "",
  email: "",
  gender: "",
  relationship: "",
});

const emptyRecipient = (): RecipientFormState => ({
  recipientName: "",
  recipientPhone: "",
  country: "Nigeria",
  occassion: "",
  callType: "regular",
  callDate: "",
  message: "",
  specialInstruction: "",
  callRecording: "no",
});

const recipientHasWordLimitViolation = (recipient: RecipientFormState) =>
  wordCount(recipient.message || "") > MESSAGE_WORD_LIMIT ||
  wordCount(recipient.specialInstruction || "") > SPECIAL_INSTRUCTION_WORD_LIMIT;

export default function BookingForm() {
  const searchParams = useSearchParams();
  const occassion = searchParams.get("occassion") || "";
  const call_type = searchParams.get("call_type") || "";
  const reference = searchParams.get("reference") || "";

  const [isMounted, setIsMounted] = useState(false);
  const [step, setStep] = useState<Step>("details");
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [bookingId, setBookingId] = useState("");

  const [caller, setCaller] = useState<CallerFormState>(emptyCaller());
  const [recipients, setRecipients] = useState<RecipientFormState[]>([emptyRecipient()]);
  const [contactConsent, setContactConsent] = useState<"yes" | "no">("no");

  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<CouponValidationResponse | null>(null);

  const BOOKINGS_DISABLED = false;
  const DISABLE_REASON =
    "We're experiencing high traffic for Valentine's Day. Bookings will resume soon!";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Pre-fill the first recipient from a "Book This Service" link (?occassion=&call_type=)
  useEffect(() => {
    if (!occassion && !call_type) return;
    setRecipients((prev) => {
      const [first, ...rest] = prev;
      return [
        {
          ...first,
          occassion: occassion || first.occassion,
          callType: call_type || first.callType,
        },
        ...rest,
      ];
    });
  }, [occassion, call_type]);

  const sendConfirmationMailMutation = useSendBookingConfirmation(reference as string);
  const verifyTransactionMutation = useVerifyTransaction(reference as string);
  const checkoutMutation = useBookingCheckout();
  const couponMutation = useValidateCoupon();

  const handleCallerChange = useCallback((field: keyof CallerFormState, value: string) => {
    setCaller((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleRecipientChange = useCallback(
    (index: number, field: keyof RecipientFormState, value: string) => {
      setRecipients((prev) =>
        prev.map((recipient, i) =>
          i === index ? { ...recipient, [field]: value } : recipient,
        ),
      );
    },
    [],
  );

  const handleAddRecipient = useCallback(() => {
    setRecipients((prev) => [...prev, emptyRecipient()]);
  }, []);

  const handleRemoveRecipient = useCallback((index: number) => {
    setRecipients((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const subtotal = recipients.reduce(
    (sum, recipient) =>
      sum + getPriceForRecipient(recipient.occassion, recipient.callType, recipient.country),
    0,
  );

  const hasWordLimitViolation = recipients.some(recipientHasWordLimitViolation);

  const handleContinueToSummary = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasWordLimitViolation) {
      setErrorMessage(
        `Message must be ${MESSAGE_WORD_LIMIT} words or fewer, special instructions ${SPECIAL_INSTRUCTION_WORD_LIMIT} words or fewer.`,
      );
      setShowErrorModal(true);
      return;
    }
    setStep("summary");
  };

  const handleApplyCoupon = () => {
    if (!couponCode) return;
    couponMutation.mutate(
      { code: couponCode, totalPrice: subtotal },
      { onSuccess: setCouponResult },
    );
  };

  const handleConfirmAndPay = () => {
    checkoutMutation.mutate(
      {
        caller,
        recipients: recipients.map((recipient) => ({
          ...recipient,
          price: getPriceForRecipient(recipient.occassion, recipient.callType, recipient.country),
        })),
        contactConsent,
        couponCode: couponResult?.valid ? couponCode : undefined,
      },
      {
        onError: () => setShowErrorModal(true),
      },
    );
  };

  // Redirect to Paystack once checkout succeeds
  useEffect(() => {
    if (checkoutMutation.isSuccess && checkoutMutation.data?.paymentURL) {
      window.location.href = checkoutMutation.data.paymentURL;
    }
  }, [checkoutMutation.isSuccess, checkoutMutation.data]);

  // Verify transaction on return from Paystack
  useEffect(() => {
    if (reference) {
      verifyTransactionMutation.mutate();
    }
  }, [reference]);

  useEffect(() => {
    if (!verifyTransactionMutation.isSuccess) return;

    const { data, booking: bookingData } = verifyTransactionMutation.data;

    if (data.status === "success" && bookingData && bookingData.paymentStatus === "paid") {
      setBookingId(bookingData.bookingId);
      setBookingStatus("completed");

      if (!bookingData.confirmationMailsent) {
        sendConfirmationMailMutation.mutateAsync().catch((error) => {
          console.error(error.message || "Failed to send confirmation email");
        });
      }
    } else {
      setErrorMessage("Booking failed - payment unsuccessful");
      setBookingStatus("error");
    }
  }, [verifyTransactionMutation.isSuccess]);

  useEffect(() => {
    if (verifyTransactionMutation.error) {
      setErrorMessage(
        verifyTransactionMutation.error.message ||
          "Error verifying transaction. Please try again.",
      );
      setBookingStatus("error");
    }
  }, [verifyTransactionMutation.error]);

  if (!isMounted) {
    return <PageLoader />;
  }

  return (
    <div>
      {(checkoutMutation.error || bookingStatus === "error") && showErrorModal && (
        <CreateErrorModal
          setShowModal={() => setShowErrorModal(false)}
          error={checkoutMutation.error ? checkoutMutation.error.message : errorMessage}
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
          ) : BOOKINGS_DISABLED ? (
            <div className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Bookings Temporarily Closed</h2>
              <p className="text-gray-600">{DISABLE_REASON}</p>
            </div>
          ) : step === "summary" ? (
            <CheckoutSummary
              caller={caller}
              recipients={recipients}
              onBack={() => setStep("details")}
              onConfirm={handleConfirmAndPay}
              isSubmitting={checkoutMutation.isPending}
              couponCode={couponCode}
              onCouponCodeChange={(value) => {
                setCouponCode(value);
                setCouponResult(null);
              }}
              onApplyCoupon={handleApplyCoupon}
              isCouponValidating={couponMutation.isPending}
              couponResult={couponResult}
            />
          ) : (
            <form onSubmit={handleContinueToSummary} className="space-y-6 text-brand-start">
              <CallerFields caller={caller} onChange={handleCallerChange} />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="gradient-text text-2xl font-semibold pb-2">
                    Recipients
                  </h2>
                  <button
                    type="button"
                    onClick={handleAddRecipient}
                    className="btn-secondary px-4 py-2 text-sm sm:text-sm"
                  >
                    + Add Recipient
                  </button>
                </div>

                {recipients.map((recipient, index) => (
                  <RecipientCard
                    key={index}
                    recipient={recipient}
                    index={index}
                    canRemove={recipients.length > 1}
                    onChange={handleRecipientChange}
                    onRemove={handleRemoveRecipient}
                  />
                ))}
              </div>

              {/* Contact Consent */}
              <div className="py-2 flex justify-between">
                <label className="flex flex-row items-center">
                  <input
                    type="checkbox"
                    checked={contactConsent === "yes"}
                    onChange={() =>
                      setContactConsent((prev) => (prev === "yes" ? "no" : "yes"))
                    }
                    className="rounded border-gray-300 text-brand-end focus:ring-brand-end"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I agree to be contacted for updates about my booking and future offers.
                  </span>
                </label>
              </div>

              {/* Pricing summary */}
              {subtotal > 0 && (
                <div className="mt-6 p-4 md:p-6 gradient-background-soft space-y-2">
                  <h3 className="font-semibold">Pricing Summary</h3>
                  <div className="flex justify-between">
                    <h2 className="text-sm sm:text-md md:text-lg font-bold text-brand-end">
                      {recipients.length} recipient{recipients.length > 1 ? "s" : ""}
                    </h2>
                    <h2 className="text-sm sm:text-md md:text-lg font-bold text-brand-end">
                      N{subtotal.toLocaleString()}
                    </h2>
                  </div>
                </div>
              )}

              <div className="w-full flex justify-center">
                <button type="submit" className="btn-primary w-full md:w-[50%]">
                  Continue to Checkout
                </button>
              </div>

              <div className="flex flex-col w-full items-center justify-center gap-2">
                <p className="text-sm font-medium italic text-gray-700 text-center mt-2 md:w-[80%]">
                  Note: All international calls are made via WhatsApp. Please provide a
                  valid WhatsApp number for easy contact.
                </p>
                <p className="text-sm font-medium italic text-gray-700 text-center mt-2 md:w-[80%]">
                  Songs performed during the call session are selected by our team. They
                  are sung live to create a more personal and engaging experience.
                </p>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
