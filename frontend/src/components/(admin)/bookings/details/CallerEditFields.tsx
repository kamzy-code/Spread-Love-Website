import { GENDER_OPTIONS } from "@/lib/bookingOptions";
import { CallerFormState } from "@/lib/types";
import EmailAuditLog from "./EmailAuditLog";

interface CallerEditFieldsProps {
  caller: CallerFormState;
  editForm: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  bookingId: string;
  isSuperAdmin: boolean;
}

export default function CallerEditFields({
  caller,
  editForm,
  onChange,
  bookingId,
  isSuperAdmin,
}: CallerEditFieldsProps) {
  return (
    <div>
      <h2 className="gradient-text text-xl font-semibold mb-4 pb-2">
        Personal Information
      </h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-gray-700 font-medium">Name:</label>
          {editForm ? (
            <input
              className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
              type="text"
              name="name"
              value={caller.name}
              onChange={onChange}
              required
            />
          ) : (
            <p className="py-3 w-full">{caller.name}</p>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-gray-700 font-medium">WhatsApp Number:</label>
          {editForm ? (
            <input
              className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
              type="text"
              name="phone"
              value={caller.phone}
              onChange={onChange}
              required
            />
          ) : (
            <p className="py-3 w-full">{caller.phone}</p>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-gray-700 font-medium">Email:</label>
          {editForm ? (
            <input
              className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
              type="email"
              name="email"
              value={caller.email}
              onChange={onChange}
              required
            />
          ) : (
            <p className="py-3 w-full">{caller.email}</p>
          )}
          <EmailAuditLog bookingId={bookingId} isSuperAdmin={isSuperAdmin} />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-gray-700 font-medium">Gender:</label>
          {editForm ? (
            <select
              name="gender"
              className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
              value={caller.gender}
              onChange={onChange}
            >
              <option value="">Select gender</option>
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <p className="py-3 w-full capitalize">
              {caller.gender.replace(/_/g, " ") || "—"}
            </p>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-gray-700 font-medium">Relationship:</label>
          {editForm ? (
            <input
              className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
              type="text"
              name="relationship"
              value={caller.relationship}
              onChange={onChange}
              required
              placeholder="Who is the caller to the recipient?"
            />
          ) : (
            <p className="py-3 w-full">{caller.relationship}</p>
          )}
        </div>
      </div>
    </div>
  );
}
