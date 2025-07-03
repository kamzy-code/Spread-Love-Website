import { services, callType } from "../services/serviceList";
import { useState } from "react";
import { motion } from "framer-motion";
import UpdateConfirmationModal from "./updateModal";
import {
  Search,
  Phone,
  Calendar,
  Clock,
  User,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { formatToYMD } from "@/lib/formatDate";
import { deepEqual } from "@/lib/hasBookingChanged";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getStatusColor, getStatusIcon } from "@/lib/getStatusColor";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;


const updateBooking = async (updatedData: any) => {
  const disallowedFields = ["bookingId", "status", "assignedRep", "callType"];

  const allowedUpdate = Object.fromEntries(
    Object.entries(updatedData).filter(([key]) => !disallowedFields.includes(key))
  );

  const response = await fetch(
    `${apiUrl}/booking/${updatedData.bookingId}/update`,
    {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(allowedUpdate),
    }
  );
  const data = await response.json();
  if (!response.ok) {
    // Attach status and statusText for more context if needed
    throw new Error(
      `${data.message}${data.field ? `: ${data.field}` : ""}` ||
        response.statusText ||
        "Unknown error"
    );
  }
  return data;
};

export default function BookingDetails({ data }: { data: any }) {
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
  const [initialBooking, setInitialBooking] = useState(data);
  const [formData, setFormData] = useState(data);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const handleOnChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (updatedData) => updateBooking(updatedData),
    onSuccess: (data) => {
      if (data && data.message === "Update Successful") {
        setEditForm(false);
        setError("");
      }
      // Refetch the booking details after update
      queryClient.invalidateQueries({
        queryKey: ["booking", initialBooking.bookingId],
      });
    },
    onError: (error) => {
      if (error) setError(error.message);
    },
    onSettled: () => {
      setIsSubmitting(false);
      setShowModal(true);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!editForm) {
      setEditForm(true);
      setIsSubmitting(false);
      return;
    }

    const hasNotChanged = deepEqual(initialBooking, formData);
    if (hasNotChanged) {
      setEditForm(false);
      setError("");
      setIsSubmitting(false);
      setShowModal(true);
      return;
    }

    await mutation.mutateAsync(formData);
 
  };

  const getCallStatusMessage = (status: string) => {
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
        return "Your call has been rescheduled due to the recipients inability to take calls at the moment.";
      default:
        return "Call status unknown. Please contact support for more information.";
    }
  };

  return (
    <section className="container-max section-padding flex justify-center py-20 px-7 md:px-10 sm:px-25 lg:px-50">
      <motion.div
        className={`card p-6 md:p-8 w-full space-y-4`}
      >
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h2 className="gradient-text font-bold text-xl md:text-2xl">
              Booking Details
            </h2>
            <p className="text-gray-700 text-md">ID: {formData?.bookingId}</p>
          </div>

          <div className="flex flex-col md:items-end gap-1">
            <div className={`flex `}>
              <p
                className={`flex flex-row gap-2 px-4 py-2 rounded-full items-center ${getStatusColor(
                  formData.status,
                  "badge"
                )}`}
              >
                {getStatusIcon(formData.status)}
                {formData?.status}
              </p>
            </div>
            <p
              className={` ${getStatusColor(
                formData.status,
                "message"
              )} text-sm font-medium italic md:max-w-90 md:text-right`}
            >
              {getCallStatusMessage(formData.status)}
            </p>
          </div>
        </div>

        <div className="">
          <form
            onSubmit={handleSubmit}
            className={`space-y-6 text-brand-start`}
          >
            {/* Personal and Recipiet info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Personal info */}
              <div>
                <h2 className="gradient-text text-xl font-semibold mb-4 pb-2">
                  {" "}
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">Name:</label>
                    <input
                      className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 disabled:border-0 disabled:pl-0"
                      type="text"
                      name="callerName"
                      value={formData.callerName}
                      onChange={handleOnChange}
                      required
                      placeholder="Your full name"
                      disabled={!editForm}
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">Phone:</label>
                    <input
                      className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 disabled:border-0 disabled:pl-0"
                      type="text"
                      name="callerPhone"
                      value={formData.callerPhone}
                      onChange={handleOnChange}
                      required
                      placeholder="+234 123 456 7890"
                      disabled={!editForm}
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">Email:</label>
                    <input
                      className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 disabled:border-0 disabled:pl-0"
                      type="email"
                      name="callerEmail"
                      value={formData.callerEmail}
                      onChange={handleOnChange}
                      required
                      placeholder="your.email@example.com"
                      disabled={!editForm}
                    />
                  </div>
                </div>
              </div>

              {/* Recipient Info */}
              <div>
                <h2 className="gradient-text text-xl font-semibold mb-4 pb-2">
                  {" "}
                  Recipient Information
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">
                      Recipients Name:
                    </label>
                    <input
                      className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 disabled:border-0 disabled:pl-0"
                      type="text"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleOnChange}
                      required
                      placeholder="who should we call?"
                      disabled={!editForm}
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">Phone:</label>
                    <input
                      className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 disabled:border-0 disabled:pl-0"
                      type="text"
                      name="recipientPhone"
                      value={formData.recipientPhone}
                      onChange={handleOnChange}
                      required
                      placeholder="+234 801 234 5678"
                      disabled={!editForm}
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">
                      Recipient Country:
                    </label>
                    <select
                      name="country"
                      id="country"
                      className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent disabled:border-0 disabled:pl-0"
                      onChange={handleOnChange}
                      value={formData.country}
                      required
                      disabled={!editForm || formData.country === "Nigeria"}
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
              <h2 className="gradient-text text-xl font-semibold mb-4 pb-2">
                {" "}
                Call Details
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* occasion label */}
                <div className="flex flex-col space-y-2">
                  <label className="text-gray-700 font-medium">
                    Occassion:
                  </label>
                  <select
                    name="occassion"
                    id="occassion"
                    className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent disabled:border-0 disabled:pl-0"
                    onChange={handleOnChange}
                    value={formData.occassion}
                    required
                    disabled={!editForm}
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
                    Call Type:
                  </label>
                  <input
                    type="text"
                    name="callType"
                    id="call_type"
                    className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent disabled:border-0 disabled:pl-0"
                    onChange={handleOnChange}
                    value={
                      formData.callType === "regular" ? "Regular" : "Special"
                    }
                    required
                    disabled
                  />
                </div>

                {/* Date */}
                <div className="flex flex-col space-y-2">
                  <label className="text-gray-700 font-medium">
                    Preferred Date:
                  </label>
                  <input
                    className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 disabled:border-0 disabled:pl-0"
                    type="date"
                    name="callDate"
                    value={formatToYMD(formData.callDate)}
                    onChange={handleOnChange}
                    required
                    min={new Date().toISOString().split("T")[0]}
                    disabled={!editForm}
                  />
                </div>
              </div>
            </div>

            {/* Personal Touch */}
            {editForm ? (
              <div className="">
                <h2 className="gradient-text text-xl font-semibold mb-4 pb-2">
                  {" "}
                  Personal Touch
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {/* message */}

                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">
                      Message:
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleOnChange}
                      required
                      rows={5}
                      placeholder="What would you like us to say? Share your heartfelt message"
                      className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 resize-none disabled:border-0 disabled:pl-0"
                      disabled={!editForm}
                    ></textarea>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">
                      Special Instructions(Optional):
                    </label>
                    <textarea
                      name="specialInstruction"
                      value={formData?.specialInstruction}
                      onChange={handleOnChange}
                      rows={3}
                      placeholder="Any Special requests, favorite songs, or important details we should know"
                      className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 resize-none disabled:border-0 disabled:pl-0"
                      disabled={!editForm}
                    ></textarea>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.message && (
                  <div>
                    <h2 className="gradient-text text-xl font-semibold mb-4 pb-2">
                      {" "}
                      Message
                    </h2>

                    <p className="p-3 gradient-background-soft rounded-md text-gray-700">
                      {formData.message}
                    </p>
                  </div>
                )}

                {formData.specialInstruction && (
                  <div>
                    <h2 className="gradient-text text-xl font-semibold mb-4 pb-2">
                      {" "}
                      Special Instruction
                    </h2>

                    <p className="p-3 gradient-background-soft rounded-md text-gray-700">
                      {formData.specialInstruction}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* pricing summary */}
            {
              <div className="mt-6 p-4 md:p-6 gradient-background-soft space-y-2">
                <h3 className="font-semibold">Pricing Summary</h3>
                <div className="flex justify-between">
                  {
                    <h2 className="text-sm sm:text-md md:text-lg font-bold text-brand-end max-w-[50%] md:max-w-full">{`${
                      formData.occassion
                    } (${
                      formData.callType === "regular" ? "Regular" : "Special"
                    })`}</h2>
                  }
                  {
                    <h2 className="text-sm sm:text-md md:text-lg font-bold text-brand-end">
                      N{formData.price}
                    </h2>
                  }
                </div>
              </div>
            }

            {/* submit button */}
            {
              <div className="w-full flex justify-center">
                <button
                  type="submit"
                  className="btn-primary w-full md:w-[50%]"
                  disabled={isSubmitting || mutation.isPending}
                >
                  {(isSubmitting || mutation.isPending) ? (
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
                      <p>
                        {editForm ? "Save my Booking" : "Update Booking Info"}
                      </p>
                    </div>
                  )}
                </button>
              </div>
            }
          </form>
        </div>

        {showModal && (
          <UpdateConfirmationModal
            setShowModal={() => setShowModal(false)}
            error={error}
          ></UpdateConfirmationModal>
        )}
      </motion.div>
    </section>
  );
}
