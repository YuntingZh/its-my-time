import React, { useState } from "react";
import { TimeEntry } from "../types/timeEntry";

interface Props {
  entry: Omit<TimeEntry, "id">;
  onSave: (entry: Omit<TimeEntry, "id">) => void;
  onCancel: () => void;
}

const TimeFixModal: React.FC<Props> = ({ entry, onSave, onCancel }) => {
  const [startTime, setStartTime] = useState(entry.startTime);
  const [endTime, setEndTime] = useState(entry.endTime || "");
  const [activity, setActivity] = useState(entry.activity);
  const [label, setLabel] = useState(entry.label);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Fix Time Entry</h3>
        <label>Start Time</label>
        <input value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        <label>End Time</label>
        <input value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        <label>Activity</label>
        <input value={activity} onChange={(e) => setActivity(e.target.value)} />
        <label>Label</label>
        <input value={label} onChange={(e) => setLabel(e.target.value)} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <button onClick={onCancel}>Cancel</button>
          <button onClick={() => onSave({ startTime, endTime, activity, label, date: entry.date })}>Save</button>
        </div>
      </div>
    </div>
  );
};

const styles: { [k: string]: React.CSSProperties } = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
  },
  modal: {
    background: "#fff",
    padding: 20,
    borderRadius: 8,
    minWidth: 300,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
};

export default TimeFixModal; 