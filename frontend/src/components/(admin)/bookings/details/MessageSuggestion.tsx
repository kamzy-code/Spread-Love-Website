"use client";
import { useState } from "react";
import { Sparkles, Copy, Check, RefreshCcw } from "lucide-react";
import { useSuggestMessage } from "@/hooks/useMessageSuggestion";
import { isBlankMessage } from "@/lib/blankMessage";
import type { SuggestedMessage } from "@/lib/types";
//
// Every button here is explicitly type="button": this renders inside the
// booking-details "Update Booking Info" <form>, and a <button> with no type
// defaults to submit (the same trap DeleteRecordingModal and
// RateRecordingModal already hit).
export default function MessageSuggestion({
  bookingId,
  recipientId,
  customerMessage,
  savedSuggestion,
}: {
  bookingId: string;
  recipientId: string;
  customerMessage?: string;
  savedSuggestion?: SuggestedMessage;
}) {
  const hasCustomerMessage = !isBlankMessage(customerMessage);
  const mutation = useSuggestMessage(bookingId, recipientId);
  const [suggestion, setSuggestion] = useState<SuggestedMessage | undefined>(savedSuggestion);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setCopied(false);
    try {
      setSuggestion(await mutation.mutateAsync());
    } catch {
      // surfaced via mutation.error below; keep any previous draft visible
    }
  };

  const copy = async () => {
    if (!suggestion) return;
    try {
      await navigator.clipboard.writeText(suggestion.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard can be blocked (insecure context / permissions) — the text
      // is still selectable on screen
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-medium text-gray-700 mb-1">Customer&apos;s Message</h4>
        {hasCustomerMessage ? (
          <p className="p-3 gradient-background-soft rounded-md text-gray-700 text-sm">
            {customerMessage}
          </p>
        ) : (
          <p className="text-sm italic text-gray-500">The customer didn&apos;t leave a message.</p>
        )}
      </div>

      {!suggestion && (
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

      {suggestion && (
        <div className="space-y-1">
          <h4 className="flex items-center gap-1.5 font-medium text-gray-700">
            <Sparkles className="h-4 w-4 text-brand-end" />
            Suggested Response
          </h4>
          <div className="space-y-3 rounded-md border border-dashed border-brand-end bg-white p-3">
            <p className="text-gray-700 text-sm whitespace-pre-line">{suggestion.text}</p>
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
              AI-written draft generated {new Date(suggestion.generatedAt).toLocaleString()} — read
              it over before using it. The customer&apos;s message above is unchanged.
            </p>
          </div>
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
