import React from "react";

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateChange }) => {
  return (
    <div style={{ marginBottom: "15px" }}>
      <label htmlFor="datePicker">📅 Select Date: </label>
      <input
        type="date"
        id="datePicker"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        style={{
          padding: "5px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          marginLeft: "5px",
        }}
      />
    </div>
  );
};

export default DateSelector;
