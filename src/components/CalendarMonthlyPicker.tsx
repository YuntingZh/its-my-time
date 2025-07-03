import React from "react";
import { getDiary } from "../services/diaryService";
import { TimeEntry } from "../types/timeEntry";

interface Props {
  selectedDate: string; // YYYY-MM-DD
  onDateChange: (date: string) => void;
  entries: TimeEntry[];
}

const CELL_SIZE = 36;
const highlightColor = "#D6BCFA"; // light purple

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

const CalendarMonthlyPicker: React.FC<Props> = ({ selectedDate, onDateChange, entries }) => {
  const sel = new Date(selectedDate);
  const [viewYear, setViewYear] = React.useState(sel.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(sel.getMonth());

  // Build set of dates that have content
  const marked = React.useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => set.add(e.date));
    // diaries
    for (let d = 1; d <= 31; d++) {
      const ymd = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      if (getDiary(ymd)?.text?.trim()) set.add(ymd);
    }
    return set;
  }, [entries, viewYear, viewMonth]);

  const weeks: (number | null)[][] = [];
  const firstDayWeekday = new Date(viewYear, viewMonth, 1).getDay(); // 0 Sunday
  let currentDay = 1 - firstDayWeekday;
  for (let row = 0; row < 6; row++) {
    const week: (number | null)[] = [];
    for (let col = 0; col < 7; col++) {
      if (currentDay < 1 || currentDay > daysInMonth(viewYear, viewMonth)) {
        week.push(null);
      } else {
        week.push(currentDay);
      }
      currentDay++;
    }
    weeks.push(week);
  }

  const gotoPrev = () => {
    const m = viewMonth - 1;
    if (m < 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth(m);
  };
  const gotoNext = () => {
    const m = viewMonth + 1;
    if (m > 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth(m);
  };

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString(undefined, { month: "long", year: "numeric" });

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <button onClick={gotoPrev}>{"<"}</button>
        <strong>{monthLabel}</strong>
        <button onClick={gotoNext}>{">"}</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(7, ${CELL_SIZE}px)`, gap: 4 }}>
        {["S","M","T","W","T","F","S"].map((d)=>(<div key={d} style={{textAlign:"center",fontSize:12}}>{d}</div>))}
        {weeks.flat().map((day, idx) => {
          if (day === null) return <div key={idx} style={{ width: CELL_SIZE, height: CELL_SIZE }} />;
          const ymd = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isSelected = ymd === selectedDate;
          const hasContent = marked.has(ymd);
          return (
            <div
              key={idx}
              onClick={() => onDateChange(ymd)}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                lineHeight: `${CELL_SIZE}px`,
                textAlign: "center",
                cursor: "pointer",
                borderRadius: "50%",
                background: isSelected ? highlightColor : undefined,
                outline: hasContent ? `2px solid ${highlightColor}` : undefined,
              }}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarMonthlyPicker; 