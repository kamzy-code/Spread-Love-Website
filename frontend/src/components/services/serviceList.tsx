"use client";
import Image from "next/image";
import { useState } from "react";
import { MapPin, Globe, XCircle } from "lucide-react";
import Link from "next/link";
import { getServiceIcon } from "@/lib/serviceIcons";
import { useFetchServices } from "@/hooks/useServices";
import MiniLoader from "../(admin)/ui/miniLoader";

export const callType = [
  { id: "regular", name: "Regular" },
  { id: "special", name: "Special" },
];

function Services() {
  const { data: services, isLoading, error, refetch } = useFetchServices();
  const [activeTab, setActiveTab] = useState("all");

  type serviceType = "regular" | "special";
  const [activeTypes, setActiveTypes] = useState<Record<string, serviceType>>({});

  const handleTypeChange = (serviceId: string, type: serviceType) => {
    setActiveTypes((prev) => ({ ...prev, [serviceId]: type }));
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <MiniLoader></MiniLoader>
      </div>
    );
  }

  if (error || !services) {
    return (
      <div className="py-20 flex flex-col items-center gap-4 text-gray-500">
        <XCircle className="h-8 w-8 text-red-500" />
        <p>Failed to load services</p>
        <button className="btn-primary rounded-lg px-6 py-2" onClick={() => refetch()}>
          Try again
        </button>
      </div>
    );
  }

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
  ].filter((c) => c.id === "all" || c.count > 0);

  const filteredServices =
    activeTab === "all" ? services : services.filter((s) => s.category === activeTab);

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
          {filteredServices.map((service) => {
            const activeType = activeTypes[service._id] ?? "regular";
            const pricing = service[activeType];
            return (
              <div key={service._id} className="w-full h-full">
                <div className="card overflow-hidden hover:shadow-2xl transition-all duration-300 w-full h-full relative flex flex-col">
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
                      <div className="text-brand-end mr-3">
                        {getServiceIcon(service.iconKey)}
                      </div>
                      <h3 className="text-xl font-semibold">{service.title}</h3>
                    </div>

                    <p className="text-gray-600 mb-4">{service.description}</p>

                    {/* Features */}
                    <ul className="space-y-2 ">
                      {pricing.features?.map((feature, idx) => {
                        return (
                          <li
                            key={idx}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <div className="w-2 h-2 bg-brand-end rounded-full mr-3 shrink-0"></div>
                            {feature}
                          </li>
                        );
                      })}
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
                              handleTypeChange(service._id, type.id as serviceType);
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
                          N{pricing.localPrice}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Globe className="h-4 w-4 mr-1" />
                          International
                        </div>
                        <span className="text-lg font-bold text-brand-end">
                          N{pricing.internationalPrice}
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
