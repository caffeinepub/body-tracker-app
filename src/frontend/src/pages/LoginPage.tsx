import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { TrendingUp, Camera, BarChart3, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const PREVIEW_IMAGES = [
  { src: '/assets/main1.png', alt: 'Progress comparison with three side-by-side photos' },
  { src: '/assets/cal.png', alt: 'Calendar view with progress tracking' },
  { src: '/assets/main2.png', alt: 'Day details with measurements and variance indicators' },
  { src: '/assets/main4.png', alt: 'Analytics dashboard with weight and body fat charts' },
];

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const isLoggingIn = loginStatus === 'logging-in';

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % PREVIEW_IMAGES.length);
  };

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev - 1 + PREVIEW_IMAGES.length) % PREVIEW_IMAGES.length);
  };

  const goToIndex = (index: number) => {
    setActiveIndex(index);
  };

  // Touch/Mouse drag handlers
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setCurrentX(clientX);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    setCurrentX(clientX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const diff = currentX - startX;
    const threshold = 50; // minimum swipe distance

    if (diff > threshold) {
      goToPrevious();
    } else if (diff < -threshold) {
      goToNext();
    }

    setStartX(0);
    setCurrentX(0);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleDragEnd();
    }
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Wheel/trackpad scroll handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;
    let accumulatedDelta = 0;

    const handleWheel = (e: WheelEvent) => {
      // Only handle horizontal scroll
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        
        accumulatedDelta += e.deltaX;

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          if (accumulatedDelta > 30) {
            goToNext();
          } else if (accumulatedDelta < -30) {
            goToPrevious();
          }
          accumulatedDelta = 0;
        }, 100);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Column - Branding & Features */}
            <div className="flex flex-col justify-center">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  physiq
                </h1>
              </div>

              <h2 className="mb-4 text-3xl font-bold text-foreground lg:text-4xl">
                Track Your Fitness Journey
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Capture daily progress photos, log your workouts, and visualize your transformation with powerful analytics.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
                    <Camera className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Daily Photo Journal</h3>
                    <p className="text-sm text-muted-foreground">
                      Capture and compare your progress with before/after photos
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
                    <BarChart3 className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Advanced Analytics</h3>
                    <p className="text-sm text-muted-foreground">
                      Visualize trends with interactive charts and heatmaps
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20">
                    <User className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Personal & Private</h3>
                    <p className="text-sm text-muted-foreground">
                      Your data is secure and only accessible by you
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Preview Gallery & Login Card */}
            <div className="flex flex-col items-center justify-center gap-6">
              {/* Preview Gallery Carousel */}
              <div className="w-[90%] mx-auto">
                <div
                  ref={containerRef}
                  className="relative overflow-hidden rounded-xl"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] w-full">
                    <img
                      src={PREVIEW_IMAGES[activeIndex].src}
                      alt={PREVIEW_IMAGES[activeIndex].alt}
                      className="h-full w-full rounded-xl border-2 border-border/50 object-contain shadow-lg"
                      draggable={false}
                      style={{
                        transform: isDragging ? `translateX(${currentX - startX}px)` : 'none',
                        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                      }}
                    />
                  </div>

                  {/* Left Arrow */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToPrevious();
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70 hover:scale-110 active:scale-95"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  {/* Right Arrow */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToNext();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70 hover:scale-110 active:scale-95"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>

                {/* Dot Indicators */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  {PREVIEW_IMAGES.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToIndex(index)}
                      className={`h-2.5 w-2.5 rounded-full transition-all ${
                        index === activeIndex
                          ? 'bg-blue-500 w-8'
                          : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Login Card */}
              <div className="w-[90%] mx-auto rounded-2xl border border-border bg-card p-8 shadow-xl">
                <div className="mb-6 text-center">
                  <h3 className="mb-2 text-2xl font-bold text-card-foreground">Get Started</h3>
                  <p className="text-muted-foreground">
                    Sign in securely to start tracking your progress
                  </p>
                </div>

                <Button
                  onClick={login}
                  disabled={isLoggingIn}
                  size="lg"
                  className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoggingIn ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <User className="h-5 w-5" />
                      Sign In
                    </>
                  )}
                </Button>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                  Secure authentication powered by Internet Identity
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
