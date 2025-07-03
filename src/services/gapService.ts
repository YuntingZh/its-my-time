import { TimeEntry } from "../types/timeEntry";
import { Gap } from "../types/gap";

// Minimum minutes that count as a real "gap" (change if you want shorter)
const MIN_GAP_MINUTES = 5;

// Helper to convert "HH:MM AM/PM" -> minutes from midnight
function toMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [time, period] = timeStr.trim().split(" ");
  const [hourStr, minuteStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return hour * 60 + minute;
}

/**
 * Find un-logged intervals ("gaps") for a given calendar day.
 * @param entries   All time entries (not yet filtered by date)
 * @param dateStr   Target date in YYYY-MM-DD (same format you store in Firestore)
 */
export function findGaps(entries: TimeEntry[], dateStr: string): Gap[] {
  const dayStart = new Date(`${dateStr}T00:00:00`);
  const now = new Date();
  const analysingToday = now.toLocaleDateString("en-CA") === dateStr;
  const dayEnd = analysingToday ? now : new Date(`${dateStr}T23:59:59`);

  // Filter and sort entries that belong to the day we are analysing
  const todaysEntries = [...entries]
    .filter((e) => e.date === dateStr)
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

  const gaps: Gap[] = [];
  let cursorMinutes = 0; // minutes from midnight

  todaysEntries.forEach((entry) => {
    const startMinutes = toMinutes(entry.startTime);

    // If the gap between the cursor and this entry's start is big enough, record it
    if (startMinutes - cursorMinutes >= MIN_GAP_MINUTES) {
      const gapStart = new Date(dayStart.getTime() + cursorMinutes * 60 * 1000).toISOString();
      const gapEnd = new Date(dayStart.getTime() + startMinutes * 60 * 1000).toISOString();
      gaps.push({ start: gapStart, end: gapEnd });
    }

    // Move cursor to the end of this entry (falls back to start if endTime missing)
    const endMinutes = entry.endTime ? toMinutes(entry.endTime) : startMinutes;
    cursorMinutes = Math.max(cursorMinutes, endMinutes);
  });

  // Final gap from the last entry until end of day / now
  const endMinutesOfDay = analysingToday
    ? now.getHours() * 60 + now.getMinutes()
    : 24 * 60; // 23:59

  if (endMinutesOfDay - cursorMinutes >= MIN_GAP_MINUTES) {
    const gapStart = new Date(dayStart.getTime() + cursorMinutes * 60 * 1000).toISOString();
    const gapEnd = analysingToday ? now.toISOString() : new Date(`${dateStr}T23:59:59`).toISOString();
    gaps.push({ start: gapStart, end: gapEnd });
  }

  return gaps;
} 