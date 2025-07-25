import { useQuery, keepPreviousData, useMutation } from "@tanstack/react-query";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const useFetchLogs = () => {
  return useQuery({
    queryKey: ["logs"],
    queryFn: async ({ signal }) => {
      const res = await fetch(`${apiUrl}/logs/admin`, {
        credentials: "include",
        signal,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to fetch logs");
      }

      const data = await res.json();
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
    queryFn: async ({ signal }) => {
      const res = await fetch(`${apiUrl}/logs/admin/${file}`, {
        credentials: "include",
        signal,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || `Failed to fetch log - ${file}`);
      }

      const data = await res.text();
      return data;
    },
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    enabled: !!file,
  });
};

export const useZipLogs = (body: { files: string[] }) => {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${apiUrl}/logs/admin/zip`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to zip logs");
      }

      const data = await res.json();
      return data.archive;
    },

    onError: (error) => {
      throw new Error(error.message || "Failed to zip logs");
    },
  });
};

export const useDownloadLogs = (file: string) => {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${apiUrl}/logs/admin/download/${file}`, {
        credentials: "include",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to download logs");
      }

      const blob = await res.blob();
      return { blob, file };
    },

     onSuccess: ({ blob, file}) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    },

    onError: (error) => {
      throw new Error(error.message || "Failed to download logs");
    },
  });
};
