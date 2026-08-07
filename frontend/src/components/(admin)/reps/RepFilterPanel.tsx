"use client";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useRepFilterStore } from "@/store/repFilterStore";

export default function RepFilterPanel({ showFilter }: { showFilter: boolean }) {
  const { user } = useAdminAuth();
  const queryClient = useQueryClient();

  const formData = useRepFilterStore((s) => s.formData);
  const searchTerm = useRepFilterStore((s) => s.searchTerm);
  const setFormField = useRepFilterStore((s) => s.setFormField);
  const setSearchTerm = useRepFilterStore((s) => s.setSearchTerm);
  const submitSearch = useRepFilterStore((s) => s.submitSearch);
  const applyFilter = useRepFilterStore((s) => s.applyFilter);
  const clearAppliedRoleAndStatus = useRepFilterStore((s) => s.clearAppliedRoleAndStatus);

  useEffect(() => {
    if (!showFilter) clearAppliedRoleAndStatus();
  }, [showFilter, clearAppliedRoleAndStatus]);

  const handleOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormField(e.target.name, e.target.value);
  };

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilter(queryClient);
  };

  return (
    <div className="space-y-8">
      {showFilter && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ y: -20 }}
          transition={{ delay: 0.2 }}
        >
          <form className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {user?.role === "superadmin" && (
                  <div className="flex flex-row items-center space-x-2 w-auto">
                    <label className="text-gray-700 font-medium text-sm">Role: </label>
                    <select
                      name="role"
                      className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                      onChange={handleOnChange}
                      value={formData.role}
                      required
                    >
                      <option value="">All</option>
                      {["superadmin", "salesrep", "callrep"].map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex flex-row items-center space-x-2 w-auto">
                  <label className="text-gray-700 font-medium text-sm">Status: </label>
                  <select
                    name="status"
                    className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                    onChange={handleOnChange}
                    value={formData.status}
                    required
                  >
                    <option value="">All</option>
                    {["active", "inactive", "blocked"].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="w-full lg:w-auto">
                <button
                  className="btn-primary rounded-sm h-8 flex items-center justify-center text-sm"
                  onClick={handleApplyFilter}
                >
                  Apply
                </button>
              </div>
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
          placeholder="Search Booking"
        />
        <button
          className="btn-primary rounded-md h-10 flex items-center justify-center text-sm"
          onClick={submitSearch}
        >
          Search
        </button>
      </div>
    </div>
  );
}
