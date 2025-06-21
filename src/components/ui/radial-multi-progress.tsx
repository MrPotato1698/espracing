import React from "react";

interface RadialData {
  label: string;
  value: number; // porcentaje (0-100)
  color: string;
}

interface RadialMultiProgressProps {
  data: RadialData[];
  size?: number;
  stroke?: number;
}

export const RadialMultiProgress: React.FC<RadialMultiProgressProps> = ({ data, size = 360, stroke = 12 }) => {
  const radiusStep = stroke + 7;
  const center = size / 2;
  const baseRadius = center - (data.length * radiusStep);

  // Solo medio círculo (180°)
  const startAngle = -90;
  const endAngle = 90;

  function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y,
      "A", r, r, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  }

  function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    const rad = (angle - 90) * Math.PI / 180.0;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  }

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size/2.2} viewBox={`0 0 ${size} ${size/2.2}`}> {/* recorta la parte inferior */}
        {data.map((d, i) => {
          const r = baseRadius + i * radiusStep;
          const percent = Math.max(0, Math.min(100, d.value));
          const arcLength = (percent / 100) * 180; // solo medio círculo
          const arcEnd = startAngle + arcLength;
          return (
            <React.Fragment key={d.label + '-' + i}>
              <path
                key={d.label + '-bg-' + i}
                d={describeArc(center, center, r, startAngle, endAngle)}
                stroke="#19191c"
                strokeWidth={stroke}
                fill="none"
              />
              <path
                key={d.label + '-arc-' + i}
                d={describeArc(center, center, r, startAngle, arcEnd)}
                stroke={d.color}
                strokeWidth={stroke}
                fill="none"
                strokeLinecap="round"
              />
            </React.Fragment>
          );
        })}
        <text
          x="50%"
          y="98%"
          textAnchor="middle"
          fontSize="1.2rem"
          fill="#f9f9f9"
        >
          Estadísticas
        </text>
      </svg>
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {data.map((d, i) => (
          <span key={d.label + '-legend-' + i} className="flex items-center gap-1 text-xs">
            <span style={{ background: d.color, width: 10, height: 10, borderRadius: '50%', display: 'inline-block' }} />
            {d.label}: {Math.round(d.value)}%
          </span>
        ))}
      </div>
    </div>
  );
};
