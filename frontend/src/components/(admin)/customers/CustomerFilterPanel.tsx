"use client";
import { motion } from "framer-motion";
import { Search, Download } from "lucide-react";
import { useState } from "react";
import { FilterType } from "@/lib/types";
import { useCustomerFilterStore } from "@/store/customerFilterStore";
import { exportCustomersCsv } from "@/hooks/useCustomers";

const tierOptions = [
  { value: "new", label: "New" },
  { value: "regular", label: "Regular" },
  { value: "vip", label: "VIP" },
  { value: "diamond", label: "Diamond" },
];

const filterOptions = [
  { key: "", label: "All Time" },
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
  { key: "custom", label: "Custom" },
];

export default function CustomerFilterPanel({ showFilter }: { showFilter: boolean }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const formData = useCustomerFilterStore((s) => s.formData);
  const appliedFormData = useCustomerFilterStore((s) => s.appliedFormData);
  const searchTerm = useCustomerFilterStore((s) => s.searchTerm);
  const setFormField = useCustomerFilterStore((s) => s.setFormField);
  const setFilterType = useCustomerFilterStore((s) => s.setFilterType);
  const setSearchTerm = useCustomerFilterStore((s) => s.setSearchTerm);
  const submitSearch = useCustomerFilterStore((s) => s.submitSearch);
  const applyFilter = useCustomerFilterStore((s) => s.applyFilter);

  const handleTierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormField(e.target.name, e.target.value);
  };

  const handleFilterTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value as FilterType | "");
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormField("singleDate", e.target.value);
  };

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilter();
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportError("");
    try {
      await exportCustomersCsv({
        tier: appliedFormData.tier,
        search: appliedFormData.search,
        filterType: appliedFormData.filterType,
        singleDate: appliedFormData.singleDate,
        startDate: appliedFormData.startDate,
        endDate: appliedFormData.endDate,
      });
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Failed to export customers");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
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
                <label className="text-gray-700 font-medium text-sm">Tier: </label>
                <select
                  name="tier"
                  className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                  onChange={handleTierChange}
                  value={formData.tier}
                  required
                >
                  <option value="">All</option>
                  {tierOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-row items-center space-x-2 w-auto">
                <label className="text-gray-700 font-medium text-sm">Booked: </label>
                <select
                  name="filterType"
                  className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                  onChange={handleFilterTypeChange}
                  value={formData.filterType}
                  required
                >
                  {filterOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {formData.filterType === "daily" && (
                <div className="flex flex-row items-center space-x-2 w-full lg:w-auto">
                  <label className="text-gray-700 font-medium text-sm">Date: </label>
                  <input
                    type="date"
                    name="singleDate"
                    className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                    onChange={handleDateChange}
                    value={formData.singleDate}
                  />
                </div>
              )}
              {formData.filterType === "weekly" && (
                <div className="flex flex-row items-center space-x-2 w-full lg:w-auto">
                  <label className="text-gray-700 font-medium text-sm">Week: </label>
                  <input
                    type="week"
                    name="singleDate"
                    className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                    onChange={handleDateChange}
                    value={formData.singleDate}
                  />
                </div>
              )}
              {formData.filterType === "monthly" && (
                <div className="flex flex-row items-center space-x-2 w-full lg:w-auto">
                  <label className="text-gray-700 font-medium text-sm">Month: </label>
                  <input
                    type="month"
                    name="singleDate"
                    className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                    onChange={handleDateChange}
                    value={formData.singleDate}
                  />
                </div>
              )}
              {formData.filterType === "yearly" && (
                <div className="flex flex-row items-center space-x-2 w-auto">
                  <label className="text-gray-700 font-medium text-sm">Year: </label>
                  <input
                    type="number"
                    min="1900"
                    max="2100"
                    name="singleDate"
                    className="px-4 py-2 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent w-30"
                    onChange={handleDateChange}
                    value={formData.singleDate}
                    placeholder="Enter year"
                  />
                </div>
              )}
            </div>

            {formData.filterType === "custom" && (
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex flex-row items-center space-x-2 w-auto">
                  <label className="text-gray-700 font-medium text-sm">Start Date: </label>
                  <input
                    type="date"
                    name="startDate"
                    className="px-4 py-2 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                    onChange={(e) => setFormField("startDate", e.target.value)}
                    value={formData.startDate}
                  />
                </div>

                <div className="flex flex-row items-center space-x-2 w-auto">
                  <label className="text-gray-700 font-medium text-sm">End Date: </label>
                  <input
                    type="date"
                    name="endDate"
                    className="px-4 py-2 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                    onChange={(e) => setFormField("endDate", e.target.value)}
                    value={formData.endDate}
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

      <div className="relative flex gap-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"></Search>
        <input
          type="text"
          name="search"
          className="pl-10 pr-4 py-2 w-full max-w-xl border border-gray-300 rounded-md flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
          placeholder="Search customers by name, email or phone"
        />
        <button
          className="btn-primary rounded-md h-10 flex items-center justify-center text-sm shrink-0"
          onClick={submitSearch}
        >
          Search
        </button>
        <button
          className="flex rounded-md h-10 shrink-0 justify-center text-sm items-center gap-2 px-4 border border-brand-end hover:bg-brand-end hover:text-white transition text-brand-end active:bg-brand-end active:text-white disabled:opacity-50"
          onClick={handleExport}
          disabled={isExporting}
          type="button"
        >
          <Download className="h-4 w-4" />
          <span className="hidden md:flex">{isExporting ? "Exporting..." : "Export CSV"}</span>
        </button>
      </div>

      {exportError && <p className="text-red-500 text-sm">{exportError}</p>}
    </div>
  );
}
