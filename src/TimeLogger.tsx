import React, { useState, useEffect } from "react";
import { sanitizeTime, timeToMinutes } from "./utils/timeUtils";
import TimerTool from "./components/TimerTool";
import Timeline from "./components/Timeline";
import InputBox from "./components/InputBox";
import LabelManager from "./components/LabelManager";
import LifeCoach from "./components/LifeCoach"; 
import TodoList from "./components/TodoList";
import Charts from "./components/Charts";
import DailyCandyJar from "./components/DailyCandyJar";
import ReviewBiWeeklyReport from "./components/ReviewBiWeeklyReport";
import { TimeEntry } from "./types/timeEntry";
import TimelineRecoveryModal from "./components/TimelineRecoveryModal";
import { findGaps } from "./services/gapService";
import { Gap } from "./types/gap";
import { parseRecoveryText, parseEntryText } from "./services/aiParserService";
import AboutMe from "./components/AboutMe";
import useLabels from "./hooks/useLabels";
import useTimeEntries from "./hooks/useTimeEntries";
import TimeFixModal from "./components/TimeFixModal";
import DailyDiary from "./components/DailyDiary";
import CalendarMonthlyPicker from "./components/CalendarMonthlyPicker";
import FastingWindowInput from "./components/FastingWindowInput";
import { getFasting } from "./services/fastingService";

