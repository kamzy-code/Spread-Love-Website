"use client";

import { useState, useContext, createContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AdminAuthContextType, AuthStatus, AdminUser } from "@/lib/types";


const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const AdminAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<null | string>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const publicRoutes = ["/admin",];

  const router = useRouter();
  const queryClient = useQueryClient();

  const fetchUser = async (isMounted = true) => {
    let retries = 2;

    while (retries >= 0) {
      try {
        const res = await fetch(`${apiUrl}/auth/me`, {
          credentials: "include",
        });

        if (res.status === 401) {
          if (isMounted) {
            setUser(null);
            setAuthStatus("unauthenticated");
            setAuthError(null);
          }
          break;
        }
        if (!res.ok) {
          throw new Error("Server error");
        }
        const data = await res.json();
        if (isMounted) {
          setUser(data.user);
          setAuthStatus("authenticated");
          setAuthError(null);
          break;
        }
      } catch (err: any) {
        if (retries === 0) {
          setAuthError(err.message || "Network error");
          setAuthStatus("error");
        }
      }
      retries--;
    }
    if (isMounted) setLoading(false);
  };

  useEffect(() => {
  let isMounted = true;
  const path = window.location.pathname;

  if (!publicRoutes.includes(path)) {
    fetchUser(isMounted);
  } else {
    setLoading(false);
    setAuthStatus("unauthenticated");
  }

  return () => {
    isMounted = false;
  };
}, []);


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
        console.error(jsonErr)
        // silently ignore, fallback to default error message
      }
      throw new Error(errorMessage);
    }

    await fetchUser(); // no need to pass isMounted here
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
        console.error(jsonErr)
        // silently ignore, fallback to default error message
      }
      throw new Error(errorMessage);
    }

    setUser(null);
    queryClient.clear();
    router.push("/admin");
    sessionStorage.removeItem("bookingFilters")
    sessionStorage.removeItem("dashboardFilters")
  };

  const reload = async () => {
    setAuthStatus("checking");
    setLoading(true);
    await fetchUser();
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: authStatus === "authenticated",
        loading,
        login,
        logout,
        authError,
        authStatus,
        reload,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
