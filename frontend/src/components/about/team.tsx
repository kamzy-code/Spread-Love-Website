import Image from "next/image";
import {motion } from "framer-motion";

function Team(){
      const team = [
    {
      name: "Udochukwu Ezinne",
      role: "Founder & CEO",
      image: "/team/ceo.png",
      description:
        "Passionate about connecting people and creating meaningful moments.",
    },
    {
      name: "Ike Blessing",
      role: "Lead Representative",
      image: "/team/lead-rep.jpg",
      description: "Ensures every call is delivered with perfection and care.",
    },
    {
      name: "Njoku Victoria",
      role: "Sales Representative",
      image: "/team/sales-rep.jpg",
      description: "Dedicated to making every customer experience exceptional.",
    },
    {
      name: "Somtochukwu Favour",
      role: "Call Representative",
      image: "/team/call-rep.jpg",
      description:
        "Master of creating heartfelt connections through every call.",
    },
  ];
  
return (<section className="section-padding py-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="container-max section-padding flex flex-col justify-center items-center text-center gap-4 mb-10"
          >
            <h1 className="gradient-text text-5xl lg:text-6xl font-bold">
              Meet Our Team
            </h1>
            <p className="text-gray-700 text-lg lg:text-xl md:max-w-[60%] ">
              The passionate people behind every magical moment we create
            </p>
          </motion.div>

          <div className="container-max section-padding grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card flex flex-col items-center text-center p-6"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h2 className="text-xl text-brand-start font-semibold">
                  {member.name}
                </h2>
                <p className="text-brand-end text-md mb-4">{member.role}</p>
                <p className="text-gray-700 text-sm">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </section>)
}

export default Team;