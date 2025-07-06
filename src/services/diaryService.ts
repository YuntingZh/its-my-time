import { db } from "./firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface Diary {
  date: string; // YYYY-MM-DD
  text: string;
}

function diaryDoc(date: string) {
  return doc(db, "diaries", date);
}

export async function saveDiary(date: string, text: string) {  // Firestore
  try {
    await setDoc(diaryDoc(date), { text });
  } catch {}
  localStorage.setItem(`diary-${date}`, text);
}

export function getDiary(date: string): Diary | null {
  const text = localStorage.getItem(`diary-${date}`);
  const local = text ? { date, text } : null;

  // Firestore fetch in background to refresh cache
  (async () => {
    try {
      const snap = await getDoc(diaryDoc(date));
      if (snap.exists()) {
        const data = snap.data();
        localStorage.setItem(`diary-${date}`, data.text);
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
      return { date, text: data.text };
    }
  } catch {}
  return null;
} 