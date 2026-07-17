import { create } from "zustand";
import { BookingFilters, FilterType } from "@/lib/types";
import {
  getDefaultDate,
  getDefaultMonth,
  getDefaultWeek,
  getDefaultYear,
} from "@/lib/formatDate";

const FORM_STORAGE_KEY = "bookingFilters";
const PANEL_STORAGE_KEY = "activeBookingFilters";

export interface ActiveFilters {
  [key: string]: boolean;
}

export interface SortOptions {
  sortParam: string;
  sortOrder: "1" | "-1";
}

const defaultActiveFilters: ActiveFilters = {
  date: true,
  assignedRep: false,
  callType: false,
  status: false,
  bookingStatus: false,
  occasion: false,
  country: false,
  confirmationMailsent: false,
  paymentStatus: false,
};

const defaultSortOptions: SortOptions = {
  sortParam: "createdAt",
  sortOrder: "1",
};

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

function defaultFormData(filterType: FilterType): BookingFilters {
  return {
    singleDate: singleDateForFilterType(filterType),
    startDate: "",
    endDate: "",
    fetchParam: "callDate",
    status: "",
    bookingStatus: "",
    callType: "",
    occassion: "",
    assignedRep: "",
    country: "",
    confirmationMailsent: undefined,
    paymentStatus: "",
    page: 1,
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

const savedFormData = readJSON<BookingFilters>(FORM_STORAGE_KEY);
const savedPanel = readJSON<{
  activeFilters: ActiveFilters;
  sortOptions: SortOptions;
}>(PANEL_STORAGE_KEY);

const initialFilterType: FilterType = savedFormData?.filterType ?? "daily";
const initialFormData: BookingFilters = savedFormData ?? defaultFormData(initialFilterType);

interface BookingFilterState {
  filterType: FilterType;
  formData: BookingFilters;
  appliedFormData: BookingFilters;
  searchTerm: string;
  debouncedValue: string;
  activeFilters: ActiveFilters;
  sortOptions: SortOptions;

  setFilterType: (type: FilterType) => void;
  setFormField: (name: string, value: unknown) => void;
  setSearchTerm: (term: string) => void;
  submitSearch: () => void;
  applyFilter: () => void;
  setPage: (page: number) => void;
  toggleActiveFilter: (key: string) => void;
  setSortOptions: (options: SortOptions) => void;
  syncFromUrl: (params: { status?: string; bookingStatus?: string }) => void;
}

let clearSearchTimer: ReturnType<typeof setTimeout> | null = null;
let applySearchTimer: ReturnType<typeof setTimeout> | null = null;

export const useBookingFilterStore = create<BookingFilterState>((set, get) => ({
  filterType: initialFilterType,
  formData: initialFormData,
  appliedFormData: {
    ...initialFormData,
    filterType: initialFilterType,
    sortParam: savedPanel?.sortOptions.sortParam ?? defaultSortOptions.sortParam,
    sortOrder: savedPanel?.sortOptions.sortOrder ?? defaultSortOptions.sortOrder,
    limit: 10,
  },
  searchTerm: "",
  debouncedValue: "",
  activeFilters: savedPanel?.activeFilters ?? defaultActiveFilters,
  sortOptions: savedPanel?.sortOptions ?? defaultSortOptions,

  setFilterType: (type) => {
    set((state) => {
      const singleDate = singleDateForFilterType(type);
      const formData: BookingFilters = {
        ...state.formData,
        singleDate,
        startDate: type === "custom" ? getDefaultDate() : "",
        endDate: type === "custom" ? getDefaultDate() : "",
      };
      return { filterType: type, formData };
    });
  },

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
        return {
          debouncedValue: term,
          appliedFormData: { ...state.appliedFormData, page: 1 },
        };
      });
    }, 500);
  },

  applyFilter: () => {
    set((state) => {
      const appliedFormData: BookingFilters = {
        ...state.appliedFormData,
        ...state.formData,
        filterType: state.filterType,
        page: 1,
      };
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

  toggleActiveFilter: (key) => {
    if (key === "date") return;
    set((state) => {
      const activeFilters = { ...state.activeFilters, [key]: !state.activeFilters[key] };
      writeJSON(PANEL_STORAGE_KEY, { activeFilters, sortOptions: state.sortOptions });

      const clearIfDisabled = (filters: BookingFilters): BookingFilters => {
        const updated = { ...filters };
        if (!activeFilters.assignedRep) updated.assignedRep = "";
        if (!activeFilters.callType) updated.callType = "";
        if (!activeFilters.status) updated.status = "";
        if (!activeFilters.bookingStatus) updated.bookingStatus = "";
        if (!activeFilters.occasion) updated.occassion = "";
        if (!activeFilters.country) updated.country = "";
        if (!activeFilters.confirmationMailsent) updated.confirmationMailsent = undefined;
        if (!activeFilters.paymentStatus) updated.paymentStatus = "";
        return updated;
      };

      const formData = clearIfDisabled(state.formData);
      const appliedFormData = clearIfDisabled(state.appliedFormData);
      writeJSON(FORM_STORAGE_KEY, appliedFormData);

      return { activeFilters, formData, appliedFormData };
    });
  },

  setSortOptions: (options) => {
    set((state) => {
      writeJSON(PANEL_STORAGE_KEY, { activeFilters: state.activeFilters, sortOptions: options });
      const appliedFormData = {
        ...state.appliedFormData,
        sortParam: options.sortParam,
        sortOrder: options.sortOrder,
      };
      writeJSON(FORM_STORAGE_KEY, appliedFormData);
      return { sortOptions: options, appliedFormData };
    });
  },

  // Called when the bookings page reads ?status=/?bookingStatus= from the URL
  // (e.g. an analytics-card deep link). Compares against the live store, not a
  // sessionStorage snapshot re-parsed on every mount, so navigating back to
  // this page without the query actually changing never resets pagination.
  syncFromUrl: ({ status, bookingStatus }) => {
    set((state) => {
      const statusChanged = status !== undefined && status !== state.appliedFormData.status;
      const bookingStatusChanged =
        bookingStatus !== undefined && bookingStatus !== state.appliedFormData.bookingStatus;

      if (!statusChanged && !bookingStatusChanged) return state;

      const overrides = {
        ...(statusChanged && { status }),
        ...(bookingStatusChanged && { bookingStatus }),
        page: 1,
      };
      const formData = { ...state.formData, ...overrides };
      const appliedFormData = { ...state.appliedFormData, ...overrides };
      writeJSON(FORM_STORAGE_KEY, appliedFormData);
      return { formData, appliedFormData };
    });
  },
}));
