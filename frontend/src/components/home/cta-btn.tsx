"use client";

interface CTAProps {
  onClickBook: () => void;
}

function CTA(prop: CTAProps) {
  return (
    <>
      <button
        className="btn-primary sm:w-auto w-full"
        onClick={() => prop.onClickBook()}
      >
        Book a call
      </button>
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
