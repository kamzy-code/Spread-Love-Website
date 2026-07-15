import React from "react";
import { wordCount } from "@/lib/wordCount";

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  min?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  min,
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-gray-700 font-medium">{label}</label>
      <input
        className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400"
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
      />
    </div>
  );
};

interface FormSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-gray-700 font-medium">{label}</label>
      <select
        name={name}
        className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
        onChange={onChange}
        value={value}
        required={required}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface FormTextAreaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  maxWords?: number;
}

export const FormTextArea: React.FC<FormTextAreaProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 4,
  maxWords,
}) => {
  const count = maxWords !== undefined ? wordCount(value) : undefined;
  const overLimit = maxWords !== undefined && count! > maxWords;

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-gray-700 font-medium">{label}</label>
        {maxWords !== undefined && (
          <span
            className={`text-xs ${
              overLimit ? "text-red-500 font-semibold" : "text-gray-400"
            }`}
          >
            {count}/{maxWords} words
          </span>
        )}
      </div>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        placeholder={placeholder}
        className={`px-4 py-3 border rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 resize-none ${
          overLimit ? "border-red-400" : "border-gray-300"
        }`}
      />
    </div>
  );
};
