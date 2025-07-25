"use client";

import Hero from "@/components/home/hero";
import HowItWorks from "@/components/home/howItWorks";
import ExperienceMagic from "@/components/home/experienceMagic";
import WhyChoose from "@/components/home/whyChoose";
import Stories from "@/components/home/stories";
import Ready from "@/components/home/ready";
import { motion, AnimatePresence } from "framer-motion";


export default function HomeMerged() {


  return (
    <AnimatePresence mode="wait">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      {/* Hero Section */}
      <Hero></Hero>

      {/* How it Works */}
      <HowItWorks></HowItWorks>

      {/* Experience the Magic */}
      <ExperienceMagic></ExperienceMagic>

      {/* Why Choose us */}
     <WhyChoose></WhyChoose>

      {/* Stories of Joy */}
     <Stories></Stories>

      {/* Ready to spread love*/}
      <Ready></Ready>
     
    </motion.div>
      </AnimatePresence>
  );
}
