"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { TriangleAlert } from "lucide-react";

// Deliberately not wrapped in AdminShell: AdminShell renders TopNav/SideNav,
// both of which call useAdminAuth() — if that's what crashed, wrapping the
// boundary in the same shell risks a second crash instead of recovering.
export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const reload = () => {
    startTransition(() => {
      router.refresh();
      reset();
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col gap-4 items-center justify-center">
      <TriangleAlert className="text-red-600 h-12 w-12"></TriangleAlert>
      <h1 className="md:text-lg text-center text-red-600">
        Something went wrong loading this page.
      </h1>
      <button onClick={() => reload()} className="btn-primary h-12">
        Try Again
      </button>
    </div>
  );
}
