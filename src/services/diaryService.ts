export interface Diary {
  date: string; // YYYY-MM-DD
  text: string;
  updatedAt: string; // ISO string
}

const key = (date: string) => `diary-${date}`;
const tsKey = (date: string) => `diaryUpdatedAt-${date}`;

export function saveDiary(date: string, text: string) {
  localStorage.setItem(key(date), text);
  localStorage.setItem(tsKey(date), new Date().toISOString());
}

export function getDiary(date: string): Diary | null {
  const text = localStorage.getItem(key(date));
  if (text === null) return null;
  const updatedAt = localStorage.getItem(tsKey(date)) || new Date().toISOString();
  return { date, text, updatedAt };
} 