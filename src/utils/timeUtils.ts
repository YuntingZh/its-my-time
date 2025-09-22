/**
 * Sanitizes and formats time strings into a consistent format.
 * Input examples that will work:
 * - "9am", "9AM", "9:00am", "9:00 am", "09:00 AM"
 * - "13:00", "1300", "13", "1pm", "1 PM"
 * - "2359", "23:59", "11:59 PM", "11:59pm"
 * 
 * Output format: "HH:MM AM/PM" (e.g. "09:00 AM", "01:30 PM")
 */
export function sanitizeTime(input: string): string {
  // Remove extra spaces and convert to lowercase
  let time = input.trim().toLowerCase();
  
  // Extract AM/PM if present
  let isPM = time.includes('pm');
  let isAM = time.includes('am');
  time = time.replace(/[ap]m/, '').trim();
  
  // Handle military time format
  if (time.length === 4 && !time.includes(':')) {
    time = time.slice(0, 2) + ':' + time.slice(2);
  }
  
  // Split hours and minutes
  let [hours, minutes = '00'] = time.split(':').map(part => part.trim());
  
  // Convert hours to number for manipulation
  let hoursNum = parseInt(hours, 10);
  
  // Determine AM/PM for 24-hour format
  if (!isAM && !isPM && hoursNum >= 12) {
    isPM = true;
    if (hoursNum > 12) hoursNum -= 12;
  }
  
  // Handle 12-hour format edge cases
  if (isPM && hoursNum < 12) hoursNum += 12;
  if (isAM && hoursNum === 12) hoursNum = 0;
  
  // Convert back to 12-hour format
  let displayHours = hoursNum % 12;
  if (displayHours === 0) displayHours = 12;
  
  // Format the final string
  const period = (isPM || hoursNum >= 12) ? 'PM' : 'AM';
  return `${String(displayHours).padStart(2, '0')}:${minutes.padStart(2, '0')} ${period}`;
}

/**
 * Converts time string to minutes since midnight
 * Input should be in "HH:MM AM/PM" format
 */
export function timeToMinutes(timeStr: string): number {
  const [time, period] = timeStr.split(' ');
  const [h, m] = time.split(':').map(Number);
  let hours = h;
  
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return hours * 60 + m;
}

/**
 * Validates if a time string is in correct format and represents a valid time
 * Returns true if valid, false otherwise
 */
export function isValidTime(timeStr: string): boolean {
  try {
    const sanitized = sanitizeTime(timeStr);
    const minutes = timeToMinutes(sanitized);
    return minutes >= 0 && minutes < 24 * 60;
  } catch {
    return false;
  }
}
