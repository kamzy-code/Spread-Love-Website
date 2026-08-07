"use client";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCouponFilterStore } from "@/store/couponFilterStore";

export default function CouponFilterPanel({ showFilter }: { showFilter: boolean }) {
  const queryClient = useQueryClient();

  const formData = useCouponFilterStore((s) => s.formData);
  const searchTerm = useCouponFilterStore((s) => s.searchTerm);
  const setFormField = useCouponFilterStore((s) => s.setFormField);
  const setSearchTerm = useCouponFilterStore((s) => s.setSearchTerm);
  const submitSearch = useCouponFilterStore((s) => s.submitSearch);
  const applyFilter = useCouponFilterStore((s) => s.applyFilter);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormField(e.target.name, e.target.value);
  };

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilter(queryClient);
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
          <form className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-row items-center space-x-2 w-auto">
                  <label className="text-gray-700 font-medium text-sm">Discount Type: </label>
                  <select
                    name="discountType"
                    className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                    onChange={handleSelectChange}
                    value={formData.discountType}
                  >
                    <option value="">All</option>
                    <option value="flat">Flat amount</option>
                    <option value="percent">Percentage</option>
                  </select>
                </div>

                <div className="flex flex-row items-center space-x-2 w-auto">
                  <label className="text-gray-700 font-medium text-sm">Status: </label>
                  <select
                    name="status"
                    className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                    onChange={handleSelectChange}
                    value={formData.status}
                  >
                    <option value="">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="expired">Expired</option>
                    <option value="exhausted">Exhausted</option>
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
          placeholder="Search coupons by code"
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
