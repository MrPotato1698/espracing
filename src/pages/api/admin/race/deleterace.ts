import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase"

export const POST: APIRoute = async ({ request }) => {
  try {
    const { id } = await request.json()
    if (!id) {
      return new Response(JSON.stringify({ error: "El Id es obligatorio" }), { status: 400 })
    }

    const { data: RaceDataSearch, error: RaceDataSearchError } = await supabase
      .from("race")
      .select("race_data_1, race_data_2")
      .eq("id", id)
      .single()

    if (RaceDataSearchError || !RaceDataSearch) {
      throw new Error(RaceDataSearchError?.message || "Fallo al buscar la carrera")
    }

    // Procesar Carrera 1
    await processRaceData(RaceDataSearch.race_data_1, "Carrera 1")

    // Procesar Carrera 2 si existe
    if (RaceDataSearch.race_data_2) {
      await processRaceData(RaceDataSearch.race_data_2, "Carrera 2")
    }

    // Eliminar la carrera de la BD
    const { error: deleteError } = await supabase.from("race").delete().eq("id", id)

    if (deleteError) {
      throw new Error(`Fallo al eliminar carrera: ${deleteError.message}`)
    }

    return new Response(JSON.stringify({ message: "Carrera eliminada con éxito" }), { status: 200 })
  } catch (error) {
    console.error("Error:", error)
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 })
  }
}

async function processRaceData(path: string, raceName: string) {
  const { data: raceData } = await supabase.storage.from("results").download(path)
  if (!raceData) {
    throw new Error(`Fallo al descargar datos de ${raceName}`)
  }

  const raceDataJson = JSON.parse(await raceData.text())

  // Eliminar carrera de bucket de Supabase
  const { data: removeRace, error: ErrorRemoveRace } = await supabase.storage.from("results").remove([path])

  if (ErrorRemoveRace || !removeRace) {
    throw new Error(`Fallo al eliminar carrera ${raceName}: ${ErrorRemoveRace?.message}`)
  }

  // Modificar estadisticas de Profile
  const response = await fetch("/api/admin/stats/deleteRaceStats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ resume: raceDataJson.RaceDriversResume }),
  })

  if (!response.ok) {
    throw new Error(`Error actualizando estadísticas de ${raceName}`)
  }
}

