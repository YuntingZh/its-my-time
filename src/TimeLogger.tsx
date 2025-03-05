import React, { useState, useEffect } from "react";
import { db } from "./firebaseConfig"; // Import db from firebaseConfig
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import OpenAI from "openai";
import Timeline from "./components/Timeline";
import InputBox from "./components/InputBox";
import { TimeEntry, LabelType } from "./types";

// Setup OpenAI API
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const TimeLogger: React.FC = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

  // AI-powered parsing
  const parseInputWithAI = async (text: string) => {
    const prompt = `Extract the start time, end time, and activity from this text: "${text}". 
    Return JSON ONLY in this format:
    {"startTime": "HH:MM AM/PM", "endTime": "HH:MM AM/PM", "activity": "description", "label": "category"}.
    Categories: ["work", "exercise", "idle", "social", "sleep", "unknown"].`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: prompt }],
        max_tokens: 50,
      });

      console.log("AI Response:", response);
      const extracted = JSON.parse(response.choices[0].message?.content || "{}");
      // Fix: Ensure `label` is one of the expected types
      const validLabels = ["work", "exercise", "idle", "social", "sleep", "unknown"] as const;
      const label = validLabels.includes(extracted.label) ? extracted.label : "unknown";

      return {
        startTime: extracted.startTime || "00:00 AM",
        endTime: extracted.endTime || "00:00 AM",
        activity: extracted.activity || "Error Parsing",
        label: label as "work" | "exercise" | "idle" | "social" | "sleep" | "unknown",
      };
    } catch (error) {
      console.error("AI Parsing Error:", error);
      return { startTime: "00:00 AM", endTime: "00:00 AM", activity: "Error Parsing", label: "unknown" };
    }
  };

  // Function to add a new time entry
  const addTimeEntry = async (inputText: string) => {
    if (!inputText) return;

    const { startTime, endTime, activity, label } = await parseInputWithAI(inputText);
    const date = new Date().toISOString().split("T")[0];

    try {
      await addDoc(collection(db, "time_entries"), { startTime, endTime, activity, label, date });
      fetchEntries(); // Refresh list
    } catch (error) {
      console.error("Error adding time entry:", error);
    }
  };
  // Delete Entry
  const deleteEntry = async (id: string) => {
    try {
      await deleteDoc(doc(db, "time_entries", id));
      setTimeEntries((prev) => prev.filter((entry) => entry.id !== id)); // Remove from state
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  // Edit Entry
  const editEntry = async (updatedEntry: TimeEntry) => {
    if (!updatedEntry.id) return;
    try {
      await updateDoc(doc(db, "time_entries", updatedEntry.id), {
        startTime: updatedEntry.startTime,
        endTime: updatedEntry.endTime,
        activity: updatedEntry.activity,
      });

      setTimeEntries((prev) =>
        prev.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry))
      );
    } catch (error) {
      console.error("Error updating entry:", error);
    }
  };

  // Fetch time entries from Firestore
  const fetchEntries = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "time_entries"));
      const entries: TimeEntry[] = querySnapshot.docs.map((doc) => {
        const data = doc.data() as Omit<TimeEntry, "label"> & { label: string };

        return {
          id: doc.id,
          startTime: data.startTime,
          endTime: data.endTime,
          activity: data.activity,
          date: data.date,
          label: (["work", "exercise", "idle", "social", "sleep", "unknown"].includes(data.label)
            ? (data.label as LabelType) // Explicitly cast as LabelType
            : "unknown"), // If it's invalid, default to "unknown"
        };
      });
      setTimeEntries(entries);
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };


  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>It's My Time 🙂</h2>
      <p>Tracking time easily!</p>
      <InputBox onAddEntry={addTimeEntry} />
      <Timeline entries={timeEntries} onDelete={deleteEntry} onEdit={editEntry} /> 
      </div>
  );
};

export default TimeLogger;
