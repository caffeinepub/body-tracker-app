export interface NormalizedCameraError {
  type: 'permission' | 'not-found' | 'in-use' | 'constraint' | 'unknown';
  message: string;
  isBlocking: boolean;
}

/**
 * Normalizes camera errors into user-friendly messages.
 * Maps DOMException names and error types to stable error categories.
 */
export function normalizeCameraError(
  error: any
): NormalizedCameraError {
  // Handle error object with type property (from useCamera hook)
  if (error && typeof error === 'object' && 'type' in error) {
    const errorType = error.type;
    
    switch (errorType) {
      case 'permission':
        return {
          type: 'permission',
          message: 'Camera access is blocked. Please allow camera permissions in your browser settings and try again.',
          isBlocking: true,
        };
      case 'not-found':
        return {
          type: 'not-found',
          message: 'No camera found. Please connect a camera and try again.',
          isBlocking: true,
        };
      case 'not-supported':
        return {
          type: 'unknown',
          message: 'Camera is not supported in this browser. Please use a modern browser.',
          isBlocking: true,
        };
      case 'unknown':
      default:
        return {
          type: 'unknown',
          message: error.message || 'An unknown camera error occurred. Please try again.',
          isBlocking: true,
        };
    }
  }

  // Handle DOMException and standard Error objects
  const errorName = (error as any)?.name || '';
  const errorMessage = (error as any)?.message || '';

  // Map DOMException names to error types
  switch (errorName) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return {
        type: 'permission',
        message: 'Camera access is blocked. Please allow camera permissions in your browser settings and try again.',
        isBlocking: true,
      };

    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return {
        type: 'not-found',
        message: 'No camera found. Please connect a camera and try again.',
        isBlocking: true,
      };

    case 'NotReadableError':
    case 'TrackStartError':
      return {
        type: 'in-use',
        message: 'Camera is already in use by another application or tab. Please close other apps using the camera and try again.',
        isBlocking: true,
      };

    case 'OverconstrainedError':
    case 'ConstraintNotSatisfiedError':
      return {
        type: 'constraint',
        message: 'Camera settings could not be applied. The camera may not support the requested features.',
        isBlocking: false, // Non-blocking - camera may still work
      };

    case 'SecurityError':
      return {
        type: 'permission',
        message: 'Camera access blocked due to security restrictions. Please ensure you are using HTTPS.',
        isBlocking: true,
      };

    case 'AbortError':
      return {
        type: 'unknown',
        message: 'Camera access was aborted. Please try again.',
        isBlocking: true,
      };

    case 'TypeError':
      return {
        type: 'unknown',
        message: 'Invalid camera configuration. Please try again.',
        isBlocking: true,
      };

    default:
      return {
        type: 'unknown',
        message: errorMessage || 'An unexpected camera error occurred. Please try again.',
        isBlocking: true,
      };
  }
}
