import React, { useState } from "react";
import { PencilSimple, FloppyDisk, PersonSimpleTaiChi } from "@phosphor-icons/react";

interface AboutMeProps {
  aboutMe: string;
  setAboutMe: (text: string) => void;
}

const AboutMe: React.FC<AboutMeProps> = ({ aboutMe, setAboutMe }) => {
  const initialTs = localStorage.getItem("aboutMeUpdatedAt");
  const [updatedAt, setUpdatedAt] = useState<string | null>(initialTs);
  const [editing, setEditing] = useState<boolean>(!aboutMe);
  const [collapsed, setCollapsed] = useState<boolean>(aboutMe !== "" && !editing);
  const [draft, setDraft] = useState<string>(aboutMe);

  const save = () => {
    setAboutMe(draft);
    localStorage.setItem("aboutMe", draft);
    const ts = new Date().toISOString();
    setUpdatedAt(ts);
    localStorage.setItem("aboutMeUpdatedAt", ts);
    setEditing(false);
    setCollapsed(false);
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <h3
        onClick={() => !editing && setCollapsed(!collapsed)}
        style={{ display: "flex", alignItems: "center", gap: 6, cursor: editing ? "default" : "pointer" }}
      >
        <PersonSimpleTaiChi size={20} /> About Me
      </h3>
      {updatedAt && !editing && !collapsed && (
        <p style={{ fontSize: 12, color: "#666", marginTop: -8, marginBottom: 8 }}>
          Last updated: {new Date(updatedAt).toLocaleString()}
        </p>
      )}
      {!collapsed && (editing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            style={{ width: "100%", padding: 8, resize: "vertical" }}
            placeholder="Write something that helps the AI understand you (e.g., your study subjects, project names, personal goals)…"
          />
          <button
            onClick={save}
            style={{ alignSelf: "flex-end", display: "flex", alignItems: "center", gap: 6, background: "#4CAF50", color: "#fff", border: "none", borderRadius: 4, padding: "6px 12px", cursor: "pointer" }}
          >
            <FloppyDisk size={18} weight="fill" /> Save
          </button>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <p style={{ whiteSpace: "pre-wrap", background: "#F5F5F5", padding: 8, borderRadius: 4 }}>{aboutMe}</p>
          <button
            onClick={() => {
              setEditing(true);
              setCollapsed(false);
            }}
            style={{ position: "absolute", top: 8, right: 8, background: "transparent", border: "none", cursor: "pointer" }}
            aria-label="Edit About Me"
          >
            <PencilSimple size={20} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AboutMe; 