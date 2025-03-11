import React, { useState } from "react";
import { TimeEntry } from "../types/timeEntry";
import TimeEntryComponent from "./TimeEntry";
import Charts from "./Charts";

const baseLeft = 100; 

interface TimelineProps {
  entries: TimeEntry[];
  getLabelColor: (labelName: string) => string;
  onDelete: (id: string) => void;
  onEdit: (entry: TimeEntry) => void;
}

const Timeline: React.FC<TimelineProps> = ({ entries, getLabelColor, onDelete, onEdit }) => {
  const today = new Date().toLocaleDateString("en-CA");
  const [selectedDate, setSelectedDate] = useState(today);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null); // Track which entry is in front

  // Filter entries for the selected date
  const filteredEntries = entries.filter(entry => entry.date === selectedDate);
  const timelineHeight = 1440;
  const minuteHeight = timelineHeight / 1440;
  const containerWidth = 600;

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

  return (
    <div style={{ width: containerWidth, margin: "auto", position: "relative", padding: "20px" }}>
      {/* Date Selector */}
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <label htmlFor="datePicker">📅 Select Date: </label>
        <input
          type="date"
          id="datePicker"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: "5px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            marginLeft: "5px",
          }}
        />
      </div>
   {/* ✅ Pie Chart Added Below Date Selector */}
   <div style={{ textAlign: "center", marginBottom: "20px" }}>
   <Charts entries={filteredEntries} getLabelColor={getLabelColor} />      </div>
      <h3>📊 Detailed Timeline for {formatDateToLocalString(selectedDate)}</h3>
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
