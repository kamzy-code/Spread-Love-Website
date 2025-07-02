"use client";

import { useState, useContext, createContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

type AdminUser = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  status: string;
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
};

type AuthStatus =
  | "idle"
  | "checking"
  | "authenticated"
  | "unauthenticated"
  | "error";

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (body: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  authStatus: AuthStatus;
   reload: () => Promise<void>;
}

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
    fetchUser(isMounted);
    console.log("fetch ran!!!");
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
        // silently ignore, fallback to default error message
      }
      throw new Error(errorMessage);
    }

    setUser(null);
    queryClient.clear();
    router.push("/admin");
  };

  const reload = async () => {
    setAuthStatus("checking");
    setLoading(true);
    await fetchUser();
    console.log("fetch reload ran!!!");
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
