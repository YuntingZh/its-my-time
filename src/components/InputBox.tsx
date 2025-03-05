import React, { useState } from "react";

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

  return (
    <div>
      <input
        type="text"
        placeholder='Try typing "11-12am chilling, doing nothing"'
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "5px",
          border: "1px solid #ddd",
        }}
      />
      <button
        onClick={handleAddEntry}
        style={{
          padding: "10px 20px",
          backgroundColor: "#4285F4",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Add Entry
      </button>
    </div>
  );
};

export default InputBox;
