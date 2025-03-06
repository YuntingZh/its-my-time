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

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      <h2>Labels</h2>
      
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
