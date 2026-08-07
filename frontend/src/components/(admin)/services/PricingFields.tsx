import { Plus, Trash2 } from "lucide-react";
import { ServicePricing } from "@/lib/types";

export function FeaturesEditor({
  features,
  onChange,
}: {
  features: string[];
  onChange: (features: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      {features.map((feature, index) => (
        <div key={index} className="flex gap-2">
          <input
            className="px-3 py-2 border border-gray-300 rounded-lg w-full text-sm focus:ring-2 focus:ring-brand-end focus:border-transparent"
            type="text"
            value={feature}
            onChange={(e) => {
              const next = [...features];
              next[index] = e.target.value;
              onChange(next);
            }}
          />
          <button
            type="button"
            onClick={() => onChange(features.filter((_, i) => i !== index))}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="flex items-center gap-1 text-xs text-brand-start hover:underline"
        onClick={() => onChange([...features, ""])}
      >
        <Plus className="h-3.5 w-3.5" />
        Add feature
      </button>
    </div>
  );
}

export default function PricingFields({
  label,
  pricing,
  onChange,
}: {
  label: string;
  pricing: ServicePricing;
  onChange: (pricing: ServicePricing) => void;
}) {
  return (
    <div>
      <h3 className="font-semibold text-gray-700 mb-2">{label}</h3>
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="flex flex-col space-y-2">
          <label className="text-gray-700 text-sm">Local (₦)</label>
          <input
            className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
            type="number"
            min={0}
            value={pricing.localPrice}
            onChange={(e) => onChange({ ...pricing, localPrice: Number(e.target.value) })}
            required
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="text-gray-700 text-sm">International (₦)</label>
          <input
            className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
            type="number"
            min={0}
            value={pricing.internationalPrice}
            onChange={(e) =>
              onChange({ ...pricing, internationalPrice: Number(e.target.value) })
            }
            required
          />
        </div>
      </div>
      <label className="text-gray-700 text-sm">Features:</label>
      <FeaturesEditor
        features={pricing.features}
        onChange={(features) => onChange({ ...pricing, features })}
      />
    </div>
  );
}
