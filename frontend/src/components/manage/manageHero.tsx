'use client'
import {motion} from 'framer-motion';
import { Search, Phone, Calendar, Clock, User, MessageCircle, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

export default function ManageHero(){
    return (
        <section className="gradient-background">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="container-max section-padding flex flex-col justify-center items-center text-center gap-4 py-20"
      >
        <Search className="h-16 w-16 mb-3 text-white" />
        <h1 className="text-white text-5xl md:text-6xl font-bold">
          {" "}
          Manage Your Booking
        </h1>
        <p className="text-primary-200 text-lg md:text-2xl max-w-[80%] lg:max-w-[60%]">
           Enter your booking ID to view details, track status, or make changes
        </p>
      </motion.div>
    </section>
    )
}