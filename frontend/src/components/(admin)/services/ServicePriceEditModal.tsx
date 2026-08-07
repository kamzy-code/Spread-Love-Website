"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Service, ServicePricing } from "@/lib/types";
import { useUpdateServicePricing } from "@/hooks/useServices";
import { deepEqual } from "@/lib/hasBookingChanged";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import PricingFields from "./PricingFields";

const toPricingState = (service: Service) => ({
  regular: { ...service.regular },
  special: { ...service.special },
});

export default function ServicePriceEditModal({
  service,
  onClose,
}: {
  service: Service;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [pricing, setPricing] = useState<{ regular: ServicePricing; special: ServicePricing }>(
    toPricingState(service)
  );
  const [errorMessage, setErrorMessage] = useState("");

  useLockBodyScroll();

  const mutation = useUpdateServicePricing(service._id);

  useEffect(() => {
    if (mutation.isSuccess) {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["service", service._id] });
      queryClient.invalidateQueries({ queryKey: ["auditLogs", "service", service._id] });
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutation.isSuccess]);

  const hasNotChanged = deepEqual(pricing, toPricingState(service));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (hasNotChanged) {
      onClose();
      return;
    }

    try {
      await mutation.mutateAsync(pricing);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update pricing");
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
            <h2 className="text-xl md:text-2xl font-bold gradient-text">Edit Pricing</h2>
            <p className="text-sm md:text-[1rem] text-gray-700">{service.title}</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 text-brand-start w-full py-4 text-start"
          >
            <PricingFields
              label="Regular Call"
              pricing={pricing.regular}
              onChange={(regular) => setPricing((prev) => ({ ...prev, regular }))}
            />

            <PricingFields
              label="Special Call"
              pricing={pricing.special}
              onChange={(special) => setPricing((prev) => ({ ...prev, special }))}
            />

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
