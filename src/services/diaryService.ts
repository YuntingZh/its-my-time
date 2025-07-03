import { db } from "./firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface Diary {
  date: string; // YYYY-MM-DD
  text: string;
  updatedAt: string; // ISO string
}

function diaryDoc(date: string) {
  return doc(db, "diaries", date);
}

export async function saveDiary(date: string, text: string) {
  const updatedAt = new Date().toISOString();
  // Firestore
  try {
    await setDoc(diaryDoc(date), { text, updatedAt });
  } catch {}
  localStorage.setItem(`diary-${date}`, text);
  localStorage.setItem(`diaryUpdatedAt-${date}`, updatedAt);
}

export function getDiary(date: string): Diary | null {
  const text = localStorage.getItem(`diary-${date}`);
  const updatedAt = localStorage.getItem(`diaryUpdatedAt-${date}`);
  const local = text ? { date, text, updatedAt: updatedAt || new Date().toISOString() } : null;

  // Firestore fetch in background to refresh cache
  (async () => {
    try {
      const snap = await getDoc(diaryDoc(date));
      if (snap.exists()) {
        const data = snap.data();
        localStorage.setItem(`diary-${date}`, data.text);
        localStorage.setItem(`diaryUpdatedAt-${date}`, data.updatedAt);
      }
    } catch {}
  })();

  return local;
}

export async function fetchDiary(date: string): Promise<Diary | null> {
  try {
    const snap = await getDoc(diaryDoc(date));
    if (snap.exists()) {
      const data = snap.data();
      // update cache
      localStorage.setItem(`diary-${date}`, data.text);
      localStorage.setItem(`diaryUpdatedAt-${date}`, data.updatedAt);
      return { date, text: data.text, updatedAt: data.updatedAt };
    }
  } catch {}
  return null;
} 