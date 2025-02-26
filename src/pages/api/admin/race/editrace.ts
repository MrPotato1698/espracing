import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase"
import { createRaceData, createRaceDataMultipleSplits } from "@/lib/results/resultConverter"
import type { RaceData, RaceDriversResume, RaceResult } from "@/types/Results"

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();

  const race_id = formData.get("race_id");
  const name = formData.get("name") as string;
  const orderChamp = formData.get("orderChamp");
  const champID = formData.get("champID");
  const pointsystem = formData.get("pointsystem");
  const switchRaceElement = formData.get("switch-Races") === "true";
  const switchS2Element = formData.get("switch-S2") === "true";
  const switchR2Element = formData.get("switch-R2") === "true";
  const fileInputS1R1 = formData.get("fileInputS1R1") as File | null;
  const fileInputS2R1 = formData.get("fileInputS2R1") as File | null;
  const fileInputS1R2 = formData.get("fileInputS1R2") as File | null;
  const fileInputS2R2 = formData.get("fileInputS2R2") as File | null;

  if (!race_id)
    return new Response(JSON.stringify({ error: "ID de carrera no proporcionado" }), { status: 400 });

  try {
    if (fileInputS1R1 !== null) {
      const fileS1R1 = fileInputS1R1
      let fileS2R1
      let fileS1R2
      let fileS2R2
      let numSplits = 1
      let transformedJsonR1 = "{}"
      let transformedJsonR2 = "{}"
      const URLBucketsResults = new Array<string>(2).fill("")
      let changeRaceJSONSwitch = false

      // Si se ha seleccionado cambiar el archivo JSON de la carrera
      if (switchRaceElement) {
        changeRaceJSONSwitch = true

        // Obtener los datos antiguos de la carrera
        const { data: oldRaceData, error: oldRaceDataError } = await supabase
        .from("race")
        .select("race_data_1, race_data_2")
        .eq("id", Number(race_id))
        .single();

        if (oldRaceDataError) throw oldRaceDataError;

        let oldRaceFiles: RaceData[] = [];
        const { data: oldRaceData1, error: oldRaceData1Error } = await supabase.storage
          .from("results")
          .download(oldRaceData.race_data_1);
        if (oldRaceData1Error) throw oldRaceData1Error;
        oldRaceFiles.push(JSON.parse(await oldRaceData1.text()));

        if (oldRaceData.race_data_2){
          const { data: oldRaceData2, error: oldRaceData2Error } = await supabase.storage
            .from("results")
            .download(oldRaceData.race_data_2);
          if (oldRaceData2Error) throw oldRaceData2Error;
          oldRaceFiles.push(JSON.parse(await oldRaceData2.text()));
        }

        if (!fileS1R1)
          return new Response(JSON.stringify({ error: "Por favor, selecciona un archivo JSON para la Carrera 1 del Split 1." }),{ status: 400 });

        if (fileInputS1R2 !== null) {
          if (fileInputS1R2 !== null) {
            fileS1R2 = fileInputS1R2;
            if (!fileS1R2)
              return new Response(JSON.stringify({ error: "Por favor, selecciona un archivo JSON para la Carrera 2 del Split 1." }), { status: 400 });

          }
          if (fileInputS2R1 !== null) {
            fileS2R1 = fileInputS2R1;
            if (!fileS2R1)
              return new Response(JSON.stringify({ error: "Por favor, selecciona un archivo JSON para la Carrera 1 del Split 2." }), { status: 400 });

            if (fileInputS2R2 !== null) {
              fileS2R2 = fileInputS2R2;
              if (!fileS2R2)
                return new Response(JSON.stringify({ error: "Por favor, selecciona un archivo JSON para la Carrera 2 del Split 2." }),{ status: 400 });
            }
            numSplits = 2;
          }

          const contentS1R1 = await fileS1R1.text();
          const jsonS1R1 = JSON.parse(contentS1R1);
          let jsonS1R2
          if (switchR2Element) {
            const contentS1R2 = await fileS1R2?.text();
            if (!contentS1R2)
              return new Response(JSON.stringify({ error: "Sin contenido en el archivo de Carrera 2 Split 1." }), {status: 400,});
            jsonS1R2 = JSON.parse(contentS1R2);
          }
          if (switchS2Element) {
            if (switchR2Element) {
              const contentS2R2 = await fileS1R2?.text();
              if (!contentS2R2)
                return new Response(JSON.stringify({ error: "Sin contenido en el archivo de Carrera 2 Split 2." }), {status: 400,});
              const jsonS2R2 = JSON.parse(contentS2R2);
              transformedJsonR2 = JSON.stringify(createRaceDataMultipleSplits(jsonS1R2, jsonS2R2));
            }
            const contentS2R1 = await fileS2R1?.text();
            if (!contentS2R1)
              return new Response(JSON.stringify({ error: "Sin contenido en el archivo de Carrera 1 Split 2." }), {status: 400,});
            const jsonS2R1 = JSON.parse(contentS2R1);
            transformedJsonR1 = JSON.stringify(createRaceDataMultipleSplits(jsonS1R1, jsonS2R1));
          } else {
            transformedJsonR1 = JSON.stringify(createRaceData(jsonS1R1))
            if (switchR2Element) {
              transformedJsonR2 = JSON.stringify(createRaceData(jsonS1R2));
            }
          }
        }

        const racenameFile = name.replace(/\s/g, '');

        const { data: uploadRace1, error: uploadErrorR1 } = await supabase.storage
          .from("results")
          .upload(`${champID}/${orderChamp}_${racenameFile}Race1`, transformedJsonR1, {upsert: true,});

        if (uploadErrorR1 || !uploadRace1) throw uploadErrorR1;
        URLBucketsResults[0] = uploadRace1.path;

        if (switchR2Element) {
          const { data: uploadRace2, error: uploadErrorR2 } = await supabase.storage
            .from("results")
            .upload(`${champID}/${orderChamp}_${racenameFile}Race2`, transformedJsonR2, {upsert: true,});

          if (uploadErrorR2 || !uploadRace2) throw uploadErrorR2;
          URLBucketsResults[1] = uploadRace2.path;
        }

      // Procesar Carrera 1
      if (oldRaceData.race_data_1 && URLBucketsResults[0] && changeRaceJSONSwitch) {
        await processRaceEdit(oldRaceFiles[0], JSON.parse(transformedJsonR1));
      }

      // Procesar Carrera 2 si existe
      if (oldRaceData.race_data_2 && URLBucketsResults[1] && changeRaceJSONSwitch && switchR2Element) {
        await processRaceEdit(oldRaceFiles[1], JSON.parse(transformedJsonR2));
      }
    }

      const updateData: any = {
        ...(name && { name: name }),
        ...(changeRaceJSONSwitch && fileInputS1R1 && { filename: fileS1R1.name }),
        ...(champID && { championship: champID }),
        ...(orderChamp && { orderinchamp: orderChamp }),
        ...(pointsystem && { pointsystem: pointsystem }),
        ...(numSplits && { splits: numSplits }),
        ...(changeRaceJSONSwitch && { race_data_1: URLBucketsResults[0] }),
        ...(changeRaceJSONSwitch && switchR2Element && { race_data_2: URLBucketsResults[1] }),
      };

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase.from("race").update(updateData).eq("id", Number(race_id));

        if (updateError) throw updateError;
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: "No se ha proporcionado un archivo para la Carrera 1 del Split 1." }), { status: 400 });
    }
  } catch (error) {
    console.error("Error al actualizar la carrera:", error);
    return new Response(JSON.stringify({ error: "Error al actualizar la carrera" }), { status: 500 });
  }
}

