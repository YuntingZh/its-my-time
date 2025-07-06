import React, { useState, useEffect } from "react";
import { NotepadIcon, PencilSimpleIcon, FloppyDiskIcon } from "@phosphor-icons/react";
import { getDiary, saveDiary, fetchDiary } from "../services/diaryService";

interface Props {
  date: string; // YYYY-MM-DD
}

const DailyDiary: React.FC<Props> = ({ date }) => {
  const existing = getDiary(date);
  const todayStr = new Date().toLocaleDateString("en-CA");
  const isToday = date === todayStr;
  const [text, setText] = useState<string>(existing?.text || "");
  const [editing, setEditing] = useState<boolean>(isToday && !existing);
  const [collapsed, setCollapsed] = useState<boolean>(existing !== null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const remote = await fetchDiary(date);
      if (cancelled) return;
      if (remote) {
        setText(remote.text);
        setEditing(false);
        setCollapsed(true);
      } else {
        const existingLocal = getDiary(date);
        setText(existingLocal?.text || "");
        setEditing(isToday && !existingLocal);
        setCollapsed(existingLocal !== null);
      }
    })();
    return () => { cancelled = true; };
  }, [date, isToday]);

  const save = () => {
    saveDiary(date, text);
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
          <p style={{ whiteSpace: "pre-wrap", background: "#F5F5F5", padding: 8, borderRadius: 4, minHeight: 40 }}>{text || (isToday ? "Click the pencil to start writing…" : "No diary entry for this date.")}</p>
          {isToday && (
            <button
              onClick={() => { setEditing(true); setCollapsed(false); }}
              style={{ position: "absolute", top: 8, right: 8, background: "transparent", border: "none", cursor: "pointer" }}
            >
              <PencilSimpleIcon size={20} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default DailyDiary; 