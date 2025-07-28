import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROTEST_STATUSES, PROTEST_STATUS_LABELS } from "@/constants/protestStatus";

interface ProtestStatusSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const statusOptions = [
  { value: PROTEST_STATUSES.PENDING, label: PROTEST_STATUS_LABELS[PROTEST_STATUSES.PENDING] },
  { value: PROTEST_STATUSES.IN_PROGRESS, label: PROTEST_STATUS_LABELS[PROTEST_STATUSES.IN_PROGRESS] },
  { value: PROTEST_STATUSES.OFFER_RECEIVED, label: PROTEST_STATUS_LABELS[PROTEST_STATUSES.OFFER_RECEIVED] },
  { value: PROTEST_STATUSES.ACCEPTED, label: PROTEST_STATUS_LABELS[PROTEST_STATUSES.ACCEPTED] },
  { value: PROTEST_STATUSES.REJECTED, label: PROTEST_STATUS_LABELS[PROTEST_STATUSES.REJECTED] },
  { value: PROTEST_STATUSES.COMPLETED, label: PROTEST_STATUS_LABELS[PROTEST_STATUSES.COMPLETED] },
  { value: PROTEST_STATUSES.NEEDS_REVIEW, label: PROTEST_STATUS_LABELS[PROTEST_STATUSES.NEEDS_REVIEW] },
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