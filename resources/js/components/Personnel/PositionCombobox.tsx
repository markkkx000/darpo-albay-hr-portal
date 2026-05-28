import { Check, ChevronsUpDown, Plus } from "lucide-react"
import * as React from "react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface Position {
  id: number;
  name: string;
}

interface FormPosition {
  id?: number | string;
  name: string;
}

export interface PositionComboboxProps {
  positions: Position[];
  value: FormPosition;
  onChange: (value: FormPosition) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function PositionCombobox({ positions, value, onChange, disabled, placeholder = "Select position..." }: PositionComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const uniquePositions = React.useMemo(() => {
    const seen = new Set<string>();

    return positions.filter(p => {
      const lowerName = p.name.toLowerCase();

      if (seen.has(lowerName)) {
return false;
}

      seen.add(lowerName);

      return true;
    });
  }, [positions]);

  const handleSelect = (currentValue: string) => {
    const existing = uniquePositions.find((p) => p.name.toLowerCase() === currentValue.toLowerCase());

    if (existing) {
      onChange({ id: existing.id, name: existing.name });
    } else {
      // It's a new position
      onChange({ id: 'new', name: currentValue });
    }

    setOpen(false)
    setInputValue("")
  }

  // Exact match check
  const hasExactMatch = uniquePositions.some(p => p.name.toLowerCase() === inputValue.toLowerCase());

  // Determine display name
  const displayName = value.id === 'new' ? value.name : positions.find((p) => p.id === value.id)?.name || value.name;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-2xl border border-input bg-transparent px-3 py-2 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            !displayName && "text-muted-foreground"
          )}
        >
          <span className="truncate">{displayName || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command filter={(value, search) => {
          if (value.toLowerCase().includes(search.toLowerCase())) {
            return 1;
          }

          return 0;
        }}>
          <CommandInput
            placeholder="Search or create position..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
              {inputValue ? (
                <div
                  className="relative flex cursor-pointer select-none items-center rounded-2xl px-2 py-1.5 text-sm outline-none hover:item-hover-gradient transition-all"
                  onClick={() => handleSelect(inputValue)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create "{inputValue}"
                </div>
              ) : "No position found."}
            </CommandEmpty>
            <CommandGroup>
              {uniquePositions.map((position) => (
                <CommandItem
                  key={position.id}
                  value={position.name}
                  onSelect={() => handleSelect(position.name)}
                  className="aria-selected:item-hover-gradient rounded-2xl transition-all"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.id === position.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {position.name}
                </CommandItem>
              ))}

              {inputValue && !hasExactMatch && (
                <CommandItem
                  value={inputValue}
                  onSelect={() => handleSelect(inputValue)}
                  className="aria-selected:item-hover-gradient rounded-2xl transition-all"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create "{inputValue}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
