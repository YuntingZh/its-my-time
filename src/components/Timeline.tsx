import React from "react";
import { TimeEntry } from "../types";
import TimeEntryComponent from "./TimeEntry";
import { labelColors } from "../colors"; // Adjust path if necessary

const gapWidth = 10; 
const baseLeft = 100; 

interface TimelineProps {
  entries: TimeEntry[];
  onDelete: (id: string) => void;
  onEdit: (entry: TimeEntry) => void;
}

const Timeline: React.FC<TimelineProps> = ({ entries, onDelete, onEdit }) => {
  const timelineHeight = 1440; // Total height in pixels (24 hours * 60 minutes)
  const minuteHeight = timelineHeight / 1440; // Height per minute
  const containerWidth = 600; // Adjust width for better spacing

  // Convert AM/PM time to minutes from midnight
  const convertToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0; // Handle missing time safely

    const [time, period] = timeStr.split(" "); // Split "4:00 PM" into ["4:00", "PM"]
    const [hourStr, minStr] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const minutes = parseInt(minStr, 10);

    // Convert PM times correctly
    if (period === "PM" && hour !== 12) {
      hour += 12;
    }
    // Convert 12 AM (midnight) to 0 hours
    if (period === "AM" && hour === 12) {
      hour = 0;
    }

    return hour * 60 + minutes; // Return total minutes from midnight
  };

  // Sort entries by start time (now correctly handling AM/PM)
  const sortedEntries = [...entries].sort((a, b) => {
    return convertToMinutes(a.startTime) - convertToMinutes(b.startTime);
  });

  return (
    <div style={{ width: containerWidth, margin: "auto", position: "relative", padding: "20px" }}>
      <h3>📊 Detailed Timeline</h3>
      <div style={{ position: "relative", borderLeft: "4px solid #ddd", paddingLeft: "20px", height: timelineHeight + "px" }}>
        {/* Render Hourly Slots */}
        {Array.from({ length: 24 }).map((_, hour) => (
          <div
            key={hour}
            style={{
              position: "absolute",
              top: hour * 60 * minuteHeight,
              height: "60px",
              borderBottom: "1px solid #eee",
              width: "100%",
            }}
          >
            <div style={{ position: "absolute", left: "-80px", fontWeight: "bold" }}>{hour}:00</div>
          </div>
        ))}

        {/* Render Entries with Precise Scaling */}


{sortedEntries.map((entry, index) => {

  const startTotalMins = convertToMinutes(entry.startTime);

  let endTime = entry.endTime;
  if (!endTime) {
    const nextEntry = sortedEntries[index + 1];
    endTime = nextEntry ? nextEntry.startTime : "11:59 PM";
  }

  const endTotalMins = convertToMinutes(endTime);
  const durationMins = endTotalMins - startTotalMins;

  // Detect overlapping events
  let offsetLeft = baseLeft;
  let overlapCount = 0;

  for (let i = 0; i < index; i++) {
    const prevEntry = sortedEntries[i];
    const prevStart = convertToMinutes(prevEntry.startTime);
    const prevEnd = convertToMinutes(prevEntry.endTime || "11:59 PM");

    if (startTotalMins < prevEnd && endTotalMins > prevStart) {
      // If overlapping, increase offset with gap
      overlapCount++;
      offsetLeft = baseLeft + overlapCount * (200 + gapWidth); // Add spacing
    }
  }

  return (
    <div key={entry.id}>
      {/* Transparent Duration Block (Stays on Timeline) */}
      <div
        style={{
          position: "absolute",
          top: startTotalMins * minuteHeight,
          left: "0px", // Align with the timeline
          height: durationMins * minuteHeight + "px",
          width: "60px",
          backgroundColor: labelColors[entry.label] || "#9E9E9E",
          opacity: 0.3,
          borderRadius: "5px",
        }}
      />

      {/* Floating Time Entry Box (Now with proper spacing) */}
      <div
        style={{
          position: "absolute",
          top: startTotalMins * minuteHeight,
          left: `${offsetLeft}px`, // Dynamically shift based on overlap
          width: "220px",
        }}
      >
        <TimeEntryComponent entry={entry} onDelete={onDelete} onEdit={onEdit} />
      </div>
    </div>
  );
})}

      </div>
    </div>
  );
};

export default Timeline;
