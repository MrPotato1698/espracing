import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase"
import type { RaceDriversResume } from "@/types/Results"

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

export const POST: APIRoute = async ({ request }) => {
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

