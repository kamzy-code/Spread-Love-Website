"use client";

import Story from "@/components/about/ourStory";
import SpreadingLove from "@/components/about/spreadingLove";
import Journey from "@/components/about/journey";
import Team from "@/components/about/team";
import Values from "@/components/about/values";
import Mission from "@/components/about/mission";
import { motion, AnimatePresence } from "framer-motion";

export default function AboutCombined() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen"
      >
        {/* Our Story */}
        <Story></Story>

        {/* Spreading Love */}
        <SpreadingLove></SpreadingLove>

        {/* our journey */}
        <Journey></Journey>

        {/* meet our team */}
        <Team></Team>

        {/* our values */}
        <Values></Values>

        {/* Join Our Mission */}
        <Mission></Mission>
      </motion.div>
    </AnimatePresence>
  );
}
