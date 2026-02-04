import { Clock, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDateDayMonth, formatDayVarianceCompact } from '../../utils/time';

interface CompareSlotHeaderProps {
  slotNumber: 1 | 2 | 3;
  dayOffsetLabel: string;
  selectedDate: Date;
  variance: number | null;
  onOpenCalendar: () => void;
}

export default function CompareSlotHeader({
  slotNumber,
  dayOffsetLabel,
  selectedDate,
  variance,
  onOpenCalendar,
}: CompareSlotHeaderProps) {
  // Harmonious outline colors for each option
  const getOptionBorderClass = (slot: 1 | 2 | 3): string => {
    switch (slot) {
      case 1:
        return 'border-primary';
      case 2:
        return 'border-accent';
      case 3:
        return 'border-chart-3';
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

  // Variance badge styling
  const getVarianceBgClass = (v: number | null): string => {
    if (v === null) return 'bg-muted';
    if (v === 0) return 'bg-muted';
    if (v > 0) return 'bg-destructive/20'; // Further back
    return 'bg-primary/20'; // Closer to target
  };

  const getVarianceTextClass = (v: number | null): string => {
    if (v === null) return 'text-muted-foreground';
    if (v === 0) return 'text-muted-foreground';
    if (v > 0) return 'text-destructive';
    return 'text-primary';
  };

  const borderClass = getOptionBorderClass(slotNumber);
  const textClass = getOptionTextClass(slotNumber);
  const varianceBgClass = getVarianceBgClass(variance);
  const varianceTextClass = getVarianceTextClass(variance);

  return (
    <div className="bg-card">
      {/* Top banner with Option label and harmonious outline */}
      <div className={`border-2 ${borderClass} ${textClass} py-2 px-4 text-center font-bold text-sm tracking-wide`}>
        Option {slotNumber}
      </div>

      {/* Second line: date + variance badge + Change button inline */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border flex-wrap">
        {/* Left side: date + variance indicator */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Date text */}
          <span className="text-base font-medium text-foreground">
            {formatDateDayMonth(selectedDate)}
          </span>

          {/* Variance indicator - icon-first badge with tooltip */}
          {variance !== null && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className={`${varianceBgClass} ${varianceTextClass} border-0 px-2 py-1 gap-1 cursor-help`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">
                      {formatDayVarianceCompact(variance)}
                    </span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {variance === 0
                      ? 'Today'
                      : variance > 0
                      ? `${Math.abs(variance)} day${Math.abs(variance) !== 1 ? 's' : ''} ago`
                      : `${Math.abs(variance)} day${Math.abs(variance) !== 1 ? 's' : ''} from now`}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
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
    </div>
  );
}
