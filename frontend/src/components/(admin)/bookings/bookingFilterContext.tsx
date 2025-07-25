import { useState, createContext, useContext, useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { motion,} from "framer-motion";
import { STATUS_LIST } from "../dashboard/analytics";
import { services } from "@/components/services/serviceList";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  BookingFilterContex,
  BookingFilters,
  FilterType,
  Rep,
} from "@/lib/types";
import {
  getDefaultDate,
  getDefaultMonth,
  getDefaultWeek,
  getDefaultYear,
} from "@/lib/formatDate";
import { useFetchReps } from "@/hooks/useReps";

const filterTypeOptions = [
  {
    key: "daily",
    label: "Daily",
  },
  {
    key: "weekly",
    label: "Weekly",
  },
  {
    key: "monthly",
    label: "Monthly",
  },
  {
    key: "yearly",
    label: "Yearly",
  },
  {
    key: "custom",
    label: "Custom",
  },
];

export const filterContext = createContext<BookingFilterContex | null>(null);

export default function FilterContextProvider({
  children,
  activeFilters,
  sortOptions,
}: {
  children: React.ReactNode;
  activeFilters: { [key: string]: boolean };
  sortOptions: { sortOrder: string; sortParam: string };
}) {
  // states an values
  const queryClient = useQueryClient();

  const savedFilter = sessionStorage.getItem("bookingFilters");

  const [filterType, setFilterType] = useState<FilterType>(() => {
    if (savedFilter) {
      const { filterType } = JSON.parse(savedFilter);
      return filterType;
    }
    return "daily";
  });
  const [formData, setFormData] = useState<BookingFilters>(() => {
    if (savedFilter) return JSON.parse(savedFilter);
    return {
      singleDate:
        filterType === "weekly"
          ? getDefaultWeek()
          : filterType === "monthly"
          ? getDefaultMonth()
          : filterType === "yearly"
          ? getDefaultYear()
          : getDefaultDate(),
      startDate: "",
      endDate: "",
      status: "",
      callType: "",
      occassion: "",
      assignedRep: "",
      country: "",
      confirmationMailsent: undefined,
      paymentStatus: "",
      page: 1,
    };
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const debouncedValue = useDebounce(debouncedSearch, 500);

  // applied filter
  const [appliedFormData, setAppliedFormData] = useState<BookingFilters>({
    filterType: filterType,
    singleDate: formData.singleDate,
    startDate: formData.startDate,
    endDate: formData.endDate,
    status: formData.status,
    callType: formData.callType,
    occassion: formData.occassion,
    assignedRep: formData.assignedRep,
    country: formData.country,
    confirmationMailsent: formData.confirmationMailsent,
    sortParam: sortOptions.sortParam,
    sortOrder: sortOptions.sortOrder as "1" | "-1",
    page: formData.page,
    paymentStatus: formData.paymentStatus,
    limit: 10,
  });

  const { data } = useFetchReps(
    { limit: 100, page: 1, role: "callrep" },
    "callreps"
  );
  const reps: Rep[] = data?.data || [];

  // functions
  const handleFilterypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as FilterType;
    setFilterType(value);

    // new
    if (value === "weekly")
      setFormData((prev) => ({ ...prev, singleDate: getDefaultWeek() }));
    else if (value === "monthly")
      setFormData((prev) => ({ ...prev, singleDate: getDefaultMonth() }));
    else if (value === "yearly")
      setFormData((prev) => ({ ...prev, singleDate: getDefaultYear() }));
    else setFormData((prev) => ({ ...prev, singleDate: getDefaultDate() }));

    setFormData((prev) => ({ ...prev, startDate: "", endDate: "" }));

    if (value === "custom") {
      setFormData((prev) => ({
        ...prev,
        date: "",
        startDate: getDefaultDate(),
        endDate: getDefaultDate(),
      }));
    }
  };

  const handleOnChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();

    queryClient.cancelQueries({
      queryKey: ["bookings", { ...appliedFormData, search: debouncedValue }],
    });

    // new
    setAppliedFormData((prev) => ({
      ...prev,
      ...formData,
      filterType: filterType,
    }));
  };

  useEffect(() => {
    sessionStorage.setItem(
      "bookingFilters",
      JSON.stringify({ ...appliedFormData, page: 1 })
    );
  }, [appliedFormData]);

  useEffect(() => {
    setAppliedFormData((prev) => ({
      ...prev,
      sortParam: sortOptions.sortParam,
      sortOrder: sortOptions.sortOrder as "1" | "-1",
    }));
  }, [sortOptions]);

  useEffect(() => {
    setFormData((prev) => {
      const updated = { ...prev };
      if (!activeFilters.assignedRep) updated.assignedRep = "";
      if (!activeFilters.callType) updated.callType = "";
      if (!activeFilters.status) updated.status = "";
      if (!activeFilters.occasion) updated.occassion = "";
      if (!activeFilters.country) updated.country = "";
      if (!activeFilters.confirmationMailsent)
        updated.confirmationMailsent = undefined;
      if (!activeFilters.paymentStatus) updated.paymentStatus = "";

      return updated;
    });

    setAppliedFormData((prev) => {
      const updated = { ...prev };
      if (!activeFilters.assignedRep) updated.assignedRep = "";
      if (!activeFilters.callType) updated.callType = "";
      if (!activeFilters.status) updated.status = "";
      if (!activeFilters.occasion) updated.occassion = "";
      if (!activeFilters.country) updated.country = "";
      if (!activeFilters.confirmationMailsent)
        updated.confirmationMailsent = undefined;
      if (!activeFilters.paymentStatus) updated.paymentStatus = "";

      return updated;
    });
  }, [activeFilters]);

  useEffect(() => {
    if (searchTerm === "") {
      const timeout = setTimeout(() => {
        setDebouncedSearch(searchTerm);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [searchTerm]);

  return (
    <filterContext.Provider
      value={{
        ...appliedFormData,
        search: debouncedValue,
        setPage: (newPage: number) =>
          setAppliedFormData((prev) => ({ ...prev, page: newPage })),
      }}
    >
      <div className="">
        <div className="space-y-8">
          {activeFilters.date && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ y: -20 }}
              transition={{ delay: 0.2 }}
            >
              {/* filters */}
              <form className="flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex flex-row items-center space-x-2 w-auto">
                      <label className="text-gray-700 font-medium text-sm">
                        Filter:{" "}
                      </label>
                      <select
                        name="filterType"
                        className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                        onChange={handleFilterypeChange}
                        value={filterType}
                        required
                      >
                        {filterTypeOptions.map((option) => {
                          return (
                            <option key={option.key} value={option.key}>
                              {option.label}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    {filterType === "daily" && (
                      <div className="flex flex-row items-center space-x-2 w-auto">
                        <label className="text-gray-700 font-medium text-sm">
                          Date:{" "}
                        </label>
                        <input
                          type="date"
                          name="singleDate"
                          className="px-4 py-2 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                          onChange={handleOnChange}
                          value={formData.singleDate}
                        />
                      </div>
                    )}
                    {filterType === "weekly" && (
                      <div className="flex flex-row items-center space-x-2 w-auto">
                        <label className="text-gray-700 font-medium text-sm">
                          Week:{" "}
                        </label>
                        <input
                          type="week"
                          name="singleDate"
                          className="px-4 py-2 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm  focus:ring-2 focus:ring-brand-end focus:border-transparent"
                          onChange={handleOnChange}
                          value={formData.singleDate}
                        />
                      </div>
                    )}

                    {filterType === "monthly" && (
                      <div className="flex flex-row items-center space-x-2 w-auto">
                        <label className="text-gray-700 font-medium text-sm">
                          Month:{" "}
                        </label>
                        <input
                          type="month"
                          name="singleDate"
                          className="px-4 py-2 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm  focus:ring-2 focus:ring-brand-end focus:border-transparent"
                          onChange={handleOnChange}
                          value={formData.singleDate}
                        />
                      </div>
                    )}

                    {filterType === "yearly" && (
                      <div className="flex flex-row items-center space-x-2 w-auto">
                        <label className="text-gray-700 font-medium text-sm">
                          Year:{" "}
                        </label>
                        <input
                          type="number"
                          min="1900"
                          max="2100"
                          name="singleDate"
                          className="px-4 py-2 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm  focus:ring-2 focus:ring-brand-end focus:border-transparent w-30"
                          onChange={handleOnChange}
                          value={formData.singleDate}
                          placeholder="Enter year"
                        />
                      </div>
                    )}
                  </div>

                  {filterType === "custom" && (
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="flex flex-row items-center space-x-2 w-auto">
                        <label className="text-gray-700 font-medium text-sm">
                          Start Date:{" "}
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          className="px-4 py-2 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm  focus:ring-2 focus:ring-brand-end focus:border-transparent"
                          onChange={handleOnChange}
                          value={formData.startDate}
                        />
                      </div>

                      <div className="flex flex-row items-center space-x-2 w-auto">
                        <label className="text-gray-700 font-medium text-sm">
                          End Date:{" "}
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          className="px-4 py-2 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm  focus:ring-2 focus:ring-brand-end focus:border-transparent"
                          onChange={handleOnChange}
                          value={formData.endDate}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {Object.entries(activeFilters).some(
                  ([key, value]) => key !== "date" && value
                ) && (
                  <div className="flex flex-row flex-wrap gap-4">
                    {activeFilters.assignedRep && (
                      <div className="flex flex-row items-center space-x-2 w-auto">
                        <label className="text-gray-700 font-medium text-sm">
                          Assigned Rep:{" "}
                        </label>
                        <select
                          name="assignedRep"
                          className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                          onChange={handleOnChange}
                          value={formData.assignedRep}
                          required
                        >
                          <option value="">All</option>
                          {reps.map((rep) => {
                            return (
                              <option
                                key={rep._id}
                                value={rep._id}
                              >{`${rep.firstName} ${rep.lastName}`}</option>
                            );
                          })}
                        </select>
                      </div>
                    )}
                    {activeFilters.callType && (
                      <div className="flex flex-row items-center space-x-2 w-auto">
                        <label className="text-gray-700 font-medium text-sm">
                          Call Type:{" "}
                        </label>
                        <select
                          name="callType"
                          className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                          onChange={handleOnChange}
                          value={formData.callType}
                          required
                        >
                          <option value="">All</option>
                          <option value="regular">Regular</option>
                          <option value="special">Special</option>
                        </select>
                      </div>
                    )}
                    {activeFilters.status && (
                      <div className="flex flex-row items-center space-x-2 w-auto">
                        <label className="text-gray-700 font-medium text-sm">
                          Status:{" "}
                        </label>
                        <select
                          name="status"
                          className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                          onChange={handleOnChange}
                          value={formData.status}
                          required
                        >
                          <option value="">All</option>
                          {STATUS_LIST.map((status) => {
                            return (
                              <option key={status.key} value={status.key}>
                                {status.label}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}
                    {activeFilters.country && (
                      <div className="flex flex-row items-center space-x-2 w-auto">
                        <label className="text-gray-700 font-medium text-sm">
                          Country:{" "}
                        </label>
                        <select
                          name="country"
                          className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                          onChange={handleOnChange}
                          value={formData.country}
                          required
                        >
                          <option value="">All</option>
                          <option value="local">Local</option>
                          <option value="international">International</option>
                        </select>
                      </div>
                    )}
                    {activeFilters.occasion && (
                      <div className="flex flex-row items-center space-x-2 w-auto">
                        <label className="text-gray-700 font-medium text-sm">
                          Occassion:{" "}
                        </label>
                        <select
                          name="occassion"
                          className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                          onChange={handleOnChange}
                          value={formData.occassion}
                          required
                        >
                          <option value="">All</option>
                          {services.map((service) => {
                            return (
                              <option key={service.id} value={service.title}>
                                {service.title}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}

                    {activeFilters.paymentStatus && (
                      <div className="flex flex-row items-center space-x-2 w-auto">
                        <label className="text-gray-700 font-medium text-sm">
                          Payment Status:
                        </label>
                        <select
                          name="paymentStatus"
                          className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                          onChange={handleOnChange}
                          value={formData.paymentStatus}
                          required
                        >
                          <option value="">All</option>
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">failed</option>
                        </select>
                      </div>
                    )}

                    {activeFilters.confirmationMailsent && (
                      <div className="flex flex-row items-center space-x-2 w-auto">
                        <label className="text-gray-700 font-medium text-sm">
                          Confirmation Mail:{" "}
                        </label>
                        <select
                          name="confirmationMailsent"
                          className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              confirmationMailsent:
                                value === ""
                                  ? undefined
                                  : value === "true"
                                  ? true
                                  : false,
                            }));
                          }}
                          value={
                            formData.confirmationMailsent === undefined
                              ? ""
                              : formData.confirmationMailsent === true
                              ? "true"
                              : "false"
                          }
                          required
                        >
                          <option value="">All</option>
                          <option value="true">Sent</option>
                          <option value="false">Failed</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* apply button */}
                <div className="w-full lg:w-auto">
                  <button
                    className="btn-primary rounded-sm h-8 flex items-center justify-center text-sm "
                    onClick={handleApplyFilter}
                  >
                    Apply
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* search input */}
          <div className="relative flex gap-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"></Search>
            <input
              type="text"
              name="search"
              className="pl-10 pr-4 py-2 w-full max-w-xl border border-gray-300 rounded-md flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
              placeholder="Search Booking"
            />
            <button
              className="btn-primary rounded-md h-10 flex items-center justify-center text-sm"
              onClick={() => setDebouncedSearch(searchTerm)}
            >
              Search
            </button>
          </div>
        </div>

        <div>{children}</div>
      </div>
    </filterContext.Provider>
  );
}

export const useBookingFilter = () => {
  const context = useContext(filterContext);
  if (context === null) {
    throw new Error(
      "useBookingFilter must be used within a BookingFilterProvider"
    );
  }
  return context;
};
