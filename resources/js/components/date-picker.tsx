import { format } from "date-fns"
// Premium DatePicker Wrapper
import { Calendar as CalendarIcon } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value?: string | null
  onChange?: (date: string | null) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  id?: string
  "aria-invalid"?: boolean
}

export function DatePicker({ value, onChange, placeholder = "Pick a date", className, disabled, id, "aria-invalid": ariaInvalid }: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value + 'T00:00:00') : undefined
  )
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (value) {
      setDate(new Date(value + 'T00:00:00'))
    } else {
      setDate(undefined)
    }
  }, [value])

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)

    if (onChange) {
      if (selectedDate) {
        onChange(format(selectedDate, "yyyy-MM-dd"))
      } else {
        onChange(null)
      }
    }

    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          className={cn(
            "w-full justify-start text-left font-normal bg-transparent rounded-2xl h-10 px-4",
            !date && "text-muted-foreground",
            ariaInvalid && "border-destructive focus-visible:ring-destructive",
            className
          )}
        >
          <CalendarIcon className="mr-3 h-4 w-4 opacity-70" />
          {date ? <span className="font-medium text-foreground">{format(date, "MMMM d, yyyy")}</span> : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 matte-card elev-3 rounded-2xl border-border/20 shadow-xl overflow-hidden" align="start">
        <div className="flex flex-col">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
          />
          <div className="p-4 border-t border-border/5 bg-[#0a0a0a]">
            <Button
              variant="default"
              size="default"
              className="w-full h-12 rounded-2xl bg-[#111111] hover:bg-[#1a1a1a] text-white font-bold transition-all border-none shadow-lg"
              onClick={() => handleSelect(undefined)}
            >
              Clear
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
