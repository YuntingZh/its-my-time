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

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [newWeight, setNewWeight] = useState(3);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [editedWeight, setEditedWeight] = useState(3);

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

  return (
    <div style={{ padding: "20px" }}>
      <h2>🎯 Todo List</h2>
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="New task..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <select value={newWeight} onChange={(e) => setNewWeight(Number(e.target.value))}>
          {[1, 2, 3, 4, 5].map((w) => (
            <option key={w} value={w}>
              {w} - {w === 5 ? "Critical" : w === 1 ? "Minor" : ""}
            </option>
          ))}
        </select>
        <button onClick={addTodo}>Add</button>
      </div>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((todo, index) => (
          <li
            key={todo.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", index.toString())}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const dragIndex = Number(e.dataTransfer.getData("text"));
              handleDrag(dragIndex, index);
            }}
            style={{
              background: todo.completed ? "#d1ffd1" : "#f0f0f0",
              padding: "10px",
              marginBottom: "5px",
              borderRadius: "5px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {editingId === todo.id ? (
              <div>
                <input
                  type="text"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                />
                <select value={editedWeight} onChange={(e) => setEditedWeight(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5].map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
                <button onClick={() => saveEdit(todo.id!)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            ) : (
              <div>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => {
                    const updated = { ...todo, completed: !todo.completed };
                    updateTodo(updated);
                    setTodos(todos.map((t) => (t.id === todo.id ? updated : t)));
                  }}
                />
                <strong style={{ marginLeft: "10px" }}>{todo.content}</strong> <span>(Weight: {todo.weight})</span>
              </div>
            )}
            <div style={{ display: "flex", gap: "8px" }}>
              {editingId !== todo.id && (
                <button onClick={() => startEditing(todo)}>Edit</button>
              )}
              <button onClick={() => deleteTodo(todo.id!)} style={{ color: "red" }}>
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
