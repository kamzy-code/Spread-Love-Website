'use client';
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AboutCTA from "./aboutCTA";

function SpreadingLove() {
  const router = useRouter();
  const handleBookCall = () => router.push("/book");

  return (
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
            {`Spread Love Network was birthed and inspired through friendship.
            It's a brand that exists because a friend saw the possibilities and
            gifts of another and encouraged her to thread this path, as she had
            the ability to put smiles on people's faces.`}
          </p>

          <p className="text-gray-700 text-lg ">
            {`We started this journey on the 14th of February 2023, and officially
            launched as a brand on the 15th of March, 2023. Through the months,
            we've been able to celebrate and appreciate hundreds and thousands
            of people in and across the country.`}
          </p>

          <p className="text-gray-700 text-lg ">
            {` Today, we've helped thousands of people create unforgettable
            moments, proving that love knows no boundaries.`}
          </p>

          <AboutCTA handleBook={handleBookCall} border={true} />
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
  );
}

export default SpreadingLove;
