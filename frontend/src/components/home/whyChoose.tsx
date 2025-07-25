import { motion } from "framer-motion";
import { Heart, Clock, Star, MessageCircle } from "lucide-react";

function WhyChoose() {
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
    <section className="flex flex-col items-center justify-center gap-4 py-20 text-center section-padding">
      <div className="container-max section-padding">
        <h1 className="text-4xl sm:text-5xl font-bold gradient-text pb-4 ">
          Why Choose Spread Love
        </h1>
        <p className="text-md sm:text-xl  text-gray-700 ">
        {`We're committed to creating authentic, heartfelt connections that
          matter`}
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
                className="col-span-1 card "
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
  );
}

export default WhyChoose;
