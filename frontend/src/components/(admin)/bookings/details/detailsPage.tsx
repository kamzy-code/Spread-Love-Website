"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import ActionStatusModal from "../../ui/updateModal";
import AuditLogSidebar from "../../ui/AuditLogSidebar";
import { deepEqual } from "@/lib/hasBookingChanged";
import { getStatusColor, getStatusIcon } from "@/lib/getStatusColor";
import { getTierColor, getTierIcon, getTierLabel } from "@/lib/getTierColor";
import { Booking, CallerFormState, AdminBookingUpdatePayload } from "@/lib/types";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { isLegacyBooking } from "@/lib/bookingShape";
import {
  getDisplayBookingStatus,
  getDisplayCustomerTier,
  getPrimaryRecipient,
} from "@/lib/bookingDisplay";
import {
  useUpdateBookingByAdmin,
  useUpdateStatus,
  useUpdateRecipientStatus,
} from "@/hooks/useBookings";
import CallerEditFields from "./CallerEditFields";
import RecipientEditCard, { RecipientEditState } from "./RecipientEditCard";

const buildCallerState = (booking: Booking): CallerFormState => ({
  name: booking.caller?.name ?? booking.callerName ?? "",
  phone: booking.caller?.phone ?? booking.callerPhone ?? "",
  email: booking.caller?.email ?? booking.callerEmail ?? "",
  gender: booking.caller?.gender ?? "",
  relationship: booking.caller?.relationship ?? booking.relationship ?? "",
});

const buildRecipientsState = (booking: Booking): RecipientEditState[] => {
  const source = isLegacyBooking(booking)
    ? [getPrimaryRecipient(booking)]
    : booking.recipients!;

  return source.map((r) => ({
    _id: r._id,
    recipientName: r.recipientName,
    recipientPhone: r.recipientPhone,
    country: r.country,
    occassion: r.occassion,
    callType: r.callType,
    callDate: r.callDate,
    price: r.price,
    message: r.message ?? "",
    specialInstruction: r.specialInstruction ?? "",
    callStatus: r.callStatus,
    callRecording: r.callRecording,
    callRecordingURL: r.callRecordingURL,
  }));
};

