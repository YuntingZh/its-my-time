import React, { useState, useEffect } from "react";
import { NotepadIcon, PencilSimpleIcon, FloppyDiskIcon } from "@phosphor-icons/react";
import { getDiary, saveDiary, fetchDiary } from "../services/diaryService";

interface Props {
  date: string; // YYYY-MM-DD
}

const DailyDiary: React.FC<Props> = ({ date }) => {
  const existing = getDiary(date);
  const [text, setText] = useState<string>(existing?.text || "");
  const [updatedAt, setUpdatedAt] = useState<string | null>(existing?.updatedAt || null);
  const [editing, setEditing] = useState<boolean>(!existing);
  const [collapsed, setCollapsed] = useState<boolean>(existing !== null);

  useEffect(() => {
    (async () => {
      const remote = await fetchDiary(date);
      if (remote && remote.text !== text) {
        setText(remote.text);
        setUpdatedAt(remote.updatedAt);
        setEditing(false);
        setCollapsed(true);
      }
    })();
  }, [date]);

  const save = () => {
    saveDiary(date, text);
    const ts = new Date().toISOString();
    setUpdatedAt(ts);
    setEditing(false);
    setCollapsed(false);
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <h3
        onClick={() => !editing && setCollapsed(!collapsed)}
        style={{ display: "flex", alignItems: "center", gap: 6, cursor: editing ? "default" : "pointer" }}
      >
        <NotepadIcon size={20} /> Diary ({date})
      </h3>
      {updatedAt && !editing && !collapsed && (
        <p style={{ fontSize: 12, color: "#666", marginTop: -8, marginBottom: 8 }}>
          Last updated: {new Date(updatedAt).toLocaleString()}
        </p>
      )}
      {!collapsed && (editing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            style={{ width: "100%", padding: 8, resize: "vertical" }}
            placeholder="Write your thoughts for today…"
          />
          <button
            onClick={save}
            style={{ alignSelf: "flex-end", display: "flex", alignItems: "center", gap: 6, background: "#4CAF50", color: "#fff", border: "none", borderRadius: 4, padding: "6px 12px", cursor: "pointer" }}
          >
            <FloppyDiskIcon size={18} weight="fill" /> Save
          </button>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <p style={{ whiteSpace: "pre-wrap", background: "#F5F5F5", padding: 8, borderRadius: 4 }}>{text}</p>
          <button
            onClick={() => { setEditing(true); setCollapsed(false); }}
            style={{ position: "absolute", top: 8, right: 8, background: "transparent", border: "none", cursor: "pointer" }}
          >
            <PencilSimpleIcon size={20} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default DailyDiary; 