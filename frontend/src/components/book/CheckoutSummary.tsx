import React from "react";
import { getPriceForRecipient } from "@/lib/pricing";
import {
  CallerFormState,
  CouponValidationResponse,
  RecipientFormState,
} from "@/lib/types";

interface CheckoutSummaryProps {
  caller: CallerFormState;
  recipients: RecipientFormState[];
  onBack: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  couponCode: string;
  onCouponCodeChange: (value: string) => void;
  onApplyCoupon: () => void;
  isCouponValidating: boolean;
  couponResult: CouponValidationResponse | null;
}

export const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  caller,
  recipients,
  onBack,
  onConfirm,
  isSubmitting,
  couponCode,
  onCouponCodeChange,
  onApplyCoupon,
  isCouponValidating,
  couponResult,
}) => {
  const recipientPrices = recipients.map((recipient) =>
    getPriceForRecipient(
      recipient.occassion,
      recipient.callType,
      recipient.country,
    ),
  );
  const subtotal = recipientPrices.reduce((sum, price) => sum + price, 0);

  const appliedDiscount = couponResult?.valid
    ? couponResult.discountAmount || 0
    : 0;
  const total = couponResult?.valid
    ? (couponResult.newTotal ?? subtotal)
    : subtotal;

  return (
    <div className="space-y-6 text-brand-start">
      <h2 className="gradient-text text-2xl font-semibold text-center">
        Review &amp; Checkout
      </h2>

      <div className=" space-y-8">
        <div className=" px-6 space-y-2 ">
          <h3 className="font-semibold mb-2">Your Details</h3>
          <p className="text-sm text-gray-600 wrap-break-word">
            {`${caller.name}`}
          </p>
          <p className="text-sm text-gray-600 wrap-break-word">
            {`${caller.email}`}
          </p>
          <p className="text-sm text-gray-600">{caller.phone} (WhatsApp)</p>
        </div>

        <div className="space-y-4 px-6">
          <h3 className="font-semibold mb-2">Recipients</h3>
          {recipients.map((recipient, index) => (
            <div key={index} className=" flex justify-between items-start border-b-2 border-gray-200 pb-2 last:border-b-0">
              <div>
                <p className="font-semibold">{recipient.recipientName}</p>
                <p className="text-sm text-gray-500">
                  {`${recipient.occassion} |
                  ${recipient.callType === "regular" ? "Regular" : "Special"}`}
                </p>
                <p className="text-sm text-gray-500">{recipient.country}</p>
              </div>
              <span className="font-bold text-brand-end">
                N{recipientPrices[index].toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="card gradient-background p-6 space-y-4">
        <h3 className="font-semibold text-white text-center">Have a coupon code?</h3>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => onCouponCodeChange(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="px-4 py-2 border border-gray-300 text-white rounded-lg flex-1 focus:ring-2 focus:ring-brand-end focus:border-transparent"
          />
          <button
            type="button"
            onClick={onApplyCoupon}
            disabled={!couponCode || isCouponValidating || isSubmitting}
            className="btn-secondary px-6"
          >
            {isCouponValidating ? "Checking..." : "Apply"}
          </button>
        </div>
        {couponResult && !couponResult.valid && (
          <p className="text-sm text-red-200">
            {couponResult.message || "Invalid coupon code"}
          </p>
        )}
        {couponResult?.valid && (
          <p className="text-sm text-green-200">
            Coupon applied — you saved N{appliedDiscount.toLocaleString()}
          </p>
        )}
      </div>

      <div className="p-6 gradient-background-soft space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>N{subtotal.toLocaleString()}</span>
        </div>
        {appliedDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span>-N{appliedDiscount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold text-brand-end pt-2 border-t">
          <span>Total</span>
          <span>N{total.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting || isCouponValidating}
          className="btn-secondary w-full sm:w-auto"
        >
          Back to Edit
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting || isCouponValidating}
          className="btn-primary w-full flex-1"
        >
          {isSubmitting ? "Processing..." : "Confirm & Pay"}
        </button>
      </div>
    </div>
  );
};
