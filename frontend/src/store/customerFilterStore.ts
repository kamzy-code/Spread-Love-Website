import { create } from "zustand";
import { CustomerFilter, FilterType } from "@/lib/types";
import {
  getDefaultDate,
  getDefaultMonth,
  getDefaultWeek,
  getDefaultYear,
} from "@/lib/formatDate";

function singleDateForFilterType(filterType: FilterType) {
  switch (filterType) {
    case "weekly":
      return getDefaultWeek();
    case "monthly":
      return getDefaultMonth();
    case "yearly":
      return getDefaultYear();
    default:
      return getDefaultDate();
  }
}

function defaultFormData(): CustomerFilter {
  return {
    limit: 10,
    page: 1,
    tier: "",
    filterType: "",
    singleDate: "",
    startDate: "",
    endDate: "",
  };
}

interface CustomerFilterState {
  formData: CustomerFilter;
  appliedFormData: CustomerFilter;
  searchTerm: string;
  debouncedValue: string;

  setFormField: (name: string, value: string) => void;
  setFilterType: (type: FilterType | "") => void;
  setSearchTerm: (term: string) => void;
  submitSearch: () => void;
  applyFilter: () => void;
  setPage: (page: number) => void;
}

let clearSearchTimer: ReturnType<typeof setTimeout> | null = null;
let applySearchTimer: ReturnType<typeof setTimeout> | null = null;

export const useCustomerFilterStore = create<CustomerFilterState>((set, get) => ({
  formData: defaultFormData(),
  appliedFormData: defaultFormData(),
  searchTerm: "",
  debouncedValue: "",

  setFormField: (name, value) => {
    set((state) => ({ formData: { ...state.formData, [name]: value } }));
  },

  setFilterType: (type) => {
    if (type === "") {
      set((state) => ({
        formData: { ...state.formData, filterType: "", singleDate: "", startDate: "", endDate: "" },
      }));
      return;
    }
    if (type === "custom") {
      set((state) => ({
        formData: {
          ...state.formData,
          filterType: type,
          singleDate: "",
          startDate: getDefaultDate(),
          endDate: getDefaultDate(),
        },
      }));
      return;
    }
    set((state) => ({
      formData: {
        ...state.formData,
        filterType: type,
        singleDate: singleDateForFilterType(type),
        startDate: "",
        endDate: "",
      },
    }));
  },

  setSearchTerm: (term) => {
    set({ searchTerm: term });
    if (clearSearchTimer) clearTimeout(clearSearchTimer);
    if (term === "") {
      clearSearchTimer = setTimeout(() => {
        get().submitSearch();
      }, 500);
    }
  },

  submitSearch: () => {
    const term = get().searchTerm;
    if (applySearchTimer) clearTimeout(applySearchTimer);
    applySearchTimer = setTimeout(() => {
      set((state) => {
        if (state.debouncedValue === term) return state;
        return {
          debouncedValue: term,
          appliedFormData: { ...state.appliedFormData, page: 1 },
        };
      });
    }, 500);
  },

  applyFilter: () => {
    set((state) => ({
      appliedFormData: { ...state.appliedFormData, ...state.formData, page: 1 },
    }));
  },

  setPage: (page) => {
    set((state) => ({ appliedFormData: { ...state.appliedFormData, page } }));
  },
}));
