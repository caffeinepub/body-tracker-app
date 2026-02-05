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
  
  // Harmonious outline colors for each option
  const getOptionBgClass = (slot: 1 | 2 | 3): string => {
    switch (slot) {
      case 1:
        return 'bg-primary/10';
      case 2:
        return 'bg-accent/10';
      case 3:
        return 'bg-chart-3/10';
    }
  };

  const getOptionTextClass = (slot: 1 | 2 | 3): string => {
    switch (slot) {
      case 1:
        return 'text-primary';
      case 2:
        return 'text-accent-foreground';
      case 3:
        return 'text-chart-3';
    }
  };

  // Variance badge styling based on Today-relative offset
  const getVarianceBgClass = (offset: number): string => {
    if (offset === 0) return 'bg-muted';
    if (offset < 0) return 'bg-primary/20'; // Past
    return 'bg-accent/20'; // Future
  };

  const getVarianceTextClass = (offset: number): string => {
    if (offset === 0) return 'text-muted-foreground';
    if (offset < 0) return 'text-primary';
    return 'text-accent-foreground';
  };

  const bgClass = getOptionBgClass(slotNumber);
  const textClass = getOptionTextClass(slotNumber);
  const varianceBgClass = getVarianceBgClass(todayVariance);
  const varianceTextClass = getVarianceTextClass(todayVariance);

  return (
    <>
      {/* Top banner with Option label - flush with card top using negative margin */}
      <div className={`${bgClass} ${textClass} -mt-[1px] py-2.5 px-4 text-center font-bold text-sm tracking-wide`}>
        Option {slotNumber}
      </div>

      {/* Second line: date + variance badge + Change button inline */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border flex-wrap bg-card">
        {/* Left side: date + variance indicator */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Date text */}
          <span className="text-base font-medium text-foreground">
            {formatDateDayMonth(selectedDate)}
          </span>

          {/* Today-relative variance indicator - always visible */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={`${varianceBgClass} ${varianceTextClass} border-0 px-2 py-1 gap-1 cursor-help`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">
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
