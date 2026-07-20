"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AdminAuthHook } from "@/lib/types";
import { useAdminAuthStore } from "@/store/adminAuthStore";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

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
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errorMessage = "Login failed";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (jsonErr) {
        console.error(jsonErr);
        // silently ignore, fallback to default error message
      }
      throw new Error(errorMessage);
    }

    await fetchUser();
    router.push("/admin/dashboard");
  };

  const logout = async () => {
    const response = await fetch(`${apiUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      let errorMessage = "Logout failed";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (jsonErr) {
        console.error(jsonErr);
        // silently ignore, fallback to default error message
      }
      throw new Error(errorMessage);
    }

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
