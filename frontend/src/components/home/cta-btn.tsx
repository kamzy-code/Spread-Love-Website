"use client";

import Link from "next/link";

function CTA() {
  return (
    <>
    <Link href={'/book'}>
      <button
        className="btn-primary sm:w-auto w-full"
      >
        Book a call
      </button>
    </Link>
      <button
        className="btn-secondary sm:w-auto w-full"
        onClick={() =>
          document
            .getElementById("sample-section")
            ?.scrollIntoView({ behavior: "smooth" })
        }
      >
        View call Samples
      </button>
    </>
  );
}

export default CTA;
