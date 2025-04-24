import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase"

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();

  const note_id = formData.get("racenoteID");
  const race_id = formData.get("raceID") as string;
  const description = formData.get("description");
  const penalty = formData.get("penalty");

  if (!race_id)
    return new Response(JSON.stringify({ error: "ID de carrera no proporcionado" }), { status: 400 });

  try {
      const updateData: any = {
        ...(race_id && { race: race_id }),
        ...(note_id && { code: note_id }),
        ...(penalty && { description: penalty }),
        ...(description && { penalty: description })
        };

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase.from("racenotes").update(updateData).eq("id", Number(note_id));

        if (updateError) throw updateError;
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error("Error al actualizar la nota de carrera:", error);
    return new Response(JSON.stringify({ error: "Error al actualizar la nota de carrera" }), { status: 500 });
  }
}