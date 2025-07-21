import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProtestStatusSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const statusOptions = [
  { value: 'waiting_for_offer', label: 'Waiting for Offer' },
  { value: 'offer_received', label: 'Offer Received' },
  { value: 'needs_review', label: 'Needs Review' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'email_reply_required', label: 'Email Reply Required' },
  { value: 'hearing_scheduled', label: 'Hearing Scheduled' },
  { value: 'completed', label: 'Completed' },
];

export function ProtestStatusSelect({ value, onValueChange, disabled }: ProtestStatusSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}