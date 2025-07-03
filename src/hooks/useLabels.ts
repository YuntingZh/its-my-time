import { useState, useEffect, useCallback } from "react";
import { getLabels } from "../services/labelService";
import { Label } from "../types/label";

export default function useLabels() {
  const [labels, setLabels] = useState<Label[]>([]);
  const refresh = useCallback(async () => {
    const data = await getLabels();
    setLabels(data);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { labels, refresh } as const;
} 