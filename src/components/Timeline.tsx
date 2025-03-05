import React from "react";
import { TimeEntry } from "../types";
import TimeEntryComponent from "./TimeEntry";

interface TimelineProps {
  entries: TimeEntry[];
}

const Timeline: React.FC<TimelineProps> = ({ entries }) => {
  return (
    <div style={{ width: "100%", maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h3>📊 Your Timeline</h3>
      <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
        {entries.map((entry) => (
          <TimeEntryComponent key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
};

export default Timeline;
