import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface MultiSelectOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
}

interface MultiSelectFilterProps {
  label: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
}

export function MultiSelectFilter({
  label,
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search options..."
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);

  const toggleOption = (value: string) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onSelectionChange(newSelection);
  };

  const clearSelection = () => {
    onSelectionChange([]);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) {
      const option = options.find(opt => opt.value === selectedValues[0]);
      return option?.label || selectedValues[0];
    }
    return `${selectedValues.length} selected`;
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-600">{label}:</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {getDisplayText()}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleOption(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValues.includes(option.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.icon && <option.icon className="mr-2 h-4 w-4" />}
                    <span className={option.color ? `text-${option.color}-600` : ""}>
                      {option.label}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedValues.map((value) => {
            const option = options.find(opt => opt.value === value);
            return (
              <Badge key={value} variant="secondary" className="text-xs">
                {option?.label || value}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
                  onClick={() => toggleOption(value)}
                >
                  ×
                </Button>
              </Badge>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            className="h-5 text-xs text-slate-500 hover:text-slate-700"
            onClick={clearSelection}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}