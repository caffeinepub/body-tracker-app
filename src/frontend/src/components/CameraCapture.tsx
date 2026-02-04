import { useEffect, useState, useRef } from 'react';
import { X, Camera, RotateCw, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCamera } from '../camera/useCamera';
import { ExternalBlob } from '../backend';
import { normalizeCameraError, NormalizedCameraError } from '../utils/cameraErrorMapping';
import { applyStandardLensPreference, LensPreferenceResult } from '../utils/cameraLensPreference';
import { isInstalledPWA, isAndroidChromePWA } from '../utils/pwa';

interface CameraCaptureProps {
  onCapture: (blob: ExternalBlob) => void;
  onClose: () => void;
}

interface ZoomCapabilities {
  min: number;
  max: number;
  step: number;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const {
    isActive,
    isSupported,
    error: cameraError,
    isLoading,
    currentFacingMode,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    retry,
    videoRef,
    canvasRef,
  } = useCamera({
    facingMode: 'environment',
    quality: 0.9,
    format: 'image/jpeg',
  });

  const [zoomCapabilities, setZoomCapabilities] = useState<ZoomCapabilities | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(1.0);
  const [availableZoomLevels, setAvailableZoomLevels] = useState<number[]>([]);
  const [displayError, setDisplayError] = useState<NormalizedCameraError | null>(null);
  const [lensPreferenceMessage, setLensPreferenceMessage] = useState<string | null>(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const zoomInitializedRef = useRef(false);
  const lensPreferenceAppliedRef = useRef(false);

  // Start camera on mount
  useEffect(() => {
    const initCamera = async () => {
      const success = await startCamera();
      setCameraStarted(success);
    };
    initCamera();
    
    return () => {
      stopCamera();
    };
  }, []);

  // Handle camera errors - only show blocking errors
  useEffect(() => {
    if (cameraError) {
      const normalized = normalizeCameraError(cameraError);
      
      // Only display blocking errors (permission, not-found, in-use)
      // Ignore non-blocking constraint errors if camera is active
      if (normalized.isBlocking || !isActive) {
        setDisplayError(normalized);
      } else {
        setDisplayError(null);
      }
    } else {
      setDisplayError(null);
    }
  }, [cameraError, isActive]);

  // Apply lens preference and detect zoom capabilities - only when camera is truly ready
  useEffect(() => {
    // Reset initialization flags when camera becomes inactive
    if (!isActive) {
      zoomInitializedRef.current = false;
      lensPreferenceAppliedRef.current = false;
      setZoomCapabilities(null);
      setAvailableZoomLevels([]);
      setLensPreferenceMessage(null);
      return;
    }

    // Only initialize once per camera session
    if (zoomInitializedRef.current && lensPreferenceAppliedRef.current) return;

    // Ensure video element and stream are ready
    if (!videoRef.current) return;
    const video = videoRef.current;
    const stream = video.srcObject as MediaStream;
    if (!stream) return;

    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;

    // Ensure track is live before attempting to read capabilities
    if (videoTrack.readyState !== 'live') return;

    // Apply lens preference first (only once)
    if (!lensPreferenceAppliedRef.current) {
      lensPreferenceAppliedRef.current = true;
      
      applyStandardLensPreference(currentFacingMode, videoTrack)
        .then((result: LensPreferenceResult) => {
          if (result.userMessage) {
            setLensPreferenceMessage(result.userMessage);
            // Auto-hide message after 5 seconds
            setTimeout(() => setLensPreferenceMessage(null), 5000);
          }
        })
        .catch((err) => {
          console.warn('Lens preference application failed:', err);
          // Non-blocking - camera continues to work
        });
    }

    // Initialize zoom (only once)
    if (zoomInitializedRef.current) return;
    zoomInitializedRef.current = true;

    // Wrap everything in try-catch to prevent any zoom errors from breaking the camera
    try {
      const capabilities = videoTrack.getCapabilities() as any;
      
      if (capabilities.zoom) {
        const zoomCap: ZoomCapabilities = {
          min: capabilities.zoom.min || 1,
          max: capabilities.zoom.max || 1,
          step: capabilities.zoom.step || 0.1,
        };
        
        setZoomCapabilities(zoomCap);

        // Generate available zoom levels
        const levels: number[] = [];
        
        // Always include 1.0 if it's in range
        if (1.0 >= zoomCap.min && 1.0 <= zoomCap.max) {
          levels.push(1.0);
        }
        
        // Add other common zoom levels
        for (let z = Math.ceil(zoomCap.min * 10) / 10; z <= zoomCap.max; z += Math.max(0.5, zoomCap.step)) {
          const rounded = Math.round(z * 10) / 10;
          if (!levels.includes(rounded) && rounded >= zoomCap.min && rounded <= zoomCap.max) {
            levels.push(rounded);
          }
        }
        
        // Ensure max is included
        if (!levels.includes(zoomCap.max)) {
          levels.push(zoomCap.max);
        }
        
        levels.sort((a, b) => a - b);
        setAvailableZoomLevels(levels);

        // Apply default zoom=1.0 if supported (non-blocking)
        if (1.0 >= zoomCap.min && 1.0 <= zoomCap.max) {
          videoTrack.applyConstraints({
            advanced: [{ zoom: 1.0 } as any]
          }).then(() => {
            setCurrentZoom(1.0);
          }).catch((err) => {
            // Silently ignore zoom constraint errors - camera still works
            console.warn('Failed to apply default zoom=1.0:', err);
            // Don't stop camera or set error state
          });
        } else {
          // If 1.0 is not in range, use the closest available
          const closest = levels.reduce((prev, curr) => 
            Math.abs(curr - 1.0) < Math.abs(prev - 1.0) ? curr : prev
          );
          setCurrentZoom(closest);
        }
      }
    } catch (err) {
      // Silently ignore any zoom capability errors - camera still works
      console.warn('Zoom capabilities not supported or failed:', err);
      // Don't stop camera or set error state
    }
  }, [isActive, videoRef, currentFacingMode]);

  const handleZoomChange = async (zoomValue: string) => {
    const zoom = parseFloat(zoomValue);
    
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const stream = video.srcObject as MediaStream;
    if (!stream) return;

    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;

    try {
      await videoTrack.applyConstraints({
        advanced: [{ zoom } as any]
      });
      setCurrentZoom(zoom);
    } catch (err) {
      // Silently ignore zoom change errors - camera still works
      console.warn('Failed to apply zoom:', err);
    }
  };

  const handleCapture = async () => {
    const file = await capturePhoto();
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array);
      onCapture(blob);
    }
  };

  const handleClose = async () => {
    await stopCamera();
    onClose();
  };

  const handleRetry = async () => {
    setDisplayError(null);
    setLensPreferenceMessage(null);
    
    // For Android Chrome PWA with permission errors, perform full clean restart
    const isPWA = isAndroidChromePWA();
    const isPermissionError = displayError?.type === 'permission';
    
    if (isPWA && isPermissionError) {
      // Full teardown: stop camera via hook
      await stopCamera();
      
      // Additionally stop any tracks on the video element
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => {
          track.stop();
        });
        // Clear the video element srcObject
        videoRef.current.srcObject = null;
      }
      
      // Small delay to ensure cleanup completes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Fresh start
      const success = await startCamera();
      setCameraStarted(success);
    } else {
      // Normal retry for non-PWA or non-permission errors
      const success = await retry();
      setCameraStarted(success);
    }
  };

  const handleSwitchCamera = async () => {
    // Reset lens preference flag when switching cameras
    lensPreferenceAppliedRef.current = false;
    setLensPreferenceMessage(null);
    
    // For Android Chrome PWA, harden camera switch with full restart on failure
    const isPWA = isAndroidChromePWA();
    
    if (isPWA) {
      const success = await switchCamera();
      
      // If switch failed in PWA mode, perform full clean restart
      if (!success) {
        console.warn('Camera switch failed in PWA mode, performing full restart');
        
        // Full teardown
        await stopCamera();
        
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => {
            track.stop();
          });
          videoRef.current.srcObject = null;
        }
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Restart with opposite facing mode
        const newFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
        await startCamera();
      }
    } else {
      // Normal switch for non-PWA
      await switchCamera();
    }
  };

  // Get PWA-specific permission guidance
  const getPermissionGuidance = (): string => {
    if (!displayError || displayError.type !== 'permission') {
      return displayError?.message || '';
    }

    const isPWA = isInstalledPWA();
    
    if (isPWA) {
      return `${displayError.message}\n\nFor installed apps: Open Chrome Settings → Site Settings → Camera → find this app → Allow. Then fully close and reopen the app.`;
    }
    
    return displayError.message;
  };

  if (isSupported === false) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
        <div className="max-w-md rounded-lg bg-white p-6 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h3 className="mb-2 text-lg font-semibold">Camera Not Supported</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Your browser doesn't support camera access. Please use a modern browser or upload a photo instead.
          </p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between bg-black/50 p-4 text-white backdrop-blur-sm">
        <h3 className="text-lg font-semibold">Capture Photo</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="text-white hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Camera Preview - with explicit aspect ratio container */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
            style={{ minHeight: '200px' }}
          />
        </div>
        <canvas ref={canvasRef} className="hidden" />

        {/* Zoom Control - Only shown when zoom is supported and camera is active */}
        {zoomCapabilities && availableZoomLevels.length > 1 && isActive && !displayError && (
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg bg-black/70 px-3 py-2 text-white backdrop-blur-sm">
              <span className="text-sm font-medium">Zoom</span>
              <Select
                value={currentZoom.toString()}
                onValueChange={handleZoomChange}
                disabled={isLoading}
              >
                <SelectTrigger className="h-8 w-20 border-white/30 bg-white/10 text-white hover:bg-white/20">
                  <SelectValue>{currentZoom.toFixed(1)}x</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableZoomLevels.map((zoom) => (
                    <SelectItem key={zoom} value={zoom.toString()}>
                      {zoom.toFixed(1)}x
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Lens Preference Info Message - Non-blocking guidance */}
        {lensPreferenceMessage && !displayError && isActive && (
          <div className="absolute inset-x-4 top-4 z-10">
            <Alert className="bg-blue-500/90 text-white border-blue-400 backdrop-blur-sm">
              <Info className="h-4 w-4" />
              <AlertDescription>
                {lensPreferenceMessage}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Error Display - Only for blocking errors */}
        {displayError && (
          <div className="absolute inset-x-4 top-4 z-10">
            <Alert variant="destructive" className="bg-destructive/90 text-destructive-foreground backdrop-blur-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex flex-col gap-2">
                <span className="whitespace-pre-line">{getPermissionGuidance()}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  disabled={isLoading}
                  className="self-start bg-white/10 hover:bg-white/20 border-white/30"
                >
                  {isLoading ? 'Retrying...' : 'Retry'}
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Loading Overlay - Only show during initial load, not when camera is active */}
        {isLoading && !isActive && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
            <div className="text-center text-white">
              <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent mx-auto" />
              <p>Starting camera...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls - Always visible, pinned to bottom with safe area padding */}
      <div className="flex shrink-0 items-center justify-center gap-6 bg-black/50 p-6 pb-8 backdrop-blur-sm safe-area-inset-bottom">
        {/* Switch camera button (hidden on desktop, only one camera typically works) */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleSwitchCamera}
          disabled={!isActive || isLoading}
          className="h-14 w-14 rounded-full border-2 border-white bg-white/20 text-white hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed md:hidden"
          aria-label="Switch camera"
        >
          <RotateCw className="h-6 w-6" />
        </Button>

        {/* Capture button - always visible, large and prominent */}
        <Button
          size="icon"
          onClick={handleCapture}
          disabled={!isActive || isLoading}
          className="h-20 w-20 rounded-full border-4 border-white bg-white text-primary shadow-2xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-white/50"
          aria-label="Capture photo"
        >
          <Camera className="h-8 w-8" />
        </Button>

        {/* Spacer for symmetry on mobile */}
        <div className="h-14 w-14 md:hidden" />
      </div>
    </div>
  );
}
