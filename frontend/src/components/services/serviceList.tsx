"use client";
import Image from "next/image";
import { useState } from "react";
import {
  Gift,
  Heart,
  Users,
  GraduationCap,
  PartyPopper,
  Cake,
  Phone,
  Sun,
  Globe,
  MapPin,
} from "lucide-react";
import Link from "next/link";

export const services = [
  {
    id: 1,
    icon: <Cake className="h-8 w-8" />,
    title: "Birthday Surprise Calls",
    description:
      "Make their special day unforgettable with a personalized birthday call filled with wishes, songs, and joy.",
    type: {
      regular: {
        features: [
          "Deliver your heartfelt birthday message",
          "Includes a cheerful celebration tip",
        ],
        localPrice: "2000",
        internationalPrice: "3000",
      },
      special: {
        features: [
          "Deliver your heartfelt birthday message",
          "Includes a cheerful celebration tip",
          "Personalized birthday song option",
        ],
        localPrice: "2500",
        internationalPrice: "3500",
      },
    },
    category: "celebration",
    thumbnail:
      "https://images.unsplash.com/photo-1545696563-af8f6ec2295a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YmlydGhkYXklMjBjYWtlfGVufDB8fDB8fHww",
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
          "Deliver your loving anniversary message",
          "Includes a romantic memory highlight",
        ],
        localPrice: "2000",
        internationalPrice: "3000",
      },
      special: {
        features: [
          "Deliver your loving anniversary message",
          "Includes a romantic memory highlight",
          "Personalized anniversary song option",
        ],
        localPrice: "2500",
        internationalPrice: "3500",
      },
    },
    category: "celebration",
    thumbnail:
      "https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
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
          "Deliver your thoughtful friendship message",
          "Includes a fun memory share",
        ],
        localPrice: "2500",
        internationalPrice: "3000",
      },
      special: {
        features: [
          "Deliver your thoughtful friendship message",
          "Includes a fun memory share",
          "Personalized friendship song option",
        ],
        localPrice: "3000",
        internationalPrice: "3500",
      },
    },
    category: "relationship",
    thumbnail:
      "https://images.unsplash.com/photo-1665686377065-08ba896d16fd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGZyaWVuZHNoaXB8ZW58MHx8MHx8fDA%3D",
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
          "Deliver your congratulatory graduation message",
          "Includes a motivational quote",
        ],
        localPrice: "2000",
        internationalPrice: "3000",
      },
      special: {
        features: [
          "Deliver your congratulatory graduation message",
          "Includes a motivational quote",
          "Personalized graduation song option",
        ],
        localPrice: "2500",
        internationalPrice: "3500",
      },
    },
    category: "achievement",
    thumbnail:
      "https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  },
  {
    id: 5,
    icon: <PartyPopper className="h-8 w-8" />,
    title: "Congratulatory Calls",
    description:
      "Welcome new arrivals and achievements with joyful calls that celebrate success.",
    type: {
      regular: {
        features: [
          "Deliver your congratulatory message",
          "Includes a joyful celebration tip",
        ],
        localPrice: "2000",
        internationalPrice: "3000",
      },
      special: {
        features: [
          "Deliver your congratulatory message",
          "Includes a joyful celebration tip",
          "Personalized congratulatory song option",
        ],
        localPrice: "2500",
        internationalPrice: "3500",
      },
    },
    category: "celebration",
    thumbnail:
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
          "Deliver your festive holiday message",
          "Includes a seasonal greeting",
        ],
        localPrice: "2000",
        internationalPrice: "3000",
      },
      special: {
        features: [
          "Deliver your festive holiday message",
          "Includes a seasonal greeting",
          "Personalized holiday song option",
        ],
        localPrice: "2500",
        internationalPrice: "3500",
      },
    },
    category: "holiday",
    thumbnail:
      "https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
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
          "Deliver your romantic message",
          "Includes a sweet compliment",
        ],
        localPrice: "3000",
        internationalPrice: "3500",
      },
      special: {
        features: [
          "Deliver your romantic message",
          "Includes a sweet compliment",
          "Personalized romantic song option",
        ],
        localPrice: "3500",
        internationalPrice: "4000",
      },
    },
    category: "relationship",
    thumbnail:
      "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
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
          "Deliver your heartfelt apology message",
          "Includes a gesture of reconciliation",
        ],
        localPrice: "2500",
        internationalPrice: "3500",
      },
      special: {
        features: [
          "Deliver your heartfelt apology message",
          "Includes a gesture of reconciliation",
          "Personalized apology song option",
        ],
        localPrice: "3000",
        internationalPrice: "4000",
      },
    },
    category: "relationship",
    thumbnail:
      "https://cdn.pixabay.com/photo/2020/06/05/16/27/excuse-me-5263696_960_720.jpg",
  },
  {
    id: 9,
    icon: <Sun className="h-8 w-8" />,
    title: "Encouragement/Cheer Up Calls",
    description:
      "Lift spirits and motivate loved ones with uplifting calls designed to encourage and inspire.",
    type: {
      regular: {
        features: [
          "Deliver your encouraging message",
          "Includes a positive affirmation",
        ],
        localPrice: "2000",
        internationalPrice: "3000",
      },
      special: {
        features: [
          "Deliver your encouraging message",
          "Includes a positive affirmation",
          "Personalized encouragement song option",
        ],
        localPrice: "2500",
        internationalPrice: "3500",
      },
    },
    category: "achievement",
    thumbnail:
      "https://images.unsplash.com/photo-1721059050927-dfad8ff13e07?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 10,
    icon: <Heart className="h-8 w-8" />,
    title: "Appreciation Call",
    description:
      "Show gratitude and appreciation to someone special with a heartfelt call that makes their day.",
    type: {
      regular: {
        features: [
          "Deliver your appreciation message",
          "Includes a thank you note",
        ],
        localPrice: "2000",
        internationalPrice: "3000",
      },
      special: {
        features: [
          "Deliver your appreciation message",
          "Includes a thank you note",
          "Personalized appreciation song option",
        ],
        localPrice: "2500",
        internationalPrice: "3500",
      },
    },
    category: "relationship",
    thumbnail:
      "https://cdn.pixabay.com/photo/2015/09/17/13/18/thank-you-944086_1280.jpg",
  },
  {
    id: 11,
    icon: <Users className="h-8 w-8" />,
    title: "Father's Day Call",
    description:
      "Honor fathers with a special call filled with love, gratitude, and memorable moments.",
    type: {
      regular: {
        features: [
          "Deliver your Father's Day message",
          "Includes a special dad tribute",
        ],
        localPrice: "2500",
        internationalPrice: "3000",
      },
      special: {
        features: [
          "Deliver your Father's Day message",
          "Includes a special dad tribute",
          "Personalized Father's Day song option",
        ],
        localPrice: "3000",
        internationalPrice: "3500",
      },
    },
    category: "celebration",
    thumbnail:
      "https://images.unsplash.com/photo-1605812830455-2fadc55bc4ba?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 12,
    icon: <Users className="h-8 w-8" />,
    title: "Mother's Day Call",
    description:
      "Celebrate mothers with a loving call that expresses gratitude, love, and admiration.",
    type: {
      regular: {
        features: [
          "Deliver your Mother's Day message",
          "Includes a special mom tribute",
        ],
        localPrice: "2500",
        internationalPrice: "3000",
      },
      special: {
        features: [
          "Deliver your Mother's Day message",
          "Includes a special mom tribute",
          "Personalized Mother's Day song option",
        ],
        localPrice: "3000",
        internationalPrice: "3500",
      },
    },
    category: "celebration",
    thumbnail:
      "https://images.unsplash.com/photo-1628191013085-990d39ec25b8?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 13,
    icon: <Heart className="h-8 w-8" />,
    title: "Valentine's Day Call",
    description:
      "Express your love and affection with a romantic call, perfect for Valentine's Day.",
    type: {
      regular: {
        features: [
          "Deliver your Valentine's Day message",
          "Includes a romantic gesture",
        ],
        localPrice: "2500",
        internationalPrice: "3500",
      },
      special: {
        features: [
          "Deliver your Valentine's Day message",
          "Includes a romantic gesture",
          "Personalized Valentine's Day song option",
        ],
        localPrice: "3000",
        internationalPrice: "4000",
      },
    },
    category: "relationship",
    thumbnail:
      "https://images.unsplash.com/photo-1487035242901-d419a42d17af?q=80&w=727&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },

  {
    id: 14,
    icon: <Users className="h-8 w-8" />,
    title: "Conference Surprise Call",
    description:
      "A group surprise call that brings multiple loved ones together to celebrate or cheer someone on—all at once. Perfect for creating unforgettable moments with a personal touch.",
    type: {
      regular: {
        features: [
          "Deliver your group celebration message",
          "Nigerian calls use standard phone networks; International calls are via WhatsApp",
        ],
        localPrice: "5000",
        internationalPrice: "6000",
      },
      special: {
        features: [
          "Deliver your group celebration message",
          "Nigerian calls use standard phone networks; International calls are via WhatsApp",
          "Personalized group song option",
        ],
        localPrice: "6000",
        internationalPrice: "7000",
      },
    },
    category: "group",
    thumbnail:
      "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
  {
    id: "group",
    name: "Group",
    count: services.filter((s) => s.category === "group").length,
  },
];

export const callType = [
  { id: "regular", name: "Regular" },
  { id: "special", name: "Special" },
];

function Services() {
  const [activeTab, setActiveTab] = useState("all");

  type serviceType = "regular" | "special";
  const [activeTypes, setActiveTypes] = useState<Record<number, serviceType>>(
    () => Object.fromEntries(services.map((service) => [service.id, "regular"]))
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
      <div className="container-max px-2 flex flex-wrap justify-center items-center py-20  gap-4 md:gap-8 border-t-2 border-gray-100">
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
        <div className="container-max section-padding grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-10 py-20  gap-8">
          {filteredServices.map((service, index) => {
            const activeType = activeTypes[service.id];
            return (
              <div key={index} className="w-full h-full">
                <div
                  key={service.id}
                  className="card overflow-hidden hover:shadow-2xl transition-all duration-300 w-full h-full relative flex flex-col"
                >
                  <div>
                    <Image
                      width={300}
                      height={300}
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

                    {/* Features */}
                    <ul className="space-y-2 ">
                      {service.type[activeType].features?.map(
                        (feature, idx) => {
                          return (
                            <li
                              key={idx}
                              className="flex items-center text-sm text-gray-600"
                            >
                              <div className="w-2 h-2 bg-brand-end rounded-full mr-3 shrink-0"></div>
                              {feature}
                            </li>
                          );
                        }
                      )}
                    </ul>
                  </div>

                  <div className="w-full px-6 bottom-0 mb-6">
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
                            {type.name} Call
                          </button>
                        );
                      })}
                    </div>

                    {/* Pricing */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          Local
                        </div>
                        <span className="text-lg font-bold text-brand-end">
                          N{service.type[activeType].localPrice}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Globe className="h-4 w-4 mr-1" />
                          International
                        </div>
                        <span className="text-lg font-bold text-brand-end">
                          N{service.type[activeType].internationalPrice}
                        </span>
                      </div>

                      <Link
                        href={`/book?occassion=${service.title}&call_type=${activeType}`}
                      >
                        <button className="w-full btn-primary">
                          Book This Service
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Services;
