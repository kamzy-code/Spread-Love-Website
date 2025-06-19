import { MessageCircle } from "lucide-react";

function AboutCTA(prop: { handleBook: () => void, border?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <button
        className="btn-primary sm:w-auto w-full mt-4"
        onClick={() => prop.handleBook()}
        //   onClick={() => window.location.href = "/book"}
      >
        Book a Call
      </button>

      <button
        className={`btn-secondary sm:w-auto w-full mt-4 flex items-center ${prop.border? '': 'border-0'}`}
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
