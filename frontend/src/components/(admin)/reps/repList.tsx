import { useRepFilter } from "./repsContext";
import { useFetchReps } from "@/hooks/useReps";
import { useEffect } from "react";
import { XCircle, Users } from "lucide-react";
import MiniLoader from "../ui/miniLoader";
import { Rep } from "@/lib/types";
import { useRouter } from "next/navigation";
import Pagination from "../ui/pagination";

export default function RepList() {
  const router = useRouter();

  const { setPage, ...filter } = useRepFilter();
  const { search: searchTerm } = filter;

  const { data, error, isLoading, isFetching, refetch } = useFetchReps(
    filter,
    searchTerm as string
  );

  const { data: reps, meta } = data ?? { data: [], meta: undefined };
  console.log("reps", reps);

  useEffect(() => {
    if (isLoading || isFetching) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Optional cleanup if component unmounts while loading
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLoading, isFetching]);

  if (error)
    return (
      <div className="absolute top-[70%] left-[50%] translate-x-[-50%] translate-y-[-50%]  flex-1 flex flex-col justify-center items-center text-gray-500 gap-4">
        <div className="flex flex-col justify-center items-center text-center z-10">
          <XCircle className="h-8 md:w-8 text-red-500" />
          <p className="text-gray-500">Error Fetching Reps</p>
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
    <div className="">
      <div className="">
        {(isLoading || isFetching) && (
          <div className="fixed z-50 inset-0 flex items-center justify-center bg-black/5">
            {" "}
            <div className="p-4 card">
              <MiniLoader></MiniLoader>
            </div>
          </div>
        )}

        {!isLoading && !isFetching && reps?.length === 0 && (
          <div className="absolute top-[70%] left-[50%] translate-x-[-50%] translate-y-[-50%]  flex-1 flex flex-col justify-center items-center text-gray-500">
            <Users className="h-4 w-4 md:h-6 md:w-6" />
            <p className="text-sm md:text-[1rem]">No Reps Available</p>
          </div>
        )}

        {reps && reps.length > 0 && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {reps.map((rep: Rep) => {
                return (
                  <div
                    key={rep._id}
                    className="card p-6 space-y-2 active:bg-gray-50"
                    onClick={() => router.push(`/admin/reps/${rep._id}`)}
                  >
                    <div className="flex justify-between">
                      <div className="flex gap-4">
                        {/* badge */}
                        <div className="gradient-background rounded-full p-4 shrink-0 w-12 h-12 flex items-center justify-center text-white font-medium text-sm">
                          <h2>{rep?.firstName?.split("")[0].toUpperCase()}</h2>
                          <h2>{rep?.lastName?.split("")[0].toUpperCase()}</h2>
                        </div>

                        {/* Name and status */}
                        <div className="flex flex-col gap-y">
                          <h2 className="font-medium text-brand-start">{`${rep?.firstName} ${rep?.lastName}`}</h2>
                          <p
                            className={`${
                              rep.status === "active"
                                ? "text-green-500"
                                : rep.status === "inactive"
                                ? "text-gray-500"
                                : "text-red-500"
                            }`}
                          >
                            {rep?.status}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4"></div>
                    </div>

                    {/* other details */}
                    <div className="text-gray-700 text-sm space-y-2">
                      <div className="flex justify-between items-center">
                        <p>Role:</p>
                        <p className="capitalize text-brand-start font-">
                          {rep?.role}
                        </p>
                      </div>

                      <div className="flex justify-between items-center">
                        <p>Email:</p>
                        <p className="text-brand-start font-">{rep?.email}</p>
                      </div>

                      <div className="flex justify-between items-center">
                        <p>Phone:</p>
                        <p className="capitalize text-brand-start font-">
                          {rep?.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <Pagination meta={meta} setPage={setPage}></Pagination>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
