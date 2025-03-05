import React from "react";
import { TimeEntry } from "../types"; // Import our TimeEntry type

// Define colors for different activity types
const labelColors: { [key: string]: string } = {
  work: "#4285F4", // Blue
  exercise: "#34A853", // Green
  idle: "#F4B400", // Yellow
  social: "#FBBC05", // Orange
  sleep: "#5F6368", // Dark Gray
  unknown: "#9E9E9E", // Default Gray
};

interface TimeEntryProps {
  entry: TimeEntry;
}

const TimeEntryComponent: React.FC<TimeEntryProps> = ({ entry }) => {
  const color = labelColors[entry.label] || "#9E9E9E"; // Use default color if label not found

  return (
    <div
      style={{
        backgroundColor: color,
        color: "#fff",
        padding: "10px",
        borderRadius: "5px",
        marginBottom: "8px",
        width: "80%",
        textAlign: "center",
      }}
    >
      <strong>{entry.startTime} - {entry.endTime || "??"}</strong>
      <br />
      {entry.activity} ({entry.label})
    </div>
  );
};

export default TimeEntryComponent;
