/**
 * PWA detection and environment utilities for Android Chrome installed PWA handling.
 */

/**
 * Detects if the app is running as an installed PWA (Progressive Web App).
 * Checks for standalone display mode on both Android/Chrome and iOS Safari.
 */
export function isInstalledPWA(): boolean {
  // Check for standalone display mode (Android Chrome, desktop PWA)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  // Check for iOS standalone mode
  if ((navigator as any).standalone === true) {
    return true;
  }

  return false;
}

/**
 * Detects if the environment is Android Chrome (or Chromium-based browser on Android).
 * This is a high-level check for gating Android-specific behavior.
 */
export function isAndroidChrome(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  const isAndroid = userAgent.includes('android');
  const isChrome = userAgent.includes('chrome') && !userAgent.includes('edg'); // Exclude Edge
  
  return isAndroid && isChrome;
}

/**
 * Detects if the app is running as an installed PWA on Android Chrome specifically.
 * This combination requires special camera permission handling.
 */
export function isAndroidChromePWA(): boolean {
  return isInstalledPWA() && isAndroidChrome();
}
