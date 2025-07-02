import { db } from "./firebaseConfig";
import { collection, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

const COLLECTION = "bi_weekly_reports";

export interface BiWeeklyReportDoc {
  id: string; // `${start}_${end}`
  start: string; // ISO date
  end: string;   // ISO date
  summary: string;
  createdAt: number; // timestamp ms
}

export async function getReport(id: string): Promise<BiWeeklyReportDoc | null> {
  const ref = doc(collection(db, COLLECTION), id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as BiWeeklyReportDoc;
}

export async function saveReport(data: BiWeeklyReportDoc) {
  const ref = doc(collection(db, COLLECTION), data.id);
  await setDoc(ref, data);
}

export async function deleteReport(id: string) {
  const ref = doc(collection(db, COLLECTION), id);
  await deleteDoc(ref);
} 