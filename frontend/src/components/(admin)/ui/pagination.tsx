"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationMeta } from "@/lib/types";
import {  } from "../bookings/bookingFilterContext";

interface PaginationProps {
  meta: PaginationMeta;
  setPage: (val: number)=> void

}

export default function Pagination({ meta, setPage }: PaginationProps) {
  const { page, totalPages } = meta;

  
  const handleChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="flex items-center justify-center space-x-4 py-4">
      <button
        onClick={() => handleChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-100 disabled:opacity-50"
      >
        <ChevronLeft size={16} />
      </button>

      <span className="text-sm text-gray-700">
        Page <strong>{page}</strong> of <strong>{totalPages}</strong>
      </span>

      <button
        onClick={() => handleChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-100 disabled:opacity-50"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
