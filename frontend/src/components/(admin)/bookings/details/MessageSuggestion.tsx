"use client";
import { useState } from "react";
import { Sparkles, Copy, Check, RefreshCcw } from "lucide-react";
import { useSuggestMessage } from "@/hooks/useMessageSuggestion";

// Shown on a recipient whose customer left the message blank/"None", so the
// rep isn't on the call with nothing to say. The draft is display-only — it
// is never saved to the booking.
//
// Every button here is explicitly type="button": this renders inside the
// booking-details "Update Booking Info" <form>, and a <button> with no type
// defaults to submit (the same trap DeleteRecordingModal and
// RateRecordingModal already hit).
export default function MessageSuggestion({
  bookingId,
  recipientId,
}: {
  bookingId: string;
  recipientId: string;
}) {
  const mutation = useSuggestMessage(bookingId, recipientId);
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setCopied(false);
    try {
      setDraft(await mutation.mutateAsync());
    } catch {
      // surfaced via mutation.error below; keep any previous draft visible
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard can be blocked (insecure context / permissions) — the text
      // is still selectable on screen
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-700">Message</h4>
      <p className="text-sm italic text-gray-500">The customer didn&apos;t leave a message.</p>

      {!draft && (
        <button
          type="button"
          onClick={generate}
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg border border-brand-end px-4 py-2 text-sm font-medium text-brand-end hover:bg-pink-50 transition disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          {mutation.isPending ? "Writing a suggestion..." : "Suggest a message"}
        </button>
      )}

      {draft && (
        <div className="p-3 gradient-background-soft rounded-md space-y-3">
          <p className="text-gray-700 text-sm whitespace-pre-line">{draft}</p>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1 font-medium text-brand-end hover:underline"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              onClick={generate}
              disabled={mutation.isPending}
              className="inline-flex items-center gap-1 font-medium text-brand-end hover:underline disabled:opacity-50"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              {mutation.isPending ? "Writing..." : "Try another"}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            AI-written draft — read it over before using it. It&apos;s not saved to the booking.
          </p>
        </div>
      )}

      {mutation.isError && (
        <p className="text-sm text-red-500">
          {mutation.error instanceof Error ? mutation.error.message : "Couldn't generate a suggestion."}
        </p>
      )}
    </div>
  );
}
