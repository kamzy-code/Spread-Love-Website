import { useState, createContext, useContext, useEffect } from "react";
import { format } from "date-fns";

import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { FilterType } from "@/lib/types";
import { BookingFilters } from "@/hooks/useBookings";
import { STATUS_LIST } from "../dashboard/analytics";
import { services } from "@/components/services/serviceList";
import { Search } from "lucide-react";

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
    key: "custom",
    label: "Custom",
  },
];

export const filterContext = createContext<BookingFilters | null>(null);

export default function FilterContextProvider({
  children,
  activeFilters,
  sortOptions,
}: {
  children: React.ReactNode;
  activeFilters: { [key: string]: boolean };
  sortOptions: { sortOrder: string; sortParam: string };
}) {
  const queryClient = useQueryClient();
  const getDefaultDate = () => format(new Date(), "yyyy-MM-dd");
  const getDefaultWeek = () => format(new Date(), "yyyy-'W'II");
  const getDefaultMonth = () => format(new Date(), "yyyy-MM");

  const [filterType, setFilterType] = useState<FilterType>("daily");
  const [formData, setFormData] = useState<BookingFilters>({
    singleDate:
      filterType === "weekly"
        ? getDefaultWeek()
        : filterType === "monthly"
        ? getDefaultMonth()
        : getDefaultDate(),
    startDate: "",
    endDate: "",
    status: "",
    callType: "",
    occassion: "",
    assignedRep: "",
    country: "",
    page: 1,
  });
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
    sortParam: sortOptions.sortParam,
    sortOrder: sortOptions.sortOrder as "1" | "-1",
    page: formData.page,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const handleFilterypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as FilterType;
    setFilterType(value);

    // new
    if (value === "weekly")
      setFormData((prev) => ({ ...prev, singleDate: getDefaultWeek() }));
    else if (value === "monthly")
      setFormData((prev) => ({ ...prev, singleDate: getDefaultMonth() }));
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
      queryKey: ["bookings", appliedFormData],
    });

    // new
    setAppliedFormData((prev) => ({
      ...prev,
      ...formData,
      filterType: filterType,
    }));
  };

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

      return updated;
    });
  }, [activeFilters]);

  return (
    <filterContext.Provider value={{ ...appliedFormData, search: searchTerm }}>
      <div className="space-y-8">
        {activeFilters.date && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ y: -20 }}
            transition={{ delay: 0.2 }}
          >
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
                        <option value="a">Rep A</option>
                        <option value="b">Rep B</option>
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
                </div>
              )}

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

        
          <div className="relative md:w-1/3">
            <input
              type="text"
              name="search"
              className="pl-10 pr-4 py-2 w-full max-w-xl border border-gray-300 rounded-md flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
              placeholder="Search Booking"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"></Search>
          </div>
        
        <div className="space-y-8">{children}</div>
      </div>
    </filterContext.Provider>
  );
}

export const useBookingFilter = () => {
  const context = useContext(filterContext);
  if (context === null) {
    throw new Error("useFilter must be used within an BookingFilterProvider");
  }
  return context;
};
