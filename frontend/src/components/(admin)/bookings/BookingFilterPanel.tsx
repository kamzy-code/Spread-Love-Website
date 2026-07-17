"use client";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { STATUS_LIST, BOOKING_STATUS_LIST } from "../dashboard/analytics";
import { services } from "@/components/services/serviceList";
import { useFetchReps } from "@/hooks/useReps";
import { Rep } from "@/lib/types";
import { useBookingFilterStore, ActiveFilters } from "@/store/bookingFilterStore";

const filterTypeOptions = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
  { key: "custom", label: "Custom" },
];

export default function BookingFilterPanel({
  activeFilters,
}: {
  activeFilters: ActiveFilters;
}) {
  const filterType = useBookingFilterStore((s) => s.filterType);
  const formData = useBookingFilterStore((s) => s.formData);
  const searchTerm = useBookingFilterStore((s) => s.searchTerm);
  const setFilterType = useBookingFilterStore((s) => s.setFilterType);
  const setFormField = useBookingFilterStore((s) => s.setFormField);
  const setSearchTerm = useBookingFilterStore((s) => s.setSearchTerm);
  const submitSearch = useBookingFilterStore((s) => s.submitSearch);
  const applyFilter = useBookingFilterStore((s) => s.applyFilter);

  const { data } = useFetchReps({ limit: 100, page: 1, role: "callrep" }, "callreps");
  const reps: Rep[] = data?.data || [];

  const handleOnChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setFormField(name, value);
  };

  const handleFilterTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value as typeof filterType);
  };

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilter();
  };

  return (
    <div>
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
                    <label className="text-gray-700 font-medium text-sm">Filter: </label>
                    <select
                      name="filterType"
                      className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                      onChange={handleFilterTypeChange}
                      value={filterType}
                      required
                    >
                      {filterTypeOptions.map((option) => (
                        <option key={option.key} value={option.key}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {filterType === "daily" && (
                    <div className="flex flex-row items-center space-x-2 w-auto">
                      <label className="text-gray-700 font-medium text-sm">Date: </label>
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
                      <label className="text-gray-700 font-medium text-sm">Week: </label>
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
                      <label className="text-gray-700 font-medium text-sm">Month: </label>
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
                      <label className="text-gray-700 font-medium text-sm">Year: </label>
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
                      <label className="text-gray-700 font-medium text-sm">Start Date: </label>
                      <input
                        type="date"
                        name="startDate"
                        className="px-4 py-2 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm  focus:ring-2 focus:ring-brand-end focus:border-transparent"
                        onChange={handleOnChange}
                        value={formData.startDate}
                      />
                    </div>

                    <div className="flex flex-row items-center space-x-2 w-auto">
                      <label className="text-gray-700 font-medium text-sm">End Date: </label>
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

                <div className="flex flex-row items-center space-x-2 w-auto">
                  <label className="text-gray-700 font-medium text-sm">Fetch By: </label>
                  <select
                    name="fetchParam"
                    className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                    onChange={handleOnChange}
                    value={formData.fetchParam}
                    required
                  >
                    <option value={"callDate"}>Call Date</option>
                    <option value={"bookingDate"}>Booking Date</option>
                  </select>
                </div>
              </div>

              {Object.entries(activeFilters).some(([key, value]) => key !== "date" && value) && (
                <div className="flex flex-row flex-wrap gap-4">
                  {activeFilters.assignedRep && (
                    <div className="flex flex-row items-center space-x-2 w-auto">
                      <label className="text-gray-700 font-medium text-sm">Assigned Rep: </label>
                      <select
                        name="assignedRep"
                        className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                        onChange={handleOnChange}
                        value={formData.assignedRep}
                        required
                      >
                        <option value="">All</option>
                        {reps.map((rep) => (
                          <option key={rep._id} value={rep._id}>{`${rep.firstName} ${rep.lastName}`}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {activeFilters.callType && (
                    <div className="flex flex-row items-center space-x-2 w-auto">
                      <label className="text-gray-700 font-medium text-sm">Call Type: </label>
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
                      <label className="text-gray-700 font-medium text-sm">Status: </label>
                      <select
                        name="status"
                        className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                        onChange={handleOnChange}
                        value={formData.status}
                        required
                      >
                        <option value="">All</option>
                        {STATUS_LIST.map((status) => (
                          <option key={status.key} value={status.key}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {activeFilters.bookingStatus && (
                    <div className="flex flex-row items-center space-x-2 w-auto">
                      <label className="text-gray-700 font-medium text-sm">Booking Status: </label>
                      <select
                        name="bookingStatus"
                        className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                        onChange={handleOnChange}
                        value={formData.bookingStatus}
                        required
                      >
                        <option value="">All</option>
                        {BOOKING_STATUS_LIST.map((status) => (
                          <option key={status.key} value={status.key}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {activeFilters.country && (
                    <div className="flex flex-row items-center space-x-2 w-auto">
                      <label className="text-gray-700 font-medium text-sm">Country: </label>
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
                      <label className="text-gray-700 font-medium text-sm">Occassion: </label>
                      <select
                        name="occassion"
                        className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                        onChange={handleOnChange}
                        value={formData.occassion}
                        required
                      >
                        <option value="">All</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.title}>
                            {service.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {activeFilters.paymentStatus && (
                    <div className="flex flex-row items-center space-x-2 w-auto">
                      <label className="text-gray-700 font-medium text-sm">Payment Status:</label>
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
                      <label className="text-gray-700 font-medium text-sm">Confirmation Mail: </label>
                      <select
                        name="confirmationMailsent"
                        className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormField(
                            "confirmationMailsent",
                            value === "" ? undefined : value === "true",
                          );
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
            onClick={() => submitSearch()}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
