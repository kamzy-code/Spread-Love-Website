import { motion} from "framer-motion";
import { Phone, Users, Gift, Smile } from "lucide-react";

function HowItWorks() {
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

  return (
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
  );
}

export default HowItWorks;
