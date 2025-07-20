import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface NumericRangeFilterProps {
  label: string;
  min?: number;
  max?: number;
  onRangeChange: (min?: number, max?: number) => void;
  placeholder?: string;
  formatValue?: (value: number) => string;
}

export function NumericRangeFilter({ 
  label, 
  min, 
  max, 
  onRangeChange, 
  placeholder = "Any",
  formatValue = (value) => value.toString()
}: NumericRangeFilterProps) {
  const [minInput, setMinInput] = useState(min?.toString() || "");
  const [maxInput, setMaxInput] = useState(max?.toString() || "");

  const handleApply = () => {
    const minValue = minInput ? parseFloat(minInput) : undefined;
    const maxValue = maxInput ? parseFloat(maxInput) : undefined;
    onRangeChange(minValue, maxValue);
  };

  const handleClear = () => {
    setMinInput("");
    setMaxInput("");
    onRangeChange(undefined, undefined);
  };

  const hasActiveFilter = min !== undefined || max !== undefined;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-600">{label}:</label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder="Min"
          value={minInput}
          onChange={(e) => setMinInput(e.target.value)}
          className="w-20"
        />
        <span className="text-sm text-slate-500">to</span>
        <Input
          type="number"
          placeholder="Max"
          value={maxInput}
          onChange={(e) => setMaxInput(e.target.value)}
          className="w-20"
        />
        <Button size="sm" onClick={handleApply}>
          Apply
        </Button>
        {hasActiveFilter && (
          <Button size="sm" variant="ghost" onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {hasActiveFilter && (
        <Badge variant="secondary" className="w-fit">
          {min !== undefined && max !== undefined 
            ? `${formatValue(min)} - ${formatValue(max)}`
            : min !== undefined 
            ? `≥ ${formatValue(min)}`
            : `≤ ${formatValue(max!)}`}
        </Badge>
      )}
    </div>
  );
}