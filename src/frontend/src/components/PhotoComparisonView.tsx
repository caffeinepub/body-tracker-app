import { useState, useMemo } from 'react';
import { X, FlipHorizontal, Clock, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useGetComparisonEntries } from '../hooks/useQueries';
import { getDaysBack, dateToTime, formatDateShort, resetToStartOfDay, timeToDate, calculateDayVariance, formatDayVariance, calculateDayOffsetFromToday, formatDayOffsetFromToday } from '../utils/time';
import CompareSlotHeader from './compare/CompareSlotHeader';

interface PhotoComparisonViewProps {
  onClose: () => void;
}

type SlotIndex = 1 | 2 | 3;

export default function PhotoComparisonView({ onClose }: PhotoComparisonViewProps) {
  // Initialize with 60 days back, 30 days back, and Today
  const [slot1Date, setSlot1Date] = useState<Date>(getDaysBack(60));
  const [slot2Date, setSlot2Date] = useState<Date>(getDaysBack(30));
  const [slot3Date, setSlot3Date] = useState<Date>(getDaysBack(0));
  const [flipped, setFlipped] = useState(false);
  
  // Track which slot's calendar is open (null = none, showing comparison view)
  const [activeCalendarSlot, setActiveCalendarSlot] = useState<SlotIndex | null>(null);

  // Convert dates to backend Time format
  const target1 = useMemo(() => dateToTime(slot1Date), [slot1Date]);
  const target2 = useMemo(() => dateToTime(slot2Date), [slot2Date]);
  const target3 = useMemo(() => dateToTime(slot3Date), [slot3Date]);

  // Fetch comparison entries with the three target dates
  const { data, isLoading } = useGetComparisonEntries(target1, target2, target3);

  const entry1Url = data?.entry1?.image?.getDirectURL();
  const entry2Url = data?.entry2?.image?.getDirectURL();
  const entry3Url = data?.entry3?.image?.getDirectURL();

  // Calculate variances for each slot (difference between selected date and actual entry date)
  const slot1Variance = data?.entry1 ? calculateDayVariance(slot1Date, timeToDate(data.entry1.date)) : null;
  const slot2Variance = data?.entry2 ? calculateDayVariance(slot2Date, timeToDate(data.entry2.date)) : null;
  const slot3Variance = data?.entry3 ? calculateDayVariance(slot3Date, timeToDate(data.entry3.date)) : null;

  // Calculate day offsets from today for dynamic labels
  const slot1DayOffset = useMemo(() => calculateDayOffsetFromToday(slot1Date), [slot1Date]);
  const slot2DayOffset = useMemo(() => calculateDayOffsetFromToday(slot2Date), [slot2Date]);
  const slot3DayOffset = useMemo(() => calculateDayOffsetFromToday(slot3Date), [slot3Date]);

  const slot1DayOffsetLabel = useMemo(() => formatDayOffsetFromToday(slot1DayOffset), [slot1DayOffset]);
  const slot2DayOffsetLabel = useMemo(() => formatDayOffsetFromToday(slot2DayOffset), [slot2DayOffset]);
  const slot3DayOffsetLabel = useMemo(() => formatDayOffsetFromToday(slot3DayOffset), [slot3DayOffset]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date || !activeCalendarSlot) return;
    
    // Normalize to local start of day to ensure consistent day selection
    const normalizedDate = resetToStartOfDay(date);
    
    if (activeCalendarSlot === 1) {
      setSlot1Date(normalizedDate);
    } else if (activeCalendarSlot === 2) {
      setSlot2Date(normalizedDate);
    } else {
      setSlot3Date(normalizedDate);
    }
    
    // Close the calendar after selection and return to comparison view
    setActiveCalendarSlot(null);
  };

  // Get the currently selected date for the active calendar
  const getActiveSlotDate = (): Date => {
    if (activeCalendarSlot === 1) return slot1Date;
    if (activeCalendarSlot === 2) return slot2Date;
    return slot3Date;
  };

  // Get the slot label for the active calendar
  const getActiveSlotLabel = (): string => {
    if (activeCalendarSlot === 1) return 'Slot 1';
    if (activeCalendarSlot === 2) return 'Slot 2';
    return 'Slot 3';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="relative h-full w-full max-w-6xl overflow-hidden rounded-lg bg-card border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          {activeCalendarSlot !== null ? (
            <>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveCalendarSlot(null)}
                  className="text-foreground hover:bg-muted"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-xl font-semibold text-foreground">
                  Select Date for {getActiveSlotLabel()}
                </h2>
              </div>
            </>
          ) : (
            <h2 className="text-xl font-semibold text-foreground">Progress Comparison</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-5rem)] overflow-auto p-6">
          {activeCalendarSlot !== null ? (
            /* Calendar Picker View */
            <div className="flex items-center justify-center h-full">
              <div className="compare-date-picker-calendar w-full h-full flex items-center justify-center">
                <Calendar
                  mode="single"
                  selected={getActiveSlotDate()}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="rounded-md border border-border"
                />
              </div>
            </div>
          ) : (
            /* Comparison View */
            <>
              <div className="mb-6 flex justify-center">
                <Button
                  onClick={() => setFlipped(!flipped)}
                  variant="outline"
                  className="gap-2"
                >
                  <FlipHorizontal className="h-4 w-4" />
                  {flipped ? 'Show Side by Side' : 'Show Overlay'}
                </Button>
              </div>

              {!flipped ? (
                /* Side by Side View */
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Slot 1 */}
                  <Card className="overflow-hidden border-border">
                    <CompareSlotHeader
                      slotNumber={1}
                      dayOffsetLabel={slot1DayOffsetLabel}
                      selectedDate={slot1Date}
                      onOpenCalendar={() => setActiveCalendarSlot(1)}
                    />
                    <div className="aspect-[3/4] bg-muted relative">
                      {isLoading ? (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          Loading...
                        </div>
                      ) : entry1Url ? (
                        <img
                          src={entry1Url}
                          alt="Comparison slot 1"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          No photo available
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Slot 2 */}
                  <Card className="overflow-hidden border-border">
                    <CompareSlotHeader
                      slotNumber={2}
                      dayOffsetLabel={slot2DayOffsetLabel}
                      selectedDate={slot2Date}
                      onOpenCalendar={() => setActiveCalendarSlot(2)}
                    />
                    <div className="aspect-[3/4] bg-muted relative">
                      {isLoading ? (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          Loading...
                        </div>
                      ) : entry2Url ? (
                        <img
                          src={entry2Url}
                          alt="Comparison slot 2"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          No photo available
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Slot 3 */}
                  <Card className="overflow-hidden border-border">
                    <CompareSlotHeader
                      slotNumber={3}
                      dayOffsetLabel={slot3DayOffsetLabel}
                      selectedDate={slot3Date}
                      onOpenCalendar={() => setActiveCalendarSlot(3)}
                    />
                    <div className="aspect-[3/4] bg-muted relative">
                      {isLoading ? (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          Loading...
                        </div>
                      ) : entry3Url ? (
                        <img
                          src={entry3Url}
                          alt="Comparison slot 3"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          No photo available
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              ) : (
                /* Overlay View */
                <div className="mx-auto max-w-md">
                  <Card className="overflow-hidden border-border">
                    <div className="relative aspect-[3/4] bg-muted">
                      {isLoading ? (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          Loading...
                        </div>
                      ) : (
                        <>
                          {entry1Url && (
                            <img
                              src={entry1Url}
                              alt="Comparison slot 1"
                              className="absolute inset-0 h-full w-full object-cover opacity-50"
                            />
                          )}
                          {entry3Url && (
                            <img
                              src={entry3Url}
                              alt="Comparison slot 3"
                              className="absolute inset-0 h-full w-full object-cover opacity-50"
                            />
                          )}
                          {!entry1Url && !entry3Url && (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                              No photos available for comparison
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex justify-around bg-muted p-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <div className="h-4 w-4 rounded-full bg-destructive" />
                          <Badge variant="outline" className="text-xs font-bold px-1.5 py-0">
                            1
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground">{slot1DayOffsetLabel}</p>
                        <p className="text-xs text-muted-foreground">{formatDateShort(slot1Date)}</p>
                        {slot1Variance !== null && (
                          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Clock className="h-3 w-3" />
                            <span>{formatDayVariance(slot1Variance)}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <div className="h-4 w-4 rounded-full bg-primary" />
                          <Badge variant="outline" className="text-xs font-bold px-1.5 py-0">
                            3
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground">{slot3DayOffsetLabel}</p>
                        <p className="text-xs text-muted-foreground">{formatDateShort(slot3Date)}</p>
                        {slot3Variance !== null && (
                          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Clock className="h-3 w-3" />
                            <span>{formatDayVariance(slot3Variance)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
