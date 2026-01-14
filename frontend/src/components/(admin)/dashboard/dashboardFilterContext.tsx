import { useState, createContext, useContext, useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FilterType, dashboardFilterContextType } from "@/lib/types";
import {
  getDefaultDate,
  getDefaultWeek,
  getDefaultMonth,
  getDefaultYear,
} from "@/lib/formatDate";

const filterOptions = [
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

export const dashboardFilterContext =
  createContext<dashboardFilterContextType | null>(null);

export default function DashboardContextProvider({
  children,
  showFilter,
  repId,
}: {
  children: React.ReactNode;
  showFilter: boolean;
  repId?: string;
}) {
  const savedFilters = sessionStorage.getItem(
    `${repId ? "callrep" : "dashboard"}Filters`
  );
  const queryClient = useQueryClient();

  const [filterType, setFilterType] = useState<FilterType>(() => {
    if (savedFilters) {
      const { appliedFilterType } = JSON.parse(savedFilters);
      return appliedFilterType;
    }
    return "daily";
  });
  const [date, setDate] = useState(() => {
    if (savedFilters) {
      const { appliedDate } = JSON.parse(savedFilters);
      return appliedDate;
    }

    if (filterType === "weekly") return getDefaultWeek();
    if (filterType === "monthly") return getDefaultMonth();
    if (filterType === "yearly") return getDefaultYear();
    return getDefaultDate();
  });
  const [startDate, setStartDate] = useState(() => {
    if (savedFilters) {
      const { appliedStartDate } = JSON.parse(savedFilters);
      return appliedStartDate;
    }
    return "";
  });
  const [endDate, setEndDate] = useState(() => {
    if (savedFilters) {
      const { appliedEndDate } = JSON.parse(savedFilters);
      return appliedEndDate;
    }
    return "";
  });
  const [fetchParam, setFetchParam] = useState(() => {
    if (savedFilters) {
      const { appliedFetchParam } = JSON.parse(savedFilters);
      return appliedFetchParam;
    }
    return "callDate";
  });

  // Applied states for query
  const [appliedFilterType, setAppliedFilterType] =
    useState<FilterType>(filterType);
  const [appliedDate, setAppliedDate] = useState(date);
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [appliedFetchParam, setAppliedFetchParam] = useState(fetchParam);

  const handleFilterChnage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as FilterType;
    setFilterType(value);

    if (value === "weekly") setDate(getDefaultWeek());
    else if (value === "monthly") setDate(getDefaultMonth());
    else if (value === "yearly") setDate(getDefaultYear());
    else setDate(getDefaultDate());

    setStartDate("");
    setEndDate("");

    if (value === "custom") {
      setDate("");
      setStartDate(getDefaultDate());
      setEndDate(getDefaultDate());
    }
  };

  const handleFetchParamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFetchParam(value);
  };

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    // For the "analytics" query
    queryClient.cancelQueries({
      queryKey: [
        "analytics",
        appliedFilterType,
        appliedDate,
        appliedStartDate,
        appliedEndDate,
        appliedFetchParam,
      ],
    });

    queryClient.cancelQueries({
      queryKey: [
        "bookings",
        {
          filterType: appliedFilterType as FilterType,
          startDate: appliedStartDate,
          endDate: appliedEndDate,
          singleDate: appliedDate,
          fetchParam: appliedFetchParam,
          sortParam: "createdAt",
          sortOrder: "-1",
          page: 1,
          limit: 5,
        },
        "all",
      ],
    });

    setAppliedFilterType(filterType);
    setAppliedDate(date);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedFetchParam(fetchParam);
  };

  useEffect(() => {
    sessionStorage.setItem(
      `${repId ? "callrep" : "dashboard"}Filters`,
      JSON.stringify({
        appliedFilterType,
        appliedDate,
        appliedStartDate,
        appliedEndDate,
        appliedFetchParam,
      })
    );
  }, [
    appliedFilterType,
    appliedDate,
    appliedStartDate,
    appliedEndDate,
    appliedFetchParam,
  ]);
  return (
    <dashboardFilterContext.Provider
      value={{
        appliedFilterType: appliedFilterType,
        appliedDate: appliedDate,
        appliedStartDate: appliedStartDate,
        appliedEndDate: appliedEndDate,
        appliedFetchParam: appliedFetchParam,
        repId,
      }}
    >
      <div className="space-y-8">
        {showFilter && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ y: -20 }}
            transition={{ delay: 0.2 }}
          >
            <form className="flex flex-col lg:flex-row gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-row items-center space-x-2 w-auto">
                  <label className="text-gray-700 font-medium text-sm">
                    Filter:{" "}
                  </label>
                  <select
                    name="filterType"
                    className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                    onChange={handleFilterChnage}
                    value={filterType}
                    required
                  >
                    {filterOptions.map((option) => {
                      return (
                        <option key={option.key} value={option.key}>
                          {option.label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {filterType === "daily" && (
                  <div className="flex flex-row items-center space-x-2 w-full lg:w-auto">
                    <label className="text-gray-700 font-medium text-sm">
                      Date:{" "}
                    </label>
                    <input
                      type="date"
                      name="date"
                      className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setDate(e.target.value)
                      }
                      value={date}
                    />
                  </div>
                )}
                {filterType === "weekly" && (
                  <div className="flex flex-row items-center space-x-2 w-full lg:w-auto">
                    <label className="text-gray-700 font-medium text-sm">
                      Week:{" "}
                    </label>
                    <input
                      type="week"
                      name="week"
                      className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setDate(e.target.value)
                      }
                      value={date}
                    />
                  </div>
                )}

                {filterType === "monthly" && (
                  <div className="flex flex-row items-center space-x-2 w-full lg:w-auto">
                    <label className="text-gray-700 font-medium text-sm">
                      Month:{" "}
                    </label>
                    <input
                      type="month"
                      name="month"
                      className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setDate(e.target.value)
                      }
                      value={date}
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setDate(e.target.value)
                      }
                      value={date}
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
                      className="px-4 py-2 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setStartDate(e.target.value)
                      }
                      value={startDate}
                    />
                  </div>

                  <div className="flex flex-row items-center space-x-2 :w-auto">
                    <label className="text-gray-700 font-medium text-sm">
                      End Date:{" "}
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      className="px-4 py-2 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEndDate(e.target.value)
                      }
                      value={endDate}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-row items-center space-x-2 w-auto">
                <label className="text-gray-700 font-medium text-sm">
                  Fetch By:{" "}
                </label>
                <select
                  name="fetchParam"
                  className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                  onChange={handleFetchParamChange}
                  value={fetchParam}
                  required
                >
                  <option value={"callDate"}>Call Date</option>
                  <option value={"bookingDate"}>Booking Date</option>
                </select>
              </div>

              <div className="w-full lg:w-auto">
                <button
                  className="btn-primary rounded-sm h-8 flex items-center justify-center text-sm"
                  onClick={handleApplyFilter}
                >
                  Apply
                </button>
              </div>
            </form>
          </motion.div>
        )}
        <div className="space-y-8">{children}</div>
      </div>
    </dashboardFilterContext.Provider>
  );
}

export const useFilter = () => {
  const context = useContext(dashboardFilterContext);
  if (context === null) {
    throw new Error("useFilter must be used within an AdminAuthProvider");
  }
  return context;
};
