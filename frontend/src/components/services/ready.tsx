"use client";
import { motion } from "framer-motion";
import Link from "next/link";

function ReadyToSurprise() {
  return (
    <section className="gradient-background">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="container-max section-padding flex flex-col justify-center items-center text-center gap-4 py-20"
      >
        <h1 className="text-white text-5xl md:text-6xl font-bold">
          {" "}
          Ready to Surprise Someone?
        </h1>
        <p className="text-primary-200 text-lg md:text-2xl max-w-[80%] lg:max-w-[60%]">
          Choose your service and let us help you create an unforgettable moment
          that will be treasured forever.
        </p>
        <Link href={"/book"}>
          <button className="btn-secondary border-0 w-48">Book now</button>
        </Link>
      </motion.div>
    </section>
  );
}

export default ReadyToSurprise;
