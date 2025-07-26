"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { User, Lock, EyeOff, Eye, TriangleAlert } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/authContext";

export default function LoginForm() {
  const { login, loading, user } = useAdminAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const mutation = useMutation({
    mutationFn: (formBody: {
      email: string;
      password: string;
      rememberMe: boolean;
    }) => login(formBody),

    retry: 3,

    onError: (error) => {
      if (error.message.includes("Email")) {
        console.error("invalid Email:", error);
        setErrorMessage("email");
      } else if (error.message.includes("password")) {
        console.error("Invalid Password:", error);
        setErrorMessage("password");
      } else {
        console.error("Login failed:", error);
        setErrorMessage("generic");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ ...formData, rememberMe });
  };

  useEffect(() => {
    if (!loading && user) {
      router.replace("/admin/dashboard");
    }
  }, [user, loading]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return (
    <div className="min-h-screen w-full flex justify-center py-20 gradient-background">
      <div className="flex items-center px-5 z-15">
        <div className="card p-8  md:w-120 flex flex-col items-center justify-center">
          {/* Logo */}
          <Link
            href="/admin"
            className="flex flex-col md:flex-row items-center gap-2"
          >
            <Image width={48} height={48} src="/logo.png" alt="Logo" />
            <span className="font-handwritten font-bold text-xl gradient-text">
              Spread Love Network
            </span>
          </Link>

          <div className="text-center py-2 mt-4">
            <h2 className="text-xl md:text-2xl font-bold">Admin Portal</h2>
            <p className="text-sm md:text-[1rem] text-gray-700">
              Sign in to manage bookings and operations
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className={`space-y-3 text-brand-start w-full py-4`}
          >
            <div className="flex flex-col space-y-2">
              <label className="text-gray-700 font-medium">
                Email Address:
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  className={`pl-10 pr-12 py-3 border ${
                    errorMessage === "email"
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400`}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleOnChange}
                  required
                  placeholder="admin@spreadlove.com"
                />
              </div>
              {errorMessage === "email" && (
                <span className="text-red-500 text-xs">
                  Invalid email address
                </span>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-gray-700 font-medium">Password:</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  className={`pl-10 pr-12 py-3 border ${
                    errorMessage === "password"
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 disabled:border-0 disabled:pl-0`}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleOnChange}
                  required
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errorMessage === "password" && (
                <span className="text-red-500 text-xs">Incorrect password</span>
              )}
            </div>

            <div className="py-2">
              <label className="flex flex-row items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-brand-end focus:ring-brand-end"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>

              {/* <Link
                href={"/admin"}
                className="text-brand-end text-sm font-medium hover:text-brand-start"
              >
                {" "}
                Forgot Password?
              </Link> */}
            </div>

            {errorMessage === "generic" && (
              <p className="text-red-500 text-sm mt-2 text-center flex items-center justify-center font-medium">
                <TriangleAlert className="h-5 w-5 mr-2 text-red-500" />
                {mutation.error?.message? mutation.error.message : "Error signing in, please try again."}
              </p>
            )}

            <button
              type="submit"
              disabled={
                mutation.isPending || !formData.email || !formData.password
              }
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
