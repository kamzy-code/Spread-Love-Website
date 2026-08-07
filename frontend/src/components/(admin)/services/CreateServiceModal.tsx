"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ServiceCreatePayload, ServicePricing } from "@/lib/types";
import { useCreateService } from "@/hooks/useServices";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { SERVICE_ICON_OPTIONS } from "@/lib/serviceIcons";
import PricingFields from "./PricingFields";

const emptyPricing: ServicePricing = { features: [], localPrice: 0, internationalPrice: 0 };

const emptyForm: ServiceCreatePayload = {
  title: "",
  description: "",
  category: "",
  thumbnail: "",
  iconKey: "gift",
  regular: { ...emptyPricing },
  special: { ...emptyPricing },
};

export default function CreateServiceModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ServiceCreatePayload>(emptyForm);
  const [errorMessage, setErrorMessage] = useState("");

  useLockBodyScroll();

  const mutation = useCreateService();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      await mutation.mutateAsync(formData);
      queryClient.invalidateQueries({ queryKey: ["services"] });
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to create service");
    }
  };

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center bg-black/50">
      <div className="relative w-[90%] md:w-[70%] lg:w-[50%] max-h-[90%] overflow-y-auto bg-white rounded-xl shadow-lg">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-8 w-full flex flex-col items-center justify-center"
        >
          <X
            className="w-5 h-5 md:h-8 md:w-8 text-gray-700 absolute right-10 top-10 hover:scale-120 transition"
            onClick={onClose}
          ></X>

          <div className="text-center py-2">
            <h2 className="text-xl md:text-2xl font-bold gradient-text">Create Service</h2>
            <p className="text-sm md:text-[1rem] text-gray-700">Add a new bookable occasion</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 text-brand-start w-full py-4 text-start"
          >
            <div className="flex flex-col space-y-2">
              <label className="text-gray-700 font-medium">Title:</label>
              <input
                className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g. New Year Wishes"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-gray-700 font-medium">Description:</label>
              <textarea
                className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent min-h-24"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-gray-700 font-medium">Category:</label>
              <input
                className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-gray-700 font-medium">Thumbnail URL:</label>
              <input
                className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
                type="text"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-gray-700 font-medium">Icon:</label>
              <select
                className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
                name="iconKey"
                value={formData.iconKey}
                onChange={handleChange}
                required
              >
                {SERVICE_ICON_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <PricingFields
              label="Regular Call"
              pricing={formData.regular}
              onChange={(regular) => setFormData((prev) => ({ ...prev, regular }))}
            />

            <PricingFields
              label="Special Call"
              pricing={formData.special}
              onChange={(special) => setFormData((prev) => ({ ...prev, special }))}
            />

            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary rounded-lg w-full h-12 flex items-center justify-center disabled:opacity-50"
            >
              {mutation.isPending ? "Creating..." : "Create Service"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
