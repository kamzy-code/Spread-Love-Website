import { motion } from "framer-motion";
import { Star } from "lucide-react";

function Stories() {
  const testimonials = [
    {
      name: "Mr. Gozeman",
      text: "Thank you so much. It was really a surprise to her, she never expected it. The moment gave her a perfect night. She loved it. Thank you so much @ spread love network.",
      rating: 5,
    },
    {
      name: "Mr. Tobi",
      text: "Thank you very much she was literally crying when she called me and I think it will bring us back together. Thank you ❤ God bless your service",
      rating: 5,
    },
    {
      name: "Mrs. Sobola",
      text: "You guys are the best thank you so much 🥰🥰🥰🥰🥰. Please tell me why I’m crying when I’m not the birthday girl 🥹🥹🥹. Thank you, thank you thank you. It’s was like you guys opened my heart to copy the words 🤭",
      rating: 5,
    },
    {
      name: "Mrs. Bisola",
      text: "Thanks so much, I’m so happy for that. He was just smiling and appreciating me, honestly I don’t know what to say because you just lifted my husband mood tonight. He hasn’t been happy for the past 3days now but tonight he is happy and was just hugging and kissing me. Thanks so much.",
      rating: 5,
    },
  ];

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-20 text-center section-padding gradient-background-soft">
      <div className="container-max section-padding">
        <h1 className="text-4xl sm:text-5xl font-bold gradient-text pb-4 ">
          Stories of Joy
        </h1>
        <p className="text-md sm:text-xl  text-gray-700 ">
          Real stories from customers who spread love and created unforgettable
          moments
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 px-10 mt-10 sm:mx-10">
          {testimonials.map((testimonial, index) => {
            return (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card w-full h-full px-5 py-10 lg:py-5 flex flex-col justify-center"
              >
                <div className="text-start">
                  <h2 className="text-lg font-semibold text-brand-start mb-2 ">
                    {testimonial.name}
                  </h2>
                  <div className="flex text-yellow-400 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>

                  <p className=" text-start text-gray-700 italic">
                    "{testimonial.text}"
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Stories;
