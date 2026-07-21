"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Booking } from "@/lib/types";
import { formatToYMD } from "@/lib/formatDate";
import { getStatusColor, getStatusIcon } from "@/lib/getStatusColor";
import { getTierColor, getTierIcon, getTierLabel } from "@/lib/getTierColor";
import {
  getDisplayCallerName,
  getDisplayBookingStatus,
  getDisplayTotalPrice,
  getDisplayCustomerTier,
  getExtraRecipientsLabel,
  getPrimaryRecipient,
} from "@/lib/bookingDisplay";
import { ArrowUpDown, ArrowDownUp } from "lucide-react";
import ItemDropDown from "./itemDropdown";

export function getColumnsByRole(
  role: "superadmin" | "salesrep" | "callrep",
  setSelectedBooking: (booking: Booking, action: string) => void,
  setDeletedBooking: (booking: Booking) => void,
  setShowDeleteModal: (val: boolean) => void
): ColumnDef<Booking>[] {
  const baseColumns: ColumnDef<Booking>[] = [
    {
      accessorKey: "bookingId",
      header: "Booking ID",
      cell: ({ row }) => {
        const booking: Booking = row.original;
        return (
          <div
            className="flex gap-2 items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="font-medium">{booking.bookingId}</span>
            <div
              className={`h-2 w-2 rounded-full shrink-0 ${
                booking.paymentStatus === "pending"
                  ? `bg-yellow-500`
                  : booking.paymentStatus === "paid"
                  ? `bg-green-500`
                  : `bg-red-500`
              }`}
            ></div>
          </div>
        );
      },
    },
    {
      id: "callerName",
      header: "Caller",
      cell: ({ row }) => {
        const booking = row.original;
        const tier = getDisplayCustomerTier(booking);
        return (
          <div className="flex items-center gap-1.5">
            <span>{getDisplayCallerName(booking)}</span>
            <span
              className={`inline-flex shrink-0 items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getTierColor(
                tier,
                "badge"
              )}`}
            >
              {getTierIcon(tier, true)}
              {getTierLabel(tier)}
            </span>
          </div>
        );
      },
    },
    {
      id: "recipientName",
      header: "Receiver",
      cell: ({ row }) => {
        const booking = row.original;
        const extra = getExtraRecipientsLabel(booking);
        return (
          <div className="flex items-center gap-1.5">
            <span>{getPrimaryRecipient(booking).recipientName}</span>
            {extra && (
              <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {extra}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <span
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex cursor-pointer"
          >
            Booking Date
            {column.getIsSorted() === "asc" ? (
              <ArrowDownUp className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </span>
        );
      },
      cell: ({ row }) => {
        const date = formatToYMD(row.getValue("createdAt"));
        return date;
      },
    },
    {
      id: "occassion",
      header: "Occassion",
      // Multi-recipient bookings can have a different occasion per
      // recipient — this shows the primary (first) recipient's; the full
      // breakdown lives on the detail page.
      cell: ({ row }) => getPrimaryRecipient(row.original).occassion,
    },
    {
      id: "callType",
      header: "Call Type",
      cell: ({ row }) => getPrimaryRecipient(row.original).callType,
    },
    {
      id: "country",
      header: "Country",
      cell: ({ row }) => getPrimaryRecipient(row.original).country,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = getDisplayBookingStatus(row.original);
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              status,
              "badge"
            )}`}
          >
            {getStatusIcon(status, true)}
            <span className="ml-1 capitalize">{status.replace("_", " ")}</span>
          </span>
        );
      },
    },
  ];

  const repColumn: ColumnDef<Booking> = {
    id: "assignedRep",
    accessorKey: "assignedRep.firstName",
    header: "Rep",
    cell: ({ row }) => {
      const booking: Booking = row.original;
      return booking?.assignedRep?.firstName ? (
        booking.assignedRep.firstName
      ) : (
        <span className="text-gray-400 italic">Unassigned</span>
      );
    },
  };

  const priceColumn: ColumnDef<Booking> = {
    id: "price",
    header: "Price",
    cell: ({ row }) => `N${getDisplayTotalPrice(row.original).toLocaleString()}`,
  };

  const actionsColumn: ColumnDef<Booking> = {
    id: "actions",
    cell: ({ row }) => {
      const booking = row.original;

      return (
        <ItemDropDown
          booking={booking}
          view="web"
          setSelectedbooking={setSelectedBooking}
          setDeletedBooking={setDeletedBooking}
          setShowDeleteModal={setShowDeleteModal}
        ></ItemDropDown>
      );
    },
  };

  // Conditionally add columns based on role
  if (role === "superadmin" || role === "salesrep") {
    return [...baseColumns, repColumn, priceColumn, actionsColumn];
  } else {
    return [...baseColumns, priceColumn, actionsColumn]; // callreps don't see assigned rep
  }
}

export function getColumnLabel(id: string): string {
  switch (id) {
    case "bookingId":
      return "Booking ID";
    case "callerName":
      return "Caller";
    case "recipientName":
      return "Receiver";
    case "createdAt":
      return "Booking Date";
    case "occassion":
      return "Occassion";
    case "callType":
      return "Call Type";
    case "country":
      return "Country";
    case "price":
      return "Price";
    case "assignedRep":
      return "Rep";
    case "status":
      return "Status";
    case "actions":
      return "Actions";
    default:
      return "Unknown Column";
  }
}
