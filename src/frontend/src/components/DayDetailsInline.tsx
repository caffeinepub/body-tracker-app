import { ReactElement } from 'react';
import { useGetAllEntries, useGetCallerUserProfile } from '../hooks/useQueries';
import { dateToTime, resetToStartOfDay } from '../utils/time';
import { Variant_kg_lbs, Variant_cm_inches } from '../backend';

interface DayDetailsInlineProps {
  selectedDate: Date;
}

export default function DayDetailsInline({ selectedDate }: DayDetailsInlineProps) {
  const { data: entries = [] } = useGetAllEntries();
  const { data: userProfile } = useGetCallerUserProfile();

  // Normalize selected date to local start of day and convert to Time
  const normalizedDate = resetToStartOfDay(selectedDate);
  const dateTimestamp = dateToTime(normalizedDate);
  const existingEntry = entries.find((e) => e.date === dateTimestamp);

  // Get today's entry for variance calculation
  const todayNormalized = resetToStartOfDay(new Date());
  const todayTimestamp = dateToTime(todayNormalized);
  const todayEntry = entries.find((e) => e.date === todayTimestamp);
  const isToday = dateTimestamp === todayTimestamp;

  const weightUnit = userProfile?.units.weight === Variant_kg_lbs.kg ? 'kg' : 'lbs';
  const measurementUnit = userProfile?.units.measurements === Variant_cm_inches.cm ? 'cm' : 'inches';

  // Extract values from entry
  const weight = existingEntry?.weight?.value;
  const bodyFatPercent = existingEntry?.bodyFatPercent;
  const chest = existingEntry?.chest?.value;
  const waist = existingEntry?.waist?.value;
  const hips = existingEntry?.hips?.value;
  const muscleGroups = existingEntry?.workouts?.[0]?.muscleGroups;
  const duration = existingEntry?.workouts?.[0]?.duration;

  // Check if there's any data to display
  const hasData = weight || bodyFatPercent || chest || waist || hips || muscleGroups || duration;

  // Helper to render variance indicator
  const renderVariance = (currentValue: number | undefined, todayValue: number | undefined): ReactElement | null => {
    // Don't show variance if current value is missing
    if (currentValue === undefined) {
      return null;
    }

    // If viewing today, always show 0.0 with neutral styling
    if (isToday) {
      return <span className="variance-neutral ml-1.5">0.0</span>;
    }

    // For non-today dates, only show variance if today's value exists
    if (todayValue === undefined) {
      return null;
    }

    const delta = currentValue - todayValue;
    
    // Format delta with sign, avoiding -0.0
    let formattedDelta: string;
    if (delta === 0 || Object.is(delta, -0)) {
      formattedDelta = '0.0';
    } else if (delta > 0) {
      formattedDelta = `+${delta.toFixed(1)}`;
    } else {
      formattedDelta = delta.toFixed(1);
    }
    
    // Choose class based on sign
    const varianceClass = delta > 0 ? 'variance-positive' : delta < 0 ? 'variance-negative' : 'variance-neutral';
    
    return <span className={`${varianceClass} ml-1.5`}>{formattedDelta}</span>;
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm px-3 py-2.5 border-t border-border/50">
      <div className="mb-1.5 flex items-baseline gap-2">
        <h4 className="text-sm font-semibold text-foreground">Day Details</h4>
        <span className="text-xs text-muted-foreground">vs Today</span>
      </div>
      {hasData ? (
        <div className="space-y-1 text-xs">
          {weight && (
            <div className="flex justify-between items-baseline">
              <span className="text-muted-foreground">Weight:</span>
              <span className="font-medium text-foreground">
                {weight.toFixed(1)} {weightUnit}
                {renderVariance(weight, todayEntry?.weight?.value)}
              </span>
            </div>
          )}
          {bodyFatPercent && (
            <div className="flex justify-between items-baseline">
              <span className="text-muted-foreground">Body Fat:</span>
              <span className="font-medium text-foreground">
                {bodyFatPercent.toFixed(1)}%
                {renderVariance(bodyFatPercent, todayEntry?.bodyFatPercent)}
              </span>
            </div>
          )}
          {muscleGroups && (
            <div className="flex justify-between items-baseline gap-2">
              <span className="text-muted-foreground whitespace-nowrap">Muscle Groups:</span>
              <span className="font-medium text-foreground text-right break-words">{muscleGroups}</span>
            </div>
          )}
          {duration && (
            <div className="flex justify-between items-baseline">
              <span className="text-muted-foreground whitespace-nowrap">Workout Duration:</span>
              <span className="font-medium text-foreground">{duration.toString()} min</span>
            </div>
          )}
          {(chest || waist || hips) && (
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Measurements</p>
              <div className="space-y-0.5">
                {chest && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-muted-foreground">Chest:</span>
                    <span className="font-medium text-foreground">
                      {chest.toFixed(1)} {measurementUnit}
                      {renderVariance(chest, todayEntry?.chest?.value)}
                    </span>
                  </div>
                )}
                {waist && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-muted-foreground">Waist:</span>
                    <span className="font-medium text-foreground">
                      {waist.toFixed(1)} {measurementUnit}
                      {renderVariance(waist, todayEntry?.waist?.value)}
                    </span>
                  </div>
                )}
                {hips && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-muted-foreground">Hips:</span>
                    <span className="font-medium text-foreground">
                      {hips.toFixed(1)} {measurementUnit}
                      {renderVariance(hips, todayEntry?.hips?.value)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No details yet</p>
      )}
    </div>
  );
}