async function processRaceEdit(oldRaceDataJson: RaceData, newRaceDataJson: RaceData) {
  try {
    const oldResume: RaceDriversResume[] = oldRaceDataJson.RaceDriversResume;
    const newResume: RaceDriversResume[] = newRaceDataJson.RaceDriversResume;

      const allSteamIDs = [
        ...new Set([
          ...oldResume.map((r: RaceDriversResume) => r.SteamID),
          ...newResume.map((r: RaceDriversResume) => r.SteamID),
        ]),
      ];

      const { data: userSteamID, error: errorSteamID } = await supabase
        .from("profiles")
        .select("id, steam_id, races, wins, poles, podiums, top5, top10, dnf, flaps")
        .in("steam_id", allSteamIDs);

      if (errorSteamID) {
        console.error("Error buscando los perfiles de los pilotos:", errorSteamID);
        return new Response(
          JSON.stringify({ error: "Error buscando los perfiles de los pilotos: " + errorSteamID.message }),
          { status: 500 },
        );
      }

      for (const driver of userSteamID) {
        const oldDriverData = oldResume.find((r: RaceDriversResume) => r.SteamID === driver.steam_id);
        const newDriverData = newResume.find((r: RaceDriversResume) => r.SteamID === driver.steam_id);

        const updates: any = {}

        // Revertir estadísticas antiguas
        if (oldDriverData) {
          if (oldDriverData.BestLap) updates.flaps = driver.flaps - 1;
          if (oldDriverData.PolePosition) updates.poles = driver.poles - 1;
          switch (oldDriverData.Position) {
            case -2: //DQ
            case -1: // DNF
              updates.dnf = driver.dnf - 1;
              updates.races = driver.races - 1;
              break;
            case 1: // Victoria
              updates.wins = driver.wins - 1;
              updates.races = driver.races - 1;
              break;
            case 2: // Podio
            case 3:
              updates.podiums = driver.podiums - 1;
              updates.races = driver.races - 1;
              break;
            case 4: //Top 5
            case 5:
              updates.top5 = driver.top5 - 1;
              updates.races = driver.races - 1;
              break;
            case 6: // Top 10
            case 7:
            case 8:
            case 9:
            case 10:
              updates.top10 = driver.top10 - 1;
              updates.races = driver.races - 1;
              break;
            default: // Resto clasificados
              updates.races = driver.races - 1;
              break;
          }
        }

        // Aplicar nuevas estadísticas
        if (newDriverData) {
          if (newDriverData.BestLap) updates.flaps = (updates.flaps || driver.flaps) + 1;
          if (newDriverData.PolePosition) updates.poles = (updates.poles || driver.poles) + 1;
          switch (newDriverData.Position) {
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
        }

        if (Object.keys(updates).length > 0) {
          const { data, error: errorUpdating } = await supabase.from("profiles").update(updates).eq("id", driver.id);

          if (errorUpdating) {
            console.error("Error actualizando el perfil del piloto:", errorUpdating);
            return new Response(JSON.stringify({ error: "Error actualizando el perfil del piloto: " + errorUpdating.message }), { status: 500 },)
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error general:", error)
    return new Response(JSON.stringify({ error: "Error general: " + error }), { status: 500 });
  }
}

