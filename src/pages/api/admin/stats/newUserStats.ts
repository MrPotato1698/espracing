import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase"

const BATCH_SIZE = 10 // Número de carreras a procesar por lote

export const POST: APIRoute = async ({ request }) => {
  const { userId } = await request.json()

  try {
    // Obtener el steam_id del usuario
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("steam_id")
      .eq("id", userId)
      .single()

    if (userError) throw userError

    const steamID = userData.steam_id

    // Obtener todas las carreras
    const { data: races, error: racesError } = await supabase
      .from("race")
      .select("id, race_data_1, race_data_2")
      .order("id", { ascending: true })

    if (racesError) throw racesError

    const stats = {
      races: 0,
      wins: 0,
      poles: 0,
      podiums: 0,
      top5: 0,
      top10: 0,
      dnf: 0,
      flaps: 0,
    }

    // Procesar las carreras en lotes
    for (let i = 0; i < races.length; i += BATCH_SIZE) {
      const batch = races.slice(i, i + BATCH_SIZE)

      for (const race of batch) {
        const { data: raceData1 } = await supabase.storage.from("results").download(race.race_data_1)
        if (raceData1) {
          const raceResults1 = JSON.parse(await raceData1.text())
          updateStatsFromRace(steamID, raceResults1.RaceDriversResume, stats)
        }

        if (race.race_data_2) {
          const { data: raceData2 } = await supabase.storage.from("results").download(race.race_data_2)
          if (raceData2) {
            const raceResults2 = JSON.parse(await raceData2.text())
            updateStatsFromRace(steamID, raceResults2.RaceDriversResume, stats)
          }
        }
      }
    }

    // Actualizar el perfil del usuario con las estadísticas calculadas
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        ...stats,
        needs_stats_update: false,
      })
      .eq("id", userId)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ success: true, stats }), { status: 200 })
  } catch (error) {
    console.error("Error actualizando estadisticas de usuario:", error)
    return new Response(JSON.stringify({ error: "Error actualizando estadisticas de usuario" }), { status: 500 })
  }
}

function updateStatsFromRace(steamID: string, raceResults: any[], stats: any) {
  const driverResult = raceResults.find((r) => r.SteamID === steamID)
  if (driverResult) {
    stats.races++
    if (driverResult.PolePosition) stats.poles++
    if (driverResult.BestLap) stats.flaps++

    switch (driverResult.Position) {
      case -2: //DQ
      case -1: // DNF
        stats.dnf++
        stats.races++
        break
      case 0: break;
      case 1:
        stats.wins++
        stats.races++
        break
      case 2:
      case 3:
        stats.podiums++
        stats.races++
        break
      case 4:
      case 5:
        stats.top5++
        stats.races++
        break
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
        stats.top10++
        stats.races++
        break
      default:
        stats.races++
        break
    }
  }
}