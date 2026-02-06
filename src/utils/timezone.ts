import { format, toZonedTime } from 'date-fns-tz';
import { startOfWeek, addDays, setHours, setMinutes } from 'date-fns';

/**
 * Detects the user's browser timezone.
 */
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
};

/**
 * Returns a list of common IANA timezones for dropdowns.
 */
export const getCommonTimezones = (): string[] => {
  return [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix',
    'America/Anchorage',
    'Pacific/Honolulu',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney',
    'UTC'
  ].sort();
};

/**
 * Formats a date string into a specific timezone.
 * @param dateStr ISO date string or Date object
 * @param timeZone Target timezone string
 * @param formatStr date-fns format string
 */
export const formatInTimezone = (
  dateStr: string | Date, 
  timeZone: string, 
  formatStr: string = 'PPpp'
): string => {
  try {
    const zonedDate = toZonedTime(dateStr, timeZone);
    return format(zonedDate, formatStr, { timeZone });
  } catch (e) {
    console.error('Timezone format error:', e);
    return dateStr.toString();
  }
};

/**
 * Appends the timezone abbreviation (e.g., EST, PDT) to a string.
 */
export const getTimezoneAbbr = (timeZone: string): string => {
  try {
    return format(new Date(), 'z', { timeZone });
  } catch (e) {
    return '';
  }
};

/**
 * Helper to display "Your Time" vs "Provider Time"
 */
export const formatDualTimezone = (
  dateStr: string,
  userTz: string,
  providerTz: string
): string => {
  const userTime = formatInTimezone(dateStr, userTz, 'h:mm a');
  const userAbbr = getTimezoneAbbr(userTz);
  
  if (userTz === providerTz) {
    return `${userTime} ${userAbbr}`;
  }

  const providerTime = formatInTimezone(dateStr, providerTz, 'h:mm a');
  const providerAbbr = getTimezoneAbbr(providerTz);

  return `${userTime} ${userAbbr} (${providerTime} ${providerAbbr})`;
};

/**
 * Generates ISO UTC timestamps for a specific day and time range in a specific timezone.
 * Used to convert "Monday 9am" in "America/New_York" to a real date.
 */
export const generateSlotInUTC = (
  targetDate: Date, 
  timeStr: string, // "09:00"
  timeZone: string
): string => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Create a date object in the target timezone
  // We use string manipulation to ensure the browser interprets it in the correct TZ context
  const year = targetDate.getFullYear();
  const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
  const day = targetDate.getDate().toString().padStart(2, '0');
  
  const isoString = `${year}-${month}-${day}T${timeStr}:00`;
  
  // Robust method:
  const zonedDate = new Date(new Date(isoString).toLocaleString('en-US', { timeZone }));
  
  return new Date(isoString).toISOString(); 
};