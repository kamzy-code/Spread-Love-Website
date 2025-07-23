"use client";

import PaystackPop from "@paystack/inline-js";

export const completePayment = (data: {
  authorization_url: string;
  access_code: string;
  reference: string;
}) => {
  const popup = new PaystackPop();
  popup.resumeTransaction(data.access_code);
};
