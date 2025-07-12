"use client";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import MiniLoader from "../../ui/miniLoader";
import { XCircle } from "lucide-react";
import DetailsPage from "./detailsPage";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/authContext";
import { useState, useEffect } from "react";
import PageLoading from "../../ui/pageLoading";
import PageError from "../../ui/pageError";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const fetchBookingDetails = async (id: string, signal: AbortSignal) => {
  const res = await fetch(`${apiUrl}/booking/admin/${id}`, {
    credentials: "include",
    signal,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch bookings");
  }

  const data = await res.json();
  return data.booking;
};

export default function BookingDetails({ id }: { id: string }) {
  const { user, authStatus, isAuthenticated, authError, loading,} =
          useAdminAuth();
           const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { data, isFetching, isLoading, refetch, error } = useQuery({
    queryKey: ["booking", id],
    queryFn: ({ signal }) => fetchBookingDetails(id, signal),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });

  const booking: any = data;

    useEffect(() => {
    setMounted(true);
  }, []);


  if (!mounted) {
      return null;
    }
  
    if (loading || authStatus === "checking") {
      return <PageLoading></PageLoading>;
    }
  
    if (authStatus === "error" && authError) {
      return <PageError></PageError>;
    }
  
    if (authStatus !== "authenticated") {
      return null;
    }

  if (error)
    return (
      <div className="absolute top-[70%] left-[50%] translate-x-[-50%] translate-y-[-50%]  flex-1 flex flex-col justify-center items-center text-gray-500 gap-4">
        <div className="flex flex-col justify-center items-center text-center z-10">
          <XCircle className="h-8 md:w-8 text-red-500" />
          <p className="text-gray-500">{error.message}</p>
        </div>
        <button
          className="btn-primary h-10 rounded-lg flex justify-center items-center"
          onClick={() => refetch()}
        >
          Try again
        </button>
      </div>
    );

  return (
    <section className="w-full flex justify-center py-3 md:py-8">
      {(isLoading || isFetching) && (
        <div>
          <div className="fixed z-50 bg-black/5 top-0 left-0 right-0 bottom-0"></div>
          <div className="fixed z-50 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
            <div className="">
              <div className="p-4 card">
                <MiniLoader></MiniLoader>
              </div>
            </div>
          </div>
        </div>
      )}

      {!!booking && !isLoading && (
        <div className="w-full">
          <button
            className="btn-secondary rounded-md py-1 md:py-2 border font-normal active:bg-brand-start active:text-white transition duration-150"
            onClick={() => router.back()}
          >
            {`Back`}
          </button>
          <DetailsPage data={booking}></DetailsPage>
        </div>
      )}
    </section>
  );
}
