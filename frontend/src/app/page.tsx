"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Phone,
  Users,
  Clock,
  Star,
  Play,
  Pause,
  CheckCircle,
  Gift,
  Smile,
  MessageCircle,
} from "lucide-react";

export default function Home() {
  const [playingVid, setPlayingVid] = useState<number | null>(null);
  const videoRefs = [
    useRef<HTMLVideoElement>(null),
    useRef<HTMLVideoElement>(null),
    useRef<HTMLVideoElement>(null),
  ];

  const steps = [
    {
      icon: <Gift className="h-12 w-12" />,
      title: "Choose Occasion",
      description:
        "Select from birthdays, anniversaries, friendship calls, and more special moments.",
    },
    {
      icon: <Users className="h-12 w-12" />,
      title: "Fill Details",
      description:
        "Provide recipient details and your personalized message for the perfect surprise.",
    },
    {
      icon: <Phone className="h-12 w-12" />,
      title: "We Call",
      description:
        "Our trained representatives make the call at your preferred time.",
    },
    {
      icon: <Smile className="h-12 w-12" />,
      title: "They Smile",
      description:
        "Watch as your loved one's face lights up with joy and surprise!",
    },
  ];

  const samples = [
    {
      video: "/call-samples/call-sample-1.mp4",
      title: "Birthday Call",
      description: "A heartfelt birthday surprise for your loved one.",
    },
    {
      video: "/call-samples/call-sample-1.mp4",
      title: "Anniversary Call",
      description: "Celebrate love with a special anniversary message.",
    },
    {
      video: "/call-samples/call-sample-1.mp4",
      title: "Friendship Call",
      description: "Cherish your friendship with a surprise call.",
    },
  ];
  const features = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Personalized Touch",
      description:
        "Every call is customized with your personal message and occasion details.",
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Fast Delivery",
      description:
        "Same-day calls available. Perfect for last-minute surprises.",
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Professional Service",
      description:
        "Trained representatives ensure every call is memorable and heartfelt.",
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "24/7 Support",
      description:
        "Round-the-clock customer support for all your questions and needs.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      {/* Hero Section */}
      <section className="gradient-background py-40 ">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="container-max section-padding flex flex-col items-center justify-center text-white text-center gap-4 "
        >
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-handwritten font-bold mb-4">
            Spread Love
          </h1>
          <p className="text-2xl md:text-4xl font-semibold mb-4 text-primary-200">
            Make Someone's Day with a Surprise Call
          </p>
          <p className="text-lg md:text-2xl font-normal">
            Personalized Phone calls for birthdays, anniversaries, and special
            moments
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-white flex flex-col sm:flex-row gap-8 w-full justify-center p-10 mt-10"
        >
          <button className="btn-primary sm:w-auto w-full">Book a call</button>
          <button className="btn-secondary sm:w-auto w-full">
            View call Samples
          </button>
        </motion.div>
      </section>

      {/* How it Works */}
      <section className="flex flex-col items-center justify-center gap-4 py-20 text-center section-padding">
        <h1 className="text-4xl sm:text-5xl font-bold gradient-text ">
          How It Works
        </h1>
        <p className="text-md sm:text-xl  text-gray-700 ">
          Four simple steps to create unforgettable moments for your loved ones
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 container-max section-padding mt-10">
          {steps.map((step, index) => {
            return (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="flex flex-col items-center justify-center gap-8 card p-6 h-70 lg:h-90 ">
                  <div className="text-brand-end">{step.icon}</div>
                  <h2 className="text-xl font-semibold text-brand-start">
                    {step.title}
                  </h2>
                  <p className="text-gray-700">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Experience the Magic */}
      <section className="flex flex-col items-center justify-center gap-4 py-20 text-center section-padding gradient-background-soft">
        <h1 className="text-4xl sm:text-5xl font-bold gradient-text pb-4 ">
          Experience the Magic
        </h1>
        <p className="text-md sm:text-xl  text-gray-700 ">
          Listen to real call samples and see how we create magical moments
        </p>

        <div className="flex flex-wrap gap-12 items-center justify-center section-padding mt-10">
          {samples.map((sample, index) => {
            return (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center card "
              >
                <video
                  ref={videoRefs[index]}
                  className="rounded-t-lg  h-50 w-70 sm:h-60 sm:w-80 object-cover "
                >
                  <source src={sample.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                <div className="flex flex-row items-center justify-center py-4 hover:scale-105  transition-transform duration-300">
                  {playingVid === index ? (
                    <Pause
                      className="h-8 w-8 text-brand-end"
                      onClick={() => {
                        if (videoRefs[index].current) {
                          videoRefs[index].current.pause();
                          setPlayingVid(null);
                        }
                      }}
                    />
                  ) : (
                    <Play
                      className="h-8 w-8 text-brand-end"
                      onClick={() => {
                        if (videoRefs[index].current) {
                          videoRefs.forEach((videoRef, i) => {
                            if (videoRef.current && i !== index)
                              videoRef.current.pause();
                          });
                          videoRefs[index].current.play();
                          setPlayingVid(index);
                        }
                      }}
                    />
                  )}
                  <h2 className="text-2xl font-semibold text-brand-start">
                    {sample.title}
                  </h2>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}
