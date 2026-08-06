import { useQuery, keepPreviousData, useMutation } from "@tanstack/react-query";
import { apiCall, apiCallText, apiCallBlob } from "@/lib/apiClient";

export const useFetchLogs = () => {
  return useQuery({
    queryKey: ["logs"],
    queryFn: async ({ signal }) => {
      const data = await apiCall("/logs/admin", { signal });
      return data.files;
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });
};

export const useGetLogContent = (file: string) => {
  return useQuery({
    queryKey: ["logs", file],
    queryFn: ({ signal }) => apiCallText(`/logs/admin/${file}`, { signal }),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    enabled: !!file,
  });
};

export const useZipLogs = (body: { files: string[] }) => {
  return useMutation({
    mutationFn: async () => {
      const data = await apiCall("/logs/admin/zip", {
        method: "POST",
        body: JSON.stringify(body),
      });
      return data.archive;
    },
  });
};

export const useDownloadLogs = (file: string) => {
  return useMutation({
    mutationFn: async () => {
      const { blob } = await apiCallBlob(`/logs/admin/download/${file}`);
      return { blob, file };
    },

    onSuccess: ({ blob, file }) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    },
  });
};
