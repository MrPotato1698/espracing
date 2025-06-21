"use client"

import { useEffect, useState } from "react"
const { supabase } = await import("@/db/supabase");
import PositionChart from "@/components/position-chart"
import GapChart from "@/components/gap-chart"

interface RaceData {
  RaceResult: any[]
  RaceLaps: {
    SteamID: string
    DriverName: string
    Split: number
    Laps: {
      Position: number
      GaptoFirst: number
    }[]
  }[]
}

interface RaceChartsProps {
  readonly raceId: string
}

export default function RaceCharts({ raceId }: RaceChartsProps) {
  const [positionData, setPositionData] = useState<{ name: string; data: number[] }[][]>([])
  const [gapData, setGapData] = useState<{ name: string; data: number[] }[][]>([])
  const [laps, setLaps] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [raceCount, setRaceCount] = useState(0)

  useEffect(() => {
    // Funcion auxiliar para descargar y parsear datos de carrera
    async function downloadAndParseRaceData(supabase: any, storageKey: string, raceNumber: number, throwOnError = false): Promise<RaceData | null> {
      try {
        const { data, error } = await supabase.storage.from("results").download(storageKey)
        if (error) {
          const msg = `Error al descargar datos de carrera ${raceNumber}: ${error.message}`
          if (throwOnError) throw new Error(msg)
          else console.warn(msg)
          return null
        }
        if (data) {
          try {
            return JSON.parse(await data.text())
          } catch (parseError) {
            const msg = `Error al parsear datos de carrera ${raceNumber}: ${parseError}`
            if (throwOnError) throw new Error(msg)
            else console.warn(msg)
            return null
          }
        }
        return null
      } catch (err) {
        if (throwOnError) throw err
        else {
          console.warn(err)
          return null
        }
      }
    }

    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const { data: resultSetData, error: supabaseError } = await supabase
          .from("race")
          .select("race_data_1, race_data_2")
          .eq("filename", raceId)
          .single()

        if (supabaseError) {
          throw new Error(`Error de Supabase: ${supabaseError.message}`)
        }

        if (!resultSetData) {
          throw new Error("No se encontraron datos de la carrera")
        }

        // Descargar y parsear los datos de la carrera
        const races: RaceData[] = []

        // Siempre intenta cargar la carrera 1, lanza un error si falla
        const datosR1 = await downloadAndParseRaceData(supabase, resultSetData.race_data_1, 1, true)
        if (datosR1) races.push(datosR1)

        // Intenta cargar la carrera 2 si existe, advierte si falla
        if (resultSetData.race_data_2) {
          const datosR2 = await downloadAndParseRaceData(supabase, resultSetData.race_data_2, 2, false)
          if (datosR2) races.push(datosR2)
        }

        if (races.length === 0) {
          throw new Error("No se pudieron cargar datos de ninguna carrera")
        }

        setRaceCount(races.length)

        // Procesar los datos de posición y gap
        const positionDataArray: { name: string; data: number[] }[][] = []
        const gapDataArray: { name: string; data: number[] }[][] = []

        function processLapData(
          race: RaceData,
          lapData: {
            SteamID: string
            DriverName: string
            Split: number
            Laps: {
              Position: number
              GaptoFirst: number
            }[]
          },
          positionSeries: { name: string; data: number[] }[],
          gapSeries: { name: string; data: number[] }[]
        ) {
          const driverResult = race.RaceResult.find((result) => result.SteamID === lapData.SteamID)
          if (driverResult) {
            positionSeries.push({
              name: lapData.DriverName,
              data: [driverResult.GridPosition, ...lapData.Laps.map((lap) => lap.Position)],
            })
            gapSeries.push({
              name: lapData.DriverName,
              data: lapData.Laps.map((lap) => lap.GaptoFirst),
            })
          }
        }

        races.forEach((race) => {
          const positionSeries: { name: string; data: number[] }[] = []
          const gapSeries: { name: string; data: number[] }[] = []

          race.RaceLaps.filter((lapData) => lapData.Laps.length > 0).forEach((lapData) => {
            processLapData(race, lapData, positionSeries, gapSeries)
          })

          positionDataArray.push(positionSeries)
          gapDataArray.push(gapSeries)
        })

        setPositionData(positionDataArray)
        setGapData(gapDataArray)

        // Poner el numero de vueltas
        if (races.length > 0 && races[0].RaceLaps.length > 0) {
          const lapCount = races[0].RaceLaps[0].Laps.length
          setLaps(Array.from({ length: lapCount + 1 }, (_, i) => i))
        }

        setLoading(false)
      } catch (error) {
        console.error("Error al cargar los datos de la carrera:", error)
        setError(error instanceof Error ? error.message : String(error))
        setLoading(false)
      }
    }

    if (raceId) {
      fetchData()
    }
  }, [raceId])

  if (loading) {
    return (
      <div className="w-full text-center p-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-lg">Cargando gráficas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full text-center p-8 bg-red-900/20 rounded-lg border border-red-500">
        <p className="text-lg text-red-500">Error: {error}</p>
        <p className="mt-2">Por favor, intenta recargar la página o contacta al administrador.</p>
      </div>
    )
  }

  if (positionData.length === 0 || gapData.length === 0) {
    return (
      <div className="w-full text-center p-8 bg-yellow-900/20 rounded-lg border border-yellow-500">
        <p className="text-lg text-yellow-500">No hay datos disponibles para mostrar en los gráficos.</p>
      </div>
    )
  }

  return (
    <>
      {positionData.map((data, index) => {
        // Usa el primer nombre de piloto como clave única para cada carrera, si no está disponible usa el índice
        const key =
          data.length > 0 && data[0].name
            ? `position-${data[0].name.replace(/\s+/g, "_")}`
            : `position-${index}`;
        return (
          <div key={key} className="mb-8">
            <PositionChart data={data} laps={laps} title={`Cambios de posiciones (Carrera ${index + 1})`} />
          </div>
        );
      })}

      {gapData.map((data, index) => {
        const key =
          data.length > 0 && data[0].name
            ? `gap-${data[0].name.replace(/\s+/g, "_")}`
            : `gap-${index}`;
        return (
          <div key={key} className="mb-8">
            <GapChart data={data} laps={laps} title={`Distancia al líder (Carrera ${index + 1})`} />
          </div>
        );
      })}
    </>
  )
}
