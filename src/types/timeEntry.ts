import { LabelType } from "./label";

export interface MoodData {
  mood: string;
  intensity: number;  // 1-5 scale
  notes?: string;
}

export interface TimeEntry {
  id?: string;
  activity: string;
  startTime: string;
  endTime?: string;
  date: string;
  label: LabelType;
  mood?: MoodData;
}

