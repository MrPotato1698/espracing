"use client";

import { useEffect, useState } from "react";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";

// Tooltip personalizado para posiciones
function PositionTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-darkSecond p-2 rounded border border-primary">
      <div className="font-bold text-primary mb-1">Posición</div>
      <div className="text-lightPrimary">
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <span
              style={{
                backgroundColor: entry.color,
                width: 14,
                height: 4,
                display: "inline-block",
                borderRadius: 2,
              }}
            ></span>
            <span className="font-semibold">{entry.dataKey}:</span>{" "}
            {entry.value}
          </div>
        ))}
      </div>
    </div>
  );
}

interface PositionChartProps {
  data: {
    name: string;
    data: number[];
  }[];
  laps: number[];
  title: string;
}

export default function PositionChart({
  data,
  laps,
  title,
}: Readonly<PositionChartProps>) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [hiddenLines, setHiddenLines] = useState<string[]>([]);
  const [highlightedLine, setHighlightedLine] = useState<string | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !laps || laps.length === 0) {
      setChartData([]);
      return;
    }

    // Transformar los datos del formato esperado por Recharts
    const transformedData = laps.map((lap, index) => {
      const lapData: Record<string, any> = { lap };

      data.forEach((series) => {
        if (series.data && series.data.length > index) {
          // Usar el nombre de los pilotos como key y el gap como value
          lapData[series.name] = series.data[index];
        }
      });

      return lapData;
    });

    setChartData(transformedData);
  }, [data, laps]);

  if (!data || data.length === 0 || chartData.length === 0) {
    return (
      <div className="w-full p-4 bg-darkSecond rounded-lg border-2 border-primary">
        <h2 className="text-2xl font-bold text-center text-lightPrimary mb-4">
          {title}
        </h2>
        <div className="text-center text-lightPrimary">
          No hay datos disponibles para este gráfico
        </div>
      </div>
    );
  }

  // Crear objeto de configuración para el chart
  const chartConfig = data.reduce(
    (config, series) => {
      config[series.name] = {
        label: series.name,
        // Asignar un color único a cada piloto
        color: getDriverColor(series.name),
      };
      return config;
    },
    {} as Record<string, { label: string; color: string }>
  );

  // Función para manejar el click en un piloto (toggle mostrar/ocultar)
  const toggleDriverVisibility = (driverName: string) => {
    setHiddenLines((prev) =>
      prev.includes(driverName)
        ? prev.filter((name) => name !== driverName)
        : [...prev, driverName]
    );
  };

  return (
    <div className="w-full p-4 bg-darkSecond rounded-lg border-2 border-primary">
      <h2 className="text-2xl font-bold text-center text-lightPrimary mb-4">
        {title}
      </h2>

      {/* Leyenda simple y directa */}
      <div className="flex flex-wrap gap-3 justify-center mb-4">
        {data.map((series) => (
          <button
            key={series.name}
            type="button"
            aria-pressed={!hiddenLines.includes(series.name)}
            className={`flex items-center gap-2 px-3 py-1 rounded cursor-pointer border ${
              hiddenLines.includes(series.name)
                ? "opacity-50"
                : "border-primary"
            } ${highlightedLine === series.name ? "bg-darkPrimary" : ""}`}
            onClick={() => toggleDriverVisibility(series.name)}
            onMouseEnter={() => setHighlightedLine(series.name)}
            onMouseLeave={() => setHighlightedLine(null)}
          >
            <div
              style={{
                backgroundColor: getDriverColor(series.name),
                width: "12px",
                height: "12px",
                borderRadius: "50%",
              }}
            />
            <span className="text-lightPrimary">{series.name}</span>
          </button>
        ))}
      </div>

      <ChartContainer config={chartConfig} className="min-h-[500px] w-full">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 35 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#5a5a5a" />
          <XAxis
            dataKey="lap"
            label={{
              value: "Vueltas",
              position: "insideBottom",
              offset: -5,
              dy: 15,
              fill: "#f9f9f9",
            }}
            tick={{ fill: "#f9f9f9" }}
          />
          <YAxis
            reversed
            domain={[1, "dataMax"]}
            label={{
              value: "Posiciones",
              angle: -90,
              position: "insideLeft",
              fill: "#f9f9f9",
            }}
            tick={{ fill: "#f9f9f9" }}
          />
          <Tooltip content={<PositionTooltip />} />

          {data.map((series) =>
            hiddenLines.includes(series.name) ? null : (
              <Line
                key={series.name}
                type="monotone"
                dataKey={series.name}
                stroke={getDriverColor(series.name)}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
                strokeWidth={highlightedLine === series.name ? 4 : 2}
                opacity={
                  highlightedLine && highlightedLine !== series.name ? 0.3 : 1
                }
              />
            )
          )}
        </LineChart>
      </ChartContainer>
    </div>
  );
}

// Funcion auxiliar para conseguir el color de cada piloto
function getDriverColor(driverName: string): string {
  const colors = [
    "#da392b", // primary (red)
    "#FF4500", // orange red
    "#FF6347", // tomato
    "#FF8C00", // dark orange
    "#FFA500", // orange
    "#fcba02", // secondary (yellow)
    "#FFD700", // gold
    "#7CFC00", // lawn green
    "#32CD32", // lime green
    "#3CB371", // medium sea green
    "#00FA9A", // medium spring green
    "#00FFFF", // cyan
    "#00BFFF", // deep sky blue
    "#1E90FF", // dodger blue
    "#4169E1", // royal blue
    "#8A2BE2", // blue violet
    "#9370DB", // medium purple
    "#9400D3", // dark violet
    "#6a1b9a", // accent1 (purple)
    "#BA55D3", // medium orchid
    "#FF00FF", // magenta
    "#FF1493", // deep pink
    "#FF69B4", // hot pink
  ];

  // Funcion simple de hash para conseguir un color consistente para cada piloto
  let hash = 0;
  for (let i = 0; i < driverName.length; i++) {
    hash = driverName.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}
