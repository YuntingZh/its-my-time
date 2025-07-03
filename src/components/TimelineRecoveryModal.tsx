import React, { useState } from "react";
import { Gap } from "../types/gap";
import { TimeEntry } from "../types/timeEntry";

interface TimelineRecoveryModalProps {
  gaps: Gap[];
  onClose: () => void;
  onSkipToday: () => void;
  onRemindLater: () => void;
  /**
   * Callback receives the entries that should be persisted.  
   * In this first MVP we won't auto-generate them yet — you can integrate the AI later.
   */
  onSave: (entries: Partial<TimeEntry>[]) => void;
}

const TimelineRecoveryModal: React.FC<TimelineRecoveryModalProps> = ({
  gaps,
  onClose,
  onSkipToday,
  onRemindLater,
  onSave,
}) => {
  const [freeText, setFreeText] = useState("");

  const renderGapLabel = (gap: Gap) => {
    const start = new Date(gap.start);
    const end = new Date(gap.end);
    const fmt = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `${fmt(start)} – ${fmt(end)}`;
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modalBox}>
        <h3 style={{ marginTop: 0 }}>Fill the missing time?</h3>
        <p>You haven't logged anything for these periods today:</p>
        <ul>
          {gaps.map((g, i) => (
            <li key={i}>{renderGapLabel(g)}</li>
          ))}
        </ul>

        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="Tell us what you were doing…"
          style={{ width: "100%", minHeight: 80, padding: 8, resize: "vertical" }}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button onClick={onSkipToday}>Skip Today</button>
          <button onClick={onRemindLater}>Remind Me Later</button>
          <button
            onClick={() => {
              // For now just hand the raw text back to caller; later integrate AI parsing
              onSave([{ activity: freeText }]);
              onClose();
            }}
            disabled={!freeText.trim()}
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
    zIndex: 9999,
  },
  modalBox: {
    background: "#fff",
    borderRadius: 8,
    padding: 24,
    width: "90%",
    maxWidth: 420,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
};

export default TimelineRecoveryModal; 