import { useFetchLogs } from "@/hooks/useLogs";
import { XCircle } from "lucide-react";
import LogViewerPage from "./logViewer";
import MiniLoader from "../ui/miniLoader";

export default function LogData() {
  const { data, error, isLoading, isFetching, refetch } = useFetchLogs();

  if (error)
    return (
      <div className="absolute top-[70%] left-[50%] translate-x-[-50%] translate-y-[-50%]  flex-1 flex flex-col justify-center items-center text-gray-500 gap-4">
        <div className="flex flex-col justify-center items-center text-center z-10">
          <XCircle className="h-8 md:w-8 text-red-500" />
          <p className="text-gray-500">Error Fetching Logs</p>
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
    <div>
      {(isLoading || isFetching) && (
        <div className="fixed z-50 inset-0 flex items-center justify-center bg-black/5">
          {" "}
          <div className="p-4 card">
            <MiniLoader></MiniLoader>
          </div>
        </div>
      )}

      {data && (
        <div className="w-full">
          <LogViewerPage logData={data}></LogViewerPage>
        </div>
      )}
    </div>
  );
}
