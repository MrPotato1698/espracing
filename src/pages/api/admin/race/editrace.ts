import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase"
import { createRaceData, createRaceDataMultipleSplits } from "@/lib/results/resultConverter"
import type { RaceData, RaceDriversResume } from "@/types/Results"

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
    if (fileInputS1R1 === null) {
      return new Response(JSON.stringify({ error: "No se ha proporcionado un archivo para la Carrera 1 del Split 1." }), { status: 400 });
    }

    const result = await handleRaceEdit({race_id, name, orderChamp, champID, pointsystem, switchRaceElement, switchS2Element, switchR2Element, fileInputS1R1, fileInputS2R1, fileInputS1R2, fileInputS2R2,});

    return result;
  } catch (error) {
    console.error("Error al actualizar la carrera:", error);
    return new Response(JSON.stringify({ error: "Error al actualizar la carrera" }), { status: 500 });
  }
};

type HandleRaceEditParams = {
  race_id: FormDataEntryValue | null;
  name: string;
  orderChamp: FormDataEntryValue | null;
  champID: FormDataEntryValue | null;
  pointsystem: FormDataEntryValue | null;
  switchRaceElement: boolean;
  switchS2Element: boolean;
  switchR2Element: boolean;
  fileInputS1R1: File | null;
  fileInputS2R1: File | null;
  fileInputS1R2: File | null;
  fileInputS2R2: File | null;
};

