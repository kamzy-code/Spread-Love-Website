"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CreateErrorModal from "./errorModal";
import { useVerifyTransaction } from "@/hooks/usePayment";
import { useBookingCheckout } from "@/hooks/useBookings";
import { useValidateCoupon } from "@/hooks/useCoupons";
import {
  bookingDetailsSchema,
  BookingFormValues,
} from "@/lib/bookingValidation";
import { CallerFormState, CouponValidationResponse } from "@/lib/types";
import { getPriceForRecipient } from "@/lib/pricing";
import { useFetchServices } from "@/hooks/useServices";
import { CallerFields } from "./CallerFields";
import { RecipientCard } from "./RecipientCard";
import { CheckoutSummary } from "./CheckoutSummary";
import { BookingSuccess } from "./BookingSuccess";
import { BookingError } from "./BookingError";
import { PageLoader } from "../ui/pageLoader";

type BookingStatus = "idle" | "completed" | "error" | "pending";
type Step = "details" | "summary";

const emptyRecipient = () => ({
  recipientName: "",
  recipientPhone: "",
  country: "Nigeria",
  occassion: "",
  callType: "regular" as const,
  callDate: "",
  message: "",
  specialInstruction: "",
  callRecording: "no" as const,
});

const defaultValues: BookingFormValues = {
  caller: { name: "", phone: "", email: "", gender: "", relationship: "" },
  recipients: [emptyRecipient()],
  contactConsent: "no",
};

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

  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] =
    useState<CouponValidationResponse | null>(null);

  const BOOKINGS_DISABLED = false;
  const DISABLE_REASON =
    "We're experiencing high traffic for Valentine's Day. Bookings will resume soon!";

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingDetailsSchema),
    defaultValues,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "recipients",
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Pre-fill the first recipient from a "Book This Service" link (?occassion=&call_type=)
  useEffect(() => {
    if (occassion) setValue("recipients.0.occassion", occassion);
    if (call_type)
      setValue("recipients.0.callType", call_type as "regular" | "special");
  }, [occassion, call_type, setValue]);

  const verifyTransactionMutation = useVerifyTransaction();
  const checkoutMutation = useBookingCheckout();
  const couponMutation = useValidateCoupon();

  const { data: services = [] } = useFetchServices();
  const recipients = watch("recipients");
  // gender is a validated enum by the time this is read for real use (the
  // "details" step's zod validation already required a non-empty choice) —
  // the form field itself stays a plain string to avoid an empty-string vs.
  // literal-union TS conflict on the initial/unselected value.
  const caller = watch("caller") as CallerFormState;
  const contactConsentValue = watch("contactConsent");

  const subtotal = recipients.reduce(
    (sum, recipient) =>
      sum +
      getPriceForRecipient(
        services,
        recipient.occassion,
        recipient.callType,
        recipient.country,
      ),
    0,
  );

  const handleApplyCoupon = () => {
    if (!couponCode) return;
    couponMutation.mutate(
      { code: couponCode, totalPrice: subtotal },
      { onSuccess: setCouponResult },
    );
  };

  const handleContinueToSummary = () => {
    setStep("summary");
  };

  const handleConfirmAndPay = () => {
    const values = getValues();
    checkoutMutation.mutate(
      {
        caller: values.caller as CallerFormState,
        recipients: values.recipients.map((recipient) => ({
          ...recipient,
          price: getPriceForRecipient(
            services,
            recipient.occassion,
            recipient.callType,
            recipient.country,
          ),
        })),
        contactConsent: values.contactConsent,
        couponCode: couponResult?.valid ? couponCode : undefined,
      },
      {
        onError: () => setShowErrorModal(true),
      },
    );
  };

  const handleVerifyTransaction = () => {
    verifyTransactionMutation.mutate(reference as string, {
      onSuccess: (result) => {
        const { data, booking: newBooking } = result;
        if (
          data.status === "success" &&
          newBooking &&
          newBooking.paymentStatus === "paid"
        ) {
          // Confirmation email is sent server-side by verifyPaymentController now.
          setBookingId(newBooking.bookingId);
          setBookingStatus("completed");
        } else {
          setErrorMessage("Booking failed - payment unsuccessful");
          setBookingStatus("error");
        }
      },
      onError: (error) => {
        setErrorMessage(
          error.message || "Error verifying transaction. Please try again.",
        );
        setBookingStatus("error");
      },
    });
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
      handleVerifyTransaction();
    }
  }, [reference]);

  if (!isMounted) {
    return <PageLoader />;
  }

  return (
    <div>
      {(checkoutMutation.error || bookingStatus === "error") &&
        showErrorModal && (
          <CreateErrorModal
            setShowModal={() => setShowErrorModal(false)}
            error={
              checkoutMutation.error
                ? checkoutMutation.error.message
                : errorMessage
            }
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
                    handleVerifyTransaction()
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
              <h2 className="text-xl font-semibold mb-2">
                Bookings Temporarily Closed
              </h2>
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
            <form
              onSubmit={handleSubmit(handleContinueToSummary)}
              className="space-y-6 text-brand-start"
            >
              <CallerFields
                register={register}
                control={control}
                errors={errors.caller}
              />

              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="gradient-text text-2xl font-semibold pb-2">
                    Recipients
                  </h2>
                  <button
                    type="button"
                    onClick={() => append(emptyRecipient())}
                    className="btn-secondary self-start whitespace-nowrap px-4 py-2 text-sm sm:self-auto"
                  >
                    + Add Recipient
                  </button>
                </div>

                {fields.map((field, index) => (
                  <RecipientCard
                    key={field.id}
                    index={index}
                    canRemove={fields.length > 1}
                    onRemove={remove}
                    register={register}
                    control={control}
                    watch={watch}
                    errors={errors.recipients?.[index]}
                  />
                ))}
              </div>

              {/* Contact Consent */}
              <div className="py-2 flex justify-between">
                <label className="flex flex-row items-center">
                  <input
                    type="checkbox"
                    checked={contactConsentValue === "yes"}
                    onChange={() =>
                      setValue(
                        "contactConsent",
                        contactConsentValue === "yes" ? "no" : "yes",
                      )
                    }
                    className="rounded border-gray-300 text-brand-end focus:ring-brand-end"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I agree to be contacted for updates about my booking and
                    future offers.
                  </span>
                </label>
              </div>

              {/* Pricing summary */}
              {subtotal > 0 && (
                <div className="mt-6 p-4 md:p-6 gradient-background-soft space-y-2">
                  <h3 className="font-semibold">Pricing Summary</h3>
                  <div className="flex justify-between">
                    <h2 className="text-sm sm:text-md md:text-lg font-bold text-brand-end">
                      {recipients.length} recipient
                      {recipients.length > 1 ? "s" : ""}
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