export default function DetailsPage({ data }: { data: Booking }) {
  const { user } = useAdminAuth();
  const queryClient = useQueryClient();

  const [initialCaller, setInitialCaller] = useState(buildCallerState(data));
  const [initialRecipients, setInitialRecipients] = useState(buildRecipientsState(data));
  const [caller, setCaller] = useState(initialCaller);
  const [recipients, setRecipients] = useState(initialRecipients);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Resync local form state from freshly fetched data (e.g. after a save
  // invalidates the query) — but never while the admin is mid-edit, or an
  // in-progress edit would get clobbered by the refetch.
  useEffect(() => {
    if (editForm) return;
    setInitialCaller(buildCallerState(data));
    setInitialRecipients(buildRecipientsState(data));
    setCaller(buildCallerState(data));
    setRecipients(buildRecipientsState(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, editForm]);

  const canEdit = user?.role !== "callrep";
  const legacy = isLegacyBooking(data);
  const bookingStatus = getDisplayBookingStatus(data);
  const customerTier = getDisplayCustomerTier(data);

  const updateBookingMutation = useUpdateBookingByAdmin();
  const updateRecipientStatusMutation = useUpdateRecipientStatus();
  const updateLegacyStatusMutation = useUpdateStatus();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["booking", data._id] });
    queryClient.invalidateQueries({ queryKey: ["auditLogs", "booking", data.bookingId] });
  };

  const handleCallerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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
      prev.map((r, i) =>
        i === index ? { ...r, [name]: name === "price" ? Number(value) : value } : r,
      ),
    );
  };

  const handleUpdateRecipientStatus = async (index: number, status: string) => {
    if (recipients[index].callStatus === status) return;

    try {
      if (legacy) {
        await updateLegacyStatusMutation.mutateAsync({ id: data._id, status });
      } else {
        await updateRecipientStatusMutation.mutateAsync({
          bookingId: data._id,
          recipientId: recipients[index]._id,
          status,
        });
      }
      setRecipients((prev) =>
        prev.map((r, i) => (i === index ? { ...r, callStatus: status } : r)),
      );
      setSuccessMessage("Call status updated successfully!");
      setErrorMessage("");
      invalidate();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update status");
      setSuccessMessage("");
    }
    setShowModal(true);
  };

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
      setErrorMessage("");
      setIsSubmitting(false);
      setShowModal(true);
      return;
    }

    const payload: AdminBookingUpdatePayload = {
      caller: { ...caller, gender: caller.gender || undefined },
      recipients: recipients.map((r) => ({
        _id: r._id,
        recipientName: r.recipientName,
        recipientPhone: r.recipientPhone,
        country: r.country,
        occassion: r.occassion,
        callType: r.callType,
        callDate: r.callDate,
        price: r.price,
        message: r.message,
        specialInstruction: r.specialInstruction,
        callRecordingURL: r.callRecordingURL,
      })),
    };

    try {
      await updateBookingMutation.mutateAsync({ bookingId: data._id, payload });
      setEditForm(false);
      setErrorMessage("");
      setSuccessMessage("Booking updated successfully!");
      invalidate();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update booking");
      setSuccessMessage("");
    } finally {
      setIsSubmitting(false);
      setShowModal(true);
    }
  };

  const subtotal = recipients.reduce((sum, r) => sum + (Number(r.price) || 0), 0);
  const total = subtotal - (data.discountAmount ?? 0);
  const isPending = isSubmitting || updateBookingMutation.isPending;

  return (
    <section className="flex flex-col lg:flex-row w-full gap-6">
      <motion.div className="py-6 md:py-8 flex-1 min-w-0 space-y-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h2 className="gradient-text font-bold text-xl md:text-2xl">
              Booking Details
            </h2>
            <p className="text-gray-700 text-md">ID: {data.bookingId}</p>
          </div>

          <div className="flex gap-2">
            <p
              className={`flex flex-row gap-2 px-4 py-2 rounded-full items-center ${getTierColor(
                customerTier,
                "badge",
              )}`}
            >
              {getTierIcon(customerTier)}
              <span>{getTierLabel(customerTier)}</span>
            </p>
            <p
              className={`flex flex-row gap-2 px-4 py-2 rounded-full items-center ${getStatusColor(
                bookingStatus,
                "badge",
              )}`}
            >
              {getStatusIcon(bookingStatus)}
              <span className="capitalize">{bookingStatus.replace("_", " ")}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-brand-start">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CallerEditFields
              caller={caller}
              editForm={editForm}
              onChange={handleCallerChange}
            />

            <div className="grid grid-cols-1 gap-4">
              {user?.role !== "callrep" && (
                <div className="flex flex-col space-y-2">
                  <label className="text-gray-700 font-medium">Assigned Rep:</label>
                  <p className="py-3 w-full">
                    {data.assignedRep?.firstName ?? (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </p>
                </div>
              )}

              <div className="flex flex-col space-y-2">
                <label className="text-gray-700 font-medium">Payment Status:</label>
                <p className="py-3 w-full capitalize">{data.paymentStatus}</p>
              </div>

              {data.paymentReference && user?.role !== "callrep" && (
                <div className="flex flex-col space-y-2">
                  <label className="text-gray-700 font-medium">
                    Payment Reference:
                  </label>
                  <p className="py-3 w-full">{data.paymentReference}</p>
                </div>
              )}

              {!editForm && (
                <div className="flex flex-col space-y-2">
                  <label className="text-gray-700 font-medium">
                    Contact Consent:
                  </label>
                  <p className="py-3 w-full capitalize">{data.contactConsent}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="gradient-text text-xl font-semibold pb-2">
              Recipient{recipients.length > 1 ? "s" : ""}
            </h2>
            {recipients.map((recipient, index) => (
              <RecipientEditCard
                key={recipient._id}
                recipient={recipient}
                index={index}
                editForm={editForm}
                onChange={handleRecipientChange}
                onUpdateStatus={(status) => handleUpdateRecipientStatus(index, status)}
                statusActionDisabled={
                  updateRecipientStatusMutation.isPending ||
                  updateLegacyStatusMutation.isPending
                }
                bookingId={data._id}
                currentUserId={user?._id}
                legacy={legacy}
              />
            ))}
          </div>

          <div className="mt-2 p-4 md:p-6 gradient-background-soft space-y-2">
            <h3 className="font-semibold">Pricing Summary</h3>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="font-medium">N{subtotal.toLocaleString()}</span>
            </div>
            {data.couponCode && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Coupon ({data.couponCode})
                </span>
                <span className="font-medium">
                  -N{(data.discountAmount ?? 0).toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-brand-end">
                N{total.toLocaleString()}
              </span>
            </div>
          </div>

          {canEdit && (
            <div
              className={`w-full flex ${
                editForm ? "justify-end gap-4" : "justify-center"
              }`}
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
                  disabled={isPending}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className={`btn-primary disabled:opacity-50 ${
                  editForm ? "w-auto" : "w-full md:w-[50%]"
                }`}
                disabled={
                  isPending ||
                  (editForm &&
                    deepEqual(initialCaller, caller) &&
                    deepEqual(initialRecipients, recipients))
                }
              >
                {isPending
                  ? "Saving..."
                  : editForm
                    ? "Save my Booking"
                    : "Update Booking Info"}
              </button>
            </div>
          )}
        </form>

        {showModal && (
          <ActionStatusModal
            setShowModal={() => setShowModal(false)}
            error={errorMessage}
            success={successMessage}
          ></ActionStatusModal>
        )}
      </motion.div>

      <AuditLogSidebar
        entity="booking"
        entityId={data.bookingId}
        isSuperAdmin={user?.role === "superadmin"}
      />
    </section>
  );
}
