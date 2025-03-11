import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { TimeEntry } from "../types/timeEntry";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ChartsProps {
  entries: TimeEntry[];
  getLabelColor: (labelName: string) => string;
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const Charts: React.FC<ChartsProps> = ({ entries, getLabelColor }) => {
  // Convert AM/PM to 24-hour format
  const convertTo24H = (timeStr: string): string => {
    const [time, period] = timeStr.split(" ");
    const [hour, minutes] = time.split(":");
    let hourNum = parseInt(hour, 10);
    if (period === "PM" && hourNum !== 12) hourNum += 12;
    if (period === "AM" && hourNum === 12) hourNum = 0;
    return `${hourNum.toString().padStart(2, "0")}:${minutes}`;
  };

  // Function to aggregate time by tag
  const aggregateTimeByTag = () => {
    const tagMap: { [tag: string]: number } = {};

    entries.forEach((entry) => {
      const startTime = new Date(`1970-01-01T${convertTo24H(entry.startTime)}Z`).getTime();
      let endTime = new Date(`1970-01-01T${convertTo24H(entry.endTime || "23:59 PM")}Z`).getTime();

      // Fix midnight crossing issue
      if (endTime < startTime) {
        endTime += 24 * 60 * 60 * 1000; // Add 24 hours if it crosses midnight
      }

      const durationMinutes = (endTime - startTime) / (1000 * 60);
      tagMap[entry.label] = (tagMap[entry.label] || 0) + durationMinutes;
    });

    // Calculate unlogged time
    const totalLoggedMinutes = Object.values(tagMap).reduce((sum, val) => sum + val, 0);
    const unloggedMinutes = 1440 - totalLoggedMinutes;

    if (unloggedMinutes > 0) {
      tagMap["Unlogged Time"] = unloggedMinutes; // Add missing time as dark gray
    }

    return tagMap;
  };

  // ✅ Enforce Order of Categories in Pie Chart
  const enforceCategoryOrder = (tagMap: { [tag: string]: number }) => {
    const predefinedOrder = [
      "Work",
      "Coding",
      "Job hunting",
      "Exercise",
      "Doomscrolling",
      "Idle",
      "Sleep",
      "Social",
      "Life",
      "call my loved ones",
      "Unknown",
      "Unlogged Time",
    ];

    return Object.entries(tagMap)
      .sort(([tagA], [tagB]) => {
        const indexA = predefinedOrder.indexOf(tagA);
        const indexB = predefinedOrder.indexOf(tagB);
        return indexA - indexB;
      })
      .map(([tag, value]) => ({ tag, value }));
  };

  // Prepare Pie Chart Data
  const timeByTag = aggregateTimeByTag();
  const sortedTags = enforceCategoryOrder(timeByTag);

  // ✅ Ensure Chart.js Respects the Fixed Order
  const pieData = {
    labels: sortedTags.map((item) => item.tag),
    datasets: [
      {
        data: sortedTags.map((item) => item.value),
        backgroundColor: sortedTags.map((item) =>
          item.tag === "Unlogged Time" ? "#3E3E3E" : getLabelColor(item.tag)
        ),
        borderWidth: 1,
        hoverOffset: 10,
      },
    ],
    order: sortedTags.map((_, index) => index), // ✅ Forces Chart.js to respect order
  };

  const options = {
    plugins: {
      legend: {
        display: false, // Hide built-in Chart.js legend
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const label = tooltipItem.label;
            const value = tooltipItem.raw;
            return `${label}: ${formatDuration(value)}`; // Show formatted time
          },
        },
      },
    },
    layout: {
      padding: 10, // Ensure labels have enough space
    },
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px" }}>
      {/* ✅ Custom Legend in Two Columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          textAlign: "left",
          width: "250px",
        }}
      >
        {sortedTags.map((item) => (
          <div key={item.tag} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                backgroundColor: item.tag === "Unlogged Time" ? "#3E3E3E" : getLabelColor(item.tag),
                borderRadius: "50%",
              }}
            ></span>
            <span>{item.tag}</span>
          </div>
        ))}
      </div>

      {/* ✅ Pie Chart */}
      <div style={{ width: "300px" }}>
        <h3 style={{ textAlign: "center" }}>Time Spent Per Activity</h3>
        <Pie data={pieData} options={options} />
      </div>
    </div>
  );
};

export default Charts;
