export interface FastingPlan {
  date: string; // YYYY-MM-DD
  windowHours: number; // eating window length in hours
  startHour: number; // 0-23 when eating window starts
}

export function saveFasting(plan: FastingPlan) {
  localStorage.setItem(`fasting-${plan.date}`, JSON.stringify(plan));
}

export function getFasting(date: string): FastingPlan | null {
  const raw = localStorage.getItem(`fasting-${date}`);
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  // migration from old shape
  if (parsed.hours !== undefined && parsed.startTime) {
    const [time, period] = parsed.startTime.split(" ");
    let [h] = time.split(":").map(Number);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return { date, windowHours: parsed.hours, startHour: h };
  }
  return parsed;
} 