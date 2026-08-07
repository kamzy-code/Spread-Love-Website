"use client";
import { motion } from "framer-motion";
import { FilterType } from "@/lib/types";
import { useDashboardFilterStore } from "@/store/dashboardFilterStore";

const filterOptions = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
  { key: "custom", label: "Custom" },
];

export default function DashboardFilterPanel({
  showFilter,
  repId,
}: {
  showFilter: boolean;
  repId?: string;
}) {
  const useStore = useDashboardFilterStore(repId);
  const filterType = useStore((s) => s.filterType);
  const date = useStore((s) => s.date);
  const startDate = useStore((s) => s.startDate);
  const endDate = useStore((s) => s.endDate);
  const fetchParam = useStore((s) => s.fetchParam);
  const setFilterType = useStore((s) => s.setFilterType);
  const setDate = useStore((s) => s.setDate);
  const setStartDate = useStore((s) => s.setStartDate);
  const setEndDate = useStore((s) => s.setEndDate);
  const setFetchParam = useStore((s) => s.setFetchParam);
  const applyFilter = useStore((s) => s.applyFilter);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value as FilterType);
  };

  const handleFetchParamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFetchParam(e.target.value);
  };

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilter();
  };

  if (!showFilter) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ y: -20 }}
      transition={{ delay: 0.2 }}
    >
      <form className="flex flex-col lg:flex-row gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-row items-center space-x-2 w-auto">
            <label className="text-gray-700 font-medium text-sm">Filter: </label>
            <select
              name="filterType"
              className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
              onChange={handleFilterChange}
              value={filterType}
              required
            >
              {filterOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {filterType === "daily" && (
            <div className="flex flex-row items-center space-x-2 w-full lg:w-auto">
              <label className="text-gray-700 font-medium text-sm">Date: </label>
              <input
                type="date"
                name="date"
                className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
                value={date}
              />
            </div>
          )}

          {filterType === "yearly" && (
            <div className="flex flex-row items-center space-x-2 w-auto">
              <label className="text-gray-700 font-medium text-sm">Year: </label>
              <input
                type="number"
                min="1900"
                max="2100"
                name="singleDate"
                className="px-4 py-2 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm  focus:ring-2 focus:ring-brand-end focus:border-transparent w-30"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
                value={date}
                placeholder="Enter year"
              />
            </div>
          )}
        </div>

        {filterType === "custom" && (
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-row items-center space-x-2 w-auto">
              <label className="text-gray-700 font-medium text-sm">Start Date: </label>
              <input
                type="date"
                name="startDate"
                className="px-4 py-2 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                value={startDate}
              />
            </div>

            <div className="flex flex-row items-center space-x-2 :w-auto">
              <label className="text-gray-700 font-medium text-sm">End Date: </label>
              <input
                type="date"
                name="endDate"
                className="px-4 py-2 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                value={endDate}
              />
            </div>
          </div>
        )}

        <div className="flex flex-row items-center space-x-2 w-auto">
          <label className="text-gray-700 font-medium text-sm">Fetch By: </label>
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
  );
}
