import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  return (
    <div className="">
      <section className="Hero-section gradient-background py-40 ">
      
        <div className="container-max section-padding flex flex-col items-center justify-center text-white text-center gap-4 ">
          <h1 className="text-6xl md:text-8xl font-handwritten font-bold mb-4">
            Spread Love
          </h1>
          <p className="text-2xl md:text-4xl font-semibold mb-4 text-primary-200">
            Make Someone's Day with a Surprise Call
          </p>
          <p className="text-lg md:text-2xl font-normal">
            Personalized Phone calls for birthdays, anniversaries, and special
            moments
          </p>
            
        </div>

        <div className="bg-white flex flex-col sm:flex-row gap-8 w-full justify-center p-10 mt-10">
            <button className="btn-primary sm:w-auto w-full">Book a call</button>
            <button className="btn-secondary sm:w-auto w-full">View call Samples</button>
            </div>
      </section>
    </div>
  );
}
