"use client";

import { useState, useContext, createContext, useEffect } from "react";
import { useRouter } from "next/navigation";

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

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (body: { email: string; password: string, rememberMe: boolean }) => Promise<void>;
  logout: () => Promise<void>;
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
  const router = useRouter();

  const fetchUser = async (isMounted = true) => {
    try {
      const res = await fetch(`${apiUrl}/auth/me`, { credentials: "include" });
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      if (isMounted) setUser(data.user);
    } catch (err) {
      if (isMounted) setUser(null);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchUser(isMounted);
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (body: { email: string; password: string, rememberMe: boolean }) => {
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
    router.push("/admin");
  };

  return (
    <AdminAuthContext.Provider
      value={{ user, isAuthenticated: !!user, loading, login, logout }}
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
