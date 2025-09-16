import { db } from "./firebaseConfig";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { TimeEntry } from "../types/timeEntry";

const COLLECTION = "time_entries";

export async function fetchTimeEntries(): Promise<TimeEntry[]> {
  const querySnapshot = await getDocs(collection(db, COLLECTION));
  return querySnapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      startTime: data.startTime,
      endTime: data.endTime,
      activity: data.activity,
      date: data.date,
      label: data.label,
    } as TimeEntry;
  });
}

export async function addTimeEntry(entry: Omit<TimeEntry, "id">) {
  await addDoc(collection(db, COLLECTION), entry);
}

export async function deleteTimeEntry(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function updateTimeEntry(entry: TimeEntry) {
  if (!entry.id) return;
  await updateDoc(doc(db, COLLECTION, entry.id), {
    startTime: entry.startTime,
    endTime: entry.endTime,
    activity: entry.activity,
    label: entry.label,
    mood: entry.mood,
  });
} 