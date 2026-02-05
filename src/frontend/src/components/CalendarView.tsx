import { useState } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useGetAllEntries } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { ImageIcon } from 'lucide-react';
import DayDetailView from './DayDetailView';
import PhotoComparisonView from './PhotoComparisonView';
import { timeToDate } from '../utils/time';

export default function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showDayDetail, setShowDayDetail] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const { data: entries = [] } = useGetAllEntries();

  const entriesMap = new Map(
    entries.map((entry) => [
      timeToDate(entry.date).toDateString(),
      entry,
    ])
  );

  const hasSavedContent = (date: Date) => {
    const entry = entriesMap.get(date.toDateString());
    if (!entry) return false;

    // Check if entry has any saved content:
    // - image present
    // - any measurement present (weight, chest, waist, hips)
    // - body fat percentage present
    // - any workouts
    const hasImage = !!entry.image;
    const hasMeasurements = !!(entry.weight || entry.chest || entry.waist || entry.hips);
    const hasBodyFat = entry.bodyFatPercent !== undefined;
    const hasWorkouts = entry.workouts.length > 0;

    return hasImage || hasMeasurements || hasBodyFat || hasWorkouts;
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setShowDayDetail(true);
    }
  };

  // If showing comparison, render it as full-page view
  if (showComparison) {
    return <PhotoComparisonView onClose={() => setShowComparison(false)} />;
  }

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="container mx-auto flex h-full flex-col px-4 py-8">
        {/* Header with huge Compare Progress button on the right */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:items-stretch md:gap-6">
          {/* Left column: Heading */}
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-foreground">
              Your Journey
              <span className="mt-1 block text-sm font-normal text-muted-foreground">
                Track & compare your progress day by day
              </span>
            </h2>
          </div>

          {/* Right column: Huge Compare Progress button */}
          <div className="flex items-stretch md:min-h-[120px]">
            <Button
              onClick={() => setShowComparison(true)}
              variant="outline"
              className="h-full w-full gap-3 border-2 border-border text-lg font-semibold md:text-xl"
            >
              <ImageIcon className="h-6 w-6 md:h-8 md:w-8" />
              Compare Progress
            </Button>
          </div>
        </div>

        {/* Fullscreen Calendar */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-4xl">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="mx-auto w-full rounded-md border-2 border-border shadow-lg"
              modifiers={{
                hasSavedContent: (date) => hasSavedContent(date),
              }}
              modifiersClassNames={{
                hasSavedContent: 'has-saved-content',
              }}
            />
          </div>
        </div>

        {/* Navigation Hint */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Click on any date to view or add an entry
          </p>
        </div>
      </div>

      {/* Day Detail Modal */}
      {showDayDetail && selectedDate && (
        <DayDetailView
          date={selectedDate}
          onClose={() => setShowDayDetail(false)}
          onNavigate={(direction) => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + direction);
            setSelectedDate(newDate);
          }}
        />
      )}
    </div>
  );
}
