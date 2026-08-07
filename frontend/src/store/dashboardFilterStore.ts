import { create, StoreApi, UseBoundStore } from "zustand";
import { FilterType } from "@/lib/types";
import {
  getDefaultDate,
  getDefaultMonth,
  getDefaultWeek,
  getDefaultYear,
} from "@/lib/formatDate";

interface DashboardFilterState {
  filterType: FilterType;
  date: string;
  startDate: string;
  endDate: string;
  fetchParam: string;
  appliedFilterType: FilterType;
  appliedDate: string;
  appliedStartDate: string;
  appliedEndDate: string;
  appliedFetchParam: string;
  repId?: string;

  setFilterType: (type: FilterType) => void;
  setDate: (date: string) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setFetchParam: (param: string) => void;
  applyFilter: () => void;
}

function storageKey(repId?: string) {
  return `${repId ? "callrep" : "dashboard"}Filters`;
}

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

function readSavedFilters(repId?: string) {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(storageKey(repId));
  return raw ? JSON.parse(raw) : null;
}

function createDashboardFilterStore(repId?: string) {
  const saved = readSavedFilters(repId);
  const initialFilterType: FilterType = saved?.appliedFilterType ?? "daily";
  const initialDate: string = saved?.appliedDate ?? singleDateForFilterType(initialFilterType);
  const initialStartDate: string = saved?.appliedStartDate ?? "";
  const initialEndDate: string = saved?.appliedEndDate ?? "";
  const initialFetchParam: string = saved?.appliedFetchParam ?? "callDate";

  return create<DashboardFilterState>((set, get) => ({
    filterType: initialFilterType,
    date: initialDate,
    startDate: initialStartDate,
    endDate: initialEndDate,
    fetchParam: initialFetchParam,
    appliedFilterType: initialFilterType,
    appliedDate: initialDate,
    appliedStartDate: initialStartDate,
    appliedEndDate: initialEndDate,
    appliedFetchParam: initialFetchParam,
    repId,

    setFilterType: (type) => {
      if (type === "custom") {
        set({ filterType: type, date: "", startDate: getDefaultDate(), endDate: getDefaultDate() });
        return;
      }
      set({ filterType: type, date: singleDateForFilterType(type), startDate: "", endDate: "" });
    },
    setDate: (date) => set({ date }),
    setStartDate: (startDate) => set({ startDate }),
    setEndDate: (endDate) => set({ endDate }),
    setFetchParam: (fetchParam) => set({ fetchParam }),

    applyFilter: () => {
      const state = get();
      const applied = {
        appliedFilterType: state.filterType,
        appliedDate: state.date,
        appliedStartDate: state.startDate,
        appliedEndDate: state.endDate,
        appliedFetchParam: state.fetchParam,
      };
      if (typeof window !== "undefined") {
        sessionStorage.setItem(storageKey(repId), JSON.stringify(applied));
      }
      set(applied);
    },
  }));
}

const storeCache = new Map<string, UseBoundStore<StoreApi<DashboardFilterState>>>();

// Dashboard filters are scoped per repId (the main admin dashboard and each
// call rep's own details page track independent applied filters/date ranges,
// mirroring the old per-mount Context provider). Stores are created lazily
// and cached by scope key so repeated renders for the same scope share state
// instead of resetting it.
export function useDashboardFilterStore(repId?: string) {
  const key = repId ?? "__dashboard__";
  let store = storeCache.get(key);
  if (!store) {
    store = createDashboardFilterStore(repId);
    storeCache.set(key, store);
  }
  return store;
}
