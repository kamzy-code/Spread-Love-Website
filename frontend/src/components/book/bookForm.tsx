"use client";
import React, { useState, useEffect } from "react";
import { services, callType } from "../services/serviceList";

export default function BookingForm({
  occassion,
  call_type,
}: {
  occassion?: string;
  call_type?: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState("");
  type serviceType = "regular" | "special";

  const countries = [
    "Nigeria",
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Germany",
    "France",
    "Spain",
    "Italy",
    "Japan",
    "South Korea",
    "India",
    "Brazil",
    "Mexico",
    "Argentina",
    "South Africa",
    "Other",
  ];

  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    caller_name: "",
    caller_email: "",
    recipient_name: "",
    recipient_phone: "",
    country: "Nigeria",
    occassion: "",
    call_type: "regular",
    call_date: "",
    message: "",
    special_instruction: "",
  });

  const handleOnChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate a random booking ID
    const id = "SL" + Math.random().toString(36).substr(2, 8).toUpperCase();
    setBookingId(id);

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  useEffect(() => {
    setMounted(true);
    if (occassion) {
      setFormData((prev) => ({ ...prev, occassion }));
    }
    if (call_type) {
      setFormData((prev) => ({ ...prev, call_type }));
    }
  }, []);

  if (!mounted) return null; // Avoid SSR
  return (
    <section className="container-max section-padding flex justify-center py-20 px-7 md:px-10 sm:px-25 lg:px-50">
      <div
        className={`card p-6 md:p-8 ${
          isSubmitted ? "w-full md:w-[70%]" : "w-full"
        }`}
      >
        {isSubmitted ? (
          <div className=" w-full text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-3xl font-bold gradient-text mb-4">
              You're All Set to Spread Love!
            </h1>
            <p className="text-gray-600 mb-6">
              Your surprise call has been booked successfully. We'll make sure
              it's absolutely perfect!
            </p>
            <div className="gradient-background-soft p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600 mb-2">Your Booking ID:</p>
              <p className="text-2xl font-bold text-brand-end">{bookingId}</p>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Save this ID to manage your booking. We'll also send confirmation
              details to your email.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    caller_name: "",
                    caller_email: "",
                    recipient_name: "",
                    recipient_phone: "",
                    country: "",
                    occassion: "",
                    call_type: "regular",
                    call_date: "",
                    message: "",
                    special_instruction: "",
                  });
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
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-brand-start">
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
                    <label className="text-gray-700 font-medium">Name *</label>
                    <input
                      className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400"
                      type="text"
                      name="caller_name"
                      value={formData.caller_name}
                      onChange={handleOnChange}
                      required
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">Email *</label>
                    <input
                      className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400"
                      type="email"
                      name="caller_email"
                      value={formData.caller_email}
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
                      name="recipient_name"
                      value={formData.recipient_name}
                      onChange={handleOnChange}
                      required
                      placeholder="who should we call?"
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">Phone *</label>
                    <input
                      className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400"
                      type="text"
                      name="recipient_phone"
                      value={formData.recipient_phone}
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
                    name="call_type"
                    id="call_type"
                    className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
                    onChange={handleOnChange}
                    value={formData.call_type}
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
                    name="call_date"
                    value={formData.call_date}
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
                  <label className="text-gray-700 font-medium">Message *</label>
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
                    name="special_instruction"
                    value={formData.special_instruction}
                    onChange={handleOnChange}
                    rows={3}
                    placeholder="Any Special requests, or important details we should know"
                    className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 resize-none"
                  ></textarea>
                </div>
              </div>
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
                      formData.call_type === "regular" ? "Regular" : "Special"
                    })`}</h2>
                  )}
                  {formData.occassion && (
                    <h2 className="text-sm sm:text-md md:text-lg font-bold text-brand-end">
                      N
                      {formData.country === "Nigeria"
                        ? `${
                            services.find(
                              (service) => service.title === formData.occassion
                            )?.type[formData.call_type as serviceType]
                              .localPrice
                          }`
                        : `${
                            services.find(
                              (service) => service.title === formData.occassion
                            )?.type[formData.call_type as serviceType]
                              .internationalPrice
                          }`}
                    </h2>
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
  );
}
