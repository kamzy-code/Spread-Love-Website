import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "successful", label: "Successful" },
  { value: "rejected", label: "Rejected" },
  { value: "rescheduled", label: "Rescheduled" },
  { value: "unsuccessful", label: "Unsuccessful" },
];

interface RecipientActionMenuProps {
  currentStatus?: string;
  onUpdateStatus: (status: string) => void;
  disabled?: boolean;
}

// Recipient-scoped equivalent of the old booking-table "Update Status"
// submenu — lives on the detail page now, one per recipient, since a v2
// booking can hold multiple recipients with independent call outcomes.
// "Update Status" is its own top-level item with a submenu (matching the
// old itemDropdown.tsx pattern) rather than being the only content of the
// menu, so future recipient-level actions have a natural place to slot in
// alongside it.
export default function RecipientActionMenu({
  currentStatus,
  onUpdateStatus,
  disabled,
}: RecipientActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-gray-200"
          disabled={disabled}
        >
          <span className="sr-only">Recipient actions</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="p-3">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger onClick={(e) => e.stopPropagation()}>
            Update Status
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {STATUS_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus(option.value);
                }}
              >
                <div className="flex items-center px-2 py-1 cursor-pointer">
                  <input
                    type="radio"
                    name="recipientStatus"
                    checked={currentStatus === option.value}
                    readOnly
                    className="mr-2 pointer-events-none"
                  />
                  {option.label}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
