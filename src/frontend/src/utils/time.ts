/**
 * Utility functions for time conversion between JS Date and backend Time (nanoseconds)
 */

import type { Time } from '../backend';

/**
 * Convert JS Date to backend Time (nanoseconds since epoch)
 * Uses BigInt arithmetic to avoid precision loss
 */
export function dateToTime(date: Date): Time {
  const milliseconds = BigInt(date.getTime());
  return milliseconds * BigInt(1000000);
}

/**
 * Convert backend Time (nanoseconds) to JS Date
 */
export function timeToDate(time: Time): Date {
  const milliseconds = Number(time / BigInt(1000000));
  return new Date(milliseconds);
}

/**
 * Get a date N days back from now (local timezone)
 */
export function getDaysBack(days: number): Date {
  const now = new Date();
  const target = new Date(now);
  target.setDate(target.getDate() - days);
  // Reset to start of day (midnight local time)
  target.setHours(0, 0, 0, 0);
  return target;
}

/**
 * Format a date for display (e.g., "4 Feb 2026")
 */
export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a date for compare UI - day and short month only (e.g., "4 Feb")
 */
export function formatDateDayMonth(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Reset a date to start of day (midnight local time)
 * This ensures consistent day boundaries across all timezones
 */
export function resetToStartOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Calculate whole-day variance between two dates (local start-of-day normalized)
 * Returns the number of days between targetDate and actualDate
 * Positive means actualDate is before targetDate (e.g., 7 days back)
 * Negative means actualDate is after targetDate (e.g., 7 days forward)
 */
export function calculateDayVariance(targetDate: Date, actualDate: Date): number {
  const target = resetToStartOfDay(new Date(targetDate));
  const actual = resetToStartOfDay(new Date(actualDate));
  
  const diffTime = target.getTime() - actual.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Format day variance as a label (e.g., "7 days back", "same day", "3 days forward")
 */
export function formatDayVariance(variance: number): string {
  if (variance === 0) {
    return 'same day';
  } else if (variance > 0) {
    return `${variance} day${variance === 1 ? '' : 's'} back`;
  } else {
    return `${Math.abs(variance)} day${Math.abs(variance) === 1 ? '' : 's'} forward`;
  }
}

/**
 * Format day variance as compact signed label for compare UI (e.g., "-30d", "0d", "+5d")
 */
export function formatDayVarianceCompact(variance: number): string {
  if (variance === 0) {
    return '0d';
  } else if (variance > 0) {
    return `-${variance}d`;
  } else {
    return `+${Math.abs(variance)}d`;
  }
}

/**
 * Calculate day offset from today to a given date (local start-of-day normalized)
 * Returns the number of days between today and the given date
 * Negative means the date is in the past (e.g., -30 for 30 days ago)
 * Positive means the date is in the future (e.g., +5 for 5 days from now)
 * Zero means today
 */
export function calculateDayOffsetFromToday(date: Date): number {
  const today = resetToStartOfDay(new Date());
  const target = resetToStartOfDay(new Date(date));
  
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Format day offset from today as compact signed label (e.g., "-30d", "0d", "+5d")
 */
export function formatDayOffsetFromToday(offset: number): string {
  if (offset === 0) {
    return '0d';
  } else if (offset < 0) {
    return `${offset}d`;
  } else {
    return `+${offset}d`;
  }
}
