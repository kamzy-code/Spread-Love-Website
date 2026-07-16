import React, { useState } from "react";
import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form";
import { RELATIONSHIP_OPTIONS, GENDER_OPTIONS } from "@/lib/bookingOptions";
import { BookingFormValues } from "@/lib/bookingValidation";
import { FormField, FormSelect } from "./FormFields";

const RELATIONSHIP_OPTION_SET: readonly string[] = RELATIONSHIP_OPTIONS;

interface RelationshipSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

// Fixed dropdown for the common cases; selecting "Other" swaps in a free-text
// input instead, since v2.md's requirement is "Others - they type" — the
// submitted `relationship` value is always a plain string either way.
const RelationshipSelect: React.FC<RelationshipSelectProps> = ({ value, onChange, error }) => {
  const isKnownOption = RELATIONSHIP_OPTION_SET.includes(value) && value !== "Other";
  const [isOther, setIsOther] = useState(Boolean(value) && !isKnownOption);

  const selectValue = isOther ? "Other" : value;

  return (
    <div className="flex flex-col space-y-2">
      <FormSelect
        label="Relationship to Recipient *"
        value={selectValue}
        onChange={(e) => {
          const next = e.target.value;
          if (next === "Other") {
            setIsOther(true);
            onChange("");
          } else {
            setIsOther(false);
            onChange(next);
          }
        }}
        options={[
          { value: "", label: "Select relationship" },
          ...RELATIONSHIP_OPTIONS.map((option) => ({ value: option, label: option })),
        ]}
        error={isOther ? undefined : error}
      />
      {isOther && (
        <FormField
          label="Please specify *"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your relationship to the recipient"
          error={error}
        />
      )}
    </div>
  );
};

interface CallerFieldsProps {
  register: UseFormRegister<BookingFormValues>;
  control: Control<BookingFormValues>;
  errors?: FieldErrors<BookingFormValues>["caller"];
}

export const CallerFields: React.FC<CallerFieldsProps> = ({ register, control, errors }) => {
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

        <Controller
          control={control}
          name="caller.relationship"
          render={({ field, fieldState }) => (
            <RelationshipSelect
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
      </div>
    </div>
  );
};
