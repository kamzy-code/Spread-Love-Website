"use client";
import { motion, AnimatePresence } from "framer-motion";
import GetInTouch from "@/components/contact/getInTouch";
import ContactInfo from "@/components/contact/contactInfo";
import DetailedContact from "@/components/contact/detailedContact";
import FAQ from "@/components/contact/faq";

export default function Contact() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen"
      >
       
       <GetInTouch></GetInTouch>

       <ContactInfo></ContactInfo>

       <DetailedContact></DetailedContact>

       <FAQ></FAQ>
       
      </motion.div>
    </AnimatePresence>
  );
}
