import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase"

export const POST: APIRoute = async ({ request }) => {
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
}