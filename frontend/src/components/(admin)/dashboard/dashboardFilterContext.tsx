import { useState, createContext, useContext } from "react";
import { format } from "date-fns";

import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

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
    key: "custom",
    label: "Custom",
  },
];

export interface filterContextType {
  appliedFilterType: string;
  appliedDate?: string;
  appliedStartDate?: string;
  appliedEndDate?: string;
}

export const filterContext = createContext<filterContextType | null>(null);

export type FilterType = "daily" | "weekly" | "monthly" | "custom";
export default function FilterContextProvider({
  children,
  showFilter,
}: {
  children: React.ReactNode;
  showFilter: boolean;
}) {
  const queryClient = useQueryClient();
  const getDefaultDate = () => format(new Date(), "yyyy-MM-dd");
  const getDefaultWeek = () => format(new Date(), "yyyy-'W'II");
  const getDefaultMonth = () => format(new Date(), "yyyy-MM");

  const [filterType, setFilterType] = useState<FilterType>("daily");
  const [date, setDate] = useState(() => {
    if (filterType === "weekly") return getDefaultWeek();
    if (filterType === "monthly") return getDefaultMonth();
    return getDefaultDate();
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Applied states for query
  const [appliedFilterType, setAppliedFilterType] =
    useState<FilterType>(filterType);
  const [appliedDate, setAppliedDate] = useState(date);
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  const handleFilterChnage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as FilterType;
    setFilterType(value);

    if (value === "weekly") setDate(getDefaultWeek());
    else if (value === "monthly") setDate(getDefaultMonth());
    else setDate(getDefaultDate());

    setStartDate("");
    setEndDate("");

    if (value === "custom") {
      setDate("");
      setStartDate(getDefaultDate());
      setEndDate(getDefaultDate());
    }
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
      ],
    });

    // For a different query, e.g., "recentBookings"
    queryClient.cancelQueries({
      queryKey: [
        "bookings",
        {
          filterType: appliedFilterType as FilterType,
          startDate: appliedStartDate,
          endDate: appliedEndDate,
          singleDate: appliedDate,
          sortParam: "createdAt",
          sortOrder: "-1",
          page: 1,
          limit: 5,
        },
      ],
    });

    setAppliedFilterType(filterType);
    setAppliedDate(date);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  return (
    <filterContext.Provider
      value={{
        appliedFilterType: appliedFilterType,
        appliedDate: appliedDate,
        appliedStartDate: appliedStartDate,
        appliedEndDate: appliedEndDate,
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
              <div className="flex flex-row gap-4">
                <div className="flex flex-row items-center space-x-2 w-auto">
                  <label className="text-gray-700 font-medium text-sm">Filter: </label>
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
                    <label className="text-gray-700 font-medium text-sm">Date: </label>
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
                    <label className="text-gray-700 font-medium text-sm">Week: </label>
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
                    <label className="text-gray-700 font-medium text-sm">Month: </label>
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
    </filterContext.Provider>
  );
}

export const useFilter = () => {
  const context = useContext(filterContext);
  if (context === null) {
    throw new Error("useFilter must be used within an AdminAuthProvider");
  }
  return context;
};
