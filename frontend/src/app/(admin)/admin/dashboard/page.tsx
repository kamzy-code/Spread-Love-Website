import Dashboard from "@/components/(admin)/dashboard/dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function AdminDashboard() {
  return (
    <div>
      <Dashboard></Dashboard>
    </div>
  );
}
