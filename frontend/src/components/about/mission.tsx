'use client'
import AboutCTA from "./aboutCTA";
import { motion } from "framer-motion";

function Mission() {
  return (
    <section className="gradient-background py-20">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="container-max section-padding px-10 flex flex-col justify-center items-center text-center gap-4 "
      >
        <h1 className="text-white text-5xl md:text-6xl font-bold">
          {" "}
          Join Our Mission
        </h1>
        <p className="text-primary-200 text-lg md:text-2xl max-w-[80%] lg:max-w-[60%]">
          {`Be part of spreading love and creating unforgettable moments. Your
          next surprise call could make someone's entire year. Book a Call`}
        </p>
        <div className="w-full sm:flex sm:justify-center">
          <AboutCTA border={false}></AboutCTA>
        </div>
      </motion.div>
    </section>
  );
}

export default Mission;
