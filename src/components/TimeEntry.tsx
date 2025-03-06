import React, { useState } from "react";
import { TimeEntry } from "../types/timeEntry";
import { labelColors } from "../types/label"; 

interface TimeEntryProps {
  entry: TimeEntry;
  onDelete: (id: string) => void;
  onEdit: (entry: TimeEntry) => void;
}

const TimeEntryComponent: React.FC<TimeEntryProps> = ({ entry, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEntry, setEditedEntry] = useState(entry);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedEntry({ ...editedEntry, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onEdit(editedEntry);
    setIsEditing(false);
  };

  return (
    <div
      style={{
        backgroundColor: labelColors[entry.label] || "#9E9E9E",
        color: "#fff",
        padding: "10px",
        borderRadius: "5px",
        margin: "5px 0",
        width: "80%",
        fontSize: "14px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {isEditing ? (
        <>
          <input type="text" name="startTime" value={editedEntry.startTime} onChange={handleEditChange} />
          <input type="text" name="endTime" value={editedEntry.endTime} onChange={handleEditChange} />
          <input type="text" name="activity" value={editedEntry.activity} onChange={handleEditChange} />
          <input type="text" name="label" value={editedEntry.label} onChange={handleEditChange} />
          <button onClick={handleSave} style={{ backgroundColor: "#34A853", color: "white", padding: "5px", border: "none", borderRadius: "3px", cursor: "pointer", marginTop: "5px" }}>
            Save
          </button>
        </>
      ) : (
        <>
          <strong>{entry.startTime} - {entry.endTime || "??"}</strong>
          <br />
          {entry.activity} ({entry.label})
          <div style={{ marginTop: "5px", display: "flex", gap: "5px" }}>
            <button onClick={() => setIsEditing(true)} style={{ backgroundColor: "#FF9800", color: "white", padding: "5px", border: "none", borderRadius: "3px", cursor: "pointer" }}>
              Edit
            </button>
            <button onClick={() => onDelete(entry.id!)} style={{ backgroundColor: "#E53935", color: "white", padding: "5px", border: "none", borderRadius: "3px", cursor: "pointer" }}>
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TimeEntryComponent;
