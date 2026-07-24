"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Service } from "@/lib/types";
import { useUpdateServicePricing } from "@/hooks/useServices";
import { deepEqual } from "@/lib/hasBookingChanged";

export default function ServicePriceEditModal({
  service,
  onClose,
}: {
  service: Service;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [regularLocal, setRegularLocal] = useState(service.regular.localPrice);
  const [regularIntl, setRegularIntl] = useState(service.regular.internationalPrice);
  const [specialLocal, setSpecialLocal] = useState(service.special.localPrice);
  const [specialIntl, setSpecialIntl] = useState(service.special.internationalPrice);
  const [errorMessage, setErrorMessage] = useState("");

  const mutation = useUpdateServicePricing(service._id);

  useEffect(() => {
    if (mutation.isSuccess) {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutation.isSuccess]);

  const pricingUpdate = {
    regular: { localPrice: regularLocal, internationalPrice: regularIntl },
    special: { localPrice: specialLocal, internationalPrice: specialIntl },
  };
  const hasNotChanged = deepEqual(pricingUpdate, {
    regular: {
      localPrice: service.regular.localPrice,
      internationalPrice: service.regular.internationalPrice,
    },
    special: {
      localPrice: service.special.localPrice,
      internationalPrice: service.special.internationalPrice,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (hasNotChanged) {
      onClose();
      return;
    }

    try {
      await mutation.mutateAsync(pricingUpdate);
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
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Regular Call</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-gray-700 text-sm">Local (₦)</label>
                  <input
                    className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
                    type="number"
                    min={0}
                    value={regularLocal}
                    onChange={(e) => setRegularLocal(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-gray-700 text-sm">International (₦)</label>
                  <input
                    className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
                    type="number"
                    min={0}
                    value={regularIntl}
                    onChange={(e) => setRegularIntl(Number(e.target.value))}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Special Call</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-gray-700 text-sm">Local (₦)</label>
                  <input
                    className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
                    type="number"
                    min={0}
                    value={specialLocal}
                    onChange={(e) => setSpecialLocal(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-gray-700 text-sm">International (₦)</label>
                  <input
                    className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
                    type="number"
                    min={0}
                    value={specialIntl}
                    onChange={(e) => setSpecialIntl(Number(e.target.value))}
                    required
                  />
                </div>
              </div>
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
