import React, { useMemo, useState } from "react";
import { TimeEntry } from "../types/timeEntry";
import { Label } from "../types/label";
import OpenAI from "openai";
import { getReport, saveReport, deleteReport } from "../services/reportService";
import { getDiary } from "../services/diaryService";

interface ReviewBiWeeklyReportProps {
  timeEntries: TimeEntry[];
  labels: Label[];
}

// Init OpenAI once
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

function getBiWeeklyRanges(entries: TimeEntry[]): { start: Date; end: Date }[] {
  if (entries.length === 0) return [];
  // Sort entries by date
  const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const firstDate = new Date(sorted[0].date);
  const lastDate = new Date(sorted[sorted.length - 1].date);
  // Find the first Monday before or on firstDate
  const start = new Date(firstDate);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // Monday
  // Build bi-weekly ranges
  const ranges = [];
  let rangeStart = new Date(start);
  while (rangeStart <= lastDate) {
    const rangeEnd = new Date(rangeStart);
    rangeEnd.setDate(rangeEnd.getDate() + 13); // 2 weeks (14 days, inclusive)
    ranges.push({ start: new Date(rangeStart), end: new Date(rangeEnd) });
    rangeStart.setDate(rangeStart.getDate() + 14);
  }
  return ranges;
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getLabelGroups(labels: Label[]) {
  // Group labels by parentId
  const parents = labels.filter(l => !l.parentId);
  return parents.map(parent => ({
    parent,
    children: labels.filter(l => l.parentId === parent.id)
  }));
}

function sumMinutes(entries: TimeEntry[], labelNames: string[]) {
  // Sum total minutes for entries with label in labelNames
  return entries.reduce((sum, entry) => {
    if (!entry.startTime || !entry.endTime) return sum;
    if (!labelNames.includes(entry.label)) return sum;
    const [startHour, startMin] = entry.startTime.split(/[: ]/).map(Number);
    const [endHour, endMin] = entry.endTime.split(/[: ]/).map(Number);
    let start = startHour * 60 + startMin;
    let end = endHour * 60 + endMin;
    if (end < start) end += 24 * 60;
    return sum + (end - start);
  }, 0);
}

const CARDS_PER_PAGE = 4;

const ReviewBiWeeklyReport: React.FC<ReviewBiWeeklyReportProps> = ({ timeEntries, labels }) => {
  const [page, setPage] = useState(0);
  const [insights, setInsights] = useState<Record<number, string>>({});
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);
  const ranges = useMemo(() => getBiWeeklyRanges(timeEntries), [timeEntries]);
  const labelGroups = useMemo(() => getLabelGroups(labels), [labels]);

  // Fetch saved insights once
  React.useEffect(() => {
    (async () => {
      const entries: Record<number, string> = {};
      await Promise.all(ranges.map(async (r, idx) => {
        const id = `${r.start.toISOString().slice(0,10)}_${r.end.toISOString().slice(0,10)}`;
        const doc = await getReport(id);
        if (doc) entries[idx] = doc.summary;
      }));
      if (Object.keys(entries).length) setInsights(entries);
    })();
  }, [ranges]);

  // For each range, summarize hours per label group
  const reports = useMemo(() => ranges.map(({ start, end }) => {
    const entriesInRange = timeEntries.filter(e => {
      const d = new Date(e.date);
      return d >= start && d <= end;
    });
    const summary = labelGroups.map(({ parent, children }) => {
      const names = [parent.name, ...children.map(c => c.name)];
      const minutes = sumMinutes(entriesInRange, names);
      return { label: parent.name, color: parent.color, minutes };
    });
    return {
      title: `${formatDate(start)} - ${formatDate(end)}`,
      summary,
    };
  }), [ranges, timeEntries, labelGroups]);

  const pagedReports = reports.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);

  // Handler to generate AI insight for a report index
  const handleGenerateInsight = async (globalIdx: number, entriesInRange: TimeEntry[]) => {
    if (loadingIdx !== null) return; // prevent parallel
    setLoadingIdx(globalIdx);
    try {
      // Build simple bullet list of activities aggregated by label/time
      const bulletEntries = entriesInRange.map(e => `• ${e.activity} (${e.startTime} - ${e.endTime})`).join("\n");
      // Diaries
      const diariesLines: string[] = [];
      let dIter = new Date(ranges[globalIdx].start);
      while (dIter <= ranges[globalIdx].end) {
        const ymd = dIter.toISOString().slice(0,10);
        const diary = getDiary(ymd);
        if (diary && diary.text.trim()) diariesLines.push(`Diary ${ymd}: ${diary.text.trim()}`);
        dIter.setDate(dIter.getDate() + 1);
      }
      const diarySection = diariesLines.length ? `\n\nPersonal diary notes:\n${diariesLines.join("\n")}` : "";

      const prompt = `You are a personal productivity coach. The following is a list of time-tracked activities for a two-week period.  Write a concise (5-7 sentences) summary that: 1) Describes what the person spent most of their time on, 2) Infers how they might have felt, 3) Points out any interesting patterns or imbalances, 4) Gives one actionable suggestion for the next two weeks.\n\nActivities:\n${bulletEntries}${diarySection}`;

      const resp = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: prompt }],
        max_tokens: 120,
      });

      const summary = resp.choices[0].message?.content?.trim() || "(No summary)";
      setInsights(prev => ({ ...prev, [globalIdx]: summary }));

      // Persist to Firestore
      const range = ranges[globalIdx];
      if (range) {
        await saveReport({
          id: `${range.start.toISOString().slice(0,10)}_${range.end.toISOString().slice(0,10)}`,
          start: range.start.toISOString().slice(0,10),
          end: range.end.toISOString().slice(0,10),
          summary,
          createdAt: Date.now(),
        });
      }
    } catch (err) {
      console.error("AI insight error", err);
      alert("Failed to generate AI summary. Please try again.");
    } finally {
      setLoadingIdx(null);
    }
  };

  const handleRemoveInsight = async (globalIdx: number) => {
    const range = ranges[globalIdx];
    if (!range) return;
    const id = `${range.start.toISOString().slice(0,10)}_${range.end.toISOString().slice(0,10)}`;
    try {
      await deleteReport(id);
    } catch (e) {
      console.error("delete report error", e);
    }
    setInsights(prev => {
      const cp = { ...prev };
      delete cp[globalIdx];
      return cp;
    });
  };

  return (
    <div style={{ marginTop: 32 }}>
      <h2 style={{ textAlign: "center" }}>📅 Review My Bi-Weekly Report</h2>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
        {pagedReports.map((report, idx) => {
          const globalIdx = page * CARDS_PER_PAGE + idx;
          return (
            <div key={idx} style={{ minWidth: 260, maxWidth: 300, background: "#fff", border: "1px solid #eee", borderRadius: 12, boxShadow: "0 2px 8px #0001", padding: 20 }}>
              <h3 style={{ margin: 0, marginBottom: 8, fontSize: 18 }}>{report.title}</h3>
              {report.summary.map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 6, background: s.color, marginRight: 8 }}></span>
                  <span style={{ flex: 1 }}>{s.label}</span>
                  <span style={{ fontWeight: 500 }}>{(s.minutes / 60).toFixed(1)}h</span>
                </div>
              ))}

              {/* AI Insight section */}
              {insights[globalIdx] ? (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 14, whiteSpace: "pre-wrap", marginBottom: 8 }}>{insights[globalIdx]}</div>
                  <button onClick={() => handleRemoveInsight(globalIdx)} style={{ fontSize: 12 }}>Remove Summary</button>
                </div>
              ) : (
                <button
                  onClick={() => handleGenerateInsight(globalIdx, timeEntries.filter(e => {
                    const d = new Date(e.date);
                    return d >= ranges[globalIdx].start && d <= ranges[globalIdx].end;
                  }))}
                  disabled={loadingIdx !== null}
                  style={{ marginTop: 12 }}
                >
                  {loadingIdx === globalIdx ? "Generating…" : "Generate AI Summary"}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ marginRight: 8 }}>Prev</button>
        <button onClick={() => setPage(p => (p + 1 < Math.ceil(reports.length / CARDS_PER_PAGE) ? p + 1 : p))} disabled={page + 1 >= Math.ceil(reports.length / CARDS_PER_PAGE)}>Next</button>
      </div>
    </div>
  );
};

export default ReviewBiWeeklyReport; 