import React from "react";
import { RELATIONSHIP_OPTIONS, GENDER_OPTIONS } from "@/lib/bookingOptions";
import { CallerFormState } from "@/lib/types";
import { FormField, FormSelect } from "./FormFields";

interface CallerFieldsProps {
  caller: CallerFormState;
  onChange: (field: keyof CallerFormState, value: string) => void;
}

export const CallerFields: React.FC<CallerFieldsProps> = ({ caller, onChange }) => {
  const handleField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => onChange(e.target.name as keyof CallerFormState, e.target.value);

  return (
    <div>
      <h2 className="gradient-text text-2xl font-semibold mb-4 pb-2">
        Personal Information
      </h2>
      <div className="grid grid-cols-1 gap-4">
        <FormField
          label="Name *"
          name="name"
          value={caller.name}
          onChange={handleField}
          placeholder="Your full name"
          required
        />

        <FormField
          label="WhatsApp Number *"
          name="phone"
          type="tel"
          value={caller.phone}
          onChange={handleField}
          placeholder="+234 123 456 7890"
          required
        />

        <FormField
          label="Email *"
          name="email"
          type="email"
          value={caller.email}
          onChange={handleField}
          placeholder="your.email@example.com"
          required
        />

        <FormSelect
          label="Gender *"
          name="gender"
          value={caller.gender}
          onChange={handleField}
          options={[{ value: "", label: "Select gender" }, ...GENDER_OPTIONS]}
          required
        />

        <FormSelect
          label="Relationship to Recipient *"
          name="relationship"
          value={caller.relationship}
          onChange={handleField}
          options={[
            { value: "", label: "Select relationship" },
            ...RELATIONSHIP_OPTIONS.map((option) => ({ value: option, label: option })),
          ]}
          required
        />
      </div>
    </div>
  );
};
