export interface Todo {
  id?: string;
  content: string;
  weight: number;
  order: number;
  completed: boolean;
  source: "manual" | "ai";
}
  