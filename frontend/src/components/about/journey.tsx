import { motion } from "framer-motion";

function Journey() {
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

  return (
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
          Born from a simple belief: that everyone deserves to feel loved and
          remembered on their special day
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
  );
}

export default Journey;
