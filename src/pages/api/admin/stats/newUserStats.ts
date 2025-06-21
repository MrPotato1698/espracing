import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase"

const BATCH_SIZE = 10 // Número de carreras a procesar por lote

let lastProcessedUserId: string | null = null;
let lastProcessedAt: number = 0;

export const POST: APIRoute = async ({ request }) => {
  const { userId } = await request.json()

  if (import.meta.env.DEV) {
    if (isDuplicateRequest(userId)) {
      return new Response(JSON.stringify({ error: "Petición duplicada ignorada en modo desarrollo" }), { status: 429 })
    }
    updateLastProcessed(userId)
  }

  try {
    const steamID = await getSteamIdForUser(userId);
    const races = await getAllRaces();

    const stats = createEmptyStats();

    await processRacesInBatches(races, steamID, stats);

    await updateUserStats(userId, stats);

    return new Response(JSON.stringify({ success: true, stats }), { status: 200 });
  } catch (error) {
    console.error("Error actualizando estadisticas de usuario:", error);
    return new Response(JSON.stringify({ error: "Error actualizando estadisticas de usuario" }), { status: 500 });
  }
}

function isDuplicateRequest(userId: string): boolean {
  return lastProcessedUserId === userId && Date.now() - lastProcessedAt < 2000;
}

function updateLastProcessed(userId: string) {
  lastProcessedUserId = userId;
  lastProcessedAt = Date.now();
}

async function getSteamIdForUser(userId: string): Promise<string> {
  const { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("steam_id")
    .eq("id", userId)
    .single();
  if (userError) throw userError;
  return userData.steam_id;
}

async function getAllRaces() {
  const { data: races, error: racesError } = await supabase
    .from("race")
    .select("id, race_data_1, race_data_2")
    .order("id", { ascending: true });
  if (racesError) throw racesError;
  return races;
}

function createEmptyStats() {
  return {
    races: 0,
    wins: 0,
    poles: 0,
    podiums: 0,
    top5: 0,
    top10: 0,
    dnf: 0,
    flaps: 0,
  };
}

async function processRacesInBatches(races: any[], steamID: string, stats: any) {
  for (let i = 0; i < races.length; i += BATCH_SIZE) {
    const batch = races.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(race => processSingleRace(race, steamID, stats)));
  };
}

async function processSingleRace(race: any, steamID: string, stats: any) {
  await processRaceData(race.race_data_1, steamID, stats)
  if (race.race_data_2) {
    await processRaceData(race.race_data_2, steamID, stats);
  }
}

async function processRaceData(raceDataKey: string, steamID: string, stats: any) {
  if (!raceDataKey) return;
  const { data: raceData } = await supabase.storage.from("results").download(raceDataKey);
  if (raceData) {
    const raceResults = JSON.parse(await raceData.text());
    updateStatsFromRace(steamID, raceResults.RaceDriversResume, stats);
  }
}

async function updateUserStats(userId: string, stats: any) {
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      ...stats,
    })
    .eq("id", userId);
  if (updateError) throw updateError;
}

function updateStatsFromRace(steamID: string, raceResults: any[], stats: any) {
  const driverResult = raceResults.find((r) => r.SteamID === steamID);
  if (driverResult) {
    stats.races++;
    if (driverResult.PolePosition) stats.poles++;
    if (driverResult.BestLap) stats.flaps++;

    switch (driverResult.Position) {
      case -2: //DQ
      case -1: // DNF
        stats.dnf++;
        stats.races++;
        break
      case 0: break;
      case 1:
        stats.wins++;
        stats.races++;
        break
      case 2:
      case 3:
        stats.podiums++;
        stats.races++;
        break
      case 4:
      case 5:
        stats.top5++;
        stats.races++;
        break
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
        stats.top10++;
        stats.races++;
        break
      default:
        stats.races++;
        break
    }
  }
}