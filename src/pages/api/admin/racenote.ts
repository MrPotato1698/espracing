import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase"

export const GET: APIRoute = async ({ request }) => {
  const { data, error } = await supabase
    .from("racenotes")
    .select("*, race!inner(*), code!inner(*)")
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
  const { racename, description, penalty, noteCode } = body;
  const lastNoteID = await getNextRaceNoteId();
  const { error } = await supabase.from('racenotes').insert([
    {
      id: lastNoteID,
      race: racename,
      description,
      penalty,
      code: noteCode
    }
  ]);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};

export const PUT: APIRoute = async ({ request }) => {
  const formData = await request.formData();

  const id = formData.get("racenoteID") as string;
  const note_id = formData.get("noteID");
  const race_id = formData.get("raceID") as string;
  const description = formData.get("description");
  const penalty = formData.get("penalty");

  if (!race_id)
    return new Response(JSON.stringify({ error: "ID de carrera no proporcionado" }), { status: 400 });

  try {
      const updateData: any = {
        ...(race_id && { race: race_id }),
        ...(note_id && { code: note_id }),
        ...(description && { description: description }),
        ...((penalty && note_id !== "0") ? { penalty: penalty } : { penalty: null }),
        };

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase.from("racenotes").update(updateData).eq("id", Number(id));

        if (updateError) throw updateError;
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error("Error al actualizar la nota de carrera:", error);
    return new Response(JSON.stringify({ error: "Error al actualizar la nota de carrera" }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  const { id } = await request.json();
  if (!id) {
    return new Response("Id is required", { status: 400 });
  }
  const { error } = await supabase
    .from('racenotes')
    .delete()
    .eq('id', id);
  if (error) {
    return new Response("Error al eliminar la nota: " + error.message , { status: 500 });
  }
  return new Response("Nota eliminada con exito", { status: 200 });
};

async function getNextRaceNoteId() {
  const { data: getLastRaceNotes } = await supabase
    .from('racenotes')
    .select('id')
    .neq('id', 0)
    .order('id', { ascending: true });
  if (!getLastRaceNotes) throw new Error("Error al obtener el último ID de notas");
  const length = getLastRaceNotes.length;
  let i = 1;
  let findID = false;
  while (!findID && i < length) {
    if (getLastRaceNotes[i - 1].id === i) {
      i++;
    } else {
      findID = true;
    }
  }
  if (!findID) i++;
  return getLastRaceNotes ? i : 1;
}