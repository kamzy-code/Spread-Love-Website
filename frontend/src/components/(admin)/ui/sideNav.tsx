import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Users,
  Phone,
  Calendar,
  TrendingUp,
  Filter,
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  LogOut,
  Settings,
  Bell,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/authContext";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
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
    label: "Settings",
    href: "/admin/settings",
    icon: <Settings className="h-5 w-5 mr-3" />,
  },
  {
    label: "Logout",
    href: "/admin",
    icon: <LogOut className="h-5 w-5 mr-3" />,
  },
];

export default function SideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, loading } = useAdminAuth();
  const [showErrorModal, setShowErrorModal] = useState(false);

  const mutation = useMutation({
    mutationFn: () => logout(),
    onError: (error) => {
      setShowErrorModal(true);
    },
  });

  return (
    <>
      <aside className="h-screen w-64 fixed top-16 left-0 border-r bg-white shadow-sm hidden md:flex flex-col py-6 px-4">
        {links.map(({ label, href, icon }) => (
          <button
            key={label}
            onClick={() => {
              if (href === "/admin") {
                mutation.mutate();

                return;
              }
              router.push(href);
            }}
            className={`flex items-center gap-3 py-2 px-3 rounded-lg text-sm font-medium ${
              pathname === href
                ? "gradient-background text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </aside>

      {showErrorModal && (
        <LogoutErrorModal
          setShowModal={() => setShowErrorModal(false)}
        ></LogoutErrorModal>
      )}
    </>
  );
}
