import React, { useState, useEffect } from "react";
import { getFasting, saveFasting } from "../services/fastingService";

interface Props {
  date: string;
  onSaved?: () => void;
}

const FastingWindowInput: React.FC<Props> = ({ date, onSaved }) => {
  const existing = getFasting(date);
  const [startHour, setStartHour] = useState<number>(existing?.startHour || 20);
  const [windowHours, setWindowHours] = useState<number>(existing?.windowHours || 8);

  useEffect(() => {
    setStartHour(existing?.startHour || 20);
    setWindowHours(existing?.windowHours || 8);
  }, [date]);

  const save = () => {
    saveFasting({ date, startHour, windowHours });
    if (onSaved) onSaved();
  };

  return (
    <div style={{ background: "#F8F8F8", padding: 12, borderRadius: 8 }}>
      <h4 style={{ margin: 0, marginBottom: 8 }}>Fasting Window</h4>
      <label>Start Hour (0-23): </label>
      <input type="number" min={0} max={23} value={startHour} onChange={(e)=>setStartHour(parseInt(e.target.value))} />
      <label style={{ marginLeft: 8 }}>Eating Hours: </label>
      <input type="number" min={2} max={12} value={windowHours} onChange={(e)=>setWindowHours(parseInt(e.target.value))} />
      <button onClick={save} style={{ marginLeft: 8 }}>Save</button>
    </div>
  );
};

export default FastingWindowInput; 