import React from "react";
import { TimeEntry } from "../types/timeEntry";
import TimeEntryComponent from "./TimeEntry";

const baseLeft = 100; 

interface TimelineProps {
  entries: TimeEntry[];
  getLabelColor: (labelName: string) => string;
  onDelete: (id: string) => void;
  onEdit: (entry: TimeEntry) => void;
  selectedDate: string;
  fastingPlan?: { startHour: number; windowHours: number } | null;
}

const Timeline: React.FC<TimelineProps> = ({ entries, getLabelColor, onDelete, onEdit, selectedDate, fastingPlan }) => {
  const [activeEntryId, setActiveEntryId] = React.useState<string | null>(null);
  const timelineHeight = 1440;
  const minuteHeight = timelineHeight / 1440;
  const containerWidth = 600;

  // Helper to format hour into 12-hour label
  const formatHourLabel = (h: number) => {
    const period = h < 12 ? "AM" : "PM";
    const display = h % 12 === 0 ? 12 : h % 12;
    return `${display} ç${period}`;
  };

  // Filter entries for the selected date
  const filteredEntries = entries.filter(entry => entry.date === selectedDate);

  // Convert AM/PM time to minutes from midnight
  const convertToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [time, period] = timeStr.split(" ");
    const [hourStr, minStr] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const minutes = parseInt(minStr, 10);

    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;

    return hour * 60 + minutes;
  };

  const formatDateToLocalString = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toDateString();
  };

  // Sort entries by start time
  const sortedEntries = [...filteredEntries].sort(
    (a, b) => convertToMinutes(a.startTime) - convertToMinutes(b.startTime)
  );

  // fasting overlay positions
  const fastingOverlay = fastingPlan
    ? {
        top: fastingPlan.startHour * 60 * minuteHeight,
        height: fastingPlan.windowHours * 60 * minuteHeight,
      }
    : null;

  return (
    <div style={{ width: '100%', margin: "auto", position: "relative", padding: "20px" }}>
      <div style={{ position: "relative", borderLeft: "4px solid #ddd", paddingLeft: "20px", height: timelineHeight + "px" }}>
        {/* Render Hourly Slots */}
        {Array.from({ length: 24 }).map((_, hour) => (
          <div
            key={hour}
            style={{              top: hour * 60 * minuteHeight,
              height: "60px",
              borderBottom: "1px solid #eee",
              width: "100%",
            }}
          >
            <div style={{ position: "absolute", left: "10px", fontWeight: "bold" }}>{formatHourLabel(hour)}</div>
          </div>
        ))}

        {/* Fasting eating window */}
        {fastingOverlay && (
          <div
            style={{
              position: "absolute",
              top: fastingOverlay.top,
              left: 0,
              height: fastingOverlay.height,
              width: "100%",
              background: "#D6BCFA",
              opacity: 0.2,
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        )}

        {/* Render Entries with Click-to-Bring-to-Front Feature */}
        {sortedEntries.map((entry, index) => {
          const startTotalMins = convertToMinutes(entry.startTime);
          let endTime = entry.endTime || "11:59 PM";
          const endTotalMins = convertToMinutes(endTime);
          const durationMins = endTotalMins - startTotalMins;

          return (
            <div key={entry.id}>
              {/* Transparent Background Block (for Timeline Indicator) */}
              <div
                style={{
                  position: "absolute",
                  top: startTotalMins * minuteHeight,
                  left: "0px",
                  height: durationMins * minuteHeight + "px",
                  width: "60px",
                  backgroundColor: getLabelColor(entry.label) || "#E0E0E0",
                  opacity: 0.3,
                  borderRadius: "5px",
                }}
              />

              {/* Time Entry Box with Click-to-Bring-to-Front */}
              <div
                onClick={() => setActiveEntryId(activeEntryId === entry.id ? null : entry.id || null)}
                style={{
                  position: "absolute",
                  top: startTotalMins * minuteHeight,
                  left: `${baseLeft}px`,
                  width: "220px",
                  cursor: "pointer",
                  zIndex: activeEntryId === entry.id ? 50 : 10, // Bring to front on click
                  transform: activeEntryId === entry.id ? "scale(1.1)" : "scale(1)", // Slight zoom-in effect
                  transition: "transform 0.2s ease-in-out, z-index 0.2s",
                }}
              >
                <TimeEntryComponent
                  entry={entry}
                  getLabelColor={getLabelColor}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
