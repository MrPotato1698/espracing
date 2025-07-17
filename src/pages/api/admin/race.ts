import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase";
import { createRaceData, createRaceDataMultipleSplits } from "@/lib/results/resultConverter"
import type { RaceData, RaceDriversResume } from "@/types/Results"

export const GET: APIRoute = async ({ request }) => {
  const { data, error } = await supabase
    .from("race")
    .select("*, championship!inner(*), pointsystem!inner(*)")
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

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const {racename, champID, numrace, pointsystem, splits, race_data_1, race_data_2, race_date, filename, isMultiCategory } = body;
  const lastRaceID = await getNextRaceId();
  const insertObj: any = {
    id: lastRaceID,
    name: racename,
    championship: champID,
    orderinchamp: numrace,
    pointsystem,
    splits,
    race_data_1,
    race_date,
    filename,
    multiclass: isMultiCategory
  };
  if (race_data_2) insertObj.race_data_2 = race_data_2;
  const { error } = await supabase.from('race').insert([insertObj]);

  if (error) {
    console.error('Error inserting: ', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};

export const PUT: APIRoute = async ({ request }) => {
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
  const isMultiCategory = formData.get("isMultiCategory") === "on" || formData.get("isMultiCategory") === "1";

  if (!race_id)
    return new Response(JSON.stringify({ error: "ID de carrera no proporcionado" }), { status: 400 });

  try {
    if (fileInputS1R1 === null) {
      return new Response(JSON.stringify({ error: "No se ha proporcionado un archivo para la Carrera 1 del Split 1." }), { status: 400 });
    }

    const result = await handleRaceEdit({race_id, name, orderChamp, champID, pointsystem, switchRaceElement, switchS2Element, switchR2Element, fileInputS1R1, fileInputS2R1, fileInputS1R2, fileInputS2R2, isMultiCategory });

    return result;
  } catch (error) {
    console.error("Error al actualizar la carrera:", error);
    return new Response(JSON.stringify({ error: "Error al actualizar la carrera" }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
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
};

async function getNextRaceId() {
  const { data: getLastRace } = await supabase
    .from('race')
    .select('id')
    .neq('id', 0)
    .order('id', { ascending: true });
  if (!getLastRace) throw new Error("Error al obtener el último ID de carrera");
  const length = getLastRace.length;
  let i = 1;
  let findID = false;
  while (!findID && i < length) {
    if (getLastRace[i - 1].id === i) {
      i++;
    } else {
      findID = true;
    }
  }
  if (!findID) i++;
  return getLastRace ? i : 1;
}


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
  isMultiCategory?: boolean;
};

async function handleRaceEdit(params: HandleRaceEditParams): Promise<Response> {
  const { race_id, name, orderChamp, champID, pointsystem, switchRaceElement, switchS2Element, switchR2Element, fileInputS1R1, fileInputS2R1, fileInputS1R2, fileInputS2R2, isMultiCategory } = params;

  if (!fileInputS1R1) {
    return new Response(JSON.stringify({ error: "Por favor, selecciona un archivo JSON para la Carrera 1 del Split 1." }), { status: 400 });
  }

  let editResult: EditRaceResult;
  if (switchRaceElement) {
    editResult = await handleRaceFileEdit({ race_id, name, orderChamp, champID, fileInputS1R1, fileInputS2R1, fileInputS1R2, fileInputS2R2, switchS2Element, switchR2Element, isMultiCategory });
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
    isMultiCategory,
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

async function handleRaceFileEdit({ race_id, name, orderChamp, champID, fileInputS1R1, fileInputS2R1, fileInputS1R2, fileInputS2R2, switchS2Element, switchR2Element, isMultiCategory }: {
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
  isMultiCategory?: boolean;
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
    isMultiCategory
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

function buildUpdateData({ name, fileS1R1, champID, orderChamp, pointsystem, numSplits, changeRaceJSONSwitch, URLBucketsResults, switchR2Element, dateRace, isMultiCategory }: {
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
  isMultiCategory?: boolean;
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
    ...(typeof isMultiCategory !== 'undefined' && { multiclass: !!isMultiCategory }),
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

async function transformRaceJsons({ fileS1R1, fileS1R2, fileS2R1, fileS2R2, switchS2Element, switchR2Element, isMultiCategory }: {
  fileS1R1: File | null;
  fileS1R2: File | null;
  fileS2R1: File | null;
  fileS2R2: File | null;
  switchS2Element: boolean;
  switchR2Element: boolean;
  isMultiCategory?: boolean;
}) {
  try {
    let transformedJsonR1 = "{}";
    let transformedJsonR2 = "{}";
    let dateRace = "2020-01-01";
    let numSplits = 1;

    const contentS1R1 = await fileS1R1!.text();
    const jsonS1R1 = JSON.parse(contentS1R1);

    // Agregar validación de la estructura del JSON
    if (!jsonS1R1.Cars || !Array.isArray(jsonS1R1.Cars)) {
      return { error: true, response: new Response(JSON.stringify({ error: "Estructura de archivo JSON inválida: falta el array 'Cars'" }), { status: 400 }) };
    }

    if (!jsonS1R1.Result || !Array.isArray(jsonS1R1.Result)) {
      return { error: true, response: new Response(JSON.stringify({ error: "Estructura de archivo JSON inválida: falta el array 'Result'" }), { status: 400 }) };
    }

    // Validar que hay datos de resultados y que no está vacío
    if (jsonS1R1.Result.length === 0) {
      return { error: true, response: new Response(JSON.stringify({ error: "El archivo JSON no contiene resultados de carrera" }), { status: 400 }) };
    }

    // Verificar que los datos del array Cars tienen la estructura mínima requerida
    const validCars = jsonS1R1.Cars.filter((car: any) => car.CarId !== undefined && car.Driver?.Name && car.Driver?.Guid);


    // Si no hay coches válidos pero sí hay resultados, podemos intentar procesar solo con los datos de Result
    if (validCars.length === 0 && jsonS1R1.Result.length > 0) {
      console.warn("No valid cars found in Cars array, but Results exist. Proceeding with Results data only.");
    }

    // Obtener la fecha en formato YYYY-MM-DD
    if (jsonS1R1.SessionFile) {
      const dateMatch = jsonS1R1.SessionFile.match(/(\d{4})[-_](\d{1,2})[-_](\d{1,2})/);
      if (dateMatch) {
        const year = dateMatch[1];
        const month = dateMatch[2].padStart(2, "0");
        const day = dateMatch[3].padStart(2, "0");
        dateRace = `${year}-${month}-${day}`;
      }
    }

    let jsonS1R2: any = null;
    if (switchR2Element == true) {
      const contentS1R2 = await fileS1R2?.text();
      if (!contentS1R2)
        return { error: true, response: new Response(JSON.stringify({ error: "Sin contenido en el archivo de Carrera 2 Split 1." }), { status: 400 }) };
      jsonS1R2 = JSON.parse(contentS1R2);
    }
    if (switchS2Element == true) {
      numSplits = 2;
      if (switchR2Element == true) {
        const contentS2R2 = await fileS2R2?.text();
        if (!contentS2R2)
          return { error: true, response: new Response(JSON.stringify({ error: "Sin contenido en el archivo de Carrera 2 Split 2." }), { status: 400 }) };
        const jsonS2R2 = JSON.parse(contentS2R2);
        transformedJsonR2 = JSON.stringify(await createRaceDataMultipleSplits(jsonS1R2, jsonS2R2, !isMultiCategory));
      }
      const contentS2R1 = await fileS2R1?.text();
      if (!contentS2R1)
        return { error: true, response: new Response(JSON.stringify({ error: "Sin contenido en el archivo de Carrera 1 Split 2." }), { status: 400 }) };
      const jsonS2R1 = JSON.parse(contentS2R1);
      transformedJsonR1 = JSON.stringify(await createRaceDataMultipleSplits(jsonS1R1, jsonS2R1, !isMultiCategory));
    } else {
      transformedJsonR1 = JSON.stringify(await createRaceData(jsonS1R1, !isMultiCategory));
      if (switchR2Element == true) {
        transformedJsonR2 = JSON.stringify(await createRaceData(jsonS1R2, !isMultiCategory));
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
      .upload(`${champID}/${orderChamp}_${racenameFile}Race1`, new Blob([transformedJsonR1], { type: "text/plain" }), { upsert: true });
    if (uploadErrorR1 || !uploadRace1) throw uploadErrorR1;
    URLBucketsResults[0] = uploadRace1.path;

    if (switchR2Element == true) {
      const { data: uploadRace2, error: uploadErrorR2 } = await supabase.storage
        .from("results")
        .upload(`${champID}/${orderChamp}_${racenameFile}Race2`, new Blob([transformedJsonR2], { type: "text/plain" }), { upsert: true });
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
    if (!oldRaceDataJson?.RaceDriversResume || !newRaceDataJson?.RaceDriversResume) {
      return new Response(
        JSON.stringify({ error: "RaceDriversResume no está definido en los datos de la carrera." }),
        { status: 400 },
      );
    }
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

async function processRaceData(path: string, raceName: string) {
  const { data: raceData } = await supabase.storage.from("results").download(path)
  if (!raceData) {
    // Si el archivo no existe, continuar sin lanzar error
    console.warn(`Archivo de resultados no encontrado para ${raceName}, se omite la descarga y actualización de estadísticas.`);
    // Intentar eliminar el archivo igualmente (por si acaso)
    await supabase.storage.from("results").remove([path]);
    return;
  }

  const raceDataJson = JSON.parse(await raceData.text())

  // Eliminar carrera de bucket de Supabase
  const { data: removeRace, error: ErrorRemoveRace } = await supabase.storage.from("results").remove([path])

  if (ErrorRemoveRace || !removeRace) {
    throw new Error(`Fallo al eliminar carrera ${raceName}: ${ErrorRemoveRace?.message}`)
  }

  // Modificar estadisticas de Profile
  const baseUrl = process.env.BASE_URL ?? "http://localhost:4321";
  const response = await fetch(`${baseUrl}/api/admin/stats`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ resume: raceDataJson.RaceDriversResume }),
  })

  if (!response.ok) {
    throw new Error(`Error actualizando estadísticas de ${raceName}`)
  }
}