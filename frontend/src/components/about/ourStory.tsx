import { motion } from "framer-motion";

function Story() {
  return (
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
          Born from a simple belief: that everyone deserves to feel loved and
          remembered on their special day
        </p>
      </motion.div>
    </section>
  );
}

export default Story;
