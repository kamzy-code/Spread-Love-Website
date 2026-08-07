"use client";
import { useEffect } from "react";
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

  // A render-time crash could be anything, including framework internals —
  // there's no "curated backend message" to trust here the way there is
  // for apiCall rejections, so never show error.message to the user. Log
  // it for debugging instead.
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
      <button
        onClick={()=> reload()}
        className="btn-primary h-12"
      >
        Try Again
      </button>
    </div>
  );
}
