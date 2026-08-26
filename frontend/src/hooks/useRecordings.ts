import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Recording, RecordingRatingValue, RecordingScore } from "@/lib/types";
import { buildQueryParams } from "@/lib/buildQueryParams";
import { apiCall } from "@/lib/apiClient";

interface UploadUrlParams {
  bookingId: string;
  recipientId: string;
  mimeType: string;
  fileSize: number;
  recordingId?: string;
}

interface UploadUrlResult {
  recordingId: string;
  s3Key: string;
  uploadUrl: string;
}

// Recordings for one recipient on one booking — the booking-details upload
// panel's own view. The same endpoint (unfiltered/status-filtered) backs
// the separate cross-booking QC route.
export const useRecordings = (bookingId: string, recipientId: string) => {
  return useQuery({
    queryKey: ["recordings", bookingId, recipientId],
    queryFn: async (): Promise<Recording[]> => {
      const queryString = buildQueryParams({ bookingId, recipientId });
      const data = await apiCall(`/recordings?${queryString}`);
      return data.recordings;
    },
    enabled: !!bookingId && !!recipientId,
  });
};

export const useRequestUploadUrl = () => {
  return useMutation({
    mutationFn: (params: UploadUrlParams): Promise<UploadUrlResult> =>
      apiCall("/recordings/upload-url", {
        method: "POST",
        body: JSON.stringify(params),
      }),
  });
};

export const useConfirmUpload = () => {
  return useMutation({
    mutationFn: ({ recordingId, s3Key }: { recordingId: string; s3Key: string }) =>
      apiCall(`/recordings/${recordingId}/confirm`, {
        method: "POST",
        body: JSON.stringify({ s3Key }),
      }),
  });
};

// Signed playback URL for one file — fetched automatically as soon as a
// player renders (no manual "generate link" step), refetch() is wired to
// the <audio> element's onError so an expired link recovers silently
// instead of surfacing an error to the admin.
export const useRecordingPlaybackUrl = (recordingId: string, fileId: string) => {
  return useQuery({
    queryKey: ["recording-playback-url", recordingId, fileId],
    queryFn: (): Promise<{ url: string; expiresIn: number }> =>
      apiCall(`/recordings/${recordingId}/files/${fileId}/playback-url`),
    enabled: !!recordingId && !!fileId,
    staleTime: 0,
    gcTime: 0,
  });
};

// The S3 PUT must bypass apiCall entirely — apiCall hardcodes
// Content-Type: application/json and credentials: include, both wrong for
// a presigned S3 upload (S3 verifies the signed Content-Type, and sending
// cookies to S3 makes no sense). Raw fetch, no timeout/network-message
// wrapping — an upload can legitimately take longer than the API's default
// timeout, and S3's own errors don't need apiCall's JSON-error parsing.
export const uploadFileToS3 = async (uploadUrl: string, file: File): Promise<void> => {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!response.ok) {
    throw new Error("Upload to storage failed. Please try again.");
  }
};

export const useInvalidateRecordings = () => {
  const queryClient = useQueryClient();
  return (bookingId: string, recipientId: string) =>
    queryClient.invalidateQueries({ queryKey: ["recordings", bookingId, recipientId] });
};

interface RatingResult {
  message: string;
  recording: Recording;
  score: RecordingScore;
}

export const useSubmitRating = (recordingId: string) => {
  return useMutation({
    mutationFn: (ratingValues: RecordingRatingValue[]): Promise<RatingResult> =>
      apiCall(`/recordings/${recordingId}/rate`, {
        method: "POST",
        body: JSON.stringify({ ratingValues }),
      }),
  });
};

export const useApproveRecording = (recordingId: string) => {
  return useMutation({
    mutationFn: (): Promise<RatingResult> =>
      apiCall(`/recordings/${recordingId}/approve`, { method: "PUT" }),
  });
};

export const useUnapproveRecording = (recordingId: string) => {
  return useMutation({
    mutationFn: (): Promise<RatingResult> =>
      apiCall(`/recordings/${recordingId}/unapprove`, { method: "PUT" }),
  });
};

export const useDeleteRecording = (recordingId: string) => {
  return useMutation({
    mutationFn: (): Promise<{ message: string; recording: Recording }> =>
      apiCall(`/recordings/${recordingId}`, { method: "DELETE" }),
  });
};

export const useSendRecordingEmail = (recordingId: string) => {
  return useMutation({
    mutationFn: (): Promise<{ message: string; recording: Recording }> =>
      apiCall(`/recordings/${recordingId}/send-email`, { method: "POST" }),
  });
};
