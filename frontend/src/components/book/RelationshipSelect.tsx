import React, { useState } from "react";
import { RELATIONSHIP_OPTIONS } from "@/lib/bookingOptions";
import { FormField, FormSelect } from "./FormFields";

const RELATIONSHIP_OPTION_SET: readonly string[] = RELATIONSHIP_OPTIONS;

interface RelationshipSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

// Fixed dropdown for the common cases; selecting "Other" swaps in a free-text
// input instead, since v2.md's requirement is "Others - they type" — the
// submitted `relationship` value is always a plain string either way. Per
// recipient (moved from caller 2026-09-18) since relationship can differ
// across recipients on the same booking.
export const RelationshipSelect: React.FC<RelationshipSelectProps> = ({ value, onChange, error }) => {
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
