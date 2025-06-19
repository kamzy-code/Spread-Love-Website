"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Heart, Users, Globe, Award, MessageCircle } from "lucide-react";
import Image from "next/image";
import AboutCTA from "@/components/ui/aboutCTA";

export default function About() {
  const router = useRouter();
  const handleBookCall = () => router.push("/book");


  const timeline = [
    {
      year: "2020",
      title: "The Idea",
      description:
        "Founded with a simple mission: to help people connect and spread love across distances.",
    },
    {
      year: "2021",
      title: "First Calls",
      description:
        "Made our first 100 surprise calls, bringing smiles to faces around the world.",
    },
    {
      year: "2022",
      title: "Going Global",
      description:
        "Expanded to serve customers internationally, connecting hearts across continents.",
    },
    {
      year: "2023",
      title: "10,000 Smiles",
      description:
        "Reached the milestone of 10,000 successful surprise calls and counting.",
    },
    {
      year: "2024",
      title: "Innovation",
      description:
        "Launched video calls and enhanced personalization features for even more magical moments.",
    },
  ];

  const team = [
    {
      name: "Udochukwu Ezinne",
      role: "Founder & CEO",
      image: "/team/ceo.png",
      description:
        "Passionate about connecting people and creating meaningful moments.",
    },
    {
      name: "Ike Blessing",
      role: "Lead Representative",
      image: "/team/lead-rep.jpg",
      description: "Ensures every call is delivered with perfection and care.",
    },
    {
      name: "Njoku Victoria",
      role: "Sales Representative",
      image: "/team/lead-rep.jpg",
      description: "Dedicated to making every customer experience exceptional.",
    },
    {
      name: "Somtochukwu Favour",
      role: "Call Representative",
      image: "/team/lead-rep.jpg",
      description:
        "Master of creating heartfelt connections through every call.",
    },
  ];

  const values = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Authenticity",
      description:
        "Every call is genuine, heartfelt, and tailored to create real emotional connections.",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Empathy",
      description:
        "We understand the importance of special moments and treat each call with care.",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Accessibility",
      description:
        "Making surprise calls available to everyone, everywhere, at affordable prices.",
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Excellence",
      description:
        "Committed to delivering the highest quality service in every interaction.",
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen"
      >
        {/* Our Story */}
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
              Our Story
            </h1>
            <p className="text-primary-200 text-lg md:text-2xl max-w-[80%] lg:max-w-[60%]">
              Born from a simple belief: that everyone deserves to feel loved
              and remembered on their special day
            </p>
          </motion.div>
        </section>

        {/* Spreading Love */}
        <section className="">
          <div className="container-max flex flex-col-reverse md:flex-row items-center justify-center gap-12 md:gap-4 section-padding py-20">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="container-max section-padding flex flex-col gap-4 md:max-w-[60%]"
            >
              <h1 className="gradient-text text-3xl md:text-4xl font-bold pb-4">
                Spreading Love, One Call at a Time
              </h1>
              <p className="text-gray-700 text-lg ">
                Spread Love was born from a personal experience. Our founder,
                Sarah, was living abroad and missed her grandmother's 90th
                birthday. She wanted to do something special but felt limited by
                distance.
              </p>

              <p className="text-gray-700 text-lg ">
                That's when the idea struck: what if there was a service that
                could help people create meaningful connections and surprise
                their loved ones, no matter where they are in the world?
              </p>

              <p className="text-gray-700 text-lg ">
                Today, we've helped thousands of people create unforgettable
                moments, proving that love knows no boundaries.
              </p>

              <AboutCTA handleBook={handleBookCall} border={true}/>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="container-max section-padding flex flex-col "
            >
              <Image
                width={300}
                height={300}
                src="/about-pic.jpg"
                alt="About Us"
                className="rounded-lg shadow-lg"
              />
            </motion.div>
          </div>
        </section>

        {/* our journey */}
        <section className="gradient-background-soft section-padding py-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="container-max section-padding flex flex-col justify-center items-center text-center gap-4 mb-10"
          >
            <h1 className="gradient-text text-5xl lg:text-6xl font-bold pb-2">
              Our Journey
            </h1>
            <p className="text-gray-700 text-lg lg:text-xl md:max-w-[60%] ">
              Born from a simple belief: that everyone deserves to feel loved
              and remembered on their special day
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {timeline.map((item, index) => {
              return (
                <motion.div
                  key={index}
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  } items-center gap-4 mb-8`}
                >
                  <div
                    className={`card space-y-2 container-max section-padding max-w-[45%] mx-5 md:mx-10  py-4 ${
                      index % 2 === 0 ? "text-right pr-8" : "text-left pl-8"
                    }`}
                  >
                    <h2 className="text-2xl font-bold text-brand-end">
                      {item.year}
                    </h2>
                    <h3 className="text-xl font-semibold text-brand-start">
                      {item.title}
                    </h3>
                    <p className="text-gray-700">{item.description}</p>
                  </div>
                  <div className="h-4 w-4 rounded-full gradient-background flex shrink-0"></div>
                </motion.div>
              );
            })}
          </div>

          <div className="container-max flex flex-col items-center justify-center gap 4"></div>
        </section>

        {/* meet our team */}
        <section className="section-padding py-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="container-max section-padding flex flex-col justify-center items-center text-center gap-4 mb-10"
          >
            <h1 className="gradient-text text-5xl lg:text-6xl font-bold">
              Meet Our Team
            </h1>
            <p className="text-gray-700 text-lg lg:text-xl md:max-w-[60%] ">
              The passionate people behind every magical moment we create
            </p>
          </motion.div>

          <div className="container-max section-padding grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card flex flex-col items-center text-center p-6"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h2 className="text-xl text-brand-start font-semibold">
                  {member.name}
                </h2>
                <p className="text-brand-end text-md mb-4">{member.role}</p>
                <p className="text-gray-700 text-sm">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* our values */}
        <section className="section-padding py-20 gradient-background-soft">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="container-max section-padding flex flex-col justify-center items-center text-center gap-4 mb-10"
          >
            <h1 className="gradient-text text-5xl lg:text-6xl font-bold pb-2">
              Our Values
            </h1>
            <p className="text-gray-700 text-lg lg:text-xl md:max-w-[60%] ">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="container-max section-padding grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              return (
                <motion.div
                  key={index}
                  className="flex flex-col items-center text-center gap-2 mt-4 section-padding"
                >
                  <div className="text-brand-end">{value.icon}</div>
                  <h2 className="text-xl text-brand-start font-semibold">
                    {value.title}
                  </h2>
                  <p className="text-gray-700 text-md mb-4">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Join Our Mission */}
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
              Join Our Mission
            </h1>
            <p className="text-primary-200 text-lg md:text-2xl max-w-[80%] lg:max-w-[60%]">
              Be part of spreading love and creating unforgettable moments. Your
              next surprise call could make someone's entire year. Book a Call
            </p>

             <AboutCTA handleBook={handleBookCall} border={false}/>
          </motion.div>
        </section>
      </motion.div>
    </AnimatePresence>
  );
}
