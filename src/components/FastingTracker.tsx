import React, { useState, useRef } from "react";

interface Props {
  initialHours?: number;
}

const FastingTracker: React.FC<Props> = ({ initialHours = 16 }) => {
  const size = 220;
  const r = size / 2 - 20;
  const [hours, setHours] = useState<number>(initialHours);
  const [startDeg, setStartDeg] = useState<number>(-90); // -90 => 12 o'clock, we default at top
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<boolean>(false);

  const endDeg = startDeg + hours * 30; // 360/12=30 deg per hour

  const polarToCartesian = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return {
      x: size / 2 + r * Math.cos(rad),
      y: size / 2 + r * Math.sin(rad),
    };
  };
  const start = polarToCartesian(startDeg);
  const end = polarToCartesian(endDeg);
  const largeArc = hours > 6 ? 1 : 0; // >180deg
  const path = `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} L ${size / 2} ${size / 2} Z`;

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const rect = svgRef.current!.getBoundingClientRect();
    const cx = rect.left + size / 2;
    const cy = rect.top + size / 2;
    const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    setStartDeg(angle);
  };
  const onPointerUp = () => setDragging(false);

  return (
    <div style={{ textAlign: "center" }}>
      <h3>⏳ Fasting for {hours} hours</h3>
      <input
        type="number"
        min={1}
        max={24}
        value={hours}
        onChange={(e) => setHours(parseInt(e.target.value) || 0)}
        style={{ marginBottom: 8 }}
      />
      <svg
        ref={svgRef}
        width={size}
        height={size}
        onPointerDown={() => setDragging(true)}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{ touchAction: "none", cursor: "pointer" }}
      >
        <circle cx={size / 2} cy={size / 2} r={r} fill="#fff" stroke="#ccc" />
        {/* shade */}
        <path d={path} fill="#D6DCFF" />
        {/* ticks */}
        {Array.from({ length: 12 }).map((_, i) => {
          const deg = (i * 30) - 90;
          const p1 = polarToCartesian(deg);
          const p2 = polarToCartesian(deg,);
          const innerR = r - 10;
          const inner = {
            x: size / 2 + innerR * Math.cos((deg * Math.PI) / 180),
            y: size / 2 + innerR * Math.sin((deg * Math.PI) / 180),
          };
          return (
            <line key={i} x1={p1.x} y1={p1.y} x2={inner.x} y2={inner.y} stroke="#000" />
          );
        })}
      </svg>
    </div>
  );
};

export default FastingTracker; 