const TimeLogger: React.FC = () => {
  const { labels } = useLabels();
  const {
    entries: timeEntries,
    addEntry,
    deleteEntry: removeEntry,
    updateEntry: updateEntryFn,
    refresh,
  } = useTimeEntries();
  const [showChart, setShowChart] = useState(false); // Toggle between TodoList and Charts
  const todayStr = new Date().toLocaleDateString("en-CA");
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  // ───────── Recovery Assistant State ─────────
  const [gapsToday, setGapsToday] = useState<Gap[]>([]);
  const [showRecovery, setShowRecovery] = useState(false);
  // ───────── About Me ─────────
  const [aboutMe, setAboutMe] = useState<string>(localStorage.getItem("aboutMe") || "");
  const [pendingFix, setPendingFix] = useState<Omit<TimeEntry, "id"> | null>(null);
  const [fastingPlan, setFastingPlan] = useState(() => getFasting(selectedDate));

  // Dynamically get label color when displaying labels
  const getLabelColor = (labelName: string) => {
  
    const label = labels.find(label => label.name.toLowerCase() === labelName.toLowerCase());
  
    if (!label) console.warn("⚠️ Label not found in labels[]:", labelName);
    
    return label ? label.color : "#9E9E9E"; // Default gray if not found
  };
  
  // ➕ Add a new time entry
  const addTimeEntry = async (inputText: string) => {
    if (!inputText) return;

    let { startTime, endTime, activity, label } = await parseEntryText(inputText, labels, aboutMe);
    startTime = sanitizeTime(startTime);
    endTime = sanitizeTime(endTime);
    const invalid =
      !startTime || !endTime || label === "unknown" || timeToMinutes(startTime) >= timeToMinutes(endTime);
    const date = new Date().toLocaleDateString("en-CA");

    if (invalid) {
      setPendingFix({ startTime, endTime, activity, label, date });
      return;
    }

    try {
      await addEntry({ startTime, endTime, activity, label, date });
    } catch (error) {
      console.error("Error adding time entry:", error);
    }
  };

  // 🗑️ Delete an entry
  const deleteEntry = removeEntry;

  // ✏️ Edit an existing entry
  const handleEditEntry = async (updatedEntry: TimeEntry) => {
    if (!updatedEntry.id) return;
    try {
      await updateEntryFn(updatedEntry);
    } catch (error) {
      console.error("Error updating entry:", error);
    }
  };

  // Re-compute gaps whenever today's entries change
  useEffect(() => {
    const gaps = findGaps(timeEntries, todayStr);
    setGapsToday(gaps);
  }, [timeEntries, todayStr]);

  // Show the modal automatically at 21:00 if gaps exist and not previously skipped
  useEffect(() => {
    const storageKey = `skipRecovery-${todayStr}`;

    const check = () => {
      const now = new Date();
      if (
        now.getHours() === 21 &&
        gapsToday.length > 0 &&
        localStorage.getItem(storageKey) !== "true"
      ) {
        setShowRecovery(true);
      }
    };

    // Check every minute
    const interval = setInterval(check, 60 * 1000);
    check(); // also run immediately on mount

    return () => clearInterval(interval);
  }, [gapsToday, todayStr]);

  useEffect(() => {
    setFastingPlan(getFasting(selectedDate));
  }, [selectedDate]);

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <h2>It's My Time 🙂</h2>

      {/* ───────────────────────── Top Row ───────────────────────── */}
      <div style={{ display: "flex", gap: "32px", alignItems: "flex-start", flexWrap: "wrap" }}>

        {/* ░░ Left Container ░░ (InputBox above TodoList) */}
        <div
          style={{
            flex: "1 1 600px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            minWidth: "300px",
          }}
        >
          <InputBox onAddEntry={addTimeEntry} />
          <TodoList />
          <DailyDiary date={selectedDate}/>
          <FastingWindowInput date={selectedDate} onSaved={() => setFastingPlan(getFasting(selectedDate))} />
        </div>

        {/* ░░ Right Container ░░ (Timeline / Chart Toggle) */}
        <div style={{ flex: "1 1 350px", minWidth: "320px" }}>
          <CalendarMonthlyPicker
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            entries={timeEntries}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h2 style={{ margin: 0 }}>{showChart ? "📊 Daily Summary" : "🕒 Timeline"}</h2>
            <button
              onClick={() => setShowChart(!showChart)}
              style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: "#5C67F2", color: "#fff", cursor: "pointer" }}
            >
              {showChart ? "Show Timeline" : "Show Pie Chart"}
            </button>
          </div>

          {showChart ? (
            <Charts
              entries={timeEntries.filter((e) => e.date === selectedDate)}
              getLabelColor={getLabelColor}
            />
          ) : (
            <Timeline
              entries={timeEntries}
              getLabelColor={getLabelColor}
              onDelete={deleteEntry}
              onEdit={handleEditEntry}
              selectedDate={selectedDate}
              fastingPlan={fastingPlan}
            />
          )}
        </div>
      </div>

      {/* ──────────────────────── Vertical Stack ───────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "32px", marginTop: "40px" }}>
        {/* Row: Timer + Candy Jar */}
        <div style={{ display: "flex", gap: "32px", flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 300px", minWidth: "260px" }}>
            <TimerTool />
          </div>
          <div style={{ flex: "1 1 300px", minWidth: "260px" }}>
            <DailyCandyJar />
          </div>
        </div>

        <LabelManager />
        <LifeCoach />
        <ReviewBiWeeklyReport timeEntries={timeEntries} labels={labels} />
        <AboutMe aboutMe={aboutMe} setAboutMe={setAboutMe} />
      </div>

      {/* ───────── Recovery Assistant Modal ───────── */}
      {showRecovery && (
        <TimelineRecoveryModal
          gaps={gapsToday}
          onClose={() => setShowRecovery(false)}
          onSkipToday={() => {
            localStorage.setItem(`skipRecovery-${todayStr}`, "true");
            setShowRecovery(false);
          }}
          onRemindLater={() => setShowRecovery(false)}
          onSave={async (raw) => {
            if (!raw.length) {
              setShowRecovery(false);
              return;
            }

            // raw will contain one object with activity=freeText
            const freeText = raw[0].activity || "";
            const aiEntries = await parseRecoveryText(freeText, gapsToday, labels);

            const date = todayStr;

            // Persist each entry
            for (const e of aiEntries) {
              if (!e.startTime || !e.endTime || !e.activity) continue;
              const label = e.label && labels.some((l) => l.name === e.label) ? e.label : "unknown";
              try {
                await addEntry({ startTime: e.startTime, endTime: e.endTime, activity: e.activity, label, date });
              } catch (err) {
                console.error("Failed saving recovery entry", err);
              }
            }

            refresh();
            setShowRecovery(false);
          }}
        />
      )}

      {pendingFix && (
        <TimeFixModal
          entry={pendingFix}
          onCancel={() => setPendingFix(null)}
          onSave={async (fixed) => {
            try {
              await addEntry(fixed);
              setPendingFix(null);
            } catch (err) {
              console.error(err);
            }
          }}
        />
      )}
    </div>
  );
};

export default TimeLogger;
