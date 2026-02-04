import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Camera, Upload, Save, X, Pencil, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useGetAllEntries, useCreateOrUpdateEntry, useGetCallerUserProfile } from '../hooks/useQueries';
import type { DailyEntry, Workout } from '../backend';
import { ExternalBlob, Variant_kg_lbs, Variant_cm_inches } from '../backend';
import { toast } from 'sonner';
import CameraCapture from './CameraCapture';
import { dateToTime, resetToStartOfDay } from '../utils/time';

interface DayDetailViewProps {
  date: Date;
  onClose: () => void;
  onNavigate: (direction: number) => void;
}

export default function DayDetailView({ date, onClose, onNavigate }: DayDetailViewProps) {
  const { data: entries = [] } = useGetAllEntries();
  const { data: userProfile } = useGetCallerUserProfile();
  const createOrUpdateMutation = useCreateOrUpdateEntry();

  const [showCamera, setShowCamera] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [imageBlob, setImageBlob] = useState<ExternalBlob | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [muscleGroups, setMuscleGroups] = useState('');
  const [duration, setDuration] = useState('');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Normalize date to local start of day and convert to Time
  const normalizedDate = resetToStartOfDay(date);
  const dateTimestamp = dateToTime(normalizedDate);
  const existingEntry = entries.find((e) => e.date === dateTimestamp);

  useEffect(() => {
    if (existingEntry) {
      setWeight(existingEntry.weight?.value.toString() || '');
      setChest(existingEntry.chest?.value.toString() || '');
      setWaist(existingEntry.waist?.value.toString() || '');
      setHips(existingEntry.hips?.value.toString() || '');
      
      if (existingEntry.workouts.length > 0) {
        setMuscleGroups(existingEntry.workouts[0].muscleGroups);
        setDuration(existingEntry.workouts[0].duration.toString());
      }

      if (existingEntry.image) {
        setImageBlob(existingEntry.image);
        setImageUrl(existingEntry.image.getDirectURL());
      }
    } else {
      setWeight('');
      setChest('');
      setWaist('');
      setHips('');
      setMuscleGroups('');
      setDuration('');
      setImageBlob(null);
      setImageUrl(null);
    }
  }, [existingEntry, dateTimestamp]);

  const handlePhotoCapture = (blob: ExternalBlob) => {
    setImageBlob(blob);
    setImageUrl(blob.getDirectURL());
    setShowCamera(false);
    toast.success('Photo captured successfully!');
  };

  const handleCameraClose = () => {
    setShowCamera(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array);
      setImageBlob(blob);
      setImageUrl(blob.getDirectURL());
      toast.success('Photo uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload photo');
    }
  };

  const handleSave = async () => {
    try {
      const measurementUnit = userProfile?.units.measurements || Variant_cm_inches.cm;

      const workouts: Workout[] = muscleGroups && duration
        ? [{
            muscleGroups,
            duration: BigInt(duration),
            date: dateTimestamp,
          }]
        : [];

      const entry: DailyEntry = {
        date: dateTimestamp,
        image: imageBlob || undefined,
        weight: weight
          ? {
              value: parseFloat(weight),
              unit: measurementUnit,
              date: dateTimestamp,
            }
          : undefined,
        chest: chest
          ? {
              value: parseFloat(chest),
              unit: measurementUnit,
              date: dateTimestamp,
            }
          : undefined,
        waist: waist
          ? {
              value: parseFloat(waist),
              unit: measurementUnit,
              date: dateTimestamp,
            }
          : undefined,
        hips: hips
          ? {
              value: parseFloat(hips),
              unit: measurementUnit,
              date: dateTimestamp,
            }
          : undefined,
        workouts,
      };

      await createOrUpdateMutation.mutateAsync(entry);
      toast.success('Day saved successfully!');
      setShowEditor(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save entry');
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      onNavigate(1);
    }
    if (isRightSwipe) {
      onNavigate(-1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      onNavigate(-1);
    } else if (e.key === 'ArrowRight') {
      onNavigate(1);
    } else if (e.key === 'Escape') {
      if (showEditor) {
        setShowEditor(false);
      } else {
        onClose();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showEditor]);

  const weightUnit = userProfile?.units.weight === Variant_kg_lbs.kg ? 'kg' : 'lbs';
  const measurementUnit = userProfile?.units.measurements === Variant_cm_inches.cm ? 'cm' : 'inches';

  // Check if there's any data to display
  const hasData = weight || chest || waist || hips || muscleGroups || duration;

  // Calculate day variance using local time
  const getDayVariance = (date: Date): { diffDays: number; label: string } => {
    const now = new Date();
    const entryDate = new Date(date);
    
    // Reset time to midnight for accurate day comparison (local time)
    now.setHours(0, 0, 0, 0);
    entryDate.setHours(0, 0, 0, 0);
    
    const diffTime = now.getTime() - entryDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    // Format as signed day variance
    let label: string;
    if (diffDays === 0) {
      label = '0d';
    } else if (diffDays > 0) {
      label = `-${diffDays}d`;
    } else {
      label = `+${Math.abs(diffDays)}d`;
    }
    
    return { diffDays, label };
  };

  const { label: dayVarianceLabel } = getDayVariance(date);

  // Format date without suffix
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Full-screen photo view */}
      <div className="relative h-full w-full">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Body photo"
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-900">
            <div className="text-center text-gray-400">
              <Camera className="mx-auto mb-4 h-24 w-24" />
              <p className="text-xl">No photo for this day</p>
              <p className="mt-2 text-sm">Click Edit to add a photo</p>
            </div>
          </div>
        )}

        {/* Date overlay - top-left with icon and day variance */}
        <div className="absolute left-4 top-4 rounded-lg bg-black/70 px-4 py-2 text-white backdrop-blur-md">
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold">
              {formatDate(date)}
            </p>
            <div className="flex items-center gap-1 text-sm text-white/70">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-medium">{dayVarianceLabel}</span>
            </div>
          </div>
        </div>

        {/* Top-right overlay buttons: Edit (left) and Close (right) */}
        <div className="absolute right-4 top-4 flex gap-2">
          {/* Edit button with white pencil icon */}
          <button
            onClick={() => setShowEditor(!showEditor)}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/70 text-white shadow-lg ring-1 ring-white/20 backdrop-blur-md transition-all hover:bg-black/80 hover:ring-white/30"
            aria-label="Edit"
          >
            <Pencil className="h-5 w-5" />
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/70 text-white shadow-lg ring-1 ring-white/20 backdrop-blur-md transition-all hover:bg-black/80 hover:ring-white/30"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Day Details overlay - bottom-left (always show when not editing) - COMPACTED */}
        {!showEditor && (
          <div className="absolute bottom-4 left-4 max-w-md rounded-lg bg-gradient-to-t from-black/80 to-black/60 px-3 py-2 text-white backdrop-blur-md">
            <h3 className="mb-1.5 text-lg font-semibold leading-tight">Day Details</h3>
            {hasData ? (
              <div className="space-y-1 text-sm leading-snug">
                {weight && (
                  <div className="grid grid-cols-[auto_1fr] gap-x-3">
                    <span className="text-white/80">Weight:</span>
                    <span className="font-medium text-right">{weight} {weightUnit}</span>
                  </div>
                )}
                {muscleGroups && (
                  <div className="grid grid-cols-[auto_1fr] gap-x-3">
                    <span className="text-white/80 whitespace-nowrap">Muscle Groups:</span>
                    <span className="font-medium text-right break-words">{muscleGroups}</span>
                  </div>
                )}
                {duration && (
                  <div className="grid grid-cols-[auto_1fr] gap-x-3">
                    <span className="text-white/80 whitespace-nowrap">Workout Duration:</span>
                    <span className="font-medium text-right">{duration} min</span>
                  </div>
                )}
                {(chest || waist || hips) && (
                  <div className="mt-1.5 border-t border-white/20 pt-1.5">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/60 leading-tight">Measurements</p>
                    <div className="space-y-0.5">
                      {chest && (
                        <div className="grid grid-cols-[auto_1fr] gap-x-3">
                          <span className="text-white/80">Chest:</span>
                          <span className="font-medium text-right">{chest} {measurementUnit}</span>
                        </div>
                      )}
                      {waist && (
                        <div className="grid grid-cols-[auto_1fr] gap-x-3">
                          <span className="text-white/80">Waist:</span>
                          <span className="font-medium text-right">{waist} {measurementUnit}</span>
                        </div>
                      )}
                      {hips && (
                        <div className="grid grid-cols-[auto_1fr] gap-x-3">
                          <span className="text-white/80">Hips:</span>
                          <span className="font-medium text-right">{hips} {measurementUnit}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-white/70 leading-snug">No details yet</p>
            )}
          </div>
        )}

        {/* Navigation arrows */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 hover:text-white"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate(1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 hover:text-white"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>

        {/* Inline editor overlay - bottom */}
        {showEditor && (
          <div className="absolute inset-x-0 bottom-0 mx-auto max-h-[75vh] w-full max-w-2xl overflow-auto rounded-t-2xl bg-gradient-to-t from-black/95 to-black/85 p-6 text-white backdrop-blur-lg md:inset-x-4 md:bottom-4 md:rounded-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Edit Day Details</h3>
                <button
                  onClick={() => setShowEditor(false)}
                  className="text-white/60 hover:text-white"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Photo actions */}
              <div className="space-y-2">
                <Label className="text-white">Photo</Label>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowCamera(true)}
                    variant="outline"
                    className="flex-1 gap-2 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  >
                    <Camera className="h-4 w-4" />
                    Capture
                  </Button>
                  <label className="flex-1">
                    <Button 
                      variant="outline" 
                      className="w-full gap-2 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white" 
                      asChild
                    >
                      <span>
                        <Upload className="h-4 w-4" />
                        Upload
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Weight */}
              <div>
                <Label htmlFor="weight" className="text-white">
                  Weight ({weightUnit})
                </Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder={`Enter weight in ${weightUnit}`}
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
                />
              </div>

              {/* Body measurements */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="chest" className="text-white">
                    Chest ({measurementUnit})
                  </Label>
                  <Input
                    id="chest"
                    type="number"
                    step="0.1"
                    value={chest}
                    onChange={(e) => setChest(e.target.value)}
                    placeholder="0"
                    className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
                  />
                </div>
                <div>
                  <Label htmlFor="waist" className="text-white">
                    Waist ({measurementUnit})
                  </Label>
                  <Input
                    id="waist"
                    type="number"
                    step="0.1"
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                    placeholder="0"
                    className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
                  />
                </div>
                <div>
                  <Label htmlFor="hips" className="text-white">
                    Hips ({measurementUnit})
                  </Label>
                  <Input
                    id="hips"
                    type="number"
                    step="0.1"
                    value={hips}
                    onChange={(e) => setHips(e.target.value)}
                    placeholder="0"
                    className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
                  />
                </div>
              </div>

              {/* Muscle groups */}
              <div>
                <Label htmlFor="muscleGroups" className="text-white">
                  Muscle Groups Trained
                </Label>
                <Textarea
                  id="muscleGroups"
                  value={muscleGroups}
                  onChange={(e) => setMuscleGroups(e.target.value)}
                  placeholder="e.g., Chest, Back, Legs"
                  rows={2}
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
                />
              </div>

              {/* Workout duration */}
              <div>
                <Label htmlFor="duration" className="text-white">
                  Workout Duration (minutes)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="0"
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={createOrUpdateMutation.isPending}
                  className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Save className="h-4 w-4" />
                  {createOrUpdateMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  onClick={() => setShowEditor(false)}
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handlePhotoCapture}
          onClose={handleCameraClose}
        />
      )}
    </div>
  );
}
