"use client";
import { useState, useEffect } from "react";
import { Image as ImageIcon, ImageOff } from "lucide-react";

// Plain <img> (not next/image) — the src here is admin-entered free text,
// not restricted to a whitelist of image hosts, so next/image's configured
// remotePatterns would break on any URL outside that list.
export default function ImageWithPlaceholder({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  // A corrected src after a failed load must re-attempt loading, not stay
  // stuck showing the old error state.
  useEffect(() => {
    setLoaded(false);
    setErrored(false);
  }, [src]);

  return (
    <div className={`relative bg-gray-100 overflow-hidden ${className}`}>
      {!loaded && !errored && (
        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
          <ImageIcon className="h-8 w-8 text-gray-300" />
        </div>
      )}

      {errored && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-gray-400">
          <ImageOff className="h-8 w-8" />
          <p className="text-xs">Image failed to load</p>
        </div>
      )}

      {!errored && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
        />
      )}
    </div>
  );
}
