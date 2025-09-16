import React, { useState } from "react";
import VoiceMemo from "./VoiceMemo";
import '../styles/VoiceMemo.css';

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
    <div style={{ padding: '10px' }}>
      <div className="input-container">
        <div className="input-group">
          <input
            type="text"
            className="text-input"
            placeholder='说说你在做什么...'
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            onClick={handleAddEntry}
            className="add-button"
          >
            添加记录
          </button>
        </div>
        <VoiceMemo onTranscriptionComplete={handleVoiceTranscription} />
      </div>
    </div>
  );
};

export default InputBox;
