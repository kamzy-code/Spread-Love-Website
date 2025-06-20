import { Heart, Users, Globe, Award } from "lucide-react";
import { motion } from "framer-motion";

function Values() {
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
              <p className="text-gray-700 text-md mb-4">{value.description}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export default Values;
