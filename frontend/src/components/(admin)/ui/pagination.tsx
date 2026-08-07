"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationMeta } from "@/lib/types";

interface PaginationProps {
  meta: PaginationMeta;
  setPage: (val: number)=> void

}

export default function Pagination({ meta, setPage }: PaginationProps) {
  const { page, totalPages, total } = meta;
  const [pageInput, setPageInput] = useState(String(page));

  // Keep the input in sync when the page changes from elsewhere (prev/next
  // buttons, a filter reset, etc.) rather than from this input itself.
  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  const handleChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const commitPageInput = () => {
    const parsed = parseInt(pageInput, 10);
    if (Number.isNaN(parsed)) {
      setPageInput(String(page));
      return;
    }
    const maxPage = Math.max(totalPages, 1);
    const clamped = Math.min(Math.max(parsed, 1), maxPage);
    setPageInput(String(clamped));
    if (clamped !== page) {
      setPage(clamped);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-1 py-4">
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={() => handleChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="flex items-center gap-2 text-sm text-gray-700">
          Page
          <input
            type="text"
            inputMode="numeric"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value.replace(/[^0-9]/g, ""))}
            onBlur={commitPageInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitPageInput();
                e.currentTarget.blur();
              }
            }}
            aria-label="Page number"
            className="w-12 text-center border border-gray-300 rounded-md py-1 focus:outline-none focus:ring-2 focus:ring-brand-end"
          />
          of <strong>{totalPages}</strong>
        </span>

        <button
          onClick={() => handleChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {total !== undefined && (
        <span className="text-xs text-gray-500">
          {total} {total === 1 ? "result" : "results"}
        </span>
      )}
    </div>
  );
}
