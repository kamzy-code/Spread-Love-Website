"use client";

import { useRef, useState } from "react";
import { Recording, RecordingFile } from "@/lib/types";
import {
  useRecordings,
  useRequestUploadUrl,
  useConfirmUpload,
  useRecordingPlaybackUrl,
  uploadFileToS3,
  useInvalidateRecordings,
  useApproveRecording,
  useUnapproveRecording,
} from "@/hooks/useRecordings";
import RateRecordingModal from "../../recordings/RateRecordingModal";

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;

const statusLabel: Record<Recording["status"], string> = {
  pending_upload: "Pending upload",
  uploaded: "Uploaded",
  expired: "Expired",
};

const statusBadgeClass: Record<Recording["status"], string> = {
  pending_upload: "bg-amber-100 text-amber-700",
  uploaded: "bg-green-100 text-green-700",
  expired: "bg-gray-200 text-gray-600",
};

function AudioPlayer({ recordingId, file }: { recordingId: string; file: RecordingFile }) {
  const { data, isLoading, isError, refetch } = useRecordingPlaybackUrl(recordingId, file._id);

  if (isLoading) {
    return <p className="text-sm text-gray-500 italic">Loading part {file.partNumber}…</p>;
  }

  if (isError || !data?.url) {
    return <p className="text-sm text-red-600">Couldn&apos;t load part {file.partNumber}.</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-500">Part {file.partNumber}</span>
      <audio
        controls
        src={data.url}
        className="w-full h-10"
        // A signed URL can expire mid-review-session — recover silently
        // with a fresh one rather than leaving the admin with a dead
        // player and no way to know why.
        onError={() => refetch()}
      />
    </div>
  );
}

