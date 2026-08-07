"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import UpdateConfirmationModal from "./updateModal";
import { formatToYMD } from "@/lib/formatDate";
import { deepEqual } from "@/lib/hasBookingChanged";
import { getStatusColor, getStatusIcon } from "@/lib/getStatusColor";
import Link from "next/link";
import { countries } from "@/lib/countries";
import { useUpdateBookingByCustomer } from "@/hooks/useBookings";

interface RecipientData {
  _id: string;
  recipientName: string;
  recipientPhone: string;
  country: string;
  occassion: string;
  callDate: string;
  message?: string;
  specialInstruction?: string;
  callStatus?: string;
  callRecording?: string;
  callRecordingURL?: string;
}

interface CallerData {
  name: string;
  phone: string;
  email: string;
  relationship: string;
  gender?: "male" | "female" | "prefer_not_to_say";
}

interface BookingData {
  bookingId: string;
  bookingStatus?: string;
  caller: CallerData;
  recipients: RecipientData[];
}

const getCallStatusMessage = (status?: string) => {
  switch (status) {
    case "pending":
      return "Your call is pending and will be placed soon.";
    case "successful":
      return "Your call was successfully placed!";
    case "unsuccessful":
      return "After several attempts, we were unable to reach the recipient. Please check the details or contact support via whatsapp.";
    case "rejected":
      return "Your call was rejected by the recipient.";
    case "rescheduled":
      return "Your call has been rescheduled due to the recipient's inability to take calls at the moment.";
    default:
      return "Call status unknown. Please contact support for more information.";
  }
};

