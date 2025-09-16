import React, { useState } from "react";
import VoiceMemo from "./VoiceMemo";

interface InputBoxProps {
  onAddEntry: (text: string) => void;
}

const InputBox: React.FC<InputBoxProps> = ({ onAddEntry }) => {
  const [inputText, setInputText] = useState<string>("");

  const handleAddEntry = () => {
    if (inputText.trim()) {
      onAddEntry(inputText);
      setInputText(""); // Clear input field after submission
    }
  };

  const handleVoiceTranscription = (text: string) => {
    setInputText(text);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <input
          type="text"
          placeholder='Try typing or speaking "11-12am chilling, feeling happy"'
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ddd",
          }}
        />
        <VoiceMemo onTranscriptionComplete={handleVoiceTranscription} />
      </div>
      <button
        onClick={handleAddEntry}
        style={{
          padding: "10px 20px",
          backgroundColor: "#4285F4",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          width: "100%",
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export default InputBox;
