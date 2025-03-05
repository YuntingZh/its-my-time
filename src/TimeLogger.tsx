import React, { useState, useEffect } from "react";
import { db, collection, addDoc, getDocs } from "./firebaseConfig";

// Define the type for a time entry
interface TimeEntry {
  id?: string;
  activity: string;
  startTime: string;
  date: string;
}

const TimeLogger: React.FC = () => {
  const [activity, setActivity] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

  // Function to add a new time entry
  const addTimeEntry = async () => {
    if (!activity || !startTime) {
      alert("Please enter an activity and start time!");
      return;
    }

    try {
      await addDoc(collection(db, "time_entries"), {
        activity,
        startTime,
        date: new Date().toISOString().split("T")[0], // Current date
      });
      setActivity("");
      setStartTime("");
      fetchEntries(); // Refresh list
    } catch (error) {
      console.error("Error adding time entry:", error);
    }
  };

  // Fetch time entries from Firestore
  const fetchEntries = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "time_entries"));
      const entries: TimeEntry[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        activity: (doc.data() as Partial<TimeEntry>).activity ?? "Unknown Activity",
        startTime: (doc.data() as Partial<TimeEntry>).startTime ?? "00:00",
        date: (doc.data() as Partial<TimeEntry>).date ?? new Date().toISOString().split("T")[0],
      }));      
      setTimeEntries(entries);
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };

  // Load entries on component mount
  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      <h2>Time Logger</h2>
      <input
        type="text"
        name="activity"
        placeholder="What are you doing?"
        value={activity}
        onChange={(e) => setActivity(e.target.value)}
      />
      <input
        type="time"
        name="startTime"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
      />
      <button onClick={addTimeEntry}>Add Entry</button>

      <h3>Logged Entries:</h3>
      <ul>
        {timeEntries.map((entry) => {
          return (
            <li key={entry.id ?? entry.date + entry.startTime}>
              {entry.date} - {entry.startTime}: {entry.activity}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TimeLogger;