async function handleRaceEdit(params: HandleRaceEditParams): Promise<Response> {
  const { race_id, name, orderChamp, champID, pointsystem, switchRaceElement, switchS2Element, switchR2Element, fileInputS1R1, fileInputS2R1, fileInputS1R2, fileInputS2R2, } = params;

  if (!fileInputS1R1) {
    return new Response(JSON.stringify({ error: "Por favor, selecciona un archivo JSON para la Carrera 1 del Split 1." }), { status: 400 });
  }

  let editResult: EditRaceResult;
  if (switchRaceElement) {
    editResult = await handleRaceFileEdit({ race_id, name, orderChamp, champID, fileInputS1R1, fileInputS2R1, fileInputS1R2, fileInputS2R2, switchS2Element, switchR2Element });
    if (editResult.error) return editResult.response!;
  } else {
    editResult = {
      numSplits: 1,
      changeRaceJSONSwitch: false,
      URLBucketsResults: ["", ""],
      dateRace: "2020-01-01",
      fileS1R1: fileInputS1R1,
    };
  }

  const updateData: any = buildUpdateData({
    name,
    fileS1R1: fileInputS1R1,
    champID,
    orderChamp,
    pointsystem,
    numSplits: editResult.numSplits,
    changeRaceJSONSwitch: editResult.changeRaceJSONSwitch,
    URLBucketsResults: editResult.URLBucketsResults,
    switchR2Element,
    dateRace: editResult.dateRace,
  });

  if (Object.keys(updateData).length > 0) {
    const { error: updateError } = await supabase.from("race").update(updateData).eq("id", Number(race_id));
    if (updateError) throw updateError;
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

type EditRaceResult = {
  numSplits: number;
  changeRaceJSONSwitch: boolean;
  URLBucketsResults: string[];
  dateRace: string;
  fileS1R1: File | null;
  error?: boolean;
  response?: Response;
};

async function handleRaceFileEdit({ race_id, name, orderChamp, champID, fileInputS1R1, fileInputS2R1, fileInputS1R2, fileInputS2R2, switchS2Element, switchR2Element }: {
  race_id: FormDataEntryValue | null;
  name: string;
  orderChamp: FormDataEntryValue | null;
  champID: FormDataEntryValue | null;
  fileInputS1R1: File | null;
  fileInputS2R1: File | null;
  fileInputS1R2: File | null;
  fileInputS2R2: File | null;
  switchS2Element: boolean;
  switchR2Element: boolean;
}): Promise<EditRaceResult> {
  let numSplits = 1;
  let transformedJsonR1 = "{}";
  let transformedJsonR2 = "{}";
  const URLBucketsResults = new Array<string>(2).fill("");
  let dateRace: string = "2020-01-01";
  let changeRaceJSONSwitch = true;

  const oldRaceData = await getOldRaceData(Number(race_id));
  if ("error" in oldRaceData && oldRaceData.response instanceof Response) {
    return { numSplits, changeRaceJSONSwitch, URLBucketsResults, dateRace, fileS1R1: fileInputS1R1, error: true, response: oldRaceData.response };
  }

  const oldRaceFiles = await getOldRaceFiles(oldRaceData.data);
  if ("error" in oldRaceFiles) {
    return { numSplits, changeRaceJSONSwitch, URLBucketsResults, dateRace, fileS1R1: fileInputS1R1, error: true, response: oldRaceFiles.response ?? new Response(JSON.stringify({ error: "Unknown error" }), { status: 500 }) };
  }

  const fileValidation = validateFiles({ fileS1R1: fileInputS1R1, fileS1R2: fileInputS1R2, fileS2R1: fileInputS2R1, fileS2R2: fileInputS2R2, switchS2Element, switchR2Element });
  if (fileValidation) {
    return { numSplits, changeRaceJSONSwitch, URLBucketsResults, dateRace, fileS1R1: fileInputS1R1, error: true, response: fileValidation };
  }

  const jsonTransformResult = await transformRaceJsons({
    fileS1R1: fileInputS1R1,
    fileS1R2: fileInputS1R2,
    fileS2R1: fileInputS2R1,
    fileS2R2: fileInputS2R2,
    switchS2Element,
    switchR2Element,
  });
  if ("error" in jsonTransformResult) {
    return { numSplits, changeRaceJSONSwitch, URLBucketsResults, dateRace, fileS1R1: fileInputS1R1, error: true, response: jsonTransformResult.response ?? new Response(JSON.stringify({ error: "Unknown error" }), { status: 500 }) };
  }

  transformedJsonR1 = jsonTransformResult.transformedJsonR1;
  transformedJsonR2 = jsonTransformResult.transformedJsonR2;
  dateRace = jsonTransformResult.dateRace;
  numSplits = jsonTransformResult.numSplits;

  const racenameFile = name.replace(/\s/g, '');

  const uploadResult = await uploadRaceFiles({
    champID,
    orderChamp,
    racenameFile,
    transformedJsonR1,
    transformedJsonR2,
    switchR2Element,
  });
  if ("error" in uploadResult) {
    return { numSplits, changeRaceJSONSwitch, URLBucketsResults, dateRace, fileS1R1: fileInputS1R1, error: true, response: uploadResult.response ?? new Response(JSON.stringify({ error: "Unknown error" }), { status: 500 }) };
  }

  URLBucketsResults[0] = uploadResult.URLBucketsResults[0];
  URLBucketsResults[1] = uploadResult.URLBucketsResults[1];

  await processRaceEditsIfNeeded({
    oldRaceData: oldRaceData.data,
    oldRaceFiles: oldRaceFiles.data,
    URLBucketsResults,
    changeRaceJSONSwitch,
    switchR2Element,
    transformedJsonR1,
    transformedJsonR2,
  });

  return { numSplits, changeRaceJSONSwitch, URLBucketsResults, dateRace, fileS1R1: fileInputS1R1 };
}

function buildUpdateData({ name, fileS1R1, champID, orderChamp, pointsystem, numSplits, changeRaceJSONSwitch, URLBucketsResults, switchR2Element, dateRace }: {
  name: string;
  fileS1R1: File | null;
  champID: FormDataEntryValue | null;
  orderChamp: FormDataEntryValue | null;
  pointsystem: FormDataEntryValue | null;
  numSplits: number;
  changeRaceJSONSwitch: boolean;
  URLBucketsResults: string[];
  switchR2Element: boolean;
  dateRace: string;
}) {
  return {
    ...(name && { name: name }),
    ...(changeRaceJSONSwitch && fileS1R1 && { filename: fileS1R1.name }),
    ...(champID && { championship: champID }),
    ...(orderChamp && { orderinchamp: orderChamp }),
    ...(pointsystem && { pointsystem: pointsystem }),
    ...(numSplits && { splits: numSplits }),
    ...(changeRaceJSONSwitch && { race_data_1: URLBucketsResults[0] }),
    ...(changeRaceJSONSwitch && switchR2Element && { race_data_2: URLBucketsResults[1] }),
    ...(changeRaceJSONSwitch && { race_date: dateRace }),
  };
}

async function getOldRaceData(raceId: number) {
  const { data, error } = await supabase
    .from("race")
    .select("race_data_1, race_data_2")
    .eq("id", raceId)
    .single();
  if (error) {
    return { error: true, response: new Response(JSON.stringify({ error: error.message }), { status: 500 }) };
  }
  return { data };
}

async function getOldRaceFiles(oldRaceData: any) {
  try {
    let oldRaceFiles: RaceData[] = [];
    const { data: oldRaceData1, error: oldRaceData1Error } = await supabase.storage
      .from("results")
      .download(oldRaceData.race_data_1);
    if (oldRaceData1Error) throw oldRaceData1Error;
    oldRaceFiles.push(JSON.parse(await oldRaceData1.text()));

    if (oldRaceData.race_data_2) {
      const { data: oldRaceData2, error: oldRaceData2Error } = await supabase.storage
        .from("results")
        .download(oldRaceData.race_data_2);
      if (oldRaceData2Error) throw oldRaceData2Error;
      oldRaceFiles.push(JSON.parse(await oldRaceData2.text()));
    }
    return { data: oldRaceFiles };
  } catch (error: any) {
    return { error: true, response: new Response(JSON.stringify({ error: error.message }), { status: 500 }) };
  }
}

function validateFiles({ fileS1R1, fileS1R2, fileS2R1, fileS2R2, switchS2Element, switchR2Element }: {
  fileS1R1: File | null;
  fileS1R2: File | null;
  fileS2R1: File | null;
  fileS2R2: File | null;
  switchS2Element: boolean;
  switchR2Element: boolean;
}) {
  if (!fileS1R1) {
    return new Response(JSON.stringify({ error: "Por favor, selecciona un archivo JSON para la Carrera 1 del Split 1." }), { status: 400 });
  }
  if (switchR2Element && !fileS1R2) {
    return new Response(JSON.stringify({ error: "Por favor, selecciona un archivo JSON para la Carrera 2 del Split 1." }), { status: 400 });
  }
  if (switchS2Element && !fileS2R1) {
    return new Response(JSON.stringify({ error: "Por favor, selecciona un archivo JSON para la Carrera 1 del Split 2." }), { status: 400 });
  }
  if (switchS2Element && switchR2Element && !fileS2R2) {
    return new Response(JSON.stringify({ error: "Por favor, selecciona un archivo JSON para la Carrera 2 del Split 2." }), { status: 400 });
  }
  return null;
}

async function transformRaceJsons({ fileS1R1, fileS1R2, fileS2R1, fileS2R2, switchS2Element, switchR2Element }: {
  fileS1R1: File | null;
  fileS1R2: File | null;
  fileS2R1: File | null;
  fileS2R2: File | null;
  switchS2Element: boolean;
  switchR2Element: boolean;
}) {
  try {
    let transformedJsonR1 = "{}";
    let transformedJsonR2 = "{}";
    let dateRace = "2020-01-01";
    let numSplits = 1;

    const contentS1R1 = await fileS1R1!.text();
    const jsonS1R1 = JSON.parse(contentS1R1);
    dateRace = jsonS1R1.SessionFile.slice(0, 10).replace("_", "-").replace(/_/g, "-");
    let jsonS1R2: any = null;
    if (switchR2Element) {
      const contentS1R2 = await fileS1R2?.text();
      if (!contentS1R2)
        return { error: true, response: new Response(JSON.stringify({ error: "Sin contenido en el archivo de Carrera 2 Split 1." }), { status: 400 }) };
      jsonS1R2 = JSON.parse(contentS1R2);
    }
    if (switchS2Element) {
      numSplits = 2;
      if (switchR2Element) {
        const contentS2R2 = await fileS2R2?.text();
        if (!contentS2R2)
          return { error: true, response: new Response(JSON.stringify({ error: "Sin contenido en el archivo de Carrera 2 Split 2." }), { status: 400 }) };
        const jsonS2R2 = JSON.parse(contentS2R2);
        transformedJsonR2 = JSON.stringify(createRaceDataMultipleSplits(jsonS1R2, jsonS2R2));
      }
      const contentS2R1 = await fileS2R1?.text();
      if (!contentS2R1)
        return { error: true, response: new Response(JSON.stringify({ error: "Sin contenido en el archivo de Carrera 1 Split 2." }), { status: 400 }) };
      const jsonS2R1 = JSON.parse(contentS2R1);
      transformedJsonR1 = JSON.stringify(createRaceDataMultipleSplits(jsonS1R1, jsonS2R1));
    } else {
      transformedJsonR1 = JSON.stringify(createRaceData(jsonS1R1));
      if (switchR2Element) {
        transformedJsonR2 = JSON.stringify(createRaceData(jsonS1R2));
      }
    }
    return { transformedJsonR1, transformedJsonR2, dateRace, numSplits };
  } catch (error: any) {
    return { error: true, response: new Response(JSON.stringify({ error: error.message }), { status: 500 }) };
  }
}

async function uploadRaceFiles({ champID, orderChamp, racenameFile, transformedJsonR1, transformedJsonR2, switchR2Element }: {
  champID: FormDataEntryValue | null;
  orderChamp: FormDataEntryValue | null;
  racenameFile: string;
  transformedJsonR1: string;
  transformedJsonR2: string;
  switchR2Element: boolean;
}) {
  try {
    const URLBucketsResults = new Array<string>(2).fill("");
    const { data: uploadRace1, error: uploadErrorR1 } = await supabase.storage
      .from("results")
      .upload(`${champID}/${orderChamp}_${racenameFile}Race1`, transformedJsonR1, { upsert: true });
    if (uploadErrorR1 || !uploadRace1) throw uploadErrorR1;
    URLBucketsResults[0] = uploadRace1.path;

    if (switchR2Element) {
      const { data: uploadRace2, error: uploadErrorR2 } = await supabase.storage
        .from("results")
        .upload(`${champID}/${orderChamp}_${racenameFile}Race2`, transformedJsonR2, { upsert: true });
      if (uploadErrorR2 || !uploadRace2) throw uploadErrorR2;
      URLBucketsResults[1] = uploadRace2.path;
    }
    return { URLBucketsResults };
  } catch (error: any) {
    return { error: true, response: new Response(JSON.stringify({ error: error.message }), { status: 500 }) };
  }
}

async function processRaceEditsIfNeeded({ oldRaceData, oldRaceFiles, URLBucketsResults, changeRaceJSONSwitch, switchR2Element, transformedJsonR1, transformedJsonR2 }: {
  oldRaceData: any;
  oldRaceFiles: RaceData[];
  URLBucketsResults: string[];
  changeRaceJSONSwitch: boolean;
  switchR2Element: boolean;
  transformedJsonR1: string;
  transformedJsonR2: string;
}) {
  if (oldRaceData.race_data_1 && URLBucketsResults[0] && changeRaceJSONSwitch) {
    await processRaceEdit(oldRaceFiles[0], JSON.parse(transformedJsonR1));
  }
  if (oldRaceData.race_data_2 && URLBucketsResults[1] && changeRaceJSONSwitch && switchR2Element) {
    await processRaceEdit(oldRaceFiles[1], JSON.parse(transformedJsonR2));
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

      let updates: any = {};

      updates = changeStats(updates, driver, newDriverData, true); // Viejas Stats
      updates = changeStats(updates, driver, oldDriverData, false); // Nuevas Stats

      if (Object.keys(updates).length > 0) {
        const { error: errorUpdating } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", driver.id);

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

function changeStats(updates: any, driver: any, newDriverData?: RaceDriversResume, isOld: boolean = false) {
  const isRevert = isOld ? -1 : 1;
  if (!newDriverData) return updates;
  if (newDriverData.BestLap) updates.flaps = (updates.flaps ?? driver.flaps) + 1 * isRevert;
  if (newDriverData.PolePosition) updates.poles = (updates.poles ?? driver.poles) + 1 * isRevert;
  switch (newDriverData.Position) {
    case -2: //DQ
    case -1: // DNF
      updates.dnf = driver.dnf + 1 * isRevert;
      updates.races = driver.races + 1 * isRevert;
      break;
    case 0: //No clasificado
      break;
    case 1: // Victoria
      updates.wins = driver.wins + 1 * isRevert;
      updates.races = driver.races + 1 * isRevert;
      break;
    case 2: // Podio
    case 3:
      updates.podiums = driver.podiums + 1 * isRevert;
      updates.races = driver.races + 1 * isRevert;
      break;
    case 4: //Top 5
    case 5:
      updates.top5 = driver.top5 + 1 * isRevert;
      updates.races = driver.races + 1 * isRevert;
      break;
    case 6: // Top 10
    case 7:
    case 8:
    case 9:
    case 10:
      updates.top10 = driver.top10 + 1 * isRevert;
      updates.races = driver.races + 1 * isRevert;
      break;
    default: // Resto clasificados
      updates.races = driver.races + 1 * isRevert;
      break;
  }
  return updates;
}