export interface Label {
  id: string;
  name: string;
  color: string;
  parentId?: string | null; // Supports nested labels
}

// LabelType is now dynamic, allowing any string since labels come from Firestore
 export type LabelType = string;
