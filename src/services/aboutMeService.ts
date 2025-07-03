import { db } from "./firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

const LS_KEY = "aboutMe";
const LS_TS = "aboutMeUpdatedAt";

export interface AboutMeData {
  text: string;
  updatedAt: string; // ISO
}

const docRef = doc(db, "meta", "aboutMe");

export async function getAboutMe(): Promise<AboutMeData> {
  // try Firestore first
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) return snap.data() as AboutMeData;
  } catch {}
  // fallback localStorage
  const text = localStorage.getItem(LS_KEY) || "";
  const updatedAt = localStorage.getItem(LS_TS) || new Date().toISOString();
  return { text, updatedAt };
}

export async function saveAboutMe(text: string): Promise<void> {
  const updatedAt = new Date().toISOString();
  // save to Firestore (ignore errors)
  try {
    await setDoc(docRef, { text, updatedAt });
  } catch {}
  // localStorage mirror
  localStorage.setItem(LS_KEY, text);
  localStorage.setItem(LS_TS, updatedAt);
} 