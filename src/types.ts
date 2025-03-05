export type LabelType = "work" | "exercise" | "idle" | "social" | "sleep" | "unknown";

export interface TimeEntry {
  id?: string;
  activity: string;
  startTime: string;
  endTime?: string;
  date: string;
  label: LabelType;
}
