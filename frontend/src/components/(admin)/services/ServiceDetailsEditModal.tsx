"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Service, ServiceDetailsUpdate } from "@/lib/types";
import { useUpdateServiceDetails } from "@/hooks/useServices";
import { deepEqual } from "@/lib/hasBookingChanged";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { SERVICE_ICON_OPTIONS } from "@/lib/serviceIcons";

const toFormValues = (service: Service): ServiceDetailsUpdate => ({
  title: service.title,
  description: service.description,
  category: service.category,
  thumbnail: service.thumbnail,
  iconKey: service.iconKey,
});

export default function ServiceDetailsEditModal({
  service,
  onClose,
}: {
  service: Service;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ServiceDetailsUpdate>(toFormValues(service));
  const [errorMessage, setErrorMessage] = useState("");

  useLockBodyScroll();

  const mutation = useUpdateServiceDetails(service._id);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const hasNotChanged = deepEqual(formData, toFormValues(service));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (hasNotChanged) {
      onClose();
      return;
    }

    try {
      await mutation.mutateAsync(formData);
      queryClient.invalidateQueries({ queryKey: ["service", service._id] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["auditLogs", "service", service._id] });
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update service");
    }
  };

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center bg-black/50">
      <div className="relative w-[90%] md:w-[70%] lg:w-[40%] max-h-[90%] overflow-y-auto bg-white rounded-xl shadow-lg">
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
            <h2 className="text-xl md:text-2xl font-bold gradient-text">Edit Service</h2>
            <p className="text-sm md:text-[1rem] text-gray-700">{`Editing ${service.title}`}</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-3 text-brand-start w-full py-4 text-start"
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
              {formData.thumbnail && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={formData.thumbnail}
                  alt="Thumbnail preview"
                  className="h-24 w-full object-cover rounded-lg border border-gray-200"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                  onLoad={(e) => (e.currentTarget.style.display = "block")}
                />
              )}
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

            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

            <button
              type="submit"
              disabled={mutation.isPending || hasNotChanged}
              className="btn-primary rounded-lg w-full h-12 flex items-center justify-center disabled:opacity-50"
            >
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
