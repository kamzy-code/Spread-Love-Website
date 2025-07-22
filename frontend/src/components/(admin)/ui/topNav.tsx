"use client";

import {
  BarChart3,
  Users,
  Calendar,
  User,
  LogOut,
  Book,
  Bell,
  Menu,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/authContext";
import { useRouter } from "next/navigation";
import LogoutErrorModal from "./logoutErrorModal";

const links = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: <BarChart3 className="h-5 w-5 mr-3" />,
  },
  {
    label: "Bookings",
    href: "/admin/bookings",
    icon: <Calendar className="h-5 w-5 mr-3" />,
  },
  {
    label: "Reps",
    href: "/admin/reps",
    icon: <Users className="h-5 w-5 mr-3" />,
  },
  {
    label: "Profile",
    href: "/admin/profile",
    icon: <User className="h-5 w-5 mr-3" />,
  },
  {
    label: "Logs",
    href: "/admin/logs",
    icon: <Book className="h-5 w-5 mr-3" />,
  },
  {
    label: "Logout",
    href: "/admin",
    icon: <LogOut className="h-5 w-5 mr-3" />,
  },
];

export default function TopNav() {
  const [showMobileNav, setShowMobileNav] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: () => logout(),
    retry: 3,
    onError: (error) => {
      setShowErrorModal(true);
    },
  });
  return (
    <>
      <nav className="w-full h-16 border-b bg-white/95 fixed top-0 z-50 py-3 px-6">
        <div className="container-max section-padding">
          <div className="flex flex-row justify-between">
            <div>
              {/* Logo */}
              <Link href="/admin" className="flex flex-row items-center gap-2">
                <Image
                  width={36}
                  height={36}
                  src="/logo.png"
                  alt="Logo"
                  className="h-[36px] w-[36px] "
                />
                <span className=" hidden md:flex font-handwritten font-bold text-md md:text-xl gradient-text">
                  Spread Love Network
                </span>
              </Link>
            </div>

            <div className="flex flex-row gap-4 items-center">
              <Link href={""}>
                <Bell className="h-5 w-5 text-gray-700" />
              </Link>

              <Link href={"/admin/profile"}>
                <div className="flex flex-row gap-2 items-center">
                  <div className="p-2 rounded-full gradient-background">
                    {" "}
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <p className="flex gradient-text font-medium">
                    {user?.firstName}{" "}
                  </p>
                </div>
              </Link>

              <button
                onClick={() => setShowMobileNav(!showMobileNav)}
                className=" md:hidden"
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {showMobileNav && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden mt-16 h-screen w-64 py-4 border-t border-gray-200 bg-white fixed top-0 z-50 px-6 shadow-sm "
        >
          {links.map((item) => {
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (item.href === "/admin") {
                    mutation.mutate();
                    setShowMobileNav(false);
                    return;
                  }
                  router.push(item.href);
                  setShowMobileNav(false);
                }}
                className={`flex w-full items-center gap-3 py-2 px-3 rounded-lg text-sm font-medium ${
                  pathname === item.href ||
                  (pathname.includes(item.href) && item.href !== "/admin")
                    ? "gradient-background text-white"
                    : "text-gray-700 hover:bg-gray-100"
                } ${
                  item.label === "Reps" && user?.role === "callrep"
                    ? "hidden"
                    : ""
                }`}
              >
                {item.icon} {item.label}
              </button>
            );
          })}
        </motion.div>
      )}

      {showErrorModal && (
        <LogoutErrorModal
          setShowModal={() => setShowErrorModal(false)}
        ></LogoutErrorModal>
      )}
    </>
  );
}
