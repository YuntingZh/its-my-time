import React, { useEffect, useState } from "react";
import { db } from "../services/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Todo } from "../types/todo";
import { TimeEntry } from "../types/timeEntry";

const DailyCandyJar: React.FC = () => {
  const [points, setPoints] = useState(0);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString("en-CA");

  useEffect(() => {
    const fetchDailyData = async () => {
      setLoading(true);

      // Fetch completed todos for today
      const todoQuery = query(collection(db, "todos"));
      const todoSnap = await getDocs(todoQuery);
      const todos: Todo[] = todoSnap.docs
        .map((doc) => ({ id: doc.id, ...(doc.data() as Todo) }))
        .filter((todo) => todo.completed);
      const todoPoints = todos.reduce((sum, t) => sum + t.weight, 0);

      // Fetch time entries for today
      const entryQuery = query(collection(db, "time_entries"), where("date", "==", today));
      const entrySnap = await getDocs(entryQuery);
      const entries: TimeEntry[] = entrySnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as TimeEntry),
      }));

      setPoints(todoPoints);
      setEntries(entries);
      setLoading(false);
    };

    fetchDailyData();
  }, [today]);

  const getCandyType = () => {
    if (points >= 10) return "🍬🍬🍬 Golden Candy Day!";
    if (points >= 6) return "🍬🍬 Brain Candy Day!";
    if (points > 0) return "🍬 Gummy Progress!";
    return "😴 No candy yet — but there's always tomorrow!";
  };

  const convert = (timeStr: string) => {
    const cleaned = timeStr.replace(/([AP]M)/, ' $1');
    const [time, period] = cleaned.split(" ");
    let [hour, minute] = time.split(":").map(Number);
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    return hour * 60 + minute;
  };

  const getTotalTime = () => {
    return entries.reduce((total, entry) => {
      if (!entry.startTime || !entry.endTime) return total;
      const start = convert(entry.startTime);
      const end = convert(entry.endTime);
      return total + Math.max(end - start, 0);
    }, 0);
  };

  const getImportantTime = () => {
    const importantLabels = ["Coding", "Work", "Job hunting"];
    return entries.reduce((total, entry) => {
      if (!entry.startTime || !entry.endTime || !importantLabels.includes(entry.label)) return total;
      const start = convert(entry.startTime);
      const end = convert(entry.endTime);
      return total + Math.max(end - start, 0);
    }, 0);
  };

  if (loading) return <p>Loading your candy jar... 🍭</p>;

  const totalMinutes = getTotalTime();
  const importantMinutes = getImportantTime();
  const productivityScore = totalMinutes > 0 ? Math.round((importantMinutes / totalMinutes) * 100) : 0;

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>🍭 Daily Candy Jar</h2>
      <p><strong>Points from completed tasks:</strong> {points}</p>
      <p><strong>Time tracked today:</strong> {Math.round(totalMinutes / 60)} hours</p>
      <p><strong>Time on important work:</strong> {Math.round(importantMinutes / 60)} hours</p>
      <p><strong>Focus Score:</strong> {productivityScore}% 🎯</p>
      <p style={{ fontSize: "24px", marginTop: "10px" }}>{getCandyType()}</p>

      <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "10px" }}>
        {[...Array(points)].map((_, i) => (
          <span key={i} style={{ fontSize: "24px" }}>🍬</span>
        ))}
      </div>
    </div>
  );
};

export default DailyCandyJar;
