import { useState, useEffect, createContext, useContext } from "react";
import { RepFilter, RepFiltercontext } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useAdminAuth } from "@/hooks/authContext";

export const repFilterContext = createContext<RepFiltercontext | null>(null);

export default function RepsContextProvider({
  children,
  showFilter,
}: {
  children: React.ReactNode;
  showFilter: boolean;
}) {
    const {user} = useAdminAuth();
  const savedFilter = sessionStorage.getItem("repFilters");
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const debouncedValue = useDebounce(debouncedSearch, 500);

  const [formData, setFormData] = useState<RepFilter>(() => {
    if (savedFilter) return JSON.parse(savedFilter);
    return {
      limit: 10,
      page: 1,
      role: "",
      status: "",
    };
  });

  const [appliedFormData, setAppliedFormData] = useState<RepFilter>({
    limit: formData.limit,
    page: formData.page,
    role: formData.role,
    status: formData.status,
  });

  const handleOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();

    queryClient.cancelQueries({
      queryKey: [
        "reps",
        { ...appliedFormData, search: debouncedValue },
        debouncedValue.toLowerCase(),
      ],
    });

    // new
    setAppliedFormData((prev) => ({
      ...prev,
      ...formData,
    }));
  };

  useEffect(() => {
    sessionStorage.setItem("repFilters", JSON.stringify({...appliedFormData, page: 1}));
  }, [appliedFormData]);

  useEffect(() => {
    if (!showFilter)
      setAppliedFormData((prev) => ({ ...prev, role: "", status: "" }));
  }, [showFilter]);

  useEffect(() => {
    if (searchTerm === "") {
      const timeout = setTimeout(() => {
        setDebouncedSearch(searchTerm);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [searchTerm]);

  return (
    <repFilterContext.Provider
      value={{
        ...appliedFormData,
        search: debouncedValue,
        setPage: (page: number) =>
          setAppliedFormData((prev) => ({ ...prev, page: page })),
      }}
    >
      <div className="">
        <div className="space-y-8">
          {showFilter && (
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
                    {/* role */}
                   {user?.role === "superadmin" && <div className="flex flex-row items-center space-x-2 w-auto">
                      <label className="text-gray-700 font-medium text-sm">
                        Role:{" "}
                      </label>
                      <select
                        name="role"
                        className="px-4 border border-gray-300 rounded-sm h-6 flex items-center justify-center text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
                        onChange={handleOnChange}
                        value={formData.role}
                        required
                      >
                        <option value="">All</option>
                        {["superadmin", "salesrep", "callrep"].map((option) => {
                          return (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          );
                        })}
                      </select>
                    </div>}
                    {/* status */}
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
                        {["active", "inactive", "blocked"].map((option) => {
                          return (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  {/* apply button */}
                  <div className="w-full lg:w-auto">
                    <button
                      className="btn-primary rounded-sm h-8 flex items-center justify-center text-sm "
                      onClick={handleApplyFilter}
                    >
                      Apply
                    </button>
                  </div>
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

          <div>{children}</div>
        </div>
      </div>
    </repFilterContext.Provider>
  );
}

export const useRepFilter = () => {
  const context = useContext(repFilterContext);
  if (context === null) {
    throw new Error("useRepFilter must be used within a RepFilterProvider");
  }
  return context;
};
