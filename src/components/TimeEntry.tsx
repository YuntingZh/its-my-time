import React, { useState, useEffect } from "react";
import { TimeEntry } from "../types/timeEntry";
import { getLabels } from "../services/labelService";
import { Label } from "../types/label";

interface TimeEntryProps {
  entry: TimeEntry;
  getLabelColor: (labelName: string) => string; // Add this line
  onDelete: (id: string) => void;
  onEdit: (entry: TimeEntry) => void;
}

const TimeEntryComponent: React.FC<TimeEntryProps> = ({ entry, getLabelColor, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEntry, setEditedEntry] = useState(entry);
  const [labels, setLabels] = useState<Label[]>([]);

  useEffect(() => {
    if (isEditing) {
      getLabels().then(setLabels);
    }
  }, [isEditing]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditedEntry({ ...editedEntry, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onEdit(editedEntry);
    setIsEditing(false);
  };

  return (
    <div
      style={{
        backgroundColor: getLabelColor(entry.label) || "#9E9E9E",
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
          <select name="label" value={editedEntry.label} onChange={handleEditChange}>
            <option value="">Select label</option>
            {/* Group labels by parentId */}
            {labels.filter(l => !l.parentId).map(parent => (
              <React.Fragment key={parent.id}>
                <option value={parent.name} style={{ color: parent.color }}>
                  {parent.name}
                </option>
                {/* Sub-labels */}
                {labels.filter(l => l.parentId === parent.id).map(child => (
                  <option key={child.id} value={child.name} style={{ color: child.color }}>
                    &nbsp;&nbsp;{parent.name} | {child.name}
                  </option>
                ))}
              </React.Fragment>
            ))}
          </select>
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
