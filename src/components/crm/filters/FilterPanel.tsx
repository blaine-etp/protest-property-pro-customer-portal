import { useState, ReactNode } from "react";
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface FilterPanelProps {
  title: string;
  children: ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  activeFiltersCount?: number;
  onClearAll?: () => void;
}

export function FilterPanel({ 
  title, 
  children, 
  isOpen = false, 
  onToggle, 
  activeFiltersCount = 0,
  onClearAll 
}: FilterPanelProps) {
  const [internalOpen, setInternalOpen] = useState(isOpen);
  
  const open = onToggle ? isOpen : internalOpen;
  const setOpen = onToggle || setInternalOpen;

  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <CardTitle className="text-base">{title}</CardTitle>
                {activeFiltersCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && onClearAll && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearAll();
                    }}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
                {open ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {children}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}