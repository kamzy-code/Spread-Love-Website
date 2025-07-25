'use client'
import { motion } from "framer-motion";
import { MessageCircle, Clock } from "lucide-react";
import ContactForm from "./form";

function DetailedContact() {
  return (
    <section className="">
      <div className="container-max flex flex-col lg:flex-row justify-center gap-12 md:gap-4 section-padding py-20">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="container-max py-6 flex flex-col gap-4 w-full lg:w-[50%]"
        >
          <ContactForm></ContactForm>
        </motion.div>

        {/* right div */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="container-max section-padding py-6 flex flex-col gap-4 w-full lg:w-[50%]"
        >
          {/* Business hours */}
          <div className="card p-6 w-full">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-6 w-6 text-brand-end" />
              <h2 className="text-xl text-brand-start font-semibold">
                Business Hours
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-700 text-md ">Monday - Saturday</p>
                <p className="text-gray-700 text-md ">Sunday</p>
              </div>

              <div className="flex flex-col items-end">
                <p className="text-gray-700 text-md ">7:30AM - 8PM WAT</p>
                <p className="text-gray-700 text-md ">12PM - 8PM WAT</p>
              </div>
            </div>

            <p className="px-2 py-3 rounded-md text-center gradient-background-soft w-full text-sm">
              <span className="font-semibold">Emergency Supprt:</span> Available
              24/7 via WhatsApp for urgent booking issues.
            </p>
          </div>

          {/* Instant Help */}
          <div className="card p-6 w-full flex flex-col items-center">
            <MessageCircle className="h-12 w-12 text-green-500 mb-2" />
            <h2 className="text-xl text-brand-start text-md font-semibold mb-2">
              Need Instant Help?
            </h2>
            <p className="text-gray-700 text-md text-center mb-4">
              Chat with us on WhatsApp for immediate assistance with your
              bookings.
            </p>

            <button
              className="btn-primary"
              onClick={() =>
                window.open(
                  "https://wa.me/+2349017539148?text=Hi! I need help with Spread Love services.",
                  "_blank"
                )
              }
            >
              Chat on WhatsApp
            </button>
          </div>

          {/* Quick Answers */}
          <div className="card p-6 w-full space-y-3">
            <h2 className="text-xl text-brand-start font-semibold">
              Quick Answers
            </h2>

            <div className="w-full ">
              <p className="font-semibold text-md mb-1">
                How far in advance should I book a call?
              </p>

              <p className="text-sm text-gray-600">
                {
                "We recommend booking a call immediately no matter the month the recipient has to receive the call. This is because the earlier you call slot is secured, the earlier the recipient can receive their call. "
              }
              </p>
              
            </div>

            <div className="w-full">
              <p className="font-semibold text-md mb-1">
              {`What if the recipient doesn't answer?`}
              </p>

              <p className=" text-sm text-gray-600">
               {
                "We'll make up to 3 attempts to reach them. If Unsuccessful, we'll reschedule at no extra cost. If the call doesn't go through, you can use that slot for another person."
              } <span className="font-medium">No Refund is provided.</span>
              </p>
              
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default DetailedContact;
