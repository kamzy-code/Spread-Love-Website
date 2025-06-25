"use client";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export default function BookHero() {
  return (
    <section className="gradient-background">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="container-max section-padding flex flex-col justify-center items-center text-center gap-4 py-20"
      >
        <Heart className="h-16 w-16 text-white"></Heart>
        <h1 className="text-white text-5xl md:text-6xl font-bold">
          {" "}
          Book Your Surprise call
        </h1>
        <p className="text-primary-200 text-lg md:text-2xl max-w-[80%] lg:max-w-[60%]">
          Fill out the details below and we'll create a magical moment for your loved one
        </p>
      </motion.div>
    </section>
  );
}
