import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase";
import type { RaceDriversResume } from "@/types/Results";

const BATCH_SIZE = 10 // Número de carreras a procesar por lote

let lastProcessedUserId: string | null = null;
let lastProcessedAt: number = 0;

export const GET: APIRoute = async ({ request }) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*, team!inner(*), roleesp!inner(*)")
    .order("id", { ascending: true });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request }) => { // RaceStats
  try {
    const { resume } = await request.json();
    const steamID = resume.map((r: RaceDriversResume) => r.SteamID);

    const { data: userSteamID, error: errorSteamID } = await supabase
      .from("profiles")
      .select("id, steam_id, races, wins, poles, podiums, top5, top10, dnf, flaps")
      .in("steam_id", steamID);

    if (errorSteamID) {
      console.error("Error buscando los perfiles de los pilotos:", errorSteamID);
      return new Response(
        JSON.stringify({
          error: "Error buscando los perfiles de los pilotos: " + errorSteamID.message,
        }),
        { status: 500 },
      );
    }

    if (!userSteamID || userSteamID.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No se encontraron perfiles de pilotos",
        }),
        { status: 404 },
      );
    }

    for (const driver of userSteamID) {
      const driverData = resume.find((r: RaceDriversResume) => r.SteamID === driver.steam_id);

      if (driverData) {
        const updates = computeDriverUpdates(driver, driverData);

        if (Object.keys(updates).length > 0) {
          const { error: errorUpdating } = await supabase
            .from("profiles")
            .update(updates)
            .eq("id", driver.id);

          if (errorUpdating) {
            console.error("Error actualizando el perfil del piloto:", errorUpdating);
            return new Response(
              JSON.stringify({
                error: "Error actualizando el perfil del piloto: " + errorUpdating.message,
              }),
              { status: 500 },
            );
          }
        }
      }
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error general:", error);
    return new Response(JSON.stringify({ error: "Error general: " + error }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request, cookies }) => { // UserStats
  const { userId } = await request.json();

  if (import.meta.env.DEV) {
    if (isDuplicateRequest(userId)) {
      return new Response(JSON.stringify({ error: "Petición duplicada ignorada en modo desarrollo" }), { status: 429 });
    }
    updateLastProcessed(userId);
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
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { resume } = await request.json();
    const steamID = resume.map((r: RaceDriversResume) => r.SteamID);

    const { data: userSteamID, error: errorSteamID } = await supabase
      .from("profiles")
      .select("id, steam_id, races, wins, poles, podiums, top5, top10, dnf, flaps")
      .in("steam_id", steamID);

    if (errorSteamID) {
      console.error("Error buscando los perfiles de los pilotos:", errorSteamID);
      return new Response(
        JSON.stringify({ error: "Error buscando los perfiles de los pilotos: " + errorSteamID.message }),
        { status: 500 },
      );
    }

    for (const driver of userSteamID) {
      const driverData = resume.find((r: RaceDriversResume) => r.SteamID === driver.steam_id);

      if (!driverData) continue;

      const updates = buildUpdates(driver, driverData);

      const { error: errorUpdating } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", driver.id);

      if (errorUpdating) {
        return new Response(
          JSON.stringify({ error: "Error actualizando el perfil del piloto: " + errorUpdating.message }),
          { status: 500 },
        );
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error("Error general:", error);
    return new Response(JSON.stringify({ error: "Error general: " + error }), { status: 500 });
  }
}

function computeDriverUpdates(driver: any, driverData: RaceDriversResume): any {
  const updates: any = {};

  if (driverData.BestLap) updates.flaps = driver.flaps + 1;
  if (driverData.PolePosition) updates.poles = driver.poles + 1;

  switch (driverData.Position) {
    case -2: //DQ
    case -1: // DNF
      updates.dnf = driver.dnf + 1;
      updates.races = driver.races + 1;
      break;
    case 0: //No clasificado
      break;
    case 1: // Victoria
      updates.wins = driver.wins + 1;
      updates.races = driver.races + 1;
      break;
    case 2: // Podio
    case 3:
      updates.podiums = driver.podiums + 1;
      updates.races = driver.races + 1;
      break;
    case 4: //Top 5
    case 5:
      updates.top5 = driver.top5 + 1;
      updates.races = driver.races + 1;
      break;
    case 6: // Top 10
    case 7:
    case 8:
    case 9:
    case 10:
      updates.top10 = driver.top10 + 1;
      updates.races = driver.races + 1;
      break;
    default: // Resto clasificados
      updates.races = driver.races + 1;
      break;
  }

  return updates;
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
  if (!userData.steam_id) throw new Error("El usuario no tiene steam_id");
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
  await processRaceData(race.race_data_1, steamID, stats);
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
    .update({...stats,})
    .eq("id", userId);
  if (updateError) throw updateError;
}

function updateStatsFromRace(steamID: string, raceResults: any[], stats: any) {
  const driverResult = raceResults.find((r) => r.SteamID === steamID);
  if (driverResult) {
    if (driverResult.PolePosition) stats.poles++;
    if (driverResult.BestLap) stats.flaps++;

    switch (driverResult.Position) {
      case -2: //DQ
      case -1: // DNF
        stats.dnf++;
        stats.races++;
        break;
      case 0:
        break;
      case 1:
        stats.wins++;
        stats.races++;
        break;
      case 2:
      case 3:
        stats.podiums++;
        stats.races++;
        break;
      case 4:
      case 5:
        stats.top5++;
        stats.races++;
        break;
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
        stats.top10++;
        stats.races++;
        break;
      default:
        stats.races++;
        break;
    }
  }
}

function buildUpdates(driver: any, driverData: RaceDriversResume) {
  const updates: any = { races: Math.max(0, (driver.races ?? 0) - 1) };

  if (driverData.BestLap) updates.flaps = Math.max(0, (driver.flaps ?? 0) - 1);
  if (driverData.PolePosition) updates.poles = Math.max(0, (driver.poles ?? 0) - 1);

  switch (driverData.Position) {
    case -2: //DQ
    case -1: // DNF
      updates.dnf = Math.max(0, (driver.dnf ?? 0) - 1);
      updates.races = Math.max(0, (driver.races ?? 0) - 1);
      break;
    case 0: //No clasificado
      break;
    case 1: // Victoria
      updates.wins = Math.max(0, (driver.wins ?? 0) - 1);
      updates.races = Math.max(0, (driver.races ?? 0) - 1);
      break;
    case 2: // Podio
    case 3:
      updates.podiums = Math.max(0, (driver.podiums ?? 0) - 1);
      updates.races = Math.max(0, (driver.races ?? 0) - 1);
      break;
    case 4: //Top 5
    case 5:
      updates.top5 = Math.max(0, (driver.top5 ?? 0) - 1);
      updates.races = Math.max(0, (driver.races ?? 0) - 1);
      break;
    case 6: // Top 10
    case 7:
    case 8:
    case 9:
    case 10:
      updates.top10 = Math.max(0, (driver.top10 ?? 0) - 1);
      updates.races = Math.max(0, (driver.races ?? 0) - 1);
      break;
    default: // Resto clasificados
      updates.races = Math.max(0, (driver.races ?? 0) - 1);
      break;
  }
  return updates;
}