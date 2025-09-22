import React, { useState } from "react";
import { TimeEntry } from "../types/timeEntry";
import { sanitizeTime, isValidTime } from "../utils/timeUtils";

interface Props {
  entry: Omit<TimeEntry, "id">;
  onSave: (entry: Omit<TimeEntry, "id">) => void;
  onCancel: () => void;
}

const TimeFixModal: React.FC<Props> = ({ entry, onSave, onCancel }) => {
  const [startTime, setStartTime] = useState(sanitizeTime(entry.startTime));
  const [endTime, setEndTime] = useState(entry.endTime ? sanitizeTime(entry.endTime) : "");
  const [activity, setActivity] = useState(entry.activity);
  const [label, setLabel] = useState(entry.label);
  const [error, setError] = useState("");

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Fix Time Entry</h3>
        <label>Start Time</label>
        <input 
          value={startTime} 
          onChange={(e) => {
            const val = e.target.value;
            try {
              if (val) setStartTime(sanitizeTime(val));
              else setStartTime("");
              setError("");
            } catch {
              setStartTime(val);
              setError("Invalid time format");
            }
          }}
          placeholder="e.g. 9:00 AM, 9am, 0900"
        />
        <label>End Time</label>
        <input 
          value={endTime}
          onChange={(e) => {
            const val = e.target.value;
            try {
              if (val) setEndTime(sanitizeTime(val));
              else setEndTime("");
              setError("");
            } catch {
              setEndTime(val);
              setError("Invalid time format");
            }
          }}
          placeholder="e.g. 5:00 PM, 5pm, 1700"
        />
        <label>Activity</label>
        <input value={activity} onChange={(e) => setActivity(e.target.value)} />
        <label>Label</label>
        <input value={label} onChange={(e) => setLabel(e.target.value)} />
        {error && <div style={{ color: "red", fontSize: "0.9em" }}>{error}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <button onClick={onCancel}>Cancel</button>
          <button 
            onClick={() => {
              if (!startTime || !endTime || !isValidTime(startTime) || !isValidTime(endTime)) {
                setError("Please enter valid times");
                return;
              }
              onSave({ 
                startTime: sanitizeTime(startTime), 
                endTime: sanitizeTime(endTime), 
                activity, 
                label, 
                date: entry.date 
              });
            }}
            disabled={!!error}
          >
            Save
          </button>
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