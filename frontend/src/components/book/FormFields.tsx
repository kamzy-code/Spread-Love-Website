import React, { forwardRef } from "react";
import { wordCount } from "@/lib/wordCount";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, ...rest }, ref) => {
    return (
      <div className="flex flex-col space-y-2">
        <label className="text-gray-700 font-medium">{label}</label>
        <input
          ref={ref}
          className={`px-4 py-3 border rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 ${
            error ? "border-red-400" : "border-gray-300"
          }`}
          {...rest}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  },
);
FormField.displayName = "FormField";

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, options, error, ...rest }, ref) => {
    return (
      <div className="flex flex-col space-y-2">
        <label className="text-gray-700 font-medium">{label}</label>
        <select
          ref={ref}
          className={`px-4 py-3 border rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent ${
            error ? "border-red-400" : "border-gray-300"
          }`}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  },
);
FormSelect.displayName = "FormSelect";

interface FormTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  maxWords?: number;
  error?: string;
}

export const FormTextArea = forwardRef<HTMLTextAreaElement, FormTextAreaProps>(
  ({ label, maxWords, error, value, ...rest }, ref) => {
    const count = maxWords !== undefined ? wordCount((value as string) || "") : undefined;
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
          ref={ref}
          value={value}
          rows={4}
          className={`px-4 py-3 border rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 resize-none ${
            error || overLimit ? "border-red-400" : "border-gray-300"
          }`}
          {...rest}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  },
);
FormTextArea.displayName = "FormTextArea";
