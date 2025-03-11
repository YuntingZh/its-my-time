// import React, { useState } from "react";
// import Timeline from "./Timeline";
// import Charts from "./Charts";
// import DateSelector from "./DateSelector";

// const TimelinePage: React.FC = () => {
//   const [showChart, setShowChart] = useState(false); // Toggle between views
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]); // YYYY-MM-DD

//   return (
//     <div style={{ textAlign: "center", padding: "20px" }}>
//       {/* Date Selector Component */}
//       <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

//       {/* Toggle Button */}
//       <button
//         onClick={() => setShowChart(!showChart)}
//         style={{
//           padding: "10px 20px",
//           backgroundColor: showChart ? "#4CAF50" : "#008CBA",
//           color: "white",
//           border: "none",
//           borderRadius: "5px",
//           cursor: "pointer",
//           marginBottom: "20px",
//         }}
//       >
//         {showChart ? "Show Timeline" : "Show Charts"}
//       </button>

//       {/* Render Either Timeline or Charts */}
//       {showChart ? <Charts selectedDate={selectedDate} /> : <Timeline selectedDate={selectedDate} />}
//     </div>
//   );
// };

// export default TimelinePage;
export {};