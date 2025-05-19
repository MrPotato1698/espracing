"use client";

import { useEffect, useState } from "react";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";

// Tooltip personalizado para puntos
function PointsTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  // Calcular el máximo de puntos en esta carrera
  const maxPoints = Math.max(...payload.map((entry: any) => entry.value));
  return (
    <div className="bg-darkSecond p-2 rounded border border-primary">
      <div className="font-bold text-primary mb-1">Puntos acumulados</div>
      <div className="text-lightPrimary">
        <div className="font-semibold mb-1">Carrera: {label}</div>
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
            <span className="text-xs text-gray-400 ml-1">
              ({entry.value === maxPoints ? "+0" : `-${maxPoints - entry.value}`})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ChampionshipProgressionChartProps {
  data: {
    name: string;
    data: number[];
  }[];
  categories: string[];
  title: string;
  yAxisStep?: number;
  yAxisMax?: number;
}

export default function ChampionshipProgressionChart({
  data,
  categories,
  title,
  yAxisStep = 20,
  yAxisMax,
}: Readonly<ChampionshipProgressionChartProps>) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [hiddenLines, setHiddenLines] = useState<string[]>([]);
  const [highlightedLine, setHighlightedLine] = useState<string | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !categories || categories.length === 0) {
      setChartData([]);
      return;
    }

    // Transformar los datos al formato esperado por Recharts
    const transformedData = categories.map((category, index) => {
      const categoryData: Record<string, any> = { category };

      data.forEach((series) => {
        if (series.data && series.data.length > index) {
          // Usar el nombre del participante como clave y los puntos como valor
          categoryData[series.name] = series.data[index];
        }
      });

      return categoryData;
    });

    setChartData(transformedData);
  }, [data, categories]);

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

  // Crear objeto de configuración para el gráfico
  const chartConfig = data.reduce(
    (config, series) => {
      config[series.name] = {
        label: series.name,
        // Asignar un color de nuestra paleta
        color: getParticipantColor(series.name),
      };
      return config;
    },
    {} as Record<string, { label: string; color: string }>
  );

  // Función para manejar el click en un participante (toggle mostrar/ocultar)
  const toggleParticipantVisibility = (participantName: string) => {
    setHiddenLines((prev) =>
      prev.includes(participantName)
        ? prev.filter((name) => name !== participantName)
        : [...prev, participantName]
    );
  };

  // Calcular el valor máximo para el eje Y si no se proporciona
  const calculatedYMax =
    yAxisMax ?? Math.max(...data.flatMap((series) => series.data)) + 10;

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
            onClick={() => toggleParticipantVisibility(series.name)}
            onMouseEnter={() => setHighlightedLine(series.name)}
            onMouseLeave={() => setHighlightedLine(null)}
          >
            <div
              style={{
                backgroundColor: getParticipantColor(series.name),
                width: "12px",
                height: "12px",
                borderRadius: "50%",
              }}
            />
            <span className="text-lightPrimary">{series.name}</span>
          </button>
        ))}
      </div>
      <ChartContainer config={chartConfig} className="min-h-[650px] w-full">
        <ResponsiveContainer width="100%" height={600}>
          <LineChart
            data={chartData}
            margin={{ top: 30, right: 40, left: 30, bottom: 45 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#5a5a5a" />
            <XAxis
              dataKey="category"
              label={{
                value: "Carreras",
                position: "insideBottom",
                offset: -5,
                dy: 20,
                fill: "#f9f9f9",
              }}
              tick={{ fill: "#f9f9f9", fontSize: 12 }}
            />
            <YAxis
              domain={[0, calculatedYMax]}
              tick={{ fill: "#f9f9f9", fontSize: 12 }}
              tickCount={Math.ceil(calculatedYMax / yAxisStep) + 1}
              label={{
                value: "Puntos",
                angle: -90,
                position: "insideLeft",
                dx: -10,
                fill: "#f9f9f9",
              }}
            />
            <Tooltip content={<PointsTooltip />} />

            {data.map((series) =>
              hiddenLines.includes(series.name) ? null : (
                <Line
                  key={series.name}
                  type="monotone"
                  dataKey={series.name}
                  stroke={getParticipantColor(series.name)}
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
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}

// Función auxiliar para obtener un color para cada participante
function getParticipantColor(participantName: string): string {
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

  // Función hash simple para obtener un color consistente para cada participante
  let hash = 0;
  for (let i = 0; i < participantName.length; i++) {
    hash = participantName.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}
