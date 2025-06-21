import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase";
import { createRaceData, createRaceDataMultipleSplits } from "@/lib/results/resultConverter"

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  try {
    // Recoger datos del formulario
    const racename = formData.get('racename') as string;
    const champID = formData.get('champID') as string;
    const numrace = formData.get('numrace') as string;
    const pointsystem = formData.get('pointsystem') as string;
    const split2 = formData.get('split2') === '1';
    const race2 = formData.get('race2') === '1';
    // Archivos
    const fileS1R1 = formData.get('fileS1R1') as File | null;
    const fileS2R1 = formData.get('fileS2R1') as File | null;
    const fileS1R2 = formData.get('fileS1R2') as File | null;
    const fileS2R2 = formData.get('fileS2R2') as File | null;

    // Validación básica
    const validationError = validateFiles({ fileS1R1, fileS2R1, fileS1R2, fileS2R2, split2, race2 });
    if (validationError) return new Response(JSON.stringify({ error: validationError }), { status: 400 });

    // Leer archivos
    const { jsonS1R1, jsonS2R1, jsonS1R2, jsonS2R2 } = await readAllFiles({ fileS1R1, fileS2R1, fileS1R2, fileS2R2 });

    // Transformar JSONs
    const { transformedJsonR1, transformedJsonR2 } = transformJsons({ split2, race2, jsonS1R1, jsonS2R1, jsonS1R2, jsonS2R2 });

    // Subir resultados a Supabase Storage
    const racenameFile = racename.replace(/\s/g, '');
    const URLBucketsResults = await uploadResults({ supabase, champID, numrace, racenameFile, transformedJsonR1, transformedJsonR2, race2 });

    // Insertar carrera en la tabla race
    const race_date = transformedJsonR1.RaceConfig.Date.slice(0, 10);
    const filename = fileS1R1?.name ?? "";
    const splits = split2 ? 2 : 1;
    await insertRace({ supabase, racename, champID, numrace, pointsystem, splits, URLBucketsResults, race_date, filename });

    // Obtener base URL del request
    const url = new URL(request.url);
    const baseUrl = url.origin;

    // Actualizar estadísticas
    await updateStats(baseUrl, transformedJsonR1.RaceDriversResume);
    if (race2 && transformedJsonR2) {
      await updateStats(baseUrl, transformedJsonR2.RaceDriversResume);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? err }), { status: 500 });
  }
};

// Auxiliar para validar archivos
function validateFiles({ fileS1R1, fileS2R1, fileS1R2, fileS2R2, split2, race2 }: any) {
  if (!fileS1R1) return "Falta archivo JSON Carrera 1 Split 1";
  if (race2 && !fileS1R2) return "Falta archivo JSON Carrera 2 Split 1";
  if (split2 && !fileS2R1) return "Falta archivo JSON Carrera 1 Split 2";
  if (split2 && race2 && !fileS2R2) return "Falta archivo JSON Carrera 2 Split 2";
  return null;
}

// Auxiliar para leer todos los archivos JSON
async function readAllFiles({ fileS1R1, fileS2R1, fileS1R2, fileS2R2 }: any) {
  const readFile = async (file: File|null) => file ? JSON.parse(await file.text()) : null;
  return {
    jsonS1R1: await readFile(fileS1R1),
    jsonS2R1: await readFile(fileS2R1),
    jsonS1R2: await readFile(fileS1R2),
    jsonS2R2: await readFile(fileS2R2),
  };
}

// Auxiliar para transformar JSONs
function transformJsons({ split2, race2, jsonS1R1, jsonS2R1, jsonS1R2, jsonS2R2 }: any) {
  let transformedJsonR1: any, transformedJsonR2: any = null;
  if (split2) {
    if (!jsonS2R1) throw new Error("Falta JSON Split 2 Carrera 1");
    transformedJsonR1 = createRaceDataMultipleSplits(jsonS1R1, jsonS2R1);
    if (race2) {
      if (!jsonS1R2 || !jsonS2R2) throw new Error("Falta JSON Split 2 Carrera 2");
      transformedJsonR2 = createRaceDataMultipleSplits(jsonS1R2, jsonS2R2);
    }
  } else {
    transformedJsonR1 = createRaceData(jsonS1R1);
    if (race2) {
      if (!jsonS1R2) throw new Error("Falta JSON Split 1 Carrera 2");
      transformedJsonR2 = createRaceData(jsonS1R2);
    }
  }
  return { transformedJsonR1, transformedJsonR2 };
}

// Auxiliar para subir resultados a Supabase Storage
async function uploadResults({ supabase, champID, numrace, racenameFile, transformedJsonR1, transformedJsonR2, race2 }: any) {
  let URLBucketsResults = ["", ""];
  const { data: uploadRace1, error: uploadErrorR1 } = await supabase
    .storage
    .from('results')
    .upload(`${champID}/${numrace}_${racenameFile}Race1`, JSON.stringify(transformedJsonR1), { upsert: true });
  if (uploadErrorR1 || !uploadRace1) throw uploadErrorR1;
  URLBucketsResults[0] = uploadRace1.path;
  if (race2 && transformedJsonR2) {
    const { data: uploadRace2, error: uploadErrorR2 } = await supabase
      .storage
      .from('results')
      .upload(`${champID}/${numrace}_${racenameFile}Race2`, JSON.stringify(transformedJsonR2), { upsert: true });
    if (uploadErrorR2 || !uploadRace2) throw uploadErrorR2;
    URLBucketsResults[1] = uploadRace2.path;
  }
  return URLBucketsResults;
}

// Auxiliar para insertar la carrera en la base de datos
async function insertRace({ supabase, racename, champID, numrace, pointsystem, splits, URLBucketsResults, race_date, filename }: any) {
  const insertObj: any = {
    name: racename,
    championship: champID,
    orderinchamp: numrace,
    pointsystem,
    splits,
    race_data_1: URLBucketsResults[0],
    race_data_2: URLBucketsResults[1] ?? null,
    race_date,
    filename
  };
  const { error: insertError } = await supabase.from('race').insert([insertObj]);
  if (insertError) throw insertError;
}

// Auxiliar para actualizar estadísticas
async function updateStats(baseUrl: string, resume: any) {
  const response = await fetch(`${baseUrl}/api/admin/stats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume })
  });
  if (!response.ok) throw new Error('Error actualizando estadísticas');
}
