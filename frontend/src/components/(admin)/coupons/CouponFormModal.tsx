"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Coupon, CouponFormValues } from "@/lib/types";
import { useCreateCoupon, useUpdateCoupon } from "@/hooks/useCoupons";

const emptyForm: CouponFormValues = {
  code: "",
  discountType: "flat",
  value: 0,
  usageLimit: 1,
  expiresAt: "",
};

const toFormValues = (coupon: Coupon): CouponFormValues => ({
  code: coupon.code,
  discountType: coupon.discountType,
  value: coupon.value,
  usageLimit: coupon.usageLimit,
  expiresAt: coupon.expiresAt.slice(0, 10),
});

export default function CouponFormModal({
  coupon,
  adminId,
  onClose,
}: {
  coupon?: Coupon;
  adminId: string;
  onClose: () => void;
}) {
  const isEditing = !!coupon;
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CouponFormValues>(
    coupon ? toFormValues(coupon) : emptyForm
  );
  const [errorMessage, setErrorMessage] = useState("");

  const createMutation = useCreateCoupon(adminId);
  const updateMutation = useUpdateCoupon(coupon?._id ?? "");
  const mutation = isEditing ? updateMutation : createMutation;

  useEffect(() => {
    if (mutation.isSuccess) {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutation.isSuccess]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "value" || name === "usageLimit" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      await mutation.mutateAsync(formData);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save coupon");
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
            <h2 className="text-xl md:text-2xl font-bold gradient-text">
              {isEditing ? "Edit Coupon" : "Create Coupon"}
            </h2>
            <p className="text-sm md:text-[1rem] text-gray-700">
              {isEditing ? `Editing ${coupon.code}` : "Set up a new discount code"}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-3 text-brand-start w-full py-4 text-start"
          >
            <div className="flex flex-col space-y-2">
              <label className="text-gray-700 font-medium">Code:</label>
              <input
                className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 uppercase"
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                placeholder="e.g. WELCOME10"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-gray-700 font-medium">Discount Type:</label>
              <select
                className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                required
              >
                <option value="flat">Flat amount</option>
                <option value="percent">Percentage</option>
              </select>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-gray-700 font-medium">
                Value: {formData.discountType === "percent" ? "(%)" : "(₦)"}
              </label>
              <input
                className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
                type="number"
                min={0}
                name="value"
                value={formData.value}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-gray-700 font-medium">Usage Limit:</label>
              <input
                className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
                type="number"
                min={0}
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-gray-700 font-medium">Expires:</label>
              <input
                className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
                type="date"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleChange}
                required
              />
            </div>

            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary rounded-lg w-full h-12 flex items-center justify-center disabled:opacity-50"
            >
              {mutation.isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Coupon"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