export default function BookingDetails({ data }: { data: BookingData }) {
  const [initialCaller] = useState(data.caller);
  const [initialRecipients] = useState(data.recipients);
  const [caller, setCaller] = useState(data.caller);
  const [recipients, setRecipients] = useState(data.recipients);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const handleCallerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setCaller((prev) => ({ ...prev, [name]: value }));
  };

  const handleRecipientChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setRecipients((prev) =>
      prev.map((recipient, i) => (i === index ? { ...recipient, [name]: value } : recipient)),
    );
  };

  const mutation = useUpdateBookingByCustomer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!editForm) {
      setEditForm(true);
      setIsSubmitting(false);
      return;
    }

    const hasNotChanged =
      deepEqual(initialCaller, caller) && deepEqual(initialRecipients, recipients);
    if (hasNotChanged) {
      setEditForm(false);
      setError("");
      setIsSubmitting(false);
      setShowModal(true);
      return;
    }

    try {
      await mutation.mutateAsync({
        bookingId: data.bookingId,
        payload: {
          caller,
          recipients: recipients.map((recipient) => ({
            _id: recipient._id,
            recipientName: recipient.recipientName,
            recipientPhone: recipient.recipientPhone,
            country: recipient.country,
            callDate: recipient.callDate,
            message: recipient.message,
            specialInstruction: recipient.specialInstruction,
          })),
        },
      });
      setEditForm(false);
      setError("");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setIsSubmitting(false);
      setShowModal(true);
    }
  };

  const overallStatus = data.bookingStatus || "pending";

  return (
    <section className="container-max section-padding flex justify-center py-20 px-7 md:px-10 sm:px-25 lg:px-50">
      <motion.div className="card p-6 md:p-8 w-full space-y-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h2 className="gradient-text font-bold text-xl md:text-2xl">Booking Details</h2>
            <p className="text-gray-700 text-md">ID: {data.bookingId}</p>
          </div>

          <div className="flex flex-col md:items-end gap-1">
            <div className="flex">
              <p
                className={`flex flex-row gap-2 px-4 py-2 rounded-full items-center ${getStatusColor(
                  overallStatus,
                  "badge",
                )}`}
              >
                {getStatusIcon(overallStatus)}
                {overallStatus}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-brand-start">
          {/* Personal info */}
          <div>
            <h2 className="gradient-text text-xl font-semibold mb-4 pb-2">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2">
                <label className="text-gray-700 font-medium">Name:</label>
                {editForm ? (
                  <input
                    className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400"
                    type="text"
                    name="name"
                    value={caller.name}
                    onChange={handleCallerChange}
                    required
                  />
                ) : (
                  <p className="py-3 w-full">{caller.name}</p>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-gray-700 font-medium">WhatsApp Number:</label>
                {editForm ? (
                  <input
                    className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400"
                    type="text"
                    name="phone"
                    value={caller.phone}
                    onChange={handleCallerChange}
                    required
                  />
                ) : (
                  <p className="py-3 w-full">{caller.phone}</p>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-gray-700 font-medium">Email:</label>
                {editForm ? (
                  <input
                    className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400"
                    type="email"
                    name="email"
                    value={caller.email}
                    onChange={handleCallerChange}
                    required
                  />
                ) : (
                  <p className="py-3 w-full">{caller.email}</p>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-gray-700 font-medium">Relationship:</label>
                {editForm ? (
                  <input
                    className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400"
                    type="text"
                    name="relationship"
                    value={caller.relationship}
                    onChange={handleCallerChange}
                    required
                    placeholder="Who are you to the recipient?"
                  />
                ) : (
                  <p className="py-3 w-full">{caller.relationship}</p>
                )}
              </div>
            </div>
          </div>

          {/* Recipients */}
          <div className="space-y-6">
            <h2 className="gradient-text text-xl font-semibold pb-2">
              Recipient{recipients.length > 1 ? "s" : ""}
            </h2>

            {recipients.map((recipient, index) => (
              <div key={recipient._id} className="border rounded-lg p-4 md:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-brand-end">
                    Recipient {index + 1}: {recipient.recipientName}
                  </h3>
                  <p
                    className={`flex flex-row gap-1 text-xs px-3 py-1 rounded-full items-center ${getStatusColor(
                      recipient.callStatus || "pending",
                      "badge",
                    )}`}
                  >
                    {getStatusIcon(recipient.callStatus || "pending", true)}
                    {recipient.callStatus || "pending"}
                  </p>
                </div>
                <p className="text-sm italic text-gray-600">
                  {getCallStatusMessage(recipient.callStatus)}
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">{`Recipient's Name:`}</label>
                    {editForm ? (
                      <input
                        className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400"
                        type="text"
                        name="recipientName"
                        value={recipient.recipientName}
                        onChange={(e) => handleRecipientChange(index, e)}
                        required
                      />
                    ) : (
                      <p className="py-3 w-full">{recipient.recipientName}</p>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">Phone:</label>
                    {editForm ? (
                      <input
                        className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400"
                        type="text"
                        name="recipientPhone"
                        value={recipient.recipientPhone}
                        onChange={(e) => handleRecipientChange(index, e)}
                        required
                      />
                    ) : (
                      <p className="py-3 w-full">{recipient.recipientPhone}</p>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">Recipient Country:</label>
                    {editForm ? (
                      <select
                        name="country"
                        className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
                        onChange={(e) => handleRecipientChange(index, e)}
                        value={recipient.country}
                        required
                        disabled={recipient.country === "Nigeria"}
                      >
                        {countries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="py-3 w-full">{recipient.country}</p>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">Occasion:</label>
                    {/* Not editable: occasion determines price, and changing it
                        post-payment would let a customer swap to a pricier call
                        without paying the difference. Server strips this field
                        even if sent, so it's read-only here to match. */}
                    <p className="py-3 w-full">{recipient.occassion}</p>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">Preferred Date:</label>
                    {editForm ? (
                      <input
                        className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400"
                        type="date"
                        name="callDate"
                        value={formatToYMD(recipient.callDate)}
                        onChange={(e) => handleRecipientChange(index, e)}
                        required
                        min={new Date().toISOString().split("T")[0]}
                      />
                    ) : (
                      <p className="py-3 w-full">{formatToYMD(recipient.callDate)}</p>
                    )}
                  </div>

                  {!editForm && recipient.callRecording === "yes" && (
                    <div className="flex flex-col space-y-2">
                      <label className="text-gray-700 font-medium">Call Recording:</label>
                      <p className="py-3 w-full">
                        {!recipient.callRecordingURL ? (
                          "Not available"
                        ) : (
                          <Link
                            href={recipient.callRecordingURL}
                            target="_blank"
                            className="text-blue-500 hover:underline"
                          >
                            {recipient.callRecordingURL}
                          </Link>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {editForm ? (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col space-y-2">
                      <label className="text-gray-700 font-medium">Message:</label>
                      <textarea
                        name="message"
                        value={recipient.message || ""}
                        onChange={(e) => handleRecipientChange(index, e)}
                        required
                        rows={4}
                        placeholder="What would you like us to say?"
                        className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 resize-none"
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label className="text-gray-700 font-medium">
                        Special Instructions (Optional):
                      </label>
                      <textarea
                        name="specialInstruction"
                        value={recipient.specialInstruction || ""}
                        onChange={(e) => handleRecipientChange(index, e)}
                        rows={3}
                        placeholder="Any special requests we should know about?"
                        className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recipient.message && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Message</h4>
                        <p className="p-3 gradient-background-soft rounded-md text-gray-700">
                          {recipient.message}
                        </p>
                      </div>
                    )}
                    {recipient.specialInstruction && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Special Instruction</h4>
                        <p className="p-3 gradient-background-soft rounded-md text-gray-700">
                          {recipient.specialInstruction}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* submit button */}
          <div
            className={`w-full flex ${editForm ? "justify-end gap-4" : "justify-center"}`}
          >
            {editForm && (
              <button
                className="btn-secondary w-auto"
                onClick={(e) => {
                  e.preventDefault();
                  setCaller(initialCaller);
                  setRecipients(initialRecipients);
                  setEditForm(false);
                }}
                disabled={isSubmitting || mutation.isPending}
              >
                <div className="flex items-center justify-center">
                  <p>Cancel</p>
                </div>
              </button>
            )}
            <button
              type="submit"
              className={`btn-primary ${editForm ? "w-auto" : "w-full md:w-[50%]"}`}
              disabled={isSubmitting || mutation.isPending}
            >
              {isSubmitting || mutation.isPending ? (
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
                  <p>{editForm ? "Save my Booking" : "Update Booking Info"}</p>
                </div>
              )}
            </button>
          </div>
        </form>

        {showModal && (
          <UpdateConfirmationModal setShowModal={() => setShowModal(false)} error={error} />
        )}
      </motion.div>
    </section>
  );
}
