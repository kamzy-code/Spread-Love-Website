import React from "react";
import { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { GENDER_OPTIONS } from "@/lib/bookingOptions";
import { BookingFormValues } from "@/lib/bookingValidation";
import { FormField, FormSelect } from "./FormFields";

interface CallerFieldsProps {
  register: UseFormRegister<BookingFormValues>;
  control: Control<BookingFormValues>;
  errors?: FieldErrors<BookingFormValues>["caller"];
}

export const CallerFields: React.FC<CallerFieldsProps> = ({ register, errors }) => {
  return (
    <div>
      <h2 className="gradient-text text-2xl font-semibold mb-4 pb-2">
        Personal Information
      </h2>
      <div className="grid grid-cols-1 gap-4">
        <FormField
          label="Name *"
          placeholder="Your full name"
          error={errors?.name?.message}
          {...register("caller.name")}
        />

        <FormField
          label="WhatsApp Number *"
          type="tel"
          placeholder="+234 123 456 7890"
          error={errors?.phone?.message}
          {...register("caller.phone")}
        />

        <FormField
          label="Email *"
          type="email"
          placeholder="your.email@example.com"
          error={errors?.email?.message}
          {...register("caller.email")}
        />

        <FormSelect
          label="Gender *"
          options={[{ value: "", label: "Select gender" }, ...GENDER_OPTIONS]}
          error={errors?.gender?.message}
          {...register("caller.gender")}
        />
      </div>
    </div>
  );
};
