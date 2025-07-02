import React, { useEffect, useState } from "react";
import { db } from "../services/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

import { Todo } from "../types/todo";
import QuadrantView from "./QuadrantView";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [newWeight, setNewWeight] = useState(3);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [editedWeight, setEditedWeight] = useState(3);
  const [sorting, setSorting] = useState(false);

  const fetchTodos = async () => {
    const querySnapshot = await getDocs(collection(db, "todos"));
    const data: Todo[] = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Todo),
    })).sort((a, b) => a.order - b.order);
    setTodos(data);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    const newItem: Omit<Todo, "id"> = {
      content: newTodo,
      weight: newWeight,
      order: todos.length,
      completed: false,
      source: "manual",
    };
    const docRef = await addDoc(collection(db, "todos"), newItem);
    setTodos([...todos, { ...newItem, id: docRef.id }]);
    setNewTodo("");
    setNewWeight(3);
  };

  const updateTodo = async (todo: Todo) => {
    if (!todo.id) return;
    const { id, ...todoData } = todo;
    await updateDoc(doc(db, "todos", id), todoData);
  };

  const deleteTodo = async (id: string) => {
    await deleteDoc(doc(db, "todos", id));
    setTodos(todos.filter((t) => t.id !== id));
  };

  const handleDrag = (dragIndex: number, hoverIndex: number) => {
    const updated = [...todos];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(hoverIndex, 0, moved);
    setTodos(updated.map((todo, index) => ({ ...todo, order: index })));
    updated.forEach((todo) => todo.id && updateDoc(doc(db, "todos", todo.id), { order: todo.order }));
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id!);
    setEditedContent(todo.content);
    setEditedWeight(todo.weight);
  };

  const saveEdit = async (id: string) => {
    const updated = todos.map((todo) =>
      todo.id === id ? { ...todo, content: editedContent, weight: editedWeight } : todo
    );
    setTodos(updated);
    await updateDoc(doc(db, "todos", id), {
      content: editedContent,
      weight: editedWeight,
    });
    setEditingId(null);
  };

  // SMART SORTING LOGIC
  const handleSmartSort = async () => {
    setSorting(true);
    try {
      // Prepare prompt
      const todoList = todos.map((t, i) => `${i + 1}. ${t.content}`).join("\n");
      const prompt = `Classify the following todos into the Eisenhower Matrix quadrants (Q1: Urgent & Important, Q2: Not Urgent & Important, Q3: Urgent & Not Important, Q4: Not Urgent & Not Important).\n\nTodos:\n${todoList}\n\nReturn a JSON object mapping each todo's content to its quadrant, e.g.: {\"Finish project report\": \"Q1\", ...}`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: prompt }],
        max_tokens: 300,
      });
      const content = response.choices[0].message?.content || "";
      let mapping: Record<string, string> = {};
      try {
        mapping = JSON.parse(content);
      } catch (err) {
        // Try to extract JSON from text if not pure JSON
        const match = content.match(/\{[\s\S]*\}/);
        if (match) mapping = JSON.parse(match[0]);
      }
      // Update todos with quadrant
      const updatedTodos = await Promise.all(
        todos.map(async (todo) => {
          let quadrant = mapping[todo.content];
          if (!["Q1", "Q2", "Q3", "Q4"].includes(quadrant)) {
            quadrant = "Q4";
          }
          const updated = { ...todo, quadrant: quadrant as "Q1" | "Q2" | "Q3" | "Q4" };
          if (todo.id) await updateDoc(doc(db, "todos", todo.id), { quadrant });
          return updated;
        })
      );
      setTodos(updatedTodos);
    } catch (error) {
      alert("Smart sorting failed. Please try again.");
      console.error(error);
    } finally {
      setSorting(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>

      {/* Left: Regular Todo List */}
      <div style={{ flex: 1, minWidth: "260px", maxWidth: "300px" }}>

        {/* Header Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>To-do</h3>

          <button
            style={{
              background: "#5C67F2",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 14,
              cursor: sorting ? "not-allowed" : "pointer",
            }}
            onClick={handleSmartSort}
            disabled={sorting}
          >
            {sorting ? "Sorting…" : "Smart Sorting"}
          </button>
        </div>

        {/* Optional spinner under header */}
        {sorting && (
          <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
            <span
              style={{
                width: 20,
                height: 20,
                border: "3px solid #eee",
                borderTop: "3px solid #5C67F2",
                borderRadius: "50%",
                display: "inline-block",
                animation: "spin 1s linear infinite",
                marginRight: 8,
              }}
            />
            <span style={{ fontSize: 14, color: "#555" }}>Sorting your todos…</span>
          </div>
        )}

        {/* Add new todo row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            type="text"
            placeholder="New task…"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            style={{ flex: 1, padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc" }}
          />
          <select
            value={newWeight}
            onChange={(e) => setNewWeight(Number(e.target.value))}
            style={{ padding: "8px", borderRadius: 6, border: "1px solid #ccc" }}
          >
            {[1, 2, 3, 4, 5].map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
          <button
            onClick={addTodo}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#5C67F2",
              color: "#fff",
              border: "none",
              fontSize: 20,
              lineHeight: 0,
              cursor: "pointer",
            }}
          >
            +
          </button>
        </div>

        {/* Todo items */}
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {todos.map((todo, index) => {
            const baseStyle: React.CSSProperties = {
              background: todo.completed ? "#ECEAFF" : "#fff",
              border: "1px solid #E0E0E0",
              padding: "10px 12px",
              marginBottom: 8,
              borderRadius: 6,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 14,
              wordBreak: "break-word",
            };

            return (
              <li
                key={todo.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", index.toString())}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const dragIndex = Number(e.dataTransfer.getData("text"));
                  handleDrag(dragIndex, index);
                }}
                style={baseStyle}
              >
                {editingId === todo.id ? (
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      style={{ width: "100%", padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
                    />
                    <select
                      value={editedWeight}
                      onChange={(e) => setEditedWeight(Number(e.target.value))}
                      style={{ marginTop: 6, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
                    >
                      {[1, 2, 3, 4, 5].map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                    <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                      <button onClick={() => saveEdit(todo.id!)}>Save</button>
                      <button onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => {
                        const updated = { ...todo, completed: !todo.completed };
                        updateTodo(updated);
                        setTodos(todos.map((t) => (t.id === todo.id ? updated : t)));
                      }}
                    />
                    <span
                      style={{
                        marginLeft: 10,
                        textDecoration: todo.completed ? "line-through" : "none",
                        color: todo.completed ? "#666" : "#000",
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {todo.content}
                    </span>
                  </div>
                )}

                {/* Action buttons */}
                {editingId !== todo.id && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => startEditing(todo)} style={{ background: "none", border: "none", cursor: "pointer" }}>Edit</button>
                    <button onClick={() => deleteTodo(todo.id!)} style={{ background: "none", border: "none", color: "red", cursor: "pointer" }}>✕</button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Right: QuadrantView */}
      <QuadrantView todos={todos} onUpdate={updateTodo} />
    </div>
  );
};

export default TodoList;
