import { Heart } from "lucide-react";

// Presentational only — used by the real pop-up and by the admin preview so
// what the admin sees is exactly what customers get. Title/body are plain
// text, rendered as text (never HTML); whitespace-pre-line keeps the admin's
// line breaks.
export default function BookingPopupCard({
  title,
  body,
  onClose,
  titleId,
  preview,
}: {
  title: string;
  body: string;
  onClose?: () => void;
  titleId?: string;
  preview?: boolean;
}) {
  return (
    <div className="card p-8 text-center w-full max-w-md">
      <Heart className="h-12 w-12 text-brand-end mx-auto mb-4" />
      <h3 id={titleId} className="text-2xl font-semibold mb-3 break-words">
        {title || <span className="text-gray-400">Your title</span>}
      </h3>
      <p className="text-gray-700 mb-6 whitespace-pre-line break-words">
        {body || <span className="text-gray-400">Your message</span>}
      </p>
      {/* type="button" regardless of where this renders — the booking page
          is one big <form>, and a button with no type submits it. */}
      <button
        type="button"
        onClick={onClose}
        disabled={preview}
        className="btn-primary rounded-lg mx-auto px-8"
      >
        Got it
      </button>
    </div>
  );
}
