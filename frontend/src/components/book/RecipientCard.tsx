import React from "react";
import { countries } from "@/lib/countries";
import { services, callType as callTypeOptions } from "../services/serviceList";
import { getPriceForRecipient } from "@/lib/pricing";
import {
  MESSAGE_WORD_LIMIT,
  SPECIAL_INSTRUCTION_WORD_LIMIT,
} from "@/lib/bookingOptions";
import { RecipientFormState } from "@/lib/types";
import { FormField, FormSelect, FormTextArea } from "./FormFields";

interface RecipientCardProps {
  recipient: RecipientFormState;
  index: number;
  canRemove: boolean;
  onChange: (index: number, field: keyof RecipientFormState, value: string) => void;
  onRemove: (index: number) => void;
}

export const RecipientCard: React.FC<RecipientCardProps> = ({
  recipient,
  index,
  canRemove,
  onChange,
  onRemove,
}) => {
  const price = getPriceForRecipient(
    recipient.occassion,
    recipient.callType,
    recipient.country,
  );

  const handleField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => onChange(index, e.target.name as keyof RecipientFormState, e.target.value);

  const handleRecordingToggle = () =>
    onChange(index, "callRecording", recipient.callRecording === "yes" ? "no" : "yes");

  return (
    <div className=" p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="gradient-text text-xl font-semibold">
          Recipient {index + 1}
        </h3>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-500 text-sm font-medium hover:underline"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FormField
          label="Recipient's Name *"
          name="recipientName"
          value={recipient.recipientName}
          onChange={handleField}
          placeholder="Who should we call?"
          required
        />

        <FormField
          label="Phone *"
          name="recipientPhone"
          value={recipient.recipientPhone}
          onChange={handleField}
          placeholder="+234 801 234 5678"
          required
        />

        <FormSelect
          label="Recipient Country *"
          name="country"
          value={recipient.country}
          onChange={handleField}
          options={countries.map((country) => ({ value: country, label: country }))}
          required
        />

        <FormSelect
          label="Occasion *"
          name="occassion"
          value={recipient.occassion}
          onChange={handleField}
          options={[
            { value: "", label: "Select Occasion" },
            ...services.map((service) => ({
              value: service.title,
              label: service.title,
            })),
          ]}
          required
        />

        <FormSelect
          label="Call Type *"
          name="callType"
          value={recipient.callType}
          onChange={handleField}
          options={callTypeOptions.map((type) => ({
            value: type.id,
            label: type.name,
          }))}
          required
        />

        <FormField
          label="Preferred Date *"
          name="callDate"
          type="date"
          value={recipient.callDate}
          onChange={handleField}
          required
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      <FormTextArea
        label="Message *"
        name="message"
        value={recipient.message || ""}
        onChange={handleField}
        placeholder="What would you like us to say? Indicate 'None' if you don't have any special message"
        required
        rows={4}
        maxWords={MESSAGE_WORD_LIMIT}
      />

      <FormTextArea
        label="Special Instructions (Optional)"
        name="specialInstruction"
        value={recipient.specialInstruction || ""}
        onChange={handleField}
        placeholder="Any special requests we should know about?"
        rows={3}
        maxWords={SPECIAL_INSTRUCTION_WORD_LIMIT}
      />

      <label className="flex flex-row items-center">
        <input
          type="checkbox"
          checked={recipient.callRecording === "yes"}
          onChange={handleRecordingToggle}
          className="rounded border-gray-300 text-brand-end focus:ring-brand-end"
        />
        <span className="ml-2 text-sm text-gray-600">
          I want a recording of this call.
        </span>
      </label>

      {recipient.occassion && recipient.callType && (
        <div className="flex justify-between items-center pt-4 border-t">
          <span className="text-sm text-gray-500">Price for this call</span>
          <span className="font-bold text-brand-end">
            N{price.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
};
