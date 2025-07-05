# Its My Time - API Documentation

## Overview

"Its My Time" is a React TypeScript time tracking application with Firebase integration. It provides comprehensive time management features including time entry tracking, todo management, AI-powered parsing, fasting tracking, and personal analytics.

## Table of Contents

1. [Core Types](#core-types)
2. [Services (APIs)](#services-apis)
3. [Custom Hooks](#custom-hooks)
4. [Components](#components)
5. [Usage Examples](#usage-examples)

## Core Types

### TimeEntry

```typescript
interface TimeEntry {
  id?: string;
  activity: string;
  startTime: string;    // Format: "HH:MM AM/PM"
  endTime?: string;     // Format: "HH:MM AM/PM"
  date: string;         // Format: "YYYY-MM-DD"
  label: LabelType;     // Label name as string
}
```

### Todo

```typescript
interface Todo {
  id?: string;
  content: string;
  weight: number;               // 1-5 priority scale
  order: number;                // Display order
  completed: boolean;
  source: "manual" | "ai";
  quadrant?: "Q1" | "Q2" | "Q3" | "Q4";  // Eisenhower Matrix
  sortedByAI?: boolean;
}
```

### Label

```typescript
interface Label {
  id: string;
  name: string;
  color: string;        // Hex color code
  parentId?: string | null;  // For nested labels
}

type LabelType = string;  // Dynamic label names
```

### Gap

```typescript
interface Gap {
  start: string;  // ISO timestamp
  end: string;    // ISO timestamp
}
```

### Diary

```typescript
interface Diary {
  date: string;      // YYYY-MM-DD
  text: string;
  updatedAt: string; // ISO string
}
```

### FastingPlan

```typescript
interface FastingPlan {
  date: string;        // YYYY-MM-DD
  windowHours: number; // eating window length in hours
  startHour: number;   // 0-23 when eating window starts
}
```

### AboutMeData

```typescript
interface AboutMeData {
  text: string;
  updatedAt: string; // ISO
}
```

## Services (APIs)

### timeEntryService

Firebase service for managing time entries.

#### fetchTimeEntries()

```typescript
async function fetchTimeEntries(): Promise<TimeEntry[]>
```

Fetches all time entries from Firebase.

**Example:**
```typescript
import { fetchTimeEntries } from './services/timeEntryService';

const entries = await fetchTimeEntries();
console.log(entries);
```

#### addTimeEntry()

```typescript
async function addTimeEntry(entry: Omit<TimeEntry, "id">): Promise<void>
```

Adds a new time entry to Firebase.

**Example:**
```typescript
import { addTimeEntry } from './services/timeEntryService';

await addTimeEntry({
  activity: "Team meeting",
  startTime: "10:00 AM",
  endTime: "11:00 AM",
  date: "2024-01-15",
  label: "Work"
});
```

#### deleteTimeEntry()

```typescript
async function deleteTimeEntry(id: string): Promise<void>
```

Deletes a time entry from Firebase.

**Example:**
```typescript
import { deleteTimeEntry } from './services/timeEntryService';

await deleteTimeEntry("entry-id-123");
```

#### updateTimeEntry()

```typescript
async function updateTimeEntry(entry: TimeEntry): Promise<void>
```

Updates an existing time entry in Firebase.

**Example:**
```typescript
import { updateTimeEntry } from './services/timeEntryService';

await updateTimeEntry({
  id: "entry-id-123",
  activity: "Updated meeting notes",
  startTime: "10:00 AM",
  endTime: "11:30 AM",
  date: "2024-01-15",
  label: "Work"
});
```

### labelService

Firebase service for managing labels.

#### getLabels()

```typescript
async function getLabels(): Promise<Label[]>
```

Fetches all labels from Firebase.

**Example:**
```typescript
import { getLabels } from './services/labelService';

const labels = await getLabels();
console.log(labels);
```

#### addLabel()

```typescript
async function addLabel(name: string, color: string, parentId?: string): Promise<DocumentReference>
```

Adds a new label to Firebase.

**Example:**
```typescript
import { addLabel } from './services/labelService';

// Add a main category
await addLabel("Work", "#FF5722");

// Add a subcategory
await addLabel("Meetings", "#FF8A65", "parent-id-123");
```

#### updateLabel()

```typescript
async function updateLabel(id: string, name: string, parentId?: string): Promise<void>
```

Updates an existing label.

**Example:**
```typescript
import { updateLabel } from './services/labelService';

await updateLabel("label-id-123", "Updated Work Category", "new-parent-id");
```

#### deleteLabel()

```typescript
async function deleteLabel(id: string): Promise<void>
```

Deletes a label from Firebase.

**Example:**
```typescript
import { deleteLabel } from './services/labelService';

await deleteLabel("label-id-123");
```

### aiParserService

OpenAI-powered service for parsing natural language time entries.

#### parseEntryText()

```typescript
async function parseEntryText(
  userText: string,
  labels: Label[],
  aboutMe: string
): Promise<{ startTime: string; endTime: string; activity: string; label: string }>
```

Parses natural language text into structured time entry data.

**Example:**
```typescript
import { parseEntryText } from './services/aiParserService';

const result = await parseEntryText(
  "Had a team meeting from 10 to 11am",
  labels,
  "I'm a software developer"
);
// Returns: { startTime: "10:00 AM", endTime: "11:00 AM", activity: "team meeting", label: "Work" }
```

#### parseRecoveryText()

```typescript
async function parseRecoveryText(
  userText: string,
  gaps: Gap[],
  labels: Label[]
): Promise<Partial<TimeEntry>[]>
```

Parses recovery text to fill time gaps with multiple activities.

**Example:**
```typescript
import { parseRecoveryText } from './services/aiParserService';

const entries = await parseRecoveryText(
  "I had lunch, then worked on coding, then had a phone call",
  gaps,
  labels
);
// Returns array of parsed time entries
```

### gapService

Service for detecting unlogged time gaps.

#### findGaps()

```typescript
function findGaps(entries: TimeEntry[], dateStr: string): Gap[]
```

Finds unlogged time intervals for a given date.

**Example:**
```typescript
import { findGaps } from './services/gapService';

const gaps = findGaps(timeEntries, "2024-01-15");
console.log(gaps); // Array of Gap objects
```

### diaryService

Service for managing daily diary entries.

#### saveDiary()

```typescript
async function saveDiary(date: string, text: string): Promise<void>
```

Saves a diary entry for a specific date.

**Example:**
```typescript
import { saveDiary } from './services/diaryService';

await saveDiary("2024-01-15", "Today was productive. Finished the project.");
```

#### getDiary()

```typescript
function getDiary(date: string): Diary | null
```

Gets diary entry for a date (from localStorage with background Firebase sync).

**Example:**
```typescript
import { getDiary } from './services/diaryService';

const diary = getDiary("2024-01-15");
if (diary) {
  console.log(diary.text);
}
```

#### fetchDiary()

```typescript
async function fetchDiary(date: string): Promise<Diary | null>
```

Fetches diary entry directly from Firebase.

**Example:**
```typescript
import { fetchDiary } from './services/diaryService';

const diary = await fetchDiary("2024-01-15");
if (diary) {
  console.log(diary.text);
}
```

### fastingService

Service for managing intermittent fasting plans.

#### saveFasting()

```typescript
function saveFasting(plan: FastingPlan): void
```

Saves a fasting plan to localStorage.

**Example:**
```typescript
import { saveFasting } from './services/fastingService';

saveFasting({
  date: "2024-01-15",
  windowHours: 8,
  startHour: 12  // 12 PM
});
```

#### getFasting()

```typescript
function getFasting(date: string): FastingPlan | null
```

Gets fasting plan for a specific date.

**Example:**
```typescript
import { getFasting } from './services/fastingService';

const plan = getFasting("2024-01-15");
if (plan) {
  console.log(`Eating window: ${plan.windowHours} hours starting at ${plan.startHour}:00`);
}
```

### aboutMeService

Service for managing personal context information.

#### getAboutMe()

```typescript
async function getAboutMe(): Promise<AboutMeData>
```

Gets personal context information with Firebase sync.

**Example:**
```typescript
import { getAboutMe } from './services/aboutMeService';

const aboutMe = await getAboutMe();
console.log(aboutMe.text);
```

#### saveAboutMe()

```typescript
async function saveAboutMe(text: string): Promise<void>
```

Saves personal context information.

**Example:**
```typescript
import { saveAboutMe } from './services/aboutMeService';

await saveAboutMe("I'm a software developer working on React applications.");
```

## Custom Hooks

### useTimeEntries

Custom hook for managing time entries state.

```typescript
function useTimeEntries(): {
  entries: TimeEntry[];
  refresh: () => Promise<void>;
  addEntry: (entry: Omit<TimeEntry, "id">) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateEntry: (entry: TimeEntry) => Promise<void>;
}
```

**Example:**
```typescript
import useTimeEntries from './hooks/useTimeEntries';

function MyComponent() {
  const { entries, addEntry, deleteEntry, updateEntry } = useTimeEntries();

  const handleAddEntry = async () => {
    await addEntry({
      activity: "New task",
      startTime: "2:00 PM",
      endTime: "3:00 PM",
      date: "2024-01-15",
      label: "Work"
    });
  };

  return (
    <div>
      {entries.map(entry => (
        <div key={entry.id}>{entry.activity}</div>
      ))}
      <button onClick={handleAddEntry}>Add Entry</button>
    </div>
  );
}
```

### useLabels

Custom hook for managing labels state.

```typescript
function useLabels(): {
  labels: Label[];
  refresh: () => Promise<void>;
}
```

**Example:**
```typescript
import useLabels from './hooks/useLabels';

function MyComponent() {
  const { labels, refresh } = useLabels();

  return (
    <div>
      {labels.map(label => (
        <div key={label.id} style={{ color: label.color }}>
          {label.name}
        </div>
      ))}
      <button onClick={refresh}>Refresh Labels</button>
    </div>
  );
}
```

## Components

### TimeLogger

Main application component that orchestrates all features.

```typescript
const TimeLogger: React.FC = () => { ... }
```

**Usage:**
```typescript
import TimeLogger from './TimeLogger';

function App() {
  return <TimeLogger />;
}
```

### InputBox

Component for adding new time entries via natural language input.

```typescript
interface InputBoxProps {
  onAddEntry: (text: string) => void;
}

const InputBox: React.FC<InputBoxProps> = ({ onAddEntry }) => { ... }
```

**Example:**
```typescript
import InputBox from './components/InputBox';

function MyComponent() {
  const handleAddEntry = (text: string) => {
    console.log('Adding entry:', text);
    // Process the natural language input
  };

  return <InputBox onAddEntry={handleAddEntry} />;
}
```

### Timeline

Visual timeline component for displaying time entries.

```typescript
interface TimelineProps {
  entries: TimeEntry[];
  getLabelColor: (labelName: string) => string;
  onDelete: (id: string) => void;
  onEdit: (entry: TimeEntry) => void;
  selectedDate: string;
  fastingPlan?: { startHour: number; windowHours: number } | null;
}

const Timeline: React.FC<TimelineProps> = ({ ... }) => { ... }
```

**Example:**
```typescript
import Timeline from './components/Timeline';

function MyComponent() {
  const getLabelColor = (labelName: string) => {
    const colorMap = { Work: '#FF5722', Personal: '#4CAF50' };
    return colorMap[labelName] || '#9E9E9E';
  };

  const handleDelete = (id: string) => {
    // Delete entry logic
  };

  const handleEdit = (entry: TimeEntry) => {
    // Edit entry logic
  };

  return (
    <Timeline
      entries={timeEntries}
      getLabelColor={getLabelColor}
      onDelete={handleDelete}
      onEdit={handleEdit}
      selectedDate="2024-01-15"
      fastingPlan={{ startHour: 12, windowHours: 8 }}
    />
  );
}
```

### TodoList

Comprehensive todo management component with AI-powered smart sorting.

```typescript
const TodoList: React.FC = () => { ... }
```

**Features:**
- Add, edit, delete todos
- Drag and drop reordering
- Weight-based prioritization
- AI-powered Eisenhower Matrix sorting
- Quadrant view integration

**Example:**
```typescript
import TodoList from './components/TodoList';

function MyComponent() {
  return <TodoList />;
}
```

### Charts

Data visualization component for time entry analytics.

```typescript
interface ChartsProps {
  entries: TimeEntry[];
  getLabelColor: (labelName: string) => string;
}

const Charts: React.FC<ChartsProps> = ({ entries, getLabelColor }) => { ... }
```

**Example:**
```typescript
import Charts from './components/Charts';

function MyComponent() {
  const getLabelColor = (labelName: string) => {
    return labelColorMap[labelName] || '#9E9E9E';
  };

  return (
    <Charts
      entries={todayEntries}
      getLabelColor={getLabelColor}
    />
  );
}
```

### TimerTool

Pomodoro-style timer component for focused work sessions.

```typescript
const TimerTool: React.FC = () => { ... }
```

**Example:**
```typescript
import TimerTool from './components/TimerTool';

function MyComponent() {
  return <TimerTool />;
}
```

### DailyCandyJar

Gamification component for tracking daily achievements.

```typescript
const DailyCandyJar: React.FC = () => { ... }
```

**Example:**
```typescript
import DailyCandyJar from './components/DailyCandyJar';

function MyComponent() {
  return <DailyCandyJar />;
}
```

### LabelManager

Component for managing time entry labels and categories.

```typescript
const LabelManager: React.FC = () => { ... }
```

**Example:**
```typescript
import LabelManager from './components/LabelManager';

function MyComponent() {
  return <LabelManager />;
}
```

### LifeCoach

AI-powered life coaching component for personal insights.

```typescript
const LifeCoach: React.FC = () => { ... }
```

**Example:**
```typescript
import LifeCoach from './components/LifeCoach';

function MyComponent() {
  return <LifeCoach />;
}
```

### ReviewBiWeeklyReport

Analytics component for bi-weekly time tracking reports.

```typescript
interface ReviewBiWeeklyReportProps {
  timeEntries: TimeEntry[];
  labels: Label[];
}

const ReviewBiWeeklyReport: React.FC<ReviewBiWeeklyReportProps> = ({ ... }) => { ... }
```

**Example:**
```typescript
import ReviewBiWeeklyReport from './components/ReviewBiWeeklyReport';

function MyComponent() {
  return (
    <ReviewBiWeeklyReport
      timeEntries={allEntries}
      labels={availableLabels}
    />
  );
}
```

### AboutMe

Component for managing personal context information.

```typescript
interface AboutMeProps {
  aboutMe: string;
  setAboutMe: (text: string) => void;
}

const AboutMe: React.FC<AboutMeProps> = ({ aboutMe, setAboutMe }) => { ... }
```

**Example:**
```typescript
import AboutMe from './components/AboutMe';

function MyComponent() {
  const [aboutMe, setAboutMe] = useState("");

  return (
    <AboutMe
      aboutMe={aboutMe}
      setAboutMe={setAboutMe}
    />
  );
}
```

### FastingTracker

Component for tracking intermittent fasting schedules.

```typescript
const FastingTracker: React.FC = () => { ... }
```

**Example:**
```typescript
import FastingTracker from './components/FastingTracker';

function MyComponent() {
  return <FastingTracker />;
}
```

### DateSelector

Component for selecting specific dates for time entry viewing.

```typescript
interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ ... }) => { ... }
```

**Example:**
```typescript
import DateSelector from './components/DateSelector';

function MyComponent() {
  const [selectedDate, setSelectedDate] = useState("2024-01-15");

  return (
    <DateSelector
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
    />
  );
}
```

### CalendarMonthlyPicker

Monthly calendar component for date selection with entry indicators.

```typescript
interface CalendarMonthlyPickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  entries: TimeEntry[];
}

const CalendarMonthlyPicker: React.FC<CalendarMonthlyPickerProps> = ({ ... }) => { ... }
```

**Example:**
```typescript
import CalendarMonthlyPicker from './components/CalendarMonthlyPicker';

function MyComponent() {
  const [selectedDate, setSelectedDate] = useState("2024-01-15");

  return (
    <CalendarMonthlyPicker
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
      entries={timeEntries}
    />
  );
}
```

### DailyDiary

Component for daily journal entries.

```typescript
interface DailyDiaryProps {
  date: string;
}

const DailyDiary: React.FC<DailyDiaryProps> = ({ date }) => { ... }
```

**Example:**
```typescript
import DailyDiary from './components/DailyDiary';

function MyComponent() {
  return <DailyDiary date="2024-01-15" />;
}
```

### FastingWindowInput

Component for configuring intermittent fasting eating windows.

```typescript
interface FastingWindowInputProps {
  date: string;
  onSaved: () => void;
}

const FastingWindowInput: React.FC<FastingWindowInputProps> = ({ ... }) => { ... }
```

**Example:**
```typescript
import FastingWindowInput from './components/FastingWindowInput';

function MyComponent() {
  const handleSaved = () => {
    console.log('Fasting plan saved');
  };

  return (
    <FastingWindowInput
      date="2024-01-15"
      onSaved={handleSaved}
    />
  );
}
```

## Usage Examples

### Complete Time Entry Workflow

```typescript
import React, { useState } from 'react';
import useTimeEntries from './hooks/useTimeEntries';
import useLabels from './hooks/useLabels';
import InputBox from './components/InputBox';
import Timeline from './components/Timeline';
import { parseEntryText } from './services/aiParserService';

function TimeTrackingApp() {
  const { entries, addEntry, deleteEntry, updateEntry } = useTimeEntries();
  const { labels } = useLabels();
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString("en-CA"));

  const getLabelColor = (labelName: string) => {
    const label = labels.find(l => l.name.toLowerCase() === labelName.toLowerCase());
    return label ? label.color : "#9E9E9E";
  };

  const handleAddEntry = async (inputText: string) => {
    const aboutMe = localStorage.getItem("aboutMe") || "";
    const parsed = await parseEntryText(inputText, labels, aboutMe);
    
    await addEntry({
      ...parsed,
      date: selectedDate
    });
  };

  return (
    <div>
      <InputBox onAddEntry={handleAddEntry} />
      <Timeline
        entries={entries}
        getLabelColor={getLabelColor}
        onDelete={deleteEntry}
        onEdit={updateEntry}
        selectedDate={selectedDate}
      />
    </div>
  );
}
```

### Label Management

```typescript
import React from 'react';
import { addLabel, getLabels, updateLabel, deleteLabel } from './services/labelService';

function LabelManagementExample() {
  const [labels, setLabels] = useState<Label[]>([]);

  useEffect(() => {
    const loadLabels = async () => {
      const fetchedLabels = await getLabels();
      setLabels(fetchedLabels);
    };
    loadLabels();
  }, []);

  const handleAddLabel = async () => {
    await addLabel("New Category", "#FF5722");
    // Refresh labels
    const updatedLabels = await getLabels();
    setLabels(updatedLabels);
  };

  const handleUpdateLabel = async (id: string) => {
    await updateLabel(id, "Updated Category Name");
    // Refresh labels
    const updatedLabels = await getLabels();
    setLabels(updatedLabels);
  };

  const handleDeleteLabel = async (id: string) => {
    await deleteLabel(id);
    setLabels(labels.filter(l => l.id !== id));
  };

  return (
    <div>
      <button onClick={handleAddLabel}>Add Label</button>
      {labels.map(label => (
        <div key={label.id}>
          <span style={{ color: label.color }}>{label.name}</span>
          <button onClick={() => handleUpdateLabel(label.id)}>Update</button>
          <button onClick={() => handleDeleteLabel(label.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### AI-Powered Time Recovery

```typescript
import React from 'react';
import { findGaps } from './services/gapService';
import { parseRecoveryText } from './services/aiParserService';

function TimeRecoveryExample() {
  const handleRecoverTime = async (timeEntries: TimeEntry[], labels: Label[]) => {
    const today = new Date().toLocaleDateString("en-CA");
    const gaps = findGaps(timeEntries, today);
    
    if (gaps.length > 0) {
      const recoveryText = "I had lunch, worked on coding, and then had a meeting";
      const recoveredEntries = await parseRecoveryText(recoveryText, gaps, labels);
      
      // Process recovered entries
      for (const entry of recoveredEntries) {
        if (entry.startTime && entry.endTime && entry.activity) {
          await addEntry({
            ...entry,
            date: today,
            label: entry.label || "unknown"
          });
        }
      }
    }
  };

  return (
    <div>
      <button onClick={() => handleRecoverTime(entries, labels)}>
        Recover Missing Time
      </button>
    </div>
  );
}
```

## Environment Setup

### Required Environment Variables

```env
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
```

### Firebase Configuration

Ensure you have a `firebaseConfig.js` file with your Firebase project configuration:

```typescript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

## Error Handling

All service functions include basic error handling. For production use, consider implementing more robust error handling:

```typescript
try {
  await addTimeEntry(entry);
} catch (error) {
  console.error("Failed to add time entry:", error);
  // Handle error appropriately
}
```

## Performance Considerations

- Time entries are cached locally and synced with Firebase
- Labels are fetched once and cached
- AI parsing has rate limits - consider implementing retry logic
- Large datasets may require pagination (not currently implemented)

## Contributing

When adding new features:
1. Define TypeScript interfaces for new data types
2. Create service functions for Firebase operations
3. Add proper error handling
4. Include usage examples in documentation
5. Consider performance implications