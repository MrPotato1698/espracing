import React from "react";

interface RadialProgressProps {
  label: string;
  value: number; // porcentaje (0-100)
  total?: number;
  color?: string;
}

export const RadialProgress: React.FC<RadialProgressProps> = ({ label, value, total, color = "#4f46e5" }) => {
  const radius = 48;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const percent = Math.max(0, Math.min(100, value));
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s' }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy="0.3em"
          fontSize="1.5rem"
          fill="#22223b"
        >
          {percent}%
        </text>
      </svg>
      <span className="mt-2 text-lg font-semibold">{label}</span>
      {typeof total === 'number' && (
        <span className="text-xs text-gray-500">de {total}</span>
      )}
    </div>
  );
};
