import AdminShell from "./AdminShell";

export default function PageLoading() {
  return (
    <AdminShell>
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-end"></div>
      </div>
    </AdminShell>
  );
}
