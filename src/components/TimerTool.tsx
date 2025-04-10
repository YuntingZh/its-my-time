import React, { useEffect, useState } from "react";
const pad = (num: number) => num.toString().padStart(2, "0");

const TimerTool: React.FC = () => {
  const [mode, setMode] = useState<"duration" | "until">("duration");
  const [duration, setDuration] = useState("00:00:00");
  const [untilTime, setUntilTime] = useState("23:00");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [running, setRunning] = useState(false);

  const playSound = () => {
    const audio = new Audio("/sounds/alarms.mp3");

    let count = 0;
    const loop = () => {
      if (count < 2) {
        const sound = audio.cloneNode() as HTMLAudioElement;
        sound.play();
        count++;
        setTimeout(loop, 1500);
      }
    };
    loop();
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (running && timeLeft !== null && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (timeLeft === 0) {
      playSound();
      setRunning(false);
    }
    return () => clearInterval(interval);
  }, [running, timeLeft]);

  const parseDuration = (timeStr: string) => {
    const [h, m, s] = timeStr.split(":" ).map(Number);
    return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
  };

  const calculateUntil = (timeStr: string) => {
    const now = new Date();
    const [h, m] = timeStr.split(":" ).map(Number);
    const until = new Date();
    until.setHours(h);
    until.setMinutes(m);
    until.setSeconds(0);
    return Math.max(Math.floor((until.getTime() - now.getTime()) / 1000), 0);
  };

  const startTimer = () => {
    setRunning(true);
    if (mode === "duration") {
      setTimeLeft(parseDuration(duration));
    } else {
      setTimeLeft(calculateUntil(untilTime));
    }
  };

  const stopTimer = () => {
    setRunning(false);
    setTimeLeft(null);
  };

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  return (
    <div style={{ border: "1px solid #ccc", borderRadius: "12px", padding: "20px", maxWidth: "350px", margin: "20px auto", textAlign: "center" }}>
      <h2>⏳ Timer</h2>
      <p>Choose how you want to set the timer.</p>

      <div style={{ marginBottom: "10px" }}>
        <label>
          <input
            type="radio"
            checked={mode === "duration"}
            onChange={() => setMode("duration")}
          /> Duration
        </label>
        <input
          type="text"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="HH:MM:SS"
          disabled={mode !== "duration"}
        />
        <div style={{ fontSize: "12px", color: "#777" }}>
          Start a timer for a fixed duration
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>
          <input
            type="radio"
            checked={mode === "until"}
            onChange={() => setMode("until")}
          /> Until time
        </label>
        <input
          type="time"
          value={untilTime}
          onChange={(e) => setUntilTime(e.target.value)}
          step="60"
          disabled={mode !== "until"}
        />
        <div style={{ fontSize: "12px", color: "#777" }}>
          Keep the timer running until a specific time
        </div>
      </div>

      <button
        onClick={running ? stopTimer : startTimer}
        style={{
          backgroundColor: running ? "#e57373" : "#64b5f6",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          fontSize: "20px",
          cursor: "pointer",
        }}
      >
        {running ? "■" : "▶"}
      </button>

      {timeLeft !== null && (
        <div style={{ marginTop: "20px", fontSize: "24px" }}>
          {formatTime(timeLeft)}
        </div>
      )}
    </div>
  );
};

export default TimerTool;
