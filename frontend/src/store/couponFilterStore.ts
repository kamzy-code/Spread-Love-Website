import { create } from "zustand";
import { QueryClient } from "@tanstack/react-query";
import { CouponFilter } from "@/lib/types";

const FORM_STORAGE_KEY = "couponFilters";

function defaultFormData(): CouponFilter {
  return {
    limit: 10,
    page: 1,
    discountType: "",
    status: "",
  };
}

function readJSON<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key, JSON.stringify(value));
}

const savedFormData = readJSON<CouponFilter>(FORM_STORAGE_KEY);
const initialFormData: CouponFilter = savedFormData ?? defaultFormData();

interface CouponFilterState {
  formData: CouponFilter;
  appliedFormData: CouponFilter;
  searchTerm: string;
  debouncedValue: string;

  setFormField: (name: string, value: string) => void;
  setSearchTerm: (term: string) => void;
  submitSearch: () => void;
  applyFilter: (queryClient: QueryClient) => void;
  setPage: (page: number) => void;
}

let clearSearchTimer: ReturnType<typeof setTimeout> | null = null;
let applySearchTimer: ReturnType<typeof setTimeout> | null = null;

export const useCouponFilterStore = create<CouponFilterState>((set, get) => ({
  formData: initialFormData,
  appliedFormData: {
    limit: initialFormData.limit,
    page: initialFormData.page,
    discountType: initialFormData.discountType,
    status: initialFormData.status,
  },
  searchTerm: "",
  debouncedValue: "",

  setFormField: (name, value) => {
    set((state) => ({ formData: { ...state.formData, [name]: value } }));
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
        return { debouncedValue: term, appliedFormData: { ...state.appliedFormData, page: 1 } };
      });
    }, 500);
  },

  applyFilter: (queryClient) => {
    const state = get();
    queryClient.cancelQueries({
      queryKey: ["coupons", { ...state.appliedFormData, search: state.debouncedValue }],
    });

    set((state) => {
      const appliedFormData = { ...state.appliedFormData, ...state.formData, page: 1 };
      writeJSON(FORM_STORAGE_KEY, appliedFormData);
      return { appliedFormData };
    });
  },

  setPage: (page) => {
    set((state) => {
      const appliedFormData = { ...state.appliedFormData, page };
      writeJSON(FORM_STORAGE_KEY, appliedFormData);
      return { appliedFormData };
    });
  },
}));
