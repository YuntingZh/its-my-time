import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Label } from "../types/label";

const labelsCollection = collection(db, "labels");
export const addLabel = async (name: string, color: string, parentId?: string) => {
  return await addDoc(collection(db, "labels"), { name, color, parentId: parentId || null });
};

export const getLabels = async (): Promise<Label[]> => {
  try {
    const snapshot = await getDocs(collection(db, "labels"));

    // Debugging Log: Check if Firestore is returning anything
    console.log("Firestore Data:", snapshot.docs.map(doc => doc.data()));

    return snapshot.docs.map(doc => ({
      id: doc.id, // Firestore document ID
      name: doc.data().name,
      color: doc.data().color || "#000000", // Default color if missing
      parentId: doc.data().parentId || null, // Ensure null if missing
    })) as Label[];
  } catch (error) {
    console.error("Error fetching labels:", error);
    return [];
  }
};

export const updateLabel = async (id: string, name: string, parentId?: string) => {
  return await updateDoc(doc(db, "labels", id), { name, parentId: parentId || null });
};

export const deleteLabel = async (id: string) => {
  return await deleteDoc(doc(db, "labels", id));
};
