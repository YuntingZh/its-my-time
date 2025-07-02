export interface Todo {
  id?: string;
  content: string;
  weight: number;
  order: number;
  completed: boolean;
  source: "manual" | "ai";
  quadrant?: "Q1" | "Q2" | "Q3" | "Q4";
  sortedByAI?: boolean;
}
  