import { useEffect } from "react";

// Locks page scroll behind a modal for as long as the calling component is mounted.
export function useLockBodyScroll() {
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);
}
