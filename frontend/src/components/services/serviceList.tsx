"use client";
import { motion } from "framer-motion";
import { RefObject } from "react";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import {
  Gift,
  Heart,
  Users,
  GraduationCap,
  Baby,
  Cake,
  Play,
  Phone,
  Video,
  Globe,
  MapPin,
} from "lucide-react";

function Services() {
  const services = [
    {
      id: 1,
      icon: <Cake className="h-8 w-8" />,
      title: "Birthday Surprise Calls",
      description:
        "Make their special day unforgettable with a personalized birthday call filled with wishes, songs, and joy.",

      type: {
        regular: {
          features: [
            "Personalized birthday song",
            "Custom message delivery",
            "Photo sharing option",
          ],
          localPrice: "N2500",
          internationalPrice: "N3500",
        },
        special: {
          features: [
            "Personalized birthday song",
            "Custom message delivery",
            "Photo sharing option",
          ],
          localPrice: "N2500",
          internationalPrice: "N3500",
        },
      },

      category: "celebration",
      thumbnail: "/about-pic.jpg",
    },
    {
      id: 2,
      icon: <Heart className="h-8 w-8" />,
      title: "Anniversary Wishes",
      description:
        "Celebrate love and milestones with heartfelt anniversary calls that honor special relationships.",
      type: {
        regular: {
          features: [
            "Romantic message delivery",
            "Memory sharing",
            "Couple's blessing",
          ],
          localPrice: "N3000",
          internationalPrice: "N3500",
        },
        special: {
          features: [
            "Romantic message delivery",
            "Memory sharing",
            "Couple's blessing",
          ],
          localPrice: "N3000",
          internationalPrice: "N3500",
        },
      },

      category: "celebration",
      thumbnail: "/about-pic.jpg",
    },
    {
      id: 3,
      icon: <Users className="h-8 w-8" />,
      title: "Friendship Reconnection",
      description:
        "Surprise old friends and strengthen bonds with unexpected calls that bring back beautiful memories.",
      type: {
        regular: {
          features: [
            "Memory lane conversation",
            "Friendship appreciation",
            "Future plans discussion",
          ],
          localPrice: "N2500",
          internationalPrice: "N3500",
        },
        special: {
          features: [
            "Memory lane conversation",
            "Friendship appreciation",
            "Future plans discussion",
          ],
          localPrice: "N2500",
          internationalPrice: "N3500",
        },
      },

      category: "relationship",
      thumbnail: "/about-pic.jpg",
    },
    {
      id: 4,
      icon: <GraduationCap className="h-8 w-8" />,
      title: "Graduation Congratulations",
      description:
        "Honor academic achievements with congratulatory calls that celebrate hard work and success.",
      type: {
        regular: {
          features: [
            "Achievement recognition",
            "Future wishes",
            "Motivational message",
          ],
          localPrice: "N2000",
          internationalPrice: "N3000",
        },
        special: {
          features: [
            "Achievement recognition",
            "Future wishes",
            "Motivational message",
          ],
          localPrice: "N2000",
          internationalPrice: "N3000",
        },
      },

      category: "achievement",
      thumbnail: "/about-pic.jpg",
    },
    {
      id: 5,
      icon: <Baby className="h-8 w-8" />,
      title: "Congratulatory Calls",
      description:
        "Welcome new arrivals and achievements with joyful calls that celebrate success.",
      type: {
        regular: {
          features: ["Baby blessing", "Parenting wishes", "Family celebration"],
          localPrice: "N2000",
          internationalPrice: "N3000",
        },
        special: {
          features: ["Baby blessing", "Parenting wishes", "Family celebration"],
          localPrice: "N2000",
          internationalPrice: "N3000",
        },
      },

      category: "celebration",
      thumbnail: "/about-pic.jpg",
    },
    {
      id: 6,
      icon: <Gift className="h-8 w-8" />,
      title: "Holiday Greetings",
      description:
        "Spread holiday cheer with seasonal calls that bring warmth and joy during special times of year.",
      type: {
        regular: {
          features: [
            "Holiday-themed messages",
            "Seasonal songs",
            "Cultural celebrations",
          ],
          localPrice: "N2000",
          internationalPrice: "N3000",
        },
        special: {
          features: [
            "Holiday-themed messages",
            "Seasonal songs",
            "Cultural celebrations",
          ],
          localPrice: "N2000",
          internationalPrice: "N3000",
        },
      },

      category: "holiday",
      thumbnail: "/about-pic.jpg",
    },
    {
      id: 7,
      icon: <Heart className="h-8 w-8" />,
      title: "Romantic Calls",
      description:
        "Express your love and affection with a heartfelt romantic call, perfect for anniversaries, proposals, or just because.",
      type: {
        regular: {
          features: [
            "Personalized love message",
            "Poetry or song option",
            "Special date reminders",
          ],
          localPrice: "N3000",
          internationalPrice: "N4000",
        },
        special: {
          features: [
            "Personalized love message",
            "Poetry or song option",
            "Special date reminders",
          ],
          localPrice: "N3000",
          internationalPrice: "N4000",
        },
      },

      category: "relationship",
      thumbnail: "/about-pic.jpg",
    },
    {
      id: 8,
      icon: <Phone className="h-8 w-8" />,
      title: "Apology Calls",
      description:
        "Mend relationships and say sorry with a sincere apology call, delivered with empathy and understanding.",
      type: {
        regular: {
          features: [
            "Custom apology message",
            "Mediation support",
            "Follow-up encouragement",
          ],
          localPrice: "N2500",
          internationalPrice: "N3500",
        },
        special: {
          features: [
            "Custom apology message",
            "Mediation support",
            "Follow-up encouragement",
          ],
          localPrice: "N2500",
          internationalPrice: "N3500",
        },
      },

      category: "relationship",
      thumbnail: "/about-pic.jpg",
    },
    {
      id: 9,
      icon: <Play className="h-8 w-8" />,
      title: "Encouragement/Cheer Up Calls",
      description:
        "Lift spirits and motivate loved ones with uplifting calls designed to encourage and inspire.",
      type: {
        regular: {
          features: [
            "Motivational message",
            "Positive affirmations",
            "Personalized support",
          ],
          localPrice: "N2000",
          internationalPrice: "N3000",
        },
        special: {
          features: [
            "Motivational message",
            "Positive affirmations",
            "Personalized support",
          ],
          localPrice: "N2000",
          internationalPrice: "N3000",
        },
      },

      category: "achievement",
      thumbnail: "/about-pic.jpg",
    },
  ];

  const categories = [
    { id: "all", name: "All Services", count: services.length },
    {
      id: "celebration",
      name: "Celebrations",
      count: services.filter((s) => s.category === "celebration").length,
    },
    {
      id: "relationship",
      name: "Relationship",
      count: services.filter((s) => s.category === "relationship").length,
    },
    {
      id: "achievement",
      name: "Achievements",
      count: services.filter((s) => s.category === "achievement").length,
    },
    {
      id: "holiday",
      name: "Holidays",
      count: services.filter((s) => s.category === "holiday").length,
    },
  ];

  const callType = [
    { id: "regular", name: "Regular" },
    { id: "special", name: "Special" },
  ];

  const [activeTab, setActiveTab] = useState("all");

  type serviceType = "regular" | "special";
  const [activeTypes, setActiveTypes] = useState<Record<number, serviceType>>(
    () =>
      Object.fromEntries(services.map((service, _) => [service.id, "regular"]))
  );

  const handleTypeChange = (ServiceId: number, type: serviceType) => {
    setActiveTypes((prev) => ({ ...prev, [ServiceId]: type }));
  };

  const filteredServices =
    activeTab === "all"
      ? services
      : services.filter((s) => s.category === activeTab);

  return (
    <section>
      <div className="container-max px-2 flex flex-wrap justify-center items-center py-20  gap-4 md:gap-8">
        {categories.map((category, index) => {
          return (
            <button
              key={index}
              onClick={() => setActiveTab(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                activeTab === category.id
                  ? "gradient-background text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {`${category.name} (${category.count})`}
            </button>
          );
        })}
      </div>

      <div className="gradient-background-soft">
        <motion.div
          layout
          className="container-max section-padding grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-10 py-20  gap-8"
        >
          {filteredServices.map((service, index) => {
            const activeType = activeTypes[service.id];
            return (
              <div key={index} className="w-full h-full">
                <motion.div
                  key={service.id}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  layout
                  className="card overflow-hidden hover:shadow-2xl transition-all duration-300 w-full h-full relative flex flex-col"
                >
                  <div>
                    <Image
                      width={48}
                      height={48}
                      src={service.thumbnail}
                      alt={service.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center mb-4">
                      <div className="text-brand-end mr-3">{service.icon}</div>
                      <h3 className="text-xl font-semibold">{service.title}</h3>
                    </div>

                    <p className="text-gray-600 mb-4">{service.description}</p>

                  
                  </div>

                  <div className="w-full px-6 bottom-0 mb-6">
                    {/* Pricing */}
                      {/* filter buttons */}
                    <div className="flex flex-row gap-4 mb-4">
                      {callType.map((type, index) => {
                        return (
                          <button
                            key={index}
                            onClick={() => {
                              handleTypeChange(
                                service.id,
                                type.id as serviceType
                              );
                            }}
                            className={`rounded-md px-4 py-2 font-semibold ${
                              type.id === activeType
                                ? "gradient-background text-white"
                                : "bg-gray-200 hover:bg-gray-300"
                            }`}
                          >
                            {" "}
                            {type.name}
                          </button>
                        );
                      })}
                    </div>
                    {/* Features */}
                    <h2>{activeType}</h2>
                    <ul className="space-y-2 mb-4">
                      {service.type[activeType].features.map((feature, idx) => {
                        return (
                          <li
                            key={idx}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <div className="w-2 h-2 bg-brand-end rounded-full mr-3"></div>
                            {feature}
                          </li>
                        );
                      })}
                    </ul>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          Local
                        </div>
                        <span className="text-lg font-bold text-brand-end">
                          {service.type[activeType].localPrice}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Globe className="h-4 w-4 mr-1" />
                          International
                        </div>
                        <span className="text-lg font-bold text-brand-end">
                          {service.type[activeType].internationalPrice}
                        </span>
                      </div>

                      <button className="w-full btn-primary">
                        Book This Service
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default Services;
