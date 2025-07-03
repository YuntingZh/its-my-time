import { useState, useEffect, useCallback } from "react";
import { TimeEntry } from "../types/timeEntry";
import {
  fetchTimeEntries,
  addTimeEntry as addDb,
  deleteTimeEntry as deleteDb,
  updateTimeEntry as updateDb,
} from "../services/timeEntryService";

export default function useTimeEntries() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);

  const refresh = useCallback(async () => {
    const data = await fetchTimeEntries();
    setEntries(data);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addEntry = useCallback(async (entry: Omit<TimeEntry, "id">) => {
    await addDb(entry);
    refresh();
  }, [refresh]);

  const deleteEntry = useCallback(async (id: string) => {
    await deleteDb(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateEntry = useCallback(async (entry: TimeEntry) => {
    await updateDb(entry);
    setEntries((prev) => prev.map((e) => (e.id === entry.id ? entry : e)));
  }, []);

  return { entries, refresh, addEntry, deleteEntry, updateEntry } as const;
} 