function UploadInput({
  bookingId,
  recipientId,
  recordingId,
  label,
  onDone,
}: {
  bookingId: string;
  recipientId: string;
  recordingId?: string;
  label: string;
  onDone: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const requestUploadUrl = useRequestUploadUrl();
  const confirmUpload = useConfirmUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setStatus("error");
      setErrorMessage("That file is larger than the 100MB limit.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setStatus("uploading");
    setErrorMessage("");

    try {
      const { recordingId: sessionId, s3Key, uploadUrl } = await requestUploadUrl.mutateAsync({
        bookingId,
        recipientId,
        mimeType: file.type,
        fileSize: file.size,
        recordingId,
      });

      await uploadFileToS3(uploadUrl, file);
      await confirmUpload.mutateAsync({ recordingId: sessionId, s3Key });

      setStatus("idle");
      onDone();
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Upload failed. Please try again.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        disabled={status === "uploading"}
        onChange={handleFileChange}
        className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-end/10 file:px-3 file:py-2 file:text-brand-end file:font-medium disabled:opacity-50"
      />
      {status === "uploading" && (
        <span className="text-xs text-gray-500">Uploading…</span>
      )}
      {status === "error" && <span className="text-xs text-red-600">{errorMessage}</span>}
    </div>
  );
}

// Reps upload but don't review — matches the role gate on the rate/approve
// endpoints themselves (recordingRoute.ts).
const CAN_REVIEW_ROLES = new Set(["superadmin", "salesrep"]);

function RecordingCard({
  recording,
  bookingId,
  recipientId,
  isOwner,
  canReview,
  refresh,
}: {
  recording: Recording;
  bookingId: string;
  recipientId: string;
  isOwner: boolean;
  canReview: boolean;
  refresh: () => void;
}) {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const approveMutation = useApproveRecording(recording._id);
  const unapproveMutation = useUnapproveRecording(recording._id);

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync();
      refresh();
    } catch {
      // error surfaced via approveMutation.error below
    }
  };

  const handleUnapprove = async () => {
    try {
      await unapproveMutation.mutateAsync();
      refresh();
    } catch {
      // error surfaced via unapproveMutation.error below
    }
  };

  return (
    <div className="border rounded-md p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass[recording.status]}`}
        >
          {statusLabel[recording.status]}
        </span>
        {recording.approved && (
          <span className="text-xs text-green-700 font-medium">QC approved</span>
        )}
      </div>

      {recording.files.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No parts confirmed yet.</p>
      ) : (
        <div className="space-y-2">
          {recording.files.map((file) => (
            <AudioPlayer key={file._id} recordingId={recording._id} file={file} />
          ))}
        </div>
      )}

      {recording.locked ? (
        <p className="text-xs text-gray-400 italic">
          Approved — no further parts can be added to this recording.
        </p>
      ) : (
        isOwner && (
          <UploadInput
            bookingId={bookingId}
            recipientId={recipientId}
            recordingId={recording._id}
            label="Add another part"
            onDone={refresh}
          />
        )
      )}

      {canReview && recording.status === "uploaded" && (
        <div className="pt-2 border-t space-y-2">
          {recording.score?.overallScorePercent !== null &&
            recording.score?.overallScorePercent !== undefined && (
              <p className="text-sm text-brand-start font-medium">
                QC score: {recording.score.overallScorePercent}%
              </p>
            )}

          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 text-sm border border-brand-end text-brand-end rounded-lg py-2 hover:bg-brand-end hover:text-white transition"
              onClick={() => setShowRatingModal(true)}
            >
              {recording.reviewed ? "Edit rating" : "Rate this call"}
            </button>

            {recording.reviewed && !recording.approved && (
              <button
                type="button"
                className="flex-1 text-sm btn-primary rounded-lg py-2 disabled:opacity-50"
                disabled={approveMutation.isPending}
                onClick={handleApprove}
              >
                {approveMutation.isPending ? "Approving..." : "Approve"}
              </button>
            )}

            {recording.approved && (
              <button
                type="button"
                className="flex-1 text-sm border border-red-400 text-red-500 rounded-lg py-2 hover:bg-red-500 hover:text-white transition disabled:opacity-50"
                disabled={unapproveMutation.isPending}
                onClick={handleUnapprove}
              >
                {unapproveMutation.isPending ? "Unapproving..." : "Unapprove"}
              </button>
            )}
          </div>

          {approveMutation.error && (
            <p className="text-xs text-red-600">
              {approveMutation.error instanceof Error
                ? approveMutation.error.message
                : "Failed to approve recording"}
            </p>
          )}
          {unapproveMutation.error && (
            <p className="text-xs text-red-600">
              {unapproveMutation.error instanceof Error
                ? unapproveMutation.error.message
                : "Failed to unapprove recording"}
            </p>
          )}
        </div>
      )}

      {showRatingModal && (
        <RateRecordingModal
          recording={recording}
          bookingId={bookingId}
          recipientId={recipientId}
          onClose={() => setShowRatingModal(false)}
        />
      )}
    </div>
  );
}

interface RecordingsPanelProps {
  bookingId: string;
  recipientId: string;
  currentUserId?: string;
  currentUserRole?: string;
}

export default function RecordingsPanel({
  bookingId,
  recipientId,
  currentUserId,
  currentUserRole,
}: RecordingsPanelProps) {
  const { data: recordings = [], isLoading, isError } = useRecordings(bookingId, recipientId);
  const invalidate = useInvalidateRecordings();

  const refresh = () => invalidate(bookingId, recipientId);
  const canReview = !!currentUserRole && CAN_REVIEW_ROLES.has(currentUserRole);

  return (
    <div className="flex flex-col space-y-3 border rounded-lg p-4">
      <label className="text-gray-700 font-medium">Call Recordings:</label>

      {isLoading && <p className="text-sm text-gray-500 italic">Loading recordings…</p>}
      {isError && (
        <p className="text-sm text-red-600">Couldn&apos;t load recordings for this recipient.</p>
      )}

      {!isLoading && !isError && recordings.length === 0 && (
        <p className="text-sm text-gray-500 italic">No recordings uploaded yet.</p>
      )}

      {recordings.map((recording) => (
        <RecordingCard
          key={recording._id}
          recording={recording}
          bookingId={bookingId}
          recipientId={recipientId}
          isOwner={!!currentUserId && recording.uploadedBy === currentUserId}
          canReview={canReview}
          refresh={refresh}
        />
      ))}

      <UploadInput
        bookingId={bookingId}
        recipientId={recipientId}
        label="Upload a call recording"
        onDone={refresh}
      />
    </div>
  );
}
