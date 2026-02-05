import { Clock, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDateDayMonth, calculateDayOffsetFromToday, formatDayOffsetFromToday } from '../../utils/time';

interface CompareSlotHeaderProps {
  slotNumber: 1 | 2 | 3;
  dayOffsetLabel: string;
  selectedDate: Date;
  onOpenCalendar: () => void;
}

export default function CompareSlotHeader({
  slotNumber,
  dayOffsetLabel,
  selectedDate,
  onOpenCalendar,
}: CompareSlotHeaderProps) {
  // Calculate Today-relative variance (always visible)
  const todayVariance = calculateDayOffsetFromToday(selectedDate);
  
  // Get the exact border color for this slot's compare section
  const getSlotBorderColor = (slot: 1 | 2 | 3): string => {
    switch (slot) {
      case 1:
        return 'oklch(0.65 0.20 240)'; // Blue
      case 2:
        return 'oklch(0.60 0.22 300)'; // Purple
      case 3:
        return 'oklch(0.65 0.18 200)'; // Cyan
    }
  };

  const slotBorderColor = getSlotBorderColor(slotNumber);

  return (
    <>
      {/* Date + variance badge + Change button inline */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border flex-wrap bg-card">
        {/* Left side: date + variance indicator */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Date text */}
          <span className="text-base font-medium text-foreground">
            {formatDateDayMonth(selectedDate)}
          </span>

          {/* Today-relative variance indicator - always visible with slot-specific color and increased size */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="border-0 px-2.5 py-1.5 gap-1.5 cursor-help text-white"
                  style={{ backgroundColor: slotBorderColor }}
                >
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {formatDayOffsetFromToday(todayVariance)}
                  </span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {todayVariance === 0
                    ? 'Today'
                    : todayVariance < 0
                    ? `${Math.abs(todayVariance)} day${Math.abs(todayVariance) !== 1 ? 's' : ''} ago`
                    : `${Math.abs(todayVariance)} day${Math.abs(todayVariance) !== 1 ? 's' : ''} from now`}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Right side: Change button inline */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenCalendar}
          className="h-8 px-3 gap-1.5 border-border hover:bg-accent hover:text-accent-foreground"
        >
          <CalendarIcon className="h-4 w-4" />
          <span className="text-xs font-medium">Change</span>
        </Button>
      </div>
    </>
  );
}
