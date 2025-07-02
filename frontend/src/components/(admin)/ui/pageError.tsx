import AdminShell from "./AdminShell";
import { TriangleAlert } from "lucide-react";
import { useAdminAuth } from "@/hooks/authContext";

export default function PageError() {
  const {reload} = useAdminAuth();
  return (
    <AdminShell>
      <div className="flex flex-col justify-center items-center h-full w-full gap-4">
        <TriangleAlert className="h-8 w-8 text-gray-500" />
        <p className="text-gray-700">Error Loading Page. Try again</p>
        <button
          className="btn-primary rounded-lg"
          onClick={() => reload()}
        >
          {" "}
          Reload{" "}
        </button>
      </div>
    </AdminShell>
  );
}
