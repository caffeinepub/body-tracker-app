import { isAndroidChromePWA } from './pwa';

/**
 * Camera lens preference utility for selecting standard rear lens over ultrawide/fisheye.
 * Uses safe, non-blocking heuristics to prefer normal rear camera when available.
 */

export interface LensPreferenceResult {
  applied: boolean;
  reason: 'success' | 'no-device-info' | 'constraint-rejected' | 'not-environment' | 'no-track' | 'pwa-skipped';
  userMessage?: string;
}

/**
 * Attempts to prefer the standard rear lens by applying device-specific constraints.
 * This is a best-effort, non-blocking operation that falls back gracefully.
 * 
 * Strategy:
 * 1. Enumerate media devices to find rear cameras
 * 2. Prefer devices with labels suggesting standard lens (avoid "ultra", "wide", "fisheye")
 * 3. If multiple rear cameras exist, try to select the standard one
 * 
 * IMPORTANT: On Android Chrome installed PWA, applying deviceId exact constraints
 * can cause stuck permission states. This function skips device switching in that environment.
 * 
 * @param facingMode - Current facing mode ('user' or 'environment')
 * @param videoTrack - Active video track from the camera stream
 * @returns Result indicating whether preference was applied and any user-facing message
 */
export async function applyStandardLensPreference(
  facingMode: 'user' | 'environment',
  videoTrack: MediaStreamTrack | null
): Promise<LensPreferenceResult> {
  // Only apply to rear camera
  if (facingMode !== 'environment') {
    return {
      applied: false,
      reason: 'not-environment',
    };
  }

  if (!videoTrack) {
    return {
      applied: false,
      reason: 'no-track',
    };
  }

  // Skip device switching on Android Chrome PWA to avoid stuck permission states
  if (isAndroidChromePWA()) {
    return {
      applied: false,
      reason: 'pwa-skipped',
      userMessage: 'Using default rear camera. Lens selection is limited in installed app mode.',
    };
  }

  try {
    // Try to enumerate devices to find available cameras
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === 'videoinput');

    // If we don't have device labels (permission not granted or browser limitation),
    // we can't reliably distinguish between cameras
    const hasLabels = videoDevices.some(d => d.label && d.label.trim() !== '');
    
    if (!hasLabels || videoDevices.length === 0) {
      return {
        applied: false,
        reason: 'no-device-info',
        userMessage: 'Unable to select specific camera lens. Using default rear camera.',
      };
    }

    // Get current device ID if available
    const currentSettings = videoTrack.getSettings();
    const currentDeviceId = currentSettings.deviceId;

    // Find rear-facing cameras (look for labels suggesting rear camera)
    const rearCameras = videoDevices.filter(device => {
      const label = device.label.toLowerCase();
      // Common patterns for rear cameras
      return (
        label.includes('back') ||
        label.includes('rear') ||
        label.includes('environment') ||
        // Exclude front-facing indicators
        (!label.includes('front') && !label.includes('user') && !label.includes('face'))
      );
    });

    if (rearCameras.length === 0) {
      // No identifiable rear cameras, use current
      return {
        applied: false,
        reason: 'no-device-info',
        userMessage: 'Unable to identify rear camera. Using default camera.',
      };
    }

    // If only one rear camera, we're already using it
    if (rearCameras.length === 1) {
      return {
        applied: true,
        reason: 'success',
      };
    }

    // Multiple rear cameras - prefer standard lens
    // Avoid ultrawide/fisheye by filtering out those keywords
    const standardCameras = rearCameras.filter(device => {
      const label = device.label.toLowerCase();
      return (
        !label.includes('ultra') &&
        !label.includes('wide') &&
        !label.includes('fisheye') &&
        !label.includes('0.5') && // Common zoom indicator for ultrawide
        !label.includes('0.6')
      );
    });

    // If we found standard cameras, prefer the first one
    let preferredDeviceId: string | undefined;
    
    if (standardCameras.length > 0) {
      preferredDeviceId = standardCameras[0].deviceId;
    } else {
      // All rear cameras seem to be ultrawide/fisheye, use the first rear camera
      preferredDeviceId = rearCameras[0].deviceId;
    }

    // If we're already using the preferred device, no need to switch
    if (currentDeviceId === preferredDeviceId) {
      return {
        applied: true,
        reason: 'success',
      };
    }

    // Try to switch to the preferred device
    // This is non-blocking - if it fails, the camera continues with current device
    try {
      await videoTrack.applyConstraints({
        deviceId: { exact: preferredDeviceId },
      });

      return {
        applied: true,
        reason: 'success',
      };
    } catch (constraintError) {
      // Constraint rejected - device may not support switching or device is unavailable
      console.warn('Failed to apply device constraint for standard lens:', constraintError);
      
      return {
        applied: false,
        reason: 'constraint-rejected',
        userMessage: 'Unable to switch to standard lens. Using available camera.',
      };
    }
  } catch (error) {
    // Any error in device enumeration or processing
    console.warn('Error in lens preference detection:', error);
    
    return {
      applied: false,
      reason: 'no-device-info',
      userMessage: 'Unable to detect camera type. Using default camera.',
    };
  }
}
