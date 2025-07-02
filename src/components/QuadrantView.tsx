import React from "react";
import { Todo } from "../types/todo";

export type Quadrant = "Q1" | "Q2" | "Q3" | "Q4";

interface QuadrantViewProps {
  todos: Todo[];
  onUpdate: (todo: Todo) => void;
}

const quadrantLabels: Record<Quadrant, string> = {
  Q1: "Urgent & Important",
  Q2: "Not Urgent & Important",
  Q3: "Urgent & Not Important",
  Q4: "Not Urgent & Not Important",
};

const quadrantColors: Record<Quadrant, string> = {
  Q1: "#FFD6D6", // light red / pink
  Q2: "#CFD9FF", // light blue
  Q3: "#FFEAC9", // light orange
  Q4: "#E1E1E1", // light grey
};

const QuadrantView: React.FC<QuadrantViewProps> = ({ todos, onUpdate }) => {
  // Group todos by quadrant
  const grouped: Record<Quadrant, Todo[]> = {
    Q1: [], Q2: [], Q3: [], Q4: []
  };
  todos.forEach(todo => {
    const q = typeof todo.quadrant === 'string' && ["Q1","Q2","Q3","Q4"].includes(todo.quadrant)
      ? (todo.quadrant as Quadrant)
      : "Q4";
    grouped[q].push(todo);
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '12px', width: '100%', minWidth: 320 }}>
      {(["Q1", "Q2", "Q3", "Q4"] as Quadrant[]).map(q => (
        <div key={q} style={{
          border: '1px solid #ddd',
          borderRadius: 12,
          padding: 12,
          minHeight: 140,
          maxHeight: 220,
          background: quadrantColors[q],
          color: '#000',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          overflowY: 'auto'
        }}>
          <strong>{quadrantLabels[q]}</strong>
          <ul style={{ paddingLeft: 16 }}>
            {grouped[q].length === 0 && <li style={{ color: '#bbb' }}>No tasks</li>}
            {grouped[q].map(todo => (
              <li key={todo.id} style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                {todo.content}
                {/* Placeholder for future drag/drop or edit */}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default QuadrantView; 