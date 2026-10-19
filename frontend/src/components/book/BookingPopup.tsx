"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useFetchPublicBookingPopup } from "@/hooks/useBookingPopup";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import BookingPopupCard from "./BookingPopupCard";

const dismissedKey = (version: string) => `booking-popup-dismissed:${version}`;

// sessionStorage can throw (private mode, blocked site data) — a pop-up that
// can't remember being dismissed is fine; one that crashes the page isn't.
const wasDismissed = (version: string) => {
  try {
    return sessionStorage.getItem(dismissedKey(version)) === "1";
  } catch {
    return false;
  }
};

const rememberDismissed = (version: string) => {
  try {
    sessionStorage.setItem(dismissedKey(version), "1");
  } catch {
    // ignore — see above
  }
};

function PopupModal({
  title,
  body,
  onClose,
}: {
  title: string;
  body: string;
  onClose: () => void;
}) {
  useLockBodyScroll();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Portalled to document.body: this renders on the booking page, whose
  // content is one big <form>. A modal left inside it would have its
  // buttons natively submit that form (the same bug class already fixed in
  // DeleteRecordingModal/RateRecordingModal).
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-popup-title"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full flex justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <BookingPopupCard
          title={title}
          body={body}
          onClose={onClose}
          titleId="booking-popup-title"
        />
      </motion.div>
    </div>,
    document.body,
  );
}

// Shown once per browser session, keyed by the copy's version — editing the
// copy in the admin brings it back for visitors who already dismissed the
// old one.
export default function BookingPopup() {
  const { data } = useFetchPublicBookingPopup();
  const [open, setOpen] = useState(false);

  const enabled = data?.enabled === true;
  const version = data?.enabled === true ? data.version : null;

  useEffect(() => {
    // /book?reference=… is where customers land after paying — a "book more
    // calls" pop-up over their payment confirmation would be noise. Read the
    // URL here rather than via useSearchParams, which would need a Suspense
    // boundary on this statically rendered page.
    if (new URLSearchParams(window.location.search).has("reference")) return;
    if (enabled && version && !wasDismissed(version)) setOpen(true);
  }, [enabled, version]);

  if (!open || data?.enabled !== true) return null;

  const close = () => {
    rememberDismissed(data.version);
    setOpen(false);
  };

  return <PopupModal title={data.title} body={data.body} onClose={close} />;
}
