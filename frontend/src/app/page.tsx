"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import CTA from "@/components/ui/cta-btn";
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
  const router = useRouter();
  const CTAonClick = () => router.push("/book");

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
      description: "Our trained representatives make the call.",
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

  const testimonials = [
    {
      name: "Sarah Johnson",
      image:
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      text: "My mom was so surprised and happy! She couldn't stop talking about the birthday call for weeks. Thank you for making her day special!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      image:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      text: "The anniversary call was perfect! My wife was in tears of joy. The representative was so professional and heartfelt.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      image:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      text: "I live abroad and wanted to surprise my best friend. This service made it possible to be part of her special day!",
      rating: 5,
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
      <section className="gradient-background py-40 min-h-screen flex flex-col justify-center items-center ">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="container-max section-padding flex flex-col items-center justify-center text-white text-center gap-4 "
        >
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-handwritten font-bold mb-4">
            Spread Love Network
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
          <CTA onClickBook={CTAonClick} />
        </motion.div>

        {/* <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-white flex flex-col sm:flex-row gap-8 w-full justify-center p-10 mt-10"
        >
          <button className="btn-primary sm:w-auto w-full" onClick={()=>router.push("/book")}>Book a call</button>
          <button className="btn-secondary sm:w-auto w-full" onClick={() => document.getElementById("sample-section")?.scrollIntoView({ behavior: "smooth" })}>
            View call Samples
          </button>
        </motion.div> */}
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
      <section
        id="sample-section"
        className="flex flex-col items-center justify-center gap-4 py-20 text-center section-padding gradient-background-soft"
      >
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
                  <h2 className="text-xl md:text-2xl font-semibold text-brand-start">
                    {sample.title}
                  </h2>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Why Choose us */}
      <section className="flex flex-col items-center justify-center gap-4 py-20 text-center section-padding">
        <div className="container-max section-padding">
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text pb-4 ">
            Why Choose Spread Love
          </h1>
          <p className="text-md sm:text-xl  text-gray-700 ">
            We're committed to creating authentic, heartfelt connections that
            matter
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 items-center justify-center section-padding mt-10">
            {features.map((feature, index) => {
              return (
                <motion.div
                  key={index}
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="col-span-1 card"
                >
                  <div className="flex flex-col items-center justify-center gap-8 p-6 h-70 lg:h-90 ">
                    <div className="text-brand-end">{feature.icon}</div>
                    <h2 className="text-xl font-semibold text-brand-start">
                      {feature.title}
                    </h2>
                    <p className="text-gray-700">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stories of Joy */}
      <section className="flex flex-col items-center justify-center gap-4 py-20 text-center section-padding gradient-background-soft">
        <div className="container-max section-padding">

        <h1 className="text-4xl sm:text-5xl font-bold gradient-text pb-4 ">
          Stories of Joy
        </h1>
        <p className="text-md sm:text-xl  text-gray-700 ">
          Real stories from customers who spread love and created unforgettable
          moments
        </p>

        <div className="flex flex-col lg:flex-row gap-12 items-center justify-center px-10 mt-10 sm:mx-10">
          {testimonials.map((testimonial, index) => {
            return (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card h-auto lg:h-70 lg:max-w-70 px-5 py-10 lg:py-5 flex flex-col justify-center"
              >
                <div className="text-start">
                  <h2 className="text-lg font-semibold text-brand-start mb-2 ">
                    {testimonial.name}
                  </h2>
                  <div className="flex text-yellow-400 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>

                  <p className=" text-start text-gray-700 italic">
                  "{testimonial.text}"
                </p>
                </div>

                
              </motion.div>
            );
          })}
        </div>
        </div>
      </section>

      {/* Ready to spread love*/}
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
            Create a magical moment for someone special today. It only takes a
            few minutes to set up.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 * 0.1 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-8 w-full justify-center mt-5"
        >
          <CTA onClickBook={CTAonClick} />
        </motion.div>
      </section>
    </motion.div>
  );
}
