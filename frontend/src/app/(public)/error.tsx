"use client";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { TriangleAlert } from "lucide-react";
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();
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
        {error.message ? error.message : "Error Loading Page"}
      </h1>
      <button
        onClick={()=> reload()}
        className="btn-primary h-12"
      >
        Try Again
      </button>
    </div>
  );
}
