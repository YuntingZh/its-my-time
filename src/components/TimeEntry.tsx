import React, { useState, useEffect } from "react";
import { TimeEntry } from "../types/timeEntry";
import { getLabels } from "../services/labelService";
import { Label } from "../types/label";
import { sanitizeTime, isValidTime } from "../utils/timeUtils";

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

  const [error, setError] = useState("");

  // Handle normal input changes
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedEntry({ ...editedEntry, [name]: value });
  };

  // Handle time input blur - format time when user finishes typing
  const handleTimeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!value) {
      setError("");
      return;
    }
    
    try {
      const formattedTime = sanitizeTime(value);
      setEditedEntry(prev => ({ ...prev, [name]: formattedTime }));
      setError("");
    } catch {
      setError("Invalid time format");
    }
  };

  const handleSave = async () => {
    if (!editedEntry.startTime || !editedEntry.endTime || 
        !isValidTime(editedEntry.startTime) || !isValidTime(editedEntry.endTime)) {
      setError("Please enter valid times");
      return;
    }
    
    try {
      // Ensure times are in standard format before saving
      const updatedEntry = {
        ...editedEntry,
        startTime: sanitizeTime(editedEntry.startTime),
        endTime: sanitizeTime(editedEntry.endTime)
      };
      
      await onEdit(updatedEntry);
      setIsEditing(false);
      setError("");
    } catch (err) {
      console.error("Failed to save entry:", err);
      setError("Failed to save changes. Please try again.");
    }
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
          <input 
            type="text" 
            name="startTime" 
            value={editedEntry.startTime} 
            onChange={handleEditChange}
            onBlur={handleTimeBlur}
            placeholder="e.g. 9:00 AM, 9am, 0900"
            style={{ 
              marginBottom: "5px",
              padding: "4px",
              border: "1px solid " + (error ? "#ff6b6b" : "#ccc"),
              borderRadius: "3px"
            }}
          />
          <input 
            type="text" 
            name="endTime" 
            value={editedEntry.endTime} 
            onChange={handleEditChange}
            onBlur={handleTimeBlur}
            placeholder="e.g. 5:00 PM, 5pm, 1700"
            style={{ 
              marginBottom: "5px",
              padding: "4px",
              border: "1px solid " + (error ? "#ff6b6b" : "#ccc"),
              borderRadius: "3px"
            }}
          />
          <input 
            type="text" 
            name="activity" 
            value={editedEntry.activity} 
            onChange={handleEditChange}
            style={{ marginBottom: "5px" }}
          />
          {error && <div style={{ color: "#FFD700", fontSize: "0.9em", marginBottom: "5px" }}>{error}</div>}
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
          <button 
            onClick={handleSave} 
            style={{ 
              backgroundColor: "#34A853", 
              color: "white", 
              padding: "5px", 
              border: "none", 
              borderRadius: "3px", 
              cursor: "pointer", 
              marginTop: "5px",
              opacity: error ? 0.7 : 1 
            }}
            disabled={!!error}
          >
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
