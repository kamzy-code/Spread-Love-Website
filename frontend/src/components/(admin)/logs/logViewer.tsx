import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { useGetLogContent, useZipLogs } from "@/hooks/useLogs";
import MiniLoader from "../ui/miniLoader";
import { LogFile } from "@/lib/types";
import { XCircle } from "lucide-react";

export default function LogViewerPage({ logData }: { logData: LogFile[] }) {
  const [logs, setLogs] = useState<LogFile[]>(() =>
    logData.length && logData.length > 0 ? logData : []
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [previewLog, setPreviewLog] = useState<string>("");
  const [previewData, setPreviewData] = useState<string | null>(null);

  const toggleSelect = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === logs.length) {
      setSelected([]);
    } else {
      setSelected(logs.map((log) => log.name));
    }
  };

  const zipMutation = useZipLogs({ files: selected });
  const { data, error, isLoading, isFetching, refetch } =
    useGetLogContent(previewLog);

  const handleZip = async () => {
    zipMutation.mutate();
    alert("Zipped successfully.");
  };

  useEffect(() => {
    if (data && previewLog) {
      setPreviewData(data);
    }
  }, [data, previewLog]);

  return (
    <div className="p-6  mx-auto space-y-6">
      {zipMutation.isPending && (
        <div className="fixed z-50 inset-0 flex items-center justify-center bg-black/5">
          {" "}
          <div className="p-4 card">
            <MiniLoader></MiniLoader>
          </div>
        </div>
      )}

      <Card className="">
        <CardContent className="">
          <div className="h-[400px] overflow-x-auto">
            <div className="w-full ">
              <table className="min-w-[600px] w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="flex gap-2 items-center pb-5 px-3">
                      <Checkbox
                        className="border-gray-700"
                        checked={
                          selected.length === logs.length && logs.length > 0
                        }
                        onCheckedChange={toggleSelectAll}
                      />
                      {selected.length && selected.length !== 0 ? (
                        <p>{selected.length}</p>
                      ) : null}
                    </th>
                    <th className="pb-5 px-3">File</th>
                    <th className="pb-5 px-3">Size</th>
                    <th className="pb-5 px-3">Modified</th>
                    <th className="pb-5 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.name} className="border-b">
                      <td className="py-5 px-3">
                        <Checkbox
                          className="border-gray-700"
                          checked={selected.includes(log.name)}
                          onCheckedChange={() => toggleSelect(log.name)}
                        />
                      </td>
                      <td className="py-5 px-3">{log.name}</td>
                      <td className="py-5 px-3">
                        {(log.size / 1024).toFixed(1)} KB
                      </td>
                      <td className="py-5 px-3 ">
                        {format(new Date(log.createdAt), "PPpp")}
                      </td>
                      <td className="py-3 px-3">
                        <Dialog
                          onOpenChange={(open) => {
                            if (!open) {
                              setPreviewLog("");
                              setPreviewData(null);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={async () => {
                                setPreviewLog(log.name);
                              }}
                            >
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogTitle>{log.name}</DialogTitle>
                            <div className="max-h-[70vh] overflow-y-auto">
                              {error ? (
                                <div>
                                  <div className="p-10 flex flex-col justify-center items-center text-gray-500 gap-4">
                                    <div className="flex flex-col justify-center items-center text-center z-10">
                                      <XCircle className="h-8 md:w-8 text-red-500" />
                                      <p className="text-gray-500">
                                        Error Fetching Logs
                                      </p>
                                    </div>
                                    <button
                                      className="btn-primary h-10 rounded-lg flex justify-center items-center"
                                      onClick={() => refetch()}
                                    >
                                      Try again
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-full max-w-full text-xs whitespace-pre-wrap">
                                  {isLoading || isFetching ? (
                                    "...Loading"
                                  ) : (
                                    <div>
                                      <p>{previewData}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button disabled={!selected.length} onClick={handleZip}>
          Zip Selected
        </Button>
        {/* Optional: Upload to Drive */}
        {/* <Button variant="outline">Upload to Drive</Button> */}
      </div>
    </div>
  );
}
