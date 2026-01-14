'use client'
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageCircle,} from "lucide-react";

function ContactInfo() {
const contactInfo = [
    {
        icon: <Phone className="h-6 w-6" />,
        title: "Phone",
        details: "+234 812 851 1397",
        description: "Mon-Sat 7:30AM-8PM WAT",
    },
    {
        icon: <Mail className="h-6 w-6" />,
        title: "Email",
        details: "spreadlovenetwork@gmail.com",
        description: "We reply within 24 hours",
    },
    {
        icon: <MessageCircle className="h-6 w-6" />,
        title: "WhatsApp",
        details: "+234 901 753 9148",
        description: "Instant support available",
    },
    {
        icon: <MapPin className="h-6 w-6" />,
        title: "Office",
        details: "Owerri, Imo State",
        description: "Nigeria",
    },
];

  return (
    <section className="gradient-background-soft">
      <div className="container-max section-padding grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-15 px-10">
        {contactInfo.map((info, index) => {
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card flex flex-col items-center text-center p-6"
            >
              <div className="w-12 h-12 rounded-full text-brand-end flex items-center justify-center mb-1">
                {info.icon}
              </div>
              <h2 className="text-xl text-brand-start font-semibold mb-3">
                {info.title}
              </h2>
              <p className="text-gray-700 text-md font-semibold mb-2">
                {info.details}
              </p>
              <p className="text-gray-700 ">{info.description}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export default ContactInfo;
