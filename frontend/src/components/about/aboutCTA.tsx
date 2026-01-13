import { MessageCircle } from "lucide-react";
import Link from "next/link";

function AboutCTA(prop: { border?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Link href="/book">
      <button
        className="btn-primary sm:w-auto w-full mt-4"
      >
        Book a Call
      </button>
      </Link>

      <button
        className={`btn-secondary sm:w-auto w-full mt-4 flex justify-center items-center ${prop.border? '': 'border-0'}`}
        onClick={() =>
          window.open(
            "https://wa.me/+2349017539148?text=Hi! I need help with Spread Love services.",
            "_blank"
          )
        }
      >
        <MessageCircle className="inline h-6 w-6 mr-1" />
        Chat on Whatsapp
      </button>
    </div>
  );
}

export default AboutCTA;
