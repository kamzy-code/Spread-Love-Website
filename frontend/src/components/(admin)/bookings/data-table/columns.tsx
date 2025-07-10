"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Booking } from "@/lib/types";
import { formatToYMD } from "@/lib/formatDate";
import { getStatusColor, getStatusIcon } from "@/lib/getStatusColor";
import { MoreHorizontal, ArrowUpDown, ArrowDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ItemDropDown from "./itemDropdown";

export function getColumnsByRole(
  role: "superadmin" | "salesrep" | "callrep",
  setSelectedBooking: (booking: Booking) => void,
  setDeletedBooking: (booking: Booking) => void,
  setShowDeleteModal: (val: boolean) => void,
): ColumnDef<Booking>[] {
  const baseColumns: ColumnDef<Booking>[] = [
    {
      accessorKey: "bookingId",
      header: "Booking ID",
      cell: ({ row }) => {
        const id: string = row.getValue("bookingId");
        return <span className="font-medium">{id}</span>;
      },
    },
    {
      accessorKey: "callerName",
      header: "Caller",
    },
    {
      accessorKey: "recipientName",
      header: "Receiver",
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
      accessorKey: "occassion",
      header: "Occassion",
    },
    {
      accessorKey: "callType",
      header: "Call Type",
    },
    {
      accessorKey: "country",
      header: "Country",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status: string = row.getValue("status");
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              status,
              "badge"
            )}`}
          >
            {getStatusIcon(status, true)}
            <span className="ml-1 capitalize">{status}</span>
          </span>
        );
      },
    },
  ];

  const repColumn: ColumnDef<Booking> = {
    id: "assignedRep",
    accessorKey: "assignedRep.firstName",
    header: "Rep",
  };

  const priceColumn: ColumnDef<Booking> = {
    accessorKey: "price",
    header: "Price",
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
