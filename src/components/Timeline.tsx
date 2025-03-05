import React from "react";
import { TimeEntry } from "../types";
import TimeEntryComponent from "./TimeEntry";

interface TimelineProps {
  entries: TimeEntry[];
  onDelete: (id: string) => void;
  onEdit: (entry: TimeEntry) => void;
}

const Timeline: React.FC<TimelineProps> = ({ entries, onDelete, onEdit }) => {
  return (
    <div style={{ width: "100%", maxWidth: "800px", margin: "auto", padding: "20px" }}>
      <h3>📊 Structured Timeline</h3>
      <div style={{ display: "flex", flexDirection: "column", borderLeft: "4px solid #ddd", paddingLeft: "10px" }}>
        {entries.map((entry) => (
          <TimeEntryComponent key={entry.id} entry={entry} onDelete={onDelete} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
};

export default Timeline;
