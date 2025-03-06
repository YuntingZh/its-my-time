import { LabelType } from "./label";

export interface TimeEntry {
  id?: string;
  activity: string;
  startTime: string;
  endTime?: string;
  date: string;
  label: LabelType;
}

