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
    // - any workouts
    const hasImage = !!entry.image;
    const hasMeasurements = !!(entry.weight || entry.chest || entry.waist || entry.hips);
    const hasWorkouts = entry.workouts.length > 0;

    return hasImage || hasMeasurements || hasWorkouts;
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setShowDayDetail(true);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="container mx-auto flex h-full flex-col px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">Your Journey</h2>
          <Button
            onClick={() => setShowComparison(true)}
            variant="outline"
            className="gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            Compare Progress
          </Button>
        </div>

        {/* Fullscreen Calendar */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-4xl">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="mx-auto w-full rounded-md border shadow-lg"
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

      {/* Photo Comparison Modal */}
      {showComparison && (
        <PhotoComparisonView onClose={() => setShowComparison(false)} />
      )}
    </div>
  );
}
