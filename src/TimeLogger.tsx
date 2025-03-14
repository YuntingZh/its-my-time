import React, { useState, useEffect } from "react";
import { db } from "./services/firebaseConfig"; 
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import OpenAI from "openai";
import Timeline from "./components/Timeline";
import InputBox from "./components/InputBox";
import LabelManager from "./components/LabelManager";
import LifeCoach from "./components/LifeCoach"; 
import { getLabels } from "./services/labelService";
import { Label } from "./types/label";
import { TimeEntry } from "./types/timeEntry";


// Setup OpenAI API
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const TimeLogger: React.FC = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [labels, setLabels] = useState<Label[]>([]); // Store labels from Firestore

  // Fetch labels from Firestore
  const fetchLabels = async () => {
    const fetchedLabels = await getLabels();
    setLabels(fetchedLabels);
  };
  // Dynamically get label color when displaying labels
  const getLabelColor = (labelName: string) => {
  
    const label = labels.find(label => label.name.toLowerCase() === labelName.toLowerCase());
  
    if (!label) console.warn("⚠️ Label not found in labels[]:", labelName);
    
    return label ? label.color : "#9E9E9E"; // Default gray if not found
  };
  
  // Fetch time entries from Firestore
  const fetchEntries = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "time_entries"));
      const entries: TimeEntry[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          startTime: data.startTime,
          endTime: data.endTime,
          activity: data.activity,
          date: data.date,
          label: data.label, // Store the label name (not color)
        };
      });
      setTimeEntries(entries);
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };


  //  AI-powered input parsing
  const parseInputWithAI = async (text: string) => {
    //  Get all label names, including sub-labels
    const labelNames = labels.map(label => {
      if (label.parentId) {
        // Find the parent label and explicitly link them
        const parentLabel = labels.find(l => l.id === label.parentId);
        return parentLabel ? `"${label.name}" (subcategory of "${parentLabel.name}")` : `"${label.name}"`;
      }
      return `"${label.name}"`; // For top-level labels
    }).join(", ");    
  
    console.log("📌 AI Label Categories Sent to OpenAI:", labelNames); // Debugging Log
  
    const now = new Date();
const currentTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

const prompt = `Extract the start time, end time, and activity from this text: "${text}".  
Match it to one of these categories: [${labelNames}].  

IMPORTANT:  
- **If a subcategory exists, ALWAYS choose the most specific one** instead of the general category.  
- **For example, "Coding" (subcategory of "Work") should be chosen instead of just "Work".**  
- **"Call my loved ones" (subcategory of "Social") should be chosen instead of just "Social".**  

Time Handling:  
- If the user says **"now"**, return the current time as **"${currentTime}"**.  
- If they say **"in X minutes/hours"**, add X to the current time and return in **"HH:MM AM/PM"** format.  
- If they say **"later"**, assume 1 hour from now and return in **"HH:MM AM/PM"** format.  
- If they say **"this afternoon"**, assume **3:00 PM**.  
- If they say **"tonight"**, assume **8:00 PM**.  
- **Never return words like "now + 10 minutes", always return actual time.**  

Return JSON ONLY in this format:
{"startTime": "HH:MM AM/PM", "endTime": "HH:MM AM/PM", "activity": "description", "label": "category"}.`;

    
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: prompt }],
        max_tokens: 50,
      });
  
      console.log("🔥 AI Response:", response.choices[0].message?.content); // Debug AI output
      const extracted = JSON.parse(response.choices[0].message?.content || "{}");
  
      // Ensure AI result matches a Firestore label
      const labelExists = labels.some(label => label.name === extracted.label);
      const finalLabel = labelExists ? extracted.label : "unknown";
  
      console.log("✅ Final Label Assigned:", finalLabel); // Debug Final Label
  
      return {
        startTime: extracted.startTime || "00:00 AM",
        endTime: extracted.endTime || "00:00 AM",
        activity: extracted.activity || "Error Parsing",
        label: finalLabel,
      };
    } catch (error) {
      console.error("❌ AI Parsing Error:", error);
      return { startTime: "00:00 AM", endTime: "00:00 AM", activity: "Error Parsing", label: "unknown" };
    }
  };
  
  
  // ➕ Add a new time entry
  const addTimeEntry = async (inputText: string) => {
    if (!inputText) return;

    const { startTime, endTime, activity, label } = await parseInputWithAI(inputText);
    const date = new Date().toLocaleDateString("en-CA"); 

    try {
      await addDoc(collection(db, "time_entries"), { startTime, endTime, activity, label, date });
      fetchEntries(); // Refresh list
    } catch (error) {
      console.error("Error adding time entry:", error);
    }
  };

  // 🗑️ Delete an entry
  const deleteEntry = async (id: string) => {
    try {
      await deleteDoc(doc(db, "time_entries", id));
      setTimeEntries((prev) => prev.filter((entry) => entry.id !== id)); // Remove from state
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  // ✏️ Edit an existing entry
  const editEntry = async (updatedEntry: TimeEntry) => {
    if (!updatedEntry.id) return;
    try {
      await updateDoc(doc(db, "time_entries", updatedEntry.id), {
        startTime: updatedEntry.startTime,
        endTime: updatedEntry.endTime,
        activity: updatedEntry.activity,
        label: updatedEntry.label,
      });

      setTimeEntries((prev) =>
        prev.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry))
      );
    } catch (error) {
      console.error("Error updating entry:", error);
    }
  };

  // ⏳ Load labels first, then fetch entries
  useEffect(() => {
    const fetchData = async () => {
      await fetchLabels(); // Load labels first
      await fetchEntries(); // Then load entries
    };
    
    fetchData();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>It's My Time 🙂</h2>
      <p>Tracking time easily!</p>
      <LifeCoach /> {/* Life Coach Component */}
      <LabelManager /> {/* Label Management */}
      <InputBox onAddEntry={addTimeEntry} />
      <Timeline entries={timeEntries} getLabelColor={getLabelColor} onDelete={deleteEntry} onEdit={editEntry} />
    </div>
  );
};

export default TimeLogger;
