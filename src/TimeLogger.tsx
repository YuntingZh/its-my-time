import React, { useState, useEffect } from "react";
import { db, collection, addDoc, getDocs } from "./firebaseConfig";
import OpenAI from 'openai';

interface TimeEntry {
  id?: string;
  activity: string;
  startTime: string;
  endTime?: string;
  date: string;
}

// Setup OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
});

const TimeLogger: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

  // Function to parse input using AI
  const parseInputWithAI = async (text: string) => {
    const prompt = `Extract the start time, end time, and activity from this text: "${text}". 
    Format as JSON: {"startTime": "HH:MM AM/PM", "endTime": "HH:MM AM/PM", "activity": "description", "label": "category"}. 
    The label should be "idle" if it's a non-productive task (e.g., chilling, watching TV). Otherwise, label it as "productive".`;
  
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: prompt }],
        max_tokens: 50,
      });
  
      // Extract structured JSON response
      const extracted = JSON.parse(response.choices[0].message?.content || "{}");
  
      return {
        startTime: extracted.startTime || "00:00 AM",
        endTime: extracted.endTime || "00:00 AM",
        activity: extracted.activity || "Unknown Activity",
        label: extracted.label || "idle",
      };
    } catch (error) {
      console.error("AI Parsing Error:", error);
      return { startTime: "00:00 AM", endTime: "00:00 AM", activity: "Error Parsing", label: "unknown" };
    }
  };  

  // Function to add a new time entry
  const addTimeEntry = async () => {
    if (!inputText) return;
  
    const { startTime, endTime, activity, label } = await parseInputWithAI(inputText);
    const date = new Date().toISOString().split("T")[0];
  
    try {
      await addDoc(collection(db, "time_entries"), { startTime, endTime, activity, label, date });
      setInputText("");
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
        ...(doc.data() as TimeEntry),
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
      <h2>It's My Time 🙂</h2>
      <p>Tracking time easily!</p>
      <input
        type="text"
        placeholder='Try typing "11am cooking, chilling"'
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <button onClick={addTimeEntry}>Add Entry</button>

      <h3>Logged Entries:</h3>
      <ul>
        {timeEntries.map((entry) => (
          <li key={entry.id}>
            {entry.date} - {entry.startTime}: {entry.activity}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TimeLogger;
