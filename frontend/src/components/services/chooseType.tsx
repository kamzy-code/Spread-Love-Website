"use client";
import { motion } from "framer-motion";
import { Phone, CalendarCheck } from "lucide-react";

function ChooseType() {
  const types = [
    {
      icon: <Phone className="w-12 h-12 text-brand-end" />,
      name: "Regular Call",
      description:
        "Instantly connect with a loved one for a heartfelt chat. It's quick, secure, and available anytime you need to spread love.",
    },
    {
      icon: <CalendarCheck className="w-12 h-12 text-brand-end" />,
      name: "Special Call",
      role: "Scheduled & Group Option",
      description:
        "Celebrate special moments like birthdays, anniversaries, or other celebrations with a personalized call — includes a special song feature for an unforgettable experience.",
    },
  ];

  return (
    <section className="section-padding py-20">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="container-max section-padding flex flex-col justify-center items-center text-center gap-4 mb-10"
      >
        <h1 className="gradient-text text-5xl lg:text-6xl font-bold pb-2">
          Choose Your Call type
        </h1>
        <p className="text-gray-700 text-lg lg:text-xl md:max-w-[60%] ">
          Select the perfect format for your surprise call
        </p>
      </motion.div>

      <div className="container-max section-padding grid grid-cols-1 md:grid-cols-2 gap-8">
        {types.map((type, index) => (
          <div key={index} className="w-full flex justify-center">
            <motion.div
              initial={{ opacity: 0, x: parseInt(`${index > 0 ? 20 : -20}`) }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card flex flex-col items-center text-center p-6 gap-6 max-w-120"
            >
              <div>{type.icon}</div>
              <h2 className="text-2xl text-brand-start font-semibold">
                {type.name}
              </h2>
              <p className="text-gray-700 text-md mb-4">{type.description}</p>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ChooseType;
