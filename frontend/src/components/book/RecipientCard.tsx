import React from "react";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";
import { countries } from "@/lib/countries";
import { services, callType as callTypeOptions } from "../services/serviceList";
import { getPriceForRecipient } from "@/lib/pricing";
import {
  MESSAGE_WORD_LIMIT,
  SPECIAL_INSTRUCTION_WORD_LIMIT,
} from "@/lib/bookingOptions";
import { BookingFormValues } from "@/lib/bookingValidation";
import { FormField, FormSelect, FormTextArea } from "./FormFields";

interface RecipientCardProps {
  index: number;
  canRemove: boolean;
  onRemove: (index: number) => void;
  register: UseFormRegister<BookingFormValues>;
  control: Control<BookingFormValues>;
  watch: UseFormWatch<BookingFormValues>;
  errors?: FieldErrors<BookingFormValues["recipients"][number]>;
}

export const RecipientCard: React.FC<RecipientCardProps> = ({
  index,
  canRemove,
  onRemove,
  register,
  control,
  watch,
  errors,
}) => {
  const occassion = watch(`recipients.${index}.occassion`);
  const callType = watch(`recipients.${index}.callType`);
  const country = watch(`recipients.${index}.country`);
  const price = getPriceForRecipient(occassion, callType, country);

  return (
    <div className="p-6 space-y-4">
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
          placeholder="Who should we call?"
          error={errors?.recipientName?.message}
          {...register(`recipients.${index}.recipientName`)}
        />

        <FormField
          label="Phone *"
          placeholder="+234 801 234 5678"
          error={errors?.recipientPhone?.message}
          {...register(`recipients.${index}.recipientPhone`)}
        />

        <FormSelect
          label="Recipient Country *"
          options={countries.map((c) => ({ value: c, label: c }))}
          error={errors?.country?.message}
          {...register(`recipients.${index}.country`)}
        />

        <FormSelect
          label="Occasion *"
          options={[
            { value: "", label: "Select Occasion" },
            ...services.map((service) => ({
              value: service.title,
              label: service.title,
            })),
          ]}
          error={errors?.occassion?.message}
          {...register(`recipients.${index}.occassion`)}
        />

        <FormSelect
          label="Call Type *"
          options={callTypeOptions.map((type) => ({ value: type.id, label: type.name }))}
          error={errors?.callType?.message}
          {...register(`recipients.${index}.callType`)}
        />

        <FormField
          label="Preferred Date *"
          type="date"
          min={new Date().toISOString().split("T")[0]}
          error={errors?.callDate?.message}
          {...register(`recipients.${index}.callDate`)}
        />
      </div>

      <Controller
        control={control}
        name={`recipients.${index}.message`}
        render={({ field, fieldState }) => (
          <FormTextArea
            label="Message *"
            placeholder="What would you like us to say? Indicate 'None' if you don't have any special message"
            maxWords={MESSAGE_WORD_LIMIT}
            rows={4}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            name={field.name}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name={`recipients.${index}.specialInstruction`}
        render={({ field, fieldState }) => (
          <FormTextArea
            label="Special Instructions (Optional)"
            placeholder="Any special requests we should know about?"
            maxWords={SPECIAL_INSTRUCTION_WORD_LIMIT}
            rows={3}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            name={field.name}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name={`recipients.${index}.callRecording`}
        render={({ field }) => (
          <label className="flex flex-row items-center">
            <input
              type="checkbox"
              checked={field.value === "yes"}
              onChange={() => field.onChange(field.value === "yes" ? "no" : "yes")}
              className="rounded border-gray-300 text-brand-end focus:ring-brand-end"
            />
            <span className="ml-2 text-sm text-gray-600">
              I want a recording of this call.
            </span>
          </label>
        )}
      />

      {occassion && callType && (
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
