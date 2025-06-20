import { motion } from "framer-motion";
function FAQ() {
  const faqs = [
    {
      question: "How far in advance should I book a call?",
      answer:
        "We recommend booking at least 24 hours in advance, but we also offer same-day calls for urgent surprises (additional fees may apply).",
    },
    {
      question: "What if the recipient doesn't answer?",
      answer:
        "We'll make up to 3 attempts to reach them. If unsuccessful, we'll reschedule at no extra cost or provide a full refund.",
    },
    {
      question: "Can I customize what the representative says?",
      answer:
        "Absolutely! You can provide a personalized message, and our representatives will deliver it naturally and warmly.",
    },
    {
      question: "Do you offer international calls?",
      answer:
        "Yes, we provide calls to most countries worldwide. International rates apply and vary by destination.",
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
        <h1 className="gradient-text text-4xl md:text-5xl font-bold pb-2">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-700 text-md sm:text-lg lg:text-xl md:max-w-[60%] ">
          Find answers to common questions about our services
        </p>
      </motion.div>

      <div className="container-max section-padding grid grid-cols-1 sm:grid-cols-2 gap-6 lg:px-40">
        {faqs.map((faq, index) => {
          return (
            <motion.div
              key={index}
              initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              className="card flex flex-col gap-2 p-6 min-h-35 items-center "
            >
              <div className="">
                <p className="font-semibold text-md mb-1">{faq.question}</p>

                <p className="text-md text-gray-600">{faq.answer}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export default FAQ;
