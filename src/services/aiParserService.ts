import OpenAI from "openai";
import { Gap } from "../types/gap";
import { TimeEntry } from "../types/timeEntry";
import { Label } from "../types/label";

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

/**
 * Use OpenAI to turn the user's free-form description of forgotten work into structured
 * timeline blocks constrained to the provided gaps.
 */
export async function parseRecoveryText(
  userText: string,
  gaps: Gap[],
  labels: Label[],
): Promise<Partial<TimeEntry>[]> {
  const gapWindows = gaps
    .map((g) => {
      const start = new Date(g.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
      const end = new Date(g.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
      return `${start}–${end}`;
    })
    .join(", ");

  const labelNames = labels.map((l) => `"${l.name}"`).join(", ");

  const systemPrompt = `You are an assistant that converts a user's description of how they spent their time into a JSON array of timeline blocks. Each block must have: startTime, endTime, activity, label. All times must fall completely inside the missing windows [${gapWindows}]. Allowed labels: [${labelNames}]. If the user describes multiple sequential activities inside one gap, split them up. Output ONLY valid JSON.`;

  const resp = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userText },
    ],
    max_tokens: 256,
  });

  const raw = resp.choices[0].message?.content || "[]";
  const parsed: Partial<TimeEntry>[] = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

/**
 * Convert a single user input line into a time entry suggestion.
 */
export async function parseEntryText(
  userText: string,
  labels: Label[],
  aboutMe: string,
): Promise<{ startTime: string; endTime: string; activity: string; label: string }> {
  const labelNames = labels
    .map((l) => {
      if (l.parentId) {
        const parent = labels.find((p) => p.id === l.parentId);
        return parent ? `"${l.name}" (subcategory of "${parent.name}")` : `"${l.name}"`;
      }
      return `"${l.name}"`;
    })
    .join(", ");

  const now = new Date();
  const currentTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const prompt = `${aboutMe ? `User context: ${aboutMe}\n\n` : ""}Extract the start time, end time, and activity from this text: "${userText}".  
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

  const resp = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: prompt },
    ],
    max_tokens: 60,
  });

  const extracted = JSON.parse(resp.choices[0].message?.content || "{}");

  const labelExists = labels.some((l) => l.name === extracted.label);
  const finalLabel = labelExists ? extracted.label : "unknown";

  return {
    startTime: extracted.startTime || "00:00 AM",
    endTime: extracted.endTime || "00:00 AM",
    activity: extracted.activity || "Error Parsing",
    label: finalLabel,
  };
} 