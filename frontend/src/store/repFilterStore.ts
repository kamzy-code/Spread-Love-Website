import { create } from "zustand";
import { QueryClient } from "@tanstack/react-query";
import { RepFilter } from "@/lib/types";

const FORM_STORAGE_KEY = "repFilters";

function defaultFormData(): RepFilter {
  return {
    limit: 10,
    page: 1,
    role: "",
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

const savedFormData = readJSON<RepFilter>(FORM_STORAGE_KEY);
const initialFormData: RepFilter = savedFormData ?? defaultFormData();

interface RepFilterState {
  formData: RepFilter;
  appliedFormData: RepFilter;
  searchTerm: string;
  debouncedValue: string;

  setFormField: (name: string, value: string) => void;
  setSearchTerm: (term: string) => void;
  submitSearch: () => void;
  applyFilter: (queryClient: QueryClient) => void;
  setPage: (page: number) => void;
  clearAppliedRoleAndStatus: () => void;
}

let clearSearchTimer: ReturnType<typeof setTimeout> | null = null;
let applySearchTimer: ReturnType<typeof setTimeout> | null = null;

export const useRepFilterStore = create<RepFilterState>((set, get) => ({
  formData: initialFormData,
  appliedFormData: {
    limit: initialFormData.limit,
    page: initialFormData.page,
    role: initialFormData.role,
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
        return { debouncedValue: term };
      });
    }, 500);
  },

  applyFilter: (queryClient) => {
    const state = get();
    queryClient.cancelQueries({
      queryKey: [
        "reps",
        { ...state.appliedFormData, search: state.debouncedValue },
        state.debouncedValue.toLowerCase(),
      ],
    });

    set((state) => {
      const appliedFormData = { ...state.appliedFormData, ...state.formData };
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

  clearAppliedRoleAndStatus: () => {
    set((state) => {
      const appliedFormData = { ...state.appliedFormData, role: "", status: "" };
      writeJSON(FORM_STORAGE_KEY, appliedFormData);
      return { appliedFormData };
    });
  },
}));
