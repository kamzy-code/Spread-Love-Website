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


export const columns: ColumnDef<Booking>[] = [
  {
    accessorKey: "bookingId",
    header: "Booking ID",
    cell: ({ row }) => {
      const id: string = row.getValue("bookingId");
      return <div className="font-medium">{id}</div>;
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
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex cursor-pointer"
        >
          Booking Date
          {column.getIsSorted() === "asc" ? (
            <ArrowDownUp className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </div>
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
    accessorKey: "price",
    header: "Price",
  },
  {
    id: "assignedRep",
    accessorKey: "assignedRep.firstName",
    header: "Rep",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status: string = row.getValue("status");
      return (
        <div
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
            status,
            "badge"
          )}`}
        >
          {getStatusIcon(status)}
          <span className="ml-1 capitalize">{status}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const booking = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-200">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="p-3">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(booking.bookingId)}
            >
              Copy booking ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Update Status</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
            <DropdownMenuItem>Assign to Rep</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function getColumnsByRole(
  role: "superadmin" | "salesrep" | "callrep"
): ColumnDef<Booking>[] {
  const baseColumns: ColumnDef<Booking>[] = [
    {
      accessorKey: "bookingId",
      header: "Booking ID",
      cell: ({ row }) => {
        const id: string = row.getValue("bookingId");
        return <div className="font-medium">{id}</div>;
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
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex cursor-pointer"
          >
            Booking Date
            {column.getIsSorted() === "asc" ? (
              <ArrowDownUp className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </div>
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
          <div
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              status,
              "badge"
            )}`}
          >
            {getStatusIcon(status, true)}
            <span className="ml-1 capitalize">{status}</span>
          </div>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-200">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="p-3">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(booking.bookingId)}
            >
              Copy booking ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Update Status</DropdownMenuItem>
            {role !== "callrep" && (
              <div>
                <DropdownMenuItem>Delete</DropdownMenuItem>
                <DropdownMenuItem>Assign to Rep</DropdownMenuItem>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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
