import React, { useState, useEffect } from "react";
import { addLabel, getLabels } from "../services/labelService";
import { Label } from "../types/label";

const LabelManager: React.FC = () => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [newLabel, setNewLabel] = useState<string>("");
  const [color, setColor] = useState<string>("#000000");
  const [parentId, setParentId] = useState<string | null>(null);

  useEffect(() => {
    const loadLabels = async () => {
      const fetchedLabels = await getLabels();
      setLabels(fetchedLabels);
    };
    loadLabels();
  }, []);
  
  const loadLabels = async () => {
    const fetchedLabels = await getLabels();
    setLabels(fetchedLabels);
  };

  const handleAddLabel = async () => {
    if (!newLabel.trim()) return;
    await addLabel(newLabel, color, parentId || undefined);
    setNewLabel("");
    setColor("#000000");
    loadLabels();
  };

  // Consistency check: find case-insensitive duplicates and sub-labels with same name as parent
  const labelNameMap = new Map<string, Label[]>();
  labels.forEach(label => {
    const key = label.name.trim().toLowerCase();
    if (!labelNameMap.has(key)) labelNameMap.set(key, []);
    labelNameMap.get(key)!.push(label);
  });
  const duplicateNames = Array.from(labelNameMap.values()).filter(arr => arr.length > 1);

  // Check for sub-labels with same name as parent
  const subLabelIssues = labels.filter(l => l.parentId && labels.find(p => p.id === l.parentId && p.name.trim().toLowerCase() === l.name.trim().toLowerCase()));

  // Check for sub-labels with similar names to their parent (case-insensitive, but not exact)
  const similarSubLabels = labels.filter(l => l.parentId && labels.find(p => p.id === l.parentId && p.name.trim().toLowerCase() !== l.name.trim().toLowerCase() && p.name.trim().toLowerCase().includes(l.name.trim().toLowerCase())));

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      <h2>Labels</h2>
      {/* Consistency Warnings */}
      {(duplicateNames.length > 0 || subLabelIssues.length > 0 || similarSubLabels.length > 0) && (
        <div style={{ background: "#fff3cd", color: "#856404", border: "1px solid #ffeeba", borderRadius: 6, padding: 12, marginBottom: 16 }}>
          <strong>⚠️ Label Consistency Issues Found:</strong>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {duplicateNames.length > 0 && duplicateNames.map((dupes, i) => (
              <li key={"dup-"+i}>Duplicate label names (case-insensitive): {dupes.map(l => l.name).join(", ")}</li>
            ))}
            {subLabelIssues.length > 0 && <li>Sub-label(s) with the same name as their parent: {subLabelIssues.map(l => l.name).join(", ")}</li>}
            {similarSubLabels.length > 0 && <li>Sub-label(s) with similar names to their parent: {similarSubLabels.map(l => l.name).join(", ")}</li>}
          </ul>
        </div>
      )}
      
      {/* Label List Display */}
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {labels
          .filter(label => !label.parentId) // Display parent labels first
          .map(parent => (
            <li key={parent.id} style={{ marginBottom: "10px" }}>
              <span style={{ color: parent.color, fontWeight: "bold" }}>●</span> {parent.name}

              {/* Child Labels */}
              <ul style={{ paddingLeft: "20px" }}>
                {labels
                  .filter(label => label.parentId === parent.id)
                  .map(child => (
                    <li key={child.id}>
                      <span style={{ color: child.color }}>●</span> {parent.name} | {child.name}
                    </li>
                  ))}
              </ul>
            </li>
          ))}
      </ul>

      {/* Add New Label */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
        <label>Color</label>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />

        <label>Label Name</label>
        <input type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />

        <label>Parent</label>
        <select onChange={(e) => setParentId(e.target.value || null)}>
          <option value="">no parent</option>
          {labels.map(label => (
            <option key={label.id} value={label.id}>{label.name}</option>
          ))}
        </select>

        <button onClick={handleAddLabel} style={{ background: "#ddd", padding: "10px", border: "none", cursor: "pointer" }}>
          Add Labels
        </button>
      </div>
    </div>
  );
};

export default LabelManager;
