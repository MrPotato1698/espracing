import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase"

export const GET: APIRoute = async ({ request }) => {
  const { data, error } = await supabase
    .from("circuit")
    .select("*")
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
  try {
    const body = await request.json();
    const { circuitData } = body;
    if (!circuitData) throw new Error("No se recibieron datos del circuito");

    const lastRaceID = await getNextCircuitId(circuitData);
    await insertCircuit(circuitData, lastRaceID);

    const needed = circuitData.layouts.length;
    const startId = await getNextLayoutStartId(needed);
    await insertLayouts(circuitData.layouts, startId, lastRaceID);

    return new Response(JSON.stringify({ success: true }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error al crear el circuito:", error);
    return new Response(JSON.stringify({ error: "Error al crear el circuito: " + error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const race_id = formData.get("circuit_id");
  const name = formData.get("name");
  const location = formData.get("location");

  if (!race_id) {
    return new Response(
      JSON.stringify({ error: "ID de carrera no proporcionado" }),
      { status: 400 }
    );
  }

  try {
      const updateData: any = {
        ...(name && { name: name }),
        ...(location && { location: location }),
      };

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from("circuit")
          .update(updateData)
          .eq("id", Number(race_id));

        if (updateError) throw updateError;
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error al actualizar el circuito:", error);
    return new Response(
      JSON.stringify({ error: "Error al actualizar el circuito" }),
      { status: 500 }
    );
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { id } = await request.json();
    if (!id) {
      return new Response(JSON.stringify({ error: "Id es requerido" }), { status: 400 });
    }
    const { error: deleteError } = await supabase
      .from("circuit")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return new Response(JSON.stringify({ error: `Fallo al eliminar circuito: ${deleteError.message}` }), { status: 500 });
    }
    return new Response(JSON.stringify({ message: "Circuito y variantes eliminados con éxito" }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

async function getNextCircuitId(circuitData: any) {
  let lastRaceID = -1;
  if (circuitData.cleanInstall) {
    const { data: cleanInstallData } = await supabase
      .from('circuit')
      .delete()
      .eq('filename', circuitData.filename)
      .select('id')
      .single();
    lastRaceID = cleanInstallData?.id ?? -1;
  }
  if (!circuitData.cleanInstall || lastRaceID === -1) {
    const { data: getLastRace } = await supabase
      .from('circuit')
      .select('id')
      .order('id', { ascending: true });
    if (!getLastRace) throw new Error("Error al obtener el último ID de circuito");
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
    lastRaceID = getLastRace ? i : 1;
  }
  return lastRaceID;
}

async function insertCircuit(circuitData: any, lastRaceID: number) {
  const { error: insertError } = await supabase
    .from('circuit')
    .insert({
      id: lastRaceID,
      name: circuitData.name,
      shortname: circuitData.shortname,
      filename: circuitData.filename,
      location: circuitData.location,
    });
  if (insertError) throw insertError;
}

async function getNextLayoutStartId(needed: number) {
  const { data: allLayouts } = await supabase
    .from('circuitLayout')
    .select('id')
    .order('id', { ascending: true });

  const existingIds = allLayouts ? allLayouts.map((l: any) => l.id) : [];
  let startId = 1;
  if (existingIds.length > 0) {
    let i = 1;
    while (true) {
      let fits = true;
      for (let j = 0; j < needed; j++) {
        if (existingIds.includes(i + j)) {
          fits = false;
          break;
        }
      }
      if (fits) {
        startId = i;
        break;
      }
      i++;
    }
  }
  return startId;
}

async function insertLayouts(layouts: any[], startId: number, lastRaceID: number) {
  for (let index = 0; index < layouts.length; index++) {
    const layout = layouts[index];
    const { error: insertLayoutError } = await supabase
      .from('circuitLayout')
      .insert({
        id: Number(startId + index),
        name: layout.name,
        filename: layout.filename,
        circuit: lastRaceID,
        length: Number(String(layout.length).replace(/\D/g, '')),
        capacity: Number(String(layout.capacity).replace(/\D/g, ''))
      });
    if (insertLayoutError) throw insertLayoutError;
  }
}