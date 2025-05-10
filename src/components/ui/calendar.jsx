
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function Calendar({ className, selected, onSelect, ...props }) {
  const [currentMonth, setCurrentMonth] = React.useState(selected ? new Date(selected.getFullYear(), selected.getMonth()) : new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const numDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const blanks = Array(startDay).fill(null);
  const daysArray = Array.from({ length: numDays }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day) => {
    const newSelectedDate = new Date(year, month, day);
    if (onSelect) {
      onSelect(newSelectedDate);
    }
  };
  
  const monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
  const dayNames = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];


  return (
    <div className={cn("p-3 rounded-md border bg-background w-fit", className)} {...props}>
      <div className="flex items-center justify-between pb-2">
        <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-7 w-7">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium">
          {monthNames[month]} {year}
        </div>
        <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-7 w-7">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 text-xs text-center text-muted-foreground">
        {dayNames.map(day => <div key={day} className="w-9 h-9 flex items-center justify-center">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, i) => <div key={`blank-${i}`} className="w-9 h-9" />)}
        {daysArray.map(day => {
          const date = new Date(year, month, day);
          date.setHours(0,0,0,0);
          const isSelected = selected && date.getTime() === new Date(selected.getFullYear(), selected.getMonth(), selected.getDate()).getTime();
          const isToday = date.getTime() === today.getTime();
          const isPast = date < today;

          return (
            <Button
              key={day}
              variant={isSelected ? 'default' : isToday ? 'secondary' : 'ghost'}
              size="icon"
              className={cn(
                "h-9 w-9 rounded-md font-normal",
                isPast && !isSelected ? "text-muted-foreground opacity-50 cursor-not-allowed" : "hover:bg-accent hover:text-accent-foreground",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                isToday && !isSelected && "bg-accent text-accent-foreground"
              )}
              onClick={() => !isPast && handleDayClick(day)}
              disabled={isPast && !isSelected}
            >
              {day}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
Calendar.displayName = "Calendar"

export { Calendar };
  