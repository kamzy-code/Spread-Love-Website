"use client";
import { useAdminAuth } from "@/hooks/authContext";
import { useState, useEffect, useRef } from "react";
import PageLoading from "../ui/pageLoading";
import PageError from "../ui/pageError";
import { motion, AnimatePresence } from "framer-motion";
import AdminShell from "../ui/AdminShell";
import BookingFilterPanel from "./BookingFilterPanel";
import { Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import BookingTable from "./bookingTable";
import { useBookingFilterStore } from "@/store/bookingFilterStore";

const FILTER_OPTIONS = [
  { key: "date", label: "Date", alwaysOn: true },
  { key: "assignedRep", label: "Assigned Rep" },
  { key: "callType", label: "Call Type" },
  { key: "status", label: "Status" },
  { key: "bookingStatus", label: "Booking Status" },
  { key: "occasion", label: "Occasion" },
  { key: "country", label: "Country" },
  { key: "confirmationMailsent", label: "Confirmation Mail" },
  { key: "paymentStatus", label: "Payment Status" },
];

const SORT_OPTIONS = [
  { sortOrder: "-1", sortParam: "callDate", label: "Call Date (newest first)" },
  { sortOrder: "1", sortParam: "callDate", label: "Call Date (oldest first)" },
  {
    sortOrder: "-1",
    sortParam: "createdAt",
    label: "Booking Date (newest first)",
  },
  {
    sortOrder: "1",
    sortParam: "createdAt",
    label: "Booking Date (oldest first)",
  },
];

export default function Booking() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authStatus, authError, loading } = useAdminAuth();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sortDropDown, setSortDropDown] = useState(false);
  const activeFilters = useBookingFilterStore((s) => s.activeFilters);
  const toggleActiveFilter = useBookingFilterStore((s) => s.toggleActiveFilter);
  const sortOptions = useBookingFilterStore((s) => s.sortOptions);
  const setSortOptions = useBookingFilterStore((s) => s.setSortOptions);
  const syncFromUrl = useBookingFilterStore((s) => s.syncFromUrl);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Arriving from an analytics card link (?status=... or ?bookingStatus=...)
  // — surface the matching filter panel so the applied filter is visible,
  // and sync the store (only actually resets the applied filter/page if the
  // value differs from what's already applied, so plain back-navigation to
  // this page is a no-op).
  useEffect(() => {
    const status = searchParams.get("status") || undefined;
    const bookingStatus = searchParams.get("bookingStatus") || undefined;
    if (status) toggleActiveFilterOn("status");
    if (bookingStatus) toggleActiveFilterOn("bookingStatus");
    if (status || bookingStatus) syncFromUrl({ status, bookingStatus });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function toggleActiveFilterOn(key: string) {
    if (!useBookingFilterStore.getState().activeFilters[key]) {
      toggleActiveFilter(key);
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
        setSortDropDown(false);
      }
    }
    if (dropdownOpen || sortDropDown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen, sortDropDown]);

  if (!mounted) {
    return null;
  }

  if (loading || authStatus === "checking") {
    return <PageLoading></PageLoading>;
  }

  if (authStatus === "error" && authError) {
    return <PageError></PageError>;
  }

  if (authStatus !== "authenticated") {
    router.replace("/admin");
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <AdminShell>
        <motion.div
          className="py-6 md:py-12 space-y-8 h-full flex flex-col relative"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div>
            <div className="flex justify-between">
              <h1 className="text-3xl font-bold">Bookings</h1>
              <div className="relative" ref={dropdownRef}>
                <div className="flex gap-4">
                  <button
                    className="flex items-center px-4 py-2 border border-brand-end rounded-lg hover:bg-brand-end hover:scale-105 hover:text-white transition text-brand-end gap-2"
                    onClick={() => {
                      if (sortDropDown) setSortDropDown(false);
                      setDropdownOpen((open) => !open);
                    }}
                    type="button"
                  >
                    <Filter className="h-5 w-5" />
                    <p className="hidden md:flex">Filter</p>
                  </button>
                </div>

                {dropdownOpen && activeFilters && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50 p-2">
                    {FILTER_OPTIONS.map((filter) => (
                      <label
                        key={filter.key}
                        className={`flex items-center px-2 py-1 cursor-pointer ${
                          filter.alwaysOn ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={!!activeFilters[filter.key]}
                          disabled={filter.alwaysOn}
                          onChange={() => toggleActiveFilter(filter.key)}
                          className="mr-2"
                        />
                        {filter.label}
                      </label>
                    ))}

                    <label
                      className={`flex items-center px-2 py-1 cursor-pointer`}
                      onClick={() => {
                        setSortDropDown(true);
                        setDropdownOpen(false);
                      }}
                    >
                      Sort by...
                    </label>
                  </div>
                )}

                {sortDropDown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50 p-2 ">
                    {SORT_OPTIONS.map((option, idx) => (
                      <label
                        key={idx}
                        className={`flex items-center px-2 py-1 cursor-pointer`}
                      >
                        <input
                          type="radio"
                          name="sortOption"
                          checked={
                            sortOptions.sortParam === option.sortParam &&
                            sortOptions.sortOrder === option.sortOrder
                          }
                          onChange={() =>
                            setSortOptions({
                              sortParam: option.sortParam,
                              sortOrder: option.sortOrder as "1" | "-1",
                            })
                          }
                          className="mr-2"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-8">
            <BookingFilterPanel activeFilters={activeFilters} />
            <BookingTable></BookingTable>
          </div>
        </motion.div>
      </AdminShell>
    </AnimatePresence>
  );
}
