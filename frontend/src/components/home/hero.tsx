import { motion } from "framer-motion";
import CTA from "./cta-btn";
import { useRouter } from "next/navigation";

function Hero() {
  const router = useRouter();
  const CTAonClick = () => router.push("/book");
  return (
    <section className="gradient-background py-40 min-h-screen flex flex-col justify-center items-center">
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
    </section>
  );
}

export default Hero;
