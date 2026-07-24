"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AdminAuthHook } from "@/lib/types";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { apiCall } from "@/lib/apiClient";

export function AdminAuthInit() {
  useEffect(() => {
    useAdminAuthStore.getState().init();
  }, []);
  return null;
}

export const useAdminAuth = (): AdminAuthHook => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const user = useAdminAuthStore((s) => s.user);
  const loading = useAdminAuthStore((s) => s.loading);
  const authError = useAdminAuthStore((s) => s.authError);
  const authStatus = useAdminAuthStore((s) => s.authStatus);
  const fetchUser = useAdminAuthStore((s) => s.fetchUser);
  const reload = useAdminAuthStore((s) => s.reload);
  const setLoggedOut = useAdminAuthStore((s) => s.setLoggedOut);

  const login = async (body: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => {
    await apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });

    await fetchUser();
    router.push("/admin/dashboard");
  };

  const logout = async () => {
    await apiCall("/auth/logout", { method: "POST" });

    setLoggedOut();
    queryClient.clear();
    router.push("/admin");
    sessionStorage.removeItem("bookingFilters");
    sessionStorage.removeItem("activeBookingFilters");
    sessionStorage.removeItem("dashboardFilters");
    sessionStorage.removeItem("callrepFilters");
    sessionStorage.removeItem("repFilters");
  };

  return {
    user,
    isAuthenticated: authStatus === "authenticated",
    loading,
    login,
    logout,
    authError,
    authStatus,
    reload,
  };
};
