import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
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
  options: MultiSelectOption[] | string[];
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
  searchPlaceholder = "Search options...",
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);

  // Normalize options to MultiSelectOption format
  const normalizedOptions: MultiSelectOption[] = options.map(option => 
    typeof option === 'string' 
      ? { value: option, label: option }
      : option
  );

  const handleSelect = (optionValue: string) => {
    const newSelection = selectedValues.includes(optionValue)
      ? selectedValues.filter(value => value !== optionValue)
      : [...selectedValues, optionValue];
    
    onSelectionChange(newSelection);
  };

  const getSelectedLabels = () => {
    return selectedValues
      .map(value => normalizedOptions.find(opt => opt.value === value)?.label || value)
      .filter(Boolean);
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) {
      return getSelectedLabels()[0];
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
                {normalizedOptions.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option.value)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.icon && (
                        <option.icon className="mr-2 h-4 w-4" />
                      )}
                      <span>{option.label}</span>
                      {option.color && (
                        <div
                          className="ml-auto h-3 w-3 rounded-full"
                          style={{ backgroundColor: option.color }}
                        />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedValues.map((value) => {
            const option = normalizedOptions.find(opt => opt.value === value);
            return (
              <Badge key={value} variant="secondary" className="text-xs">
                {option?.label || value}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
                  onClick={() => handleSelect(value)}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            );
          })}
          {selectedValues.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 text-xs text-slate-500 hover:text-slate-700"
              onClick={clearAll}
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}