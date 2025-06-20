import { motion } from "framer-motion";
import { Star } from "lucide-react";

function Stories() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      image:
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      text: "My mom was so surprised and happy! She couldn't stop talking about the birthday call for weeks. Thank you for making her day special!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      image:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      text: "The anniversary call was perfect! My wife was in tears of joy. The representative was so professional and heartfelt.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      image:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      text: "I live abroad and wanted to surprise my best friend. This service made it possible to be part of her special day!",
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

        <div className="flex flex-col lg:flex-row gap-12 items-center justify-center px-10 mt-10 sm:mx-10">
          {testimonials.map((testimonial, index) => {
            return (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card h-auto lg:h-70 lg:max-w-70 px-5 py-10 lg:py-5 flex flex-col justify-center"
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
