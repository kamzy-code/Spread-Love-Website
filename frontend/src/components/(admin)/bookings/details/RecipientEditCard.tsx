import { countries } from "@/lib/countries";
import { callType as callTypeOptions } from "@/components/services/serviceList";
import { useFetchServices } from "@/hooks/useServices";
import { formatToYMD } from "@/lib/formatDate";
import { getStatusColor, getStatusIcon } from "@/lib/getStatusColor";
import RecipientActionMenu from "./RecipientActionMenu";
import RecordingsPanel from "./RecordingsPanel";

export interface RecipientEditState {
  _id: string;
  recipientName: string;
  recipientPhone: string;
  country: string;
  occassion: string;
  callType: string;
  callDate: string;
  price: number;
  message?: string;
  specialInstruction?: string;
  callStatus?: string;
  callRecording?: string;
  callRecordingURL?: string;
}

const getCallStatusMessage = (status?: string) => {
  switch (status) {
    case "pending":
      return "Call is pending and will be placed soon.";
    case "successful":
      return "Call was successfully placed.";
    case "unsuccessful":
      return "After several attempts, the recipient could not be reached.";
    case "rejected":
      return "Call was rejected by the recipient.";
    case "rescheduled":
      return "Call has been rescheduled.";
    default:
      return "Call status unknown.";
  }
};

interface RecipientEditCardProps {
  recipient: RecipientEditState;
  index: number;
  editForm: boolean;
  onChange: (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  onUpdateStatus: (status: string) => void;
  statusActionDisabled?: boolean;
  bookingId: string;
  currentUserId?: string;
  currentUserRole?: string;
  legacy?: boolean;
}

export default function RecipientEditCard({
  recipient,
  index,
  editForm,
  onChange,
  onUpdateStatus,
  statusActionDisabled,
  bookingId,
  currentUserId,
  currentUserRole,
  legacy,
}: RecipientEditCardProps) {
  const { data: services = [] } = useFetchServices();
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => onChange(index, e);

  return (
    <div className="border rounded-lg p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="gradient-text text-lg font-semibold">
            Recipient {index + 1}: {recipient.recipientName}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                recipient.callStatus ?? "pending",
                "badge",
              )}`}
            >
              {getStatusIcon(recipient.callStatus ?? "pending", true)}
              <span className="capitalize">
                {(recipient.callStatus ?? "pending").replace("_", " ")}
              </span>
            </span>
            <span className="text-xs italic text-gray-500">
              {getCallStatusMessage(recipient.callStatus)}
            </span>
          </div>
        </div>

        <RecipientActionMenu
          currentStatus={recipient.callStatus}
          onUpdateStatus={onUpdateStatus}
          disabled={statusActionDisabled}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-gray-700 font-medium">Recipient&apos;s Name:</label>
          {editForm ? (
            <input
              className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
              type="text"
              name="recipientName"
              value={recipient.recipientName}
              onChange={handleChange}
              required
            />
          ) : (
            <p className="py-3 w-full">{recipient.recipientName}</p>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-gray-700 font-medium">Phone:</label>
          {editForm ? (
            <input
              className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
              type="text"
              name="recipientPhone"
              value={recipient.recipientPhone}
              onChange={handleChange}
              required
            />
          ) : (
            <p className="py-3 w-full">{recipient.recipientPhone}</p>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-gray-700 font-medium">Country:</label>
          {editForm ? (
            <select
              name="country"
              className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
              value={recipient.country}
              onChange={handleChange}
              required
            >
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          ) : (
            <p className="py-3 w-full">{recipient.country}</p>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-gray-700 font-medium">Occasion:</label>
          {editForm ? (
            <select
              name="occassion"
              className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
              value={recipient.occassion}
              onChange={handleChange}
              required
            >
              {services.map((service) => (
                <option key={service._id} value={service.title}>
                  {service.title}
                </option>
              ))}
            </select>
          ) : (
            <p className="py-3 w-full">{recipient.occassion}</p>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-gray-700 font-medium">Call Type:</label>
          {editForm ? (
            <select
              name="callType"
              className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
              value={recipient.callType}
              onChange={handleChange}
              required
            >
              {callTypeOptions.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="py-3 w-full capitalize">{recipient.callType}</p>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-gray-700 font-medium">Preferred Date:</label>
          {editForm ? (
            <input
              className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
              type="date"
              name="callDate"
              value={formatToYMD(recipient.callDate || "")}
              onChange={handleChange}
              required
            />
          ) : (
            <p className="py-3 w-full">{formatToYMD(recipient.callDate || "")}</p>
          )}
        </div>

      </div>

      {recipient.callRecording === "yes" && !legacy && (
        <RecordingsPanel
          bookingId={bookingId}
          recipientId={recipient._id}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
        />
      )}

      {editForm ? (
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col space-y-2">
            <label className="text-gray-700 font-medium">Message:</label>
            <textarea
              name="message"
              value={recipient.message || ""}
              onChange={handleChange}
              required
              rows={4}
              className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent resize-none"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-gray-700 font-medium">
              Special Instructions (Optional):
            </label>
            <textarea
              name="specialInstruction"
              value={recipient.specialInstruction || ""}
              onChange={handleChange}
              rows={3}
              className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent resize-none"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {recipient.message && (
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Message</h4>
              <p className="p-3 gradient-background-soft rounded-md text-gray-700 text-sm">
                {recipient.message}
              </p>
            </div>
          )}
          {recipient.specialInstruction && (
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Special Instruction</h4>
              <p className="p-3 gradient-background-soft rounded-md text-gray-700 text-sm">
                {recipient.specialInstruction}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
