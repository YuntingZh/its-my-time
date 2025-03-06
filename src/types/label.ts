export type LabelType = "work" | "exercise" | "idle" | "social" | "sleep" | "unknown";

export interface Label {
  id: string;
  name: string;
  color: string;
  parentId?: string | null; // Supports nested labels
}
export const labelColors: { [key: string]: string } = {
  work: "#4285F4",
  exercise: "#34A853",
  idle: "#F4B400",
  social: "#FBBC05",
  sleep: "#5F6368",
  unknown: "#9E9E9E",
};
