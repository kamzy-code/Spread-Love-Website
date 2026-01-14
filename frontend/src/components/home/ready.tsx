'use client';
import { motion } from "framer-motion";
import CTA from "./cta-btn";

function Ready() {

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-20 text-center section-padding gradient-background text-white">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 * 0.1 }}
        viewport={{ once: true }}
      >
        <h1 className="text-4xl sm:text-5xl font-bold pb-4 ">
          Ready to Spread Some Love?
        </h1>
        <p className="text-md sm:text-xl w-auto md:w-150 text-primary-200">
          Create a magical moment for someone special today. It only takes a few
          minutes to set up.
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 * 0.1 }}
        viewport={{ once: true }}
        className="flex flex-col sm:flex-row gap-8 w-full justify-center mt-5"
      >
        <CTA />
      </motion.div>
    </section>
  );
}

export default Ready;
