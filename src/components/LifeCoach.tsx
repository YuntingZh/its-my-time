import React, { useState, useEffect } from "react";
import { db } from "../services/firebaseConfig";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import OpenAI from "openai";
import { TimeEntry } from "../types/timeEntry";

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const LifeCoach: React.FC = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  // Fetch all entries from Firestore
  useEffect(() => {
    const fetchAllEntries = async () => {
      try {
        const q = query(
          collection(db, "time_entries"),
          orderBy("date", "desc"),
          limit(40)
        );
        const querySnapshot = await getDocs(q);
        const entries: TimeEntry[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as TimeEntry[];
        setTimeEntries(entries);
      } catch (error) {
        console.error("Error fetching time entries:", error);
      }
    };

    fetchAllEntries();
  }, []);

  const generateDeepAdvice = async () => {
    const activitySummary = timeEntries.map(entry =>
      `On ${entry.date}, from ${entry.startTime} to ${entry.endTime}, I did: ${entry.activity} (${entry.label}).`
    ).join("\n");
  
    const prompt = `
    I track my time using different labels, but context matters. Here's what you should know before analyzing my data:
    
    ### **🎙️ Your Role:**
    You are a **supportive and fun life coach**, always focusing on **encouragement while providing actionable advice.**   
    - You **celebrate small wins** and **reframe setbacks as learning moments** instead of failures.  
    - You **sound like a mix of a motivational speaker and a best friend**—using **positivity, humor, and emojis** to keep things uplifting.   
    - You **NEVER judge or shame—only uplift, redirect, and energize!**    
    
    ### **🔍 How to Analyze My Data:**
    - **Find REAL patterns**, not just what's labeled.  
    - **Ask insightful questions** that help me reflect on my habits.  
    - If I seem **distracted or stuck**, suggest simple, actionable strategies to regain focus.  
    - If my **balance seems off**, help me **adjust it in a smart and realistic way**—no guilt, just constructive guidance.  
    - If I'm **overworking or procrastinating**, encourage me while keeping things fun & lighthearted.  

    Now, here's my time log:  
    ${activitySummary}
    ### **🚀 Let's go! What insights do you have for me?**  
    `;
    

  
    console.log("🧠 AI Prompt:", prompt); // Debugging
  
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4", // If you can, use GPT-4 for better reasoning.
        messages: [{ role: "system", content: prompt }],
        max_tokens: 500, // Longer for deep coaching.
      });
  
      console.log("🔥 AI Response:", response.choices[0].message?.content);
  
      setAiAdvice(response.choices[0].message?.content || "Error generating deep advice.");
    } catch (error) {
      console.error("AI Life Coach Error:", error);
      setAiAdvice("Oops! Something went wrong.");
    }
  };
  

  return (
    <div style={{ marginBottom: "20px", textAlign: "center" }}>
      <h3>💡 Life Coach</h3>
      <button
        onClick={generateDeepAdvice}
        style={{
          padding: "10px",
          backgroundColor: "#5C67F2",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Inspire Me!
      </button>

      {aiAdvice && (
        <p style={{
          marginTop: "10px",
          padding: "10px",
          backgroundColor: "#F1F8E9",
          borderRadius: "5px",
          fontStyle: "italic",
        }}>
          {aiAdvice}
        </p>
      )}
    </div>
  );
};

export default LifeCoach;
