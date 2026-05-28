import * as React from "react"
// Premium Apple-Grade Calendar Component
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { useDayPicker, useNavigation } from "react-day-picker"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function CalendarCaption({ displayMonth, onMonthChange }: { displayMonth: Date, onMonthChange: (d: Date) => void }) {
  const currentYear = displayMonth.getFullYear()
  const currentMonth = displayMonth.getMonth()

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const years = Array.from(
    { length: new Date().getFullYear() - 1920 + 11 },
    (_, i) => 1920 + i
  ).reverse()

  const decadeGroups: Record<number, number[]> = {}
  years.forEach((year: number) => {
    const decade = Math.floor(year / 10) * 10
    if (!decadeGroups[decade]) {
      decadeGroups[decade] = []
    }
    decadeGroups[decade].push(year)
  })

  const sortedDecades = Object.keys(decadeGroups)
    .map(Number)
    .sort((a, b) => b - a)

  const handleMonthChange = (val: string) => {
    const newDate = new Date(displayMonth)
    newDate.setMonth(parseInt(val))
    onMonthChange(newDate)
  }

  const handleYearChange = (val: string) => {
    const newDate = new Date(displayMonth)
    newDate.setFullYear(parseInt(val))
    onMonthChange(newDate)
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      <Select value={currentMonth.toString()} onValueChange={handleMonthChange}>
        <SelectTrigger className="h-10 px-4 bg-secondary border border-border rounded-2xl text-base font-bold text-secondary-foreground hover:bg-secondary/80 transition-all focus:ring-0 gap-2 min-w-[90px] justify-center cursor-pointer shadow-sm">
          <SelectValue>{months[currentMonth]}</SelectValue>
        </SelectTrigger>
        <SelectContent className="matte-card elev-4 border-border max-h-[350px]">
          {months.map((month, i) => (
            <SelectItem key={i} value={i.toString()} className="text-sm font-medium focus:item-hover-gradient">
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentYear.toString()} onValueChange={handleYearChange}>
        <SelectTrigger className="h-10 px-4 bg-secondary border border-border rounded-2xl text-base font-bold text-secondary-foreground hover:bg-secondary/80 transition-all focus:ring-0 gap-2 min-w-[85px] justify-center cursor-pointer shadow-sm">
          <SelectValue>{currentYear}</SelectValue>
        </SelectTrigger>
        <SelectContent className="matte-card elev-4 border-border max-h-[350px]">
          {sortedDecades.map((decade) => (
            <SelectGroup key={decade}>
              <SelectLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-3 py-2 bg-surface-2/50 font-black">
                {decade}s
              </SelectLabel>
              {decadeGroups[decade].map((year) => (
                <SelectItem key={year} value={year.toString()} className="text-sm font-medium focus:item-hover-gradient">
                  {year}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  month,
  onMonthChange,
  ...props
}: CalendarProps) {
  const [internalMonth, setInternalMonth] = React.useState<Date>(month || new Date());
  
  React.useEffect(() => {
    if (month) setInternalMonth(month);
  }, [month]);
  
  const displayMonth = month || internalMonth;
  const setDisplayMonth = (d: Date) => {
    setInternalMonth(d);
    if (onMonthChange) onMonthChange(d);
  };

  const [direction, setDirection] = React.useState(1);
  const [prevMonth, setPrevMonth] = React.useState(displayMonth);
  
  if (displayMonth.getTime() !== prevMonth.getTime()) {
    setDirection(displayMonth > prevMonth ? 1 : -1);
    setPrevMonth(displayMonth);
  }

  return (
    <div className={cn("p-4", className)}>
      <CalendarCaption displayMonth={displayMonth} onMonthChange={setDisplayMonth} />
      
      {/* Static Weekdays Header */}
      <div className="flex justify-between px-2 mt-4 mb-2">
        <div className="text-[#ff3b30] w-9 font-black text-[0.7rem] uppercase tracking-widest text-center">Sun</div>
        <div className="text-muted-foreground w-9 font-black text-[0.7rem] uppercase tracking-widest opacity-60 text-center">Mon</div>
        <div className="text-muted-foreground w-9 font-black text-[0.7rem] uppercase tracking-widest opacity-60 text-center">Tue</div>
        <div className="text-muted-foreground w-9 font-black text-[0.7rem] uppercase tracking-widest opacity-60 text-center">Wed</div>
        <div className="text-muted-foreground w-9 font-black text-[0.7rem] uppercase tracking-widest opacity-60 text-center">Thu</div>
        <div className="text-muted-foreground w-9 font-black text-[0.7rem] uppercase tracking-widest opacity-60 text-center">Fri</div>
        <div className="text-[#ff3b30] w-9 font-black text-[0.7rem] uppercase tracking-widest text-center">Sat</div>
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={displayMonth.toString()}
            custom={direction}
            variants={{
              enter: (dir: number) => ({ y: dir > 0 ? 150 : -150, opacity: 0 }),
              center: { y: 0, opacity: 1 },
              exit: (dir: number) => ({ y: dir > 0 ? -150 : 150, opacity: 0 })
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          >
            <DayPicker
              month={displayMonth}
              onMonthChange={setDisplayMonth}
              showOutsideDays={showOutsideDays}
              fixedWeeks={true}
              className="p-0"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "hidden", // Hide native caption
                nav: "hidden",
                table: "w-full border-collapse space-y-1",
                head_row: "hidden", // Hide native head row completely
                head_cell: "hidden", 
                row: "flex w-full mt-2 justify-between px-1",
                cell: "h-10 w-10 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                day: cn(
                  buttonVariants({ variant: "ghost" }),
                  "h-10 w-10 p-0 font-bold aria-selected:opacity-100 rounded-full transition-all duration-200 hover:bg-[#22c55e]/10"
                ),
                day_range_end: "day-range-end",
                day_selected:
                  "item-hover-gradient text-[#1c1c1e] hover:item-hover-gradient hover:text-[#1c1c1e] focus:item-hover-gradient focus:text-[#1c1c1e] font-bold shadow-md",
                day_today: "bg-surface-3 text-foreground font-bold",
                day_outside:
                  "day-outside text-muted-foreground opacity-30 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle:
                  "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
                ...classNames,
              }}
              components={{
                Caption: () => null,
                Head: () => null
              }}
              {...props}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
