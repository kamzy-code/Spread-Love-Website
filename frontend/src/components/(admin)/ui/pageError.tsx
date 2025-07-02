import AdminShell from "./AdminShell";
import { TriangleAlert } from "lucide-react";

export default function PageError() {
  return (
    <AdminShell>
      <div className="flex flex-col justify-center items-center h-full w-full gap-4">
        <TriangleAlert className="h-8 w-8 text-gray-500" />
        <p className="text-gray-700">Error Loading Page. Try again</p>
        <button
          className="btn-primary rounded-lg"
          onClick={() => window.location.reload()}
        >
          {" "}
          Reload{" "}
        </button>
      </div>
    </AdminShell>
  );
}
