import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRangeFilterProps {
  label: string;
  startDate?: Date;
  endDate?: Date;
  onDateChange: (startDate?: Date, endDate?: Date) => void;
  placeholder?: string;
}

export function DateRangeFilter({ 
  label, 
  startDate, 
  endDate, 
  onDateChange, 
  placeholder = "Select date range" 
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleStartDateSelect = (date: Date | undefined) => {
    onDateChange(date, endDate);
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    onDateChange(startDate, date);
  };

  const clearDates = () => {
    onDateChange(undefined, undefined);
    setIsOpen(false);
  };

  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd")}`;
    } else if (startDate) {
      return `From ${format(startDate, "MMM dd")}`;
    } else if (endDate) {
      return `Until ${format(endDate, "MMM dd")}`;
    }
    return placeholder;
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-600">{label}:</label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[200px] justify-start text-left font-normal",
              !startDate && !endDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={handleStartDateSelect}
                className={cn("p-3 pointer-events-auto")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={handleEndDateSelect}
                className={cn("p-3 pointer-events-auto")}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setIsOpen(false)}>
                Apply
              </Button>
              <Button size="sm" variant="outline" onClick={clearDates}>
                Clear
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}