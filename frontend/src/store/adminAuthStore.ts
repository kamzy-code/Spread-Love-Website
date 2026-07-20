import { create } from "zustand";
import { AdminUser, AuthStatus } from "@/lib/types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const publicRoutes = ["/admin"];

interface AdminAuthState {
  user: AdminUser | null;
  loading: boolean;
  authError: string | null;
  authStatus: AuthStatus;
  hasInitialized: boolean;

  fetchUser: () => Promise<void>;
  init: () => void;
  reload: () => Promise<void>;
  setLoggedOut: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set, get) => ({
  user: null,
  loading: true,
  authError: null,
  authStatus: "checking",
  hasInitialized: false,

  fetchUser: async () => {
    let retries = 2;

    while (retries >= 0) {
      try {
        const res = await fetch(`${apiUrl}/auth/me`, {
          credentials: "include",
        });

        if (res.status === 401) {
          set({ user: null, authStatus: "unauthenticated", authError: null });
          break;
        }
        if (!res.ok) {
          throw new Error("Server error");
        }
        const data = await res.json();
        set({ user: data.user, authStatus: "authenticated", authError: null });
        break;
      } catch (err) {
        if (retries === 0) {
          const message = err instanceof Error ? err.message : "Network error";
          set({ authError: message, authStatus: "error" });
        }
      }
      retries--;
    }
    set({ loading: false });
  },

  init: () => {
    if (get().hasInitialized) return;
    set({ hasInitialized: true });

    const path = window.location.pathname;
    if (!publicRoutes.includes(path)) {
      get().fetchUser();
    } else {
      set({ loading: false, authStatus: "unauthenticated" });
    }
  },

  reload: async () => {
    set({ authStatus: "checking", loading: true });
    await get().fetchUser();
  },

  setLoggedOut: () => {
    set({ user: null, authStatus: "unauthenticated", authError: null });
  },
}));
