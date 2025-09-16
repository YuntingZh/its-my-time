import React from 'react';

interface BiWeeklyDatePickerProps {
  ranges: { start: Date; end: Date }[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const BiWeeklyDatePicker: React.FC<BiWeeklyDatePickerProps> = ({
  ranges,
  selectedIndex,
  onSelect,
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '24px',
    }}>
      <button
        onClick={() => onSelect(Math.min(ranges.length - 1, selectedIndex + 1))}
        disabled={selectedIndex >= ranges.length - 1}
        style={{
          padding: '8px 12px',
          border: 'none',
          borderRadius: '6px',
          background: '#f0f0f0',
          cursor: 'pointer',
          opacity: selectedIndex >= ranges.length - 1 ? 0.5 : 1,
        }}
      >
        ←
      </button>

      <select
        value={selectedIndex}
        onChange={(e) => onSelect(Number(e.target.value))}
        style={{
          padding: '8px 12px',
          borderRadius: '6px',
          border: '1px solid #ddd',
          fontSize: '14px',
          minWidth: '200px',
          cursor: 'pointer',
        }}
      >
        {ranges.map((range, index) => (
          <option key={index} value={index}>
            {formatDate(range.start)} - {formatDate(range.end)}
          </option>
        ))}
      </select>

      <button
        onClick={() => onSelect(Math.max(0, selectedIndex - 1))}
        disabled={selectedIndex <= 0}
        style={{
          padding: '8px 12px',
          border: 'none',
          borderRadius: '6px',
          background: '#f0f0f0',
          cursor: 'pointer',
          opacity: selectedIndex <= 0 ? 0.5 : 1,
        }}
      >
        →
      </button>
    </div>
  );
};

export default BiWeeklyDatePicker;
