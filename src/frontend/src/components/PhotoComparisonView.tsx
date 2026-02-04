import { useState } from 'react';
import { X, FlipHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGetComparisonImages } from '../hooks/useQueries';

interface PhotoComparisonViewProps {
  onClose: () => void;
}

export default function PhotoComparisonView({ onClose }: PhotoComparisonViewProps) {
  const { data } = useGetComparisonImages();
  const [flipped, setFlipped] = useState(false);

  const day1Url = data?.day1?.image?.getDirectURL();
  const day30Url = data?.day30?.image?.getDirectURL();
  const day90Url = data?.day90?.image?.getDirectURL();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="relative h-full w-full max-w-6xl overflow-hidden rounded-lg bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 text-white">
          <h2 className="text-xl font-semibold">Progress Comparison</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-5rem)] overflow-auto p-6">
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
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 text-center text-white font-semibold">
                  Day 1
                </div>
                <div className="aspect-[3/4] bg-gray-100">
                  {day1Url ? (
                    <img
                      src={day1Url}
                      alt="Day 1"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      No photo available
                    </div>
                  )}
                </div>
              </Card>

              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-center text-white font-semibold">
                  Day 30
                </div>
                <div className="aspect-[3/4] bg-gray-100">
                  {day30Url ? (
                    <img
                      src={day30Url}
                      alt="Day 30"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      No photo available
                    </div>
                  )}
                </div>
              </Card>

              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2 text-center text-white font-semibold">
                  Day 90
                </div>
                <div className="aspect-[3/4] bg-gray-100">
                  {day90Url ? (
                    <img
                      src={day90Url}
                      alt="Day 90"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      No photo available
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ) : (
            /* Overlay View */
            <div className="mx-auto max-w-md">
              <Card className="overflow-hidden">
                <div className="relative aspect-[3/4] bg-gray-100">
                  {day1Url && (
                    <img
                      src={day1Url}
                      alt="Day 1"
                      className="absolute inset-0 h-full w-full object-cover opacity-50"
                    />
                  )}
                  {day90Url && (
                    <img
                      src={day90Url}
                      alt="Day 90"
                      className="absolute inset-0 h-full w-full object-cover opacity-50"
                    />
                  )}
                  {!day1Url && !day90Url && (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      No photos available for comparison
                    </div>
                  )}
                </div>
                <div className="flex justify-around bg-gray-50 p-4">
                  <div className="text-center">
                    <div className="h-4 w-4 rounded-full bg-green-500 mx-auto mb-1" />
                    <p className="text-sm font-medium">Day 1</p>
                  </div>
                  <div className="text-center">
                    <div className="h-4 w-4 rounded-full bg-purple-500 mx-auto mb-1" />
                    <p className="text-sm font-medium">Day 90</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
