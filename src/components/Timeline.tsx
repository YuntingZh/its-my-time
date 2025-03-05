import React from "react";
import { TimeEntry } from "../types";
import TimeEntryComponent from "./TimeEntry";

interface TimelineProps {
  entries: TimeEntry[];
}

// Generate a list of hourly time slots (00:00 - 23:00)
const generateHourlySlots = () => {
  return Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0") + ":00"; // "00:00", "01:00", etc.
    return hour;
  });
};

const Timeline: React.FC<TimelineProps> = ({ entries }) => {
  const hours = generateHourlySlots(); // Create 24-hour slots

  return (
    <div style={{ width: "100%", maxWidth: "800px", margin: "auto", padding: "20px" }}>
      <h3>📊 Structured Timeline</h3>
      <div style={{ display: "flex", flexDirection: "column", borderLeft: "4px solid #ddd", paddingLeft: "10px" }}>
        {hours.map((hour) => (
          <div key={hour} style={{ position: "relative", marginBottom: "10px" }}>
            {/* Hour Label */}
            <div style={{ fontWeight: "bold", marginBottom: "5px" }}>{hour}</div>

            {/* Find entries that match this hour */}
            {entries
              .filter((entry) => entry.startTime.startsWith(hour.split(":")[0])) // Match hour
              .map((entry) => (
                <TimeEntryComponent key={entry.id} entry={entry} />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
