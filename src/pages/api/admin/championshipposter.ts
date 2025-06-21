import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const championshipId = formData.get("championshipId");
    const file = formData.get("file");
    if (!championshipId || !file || !(file instanceof Blob)) {
      return new Response(JSON.stringify({ error: "Faltan datos obligatorios" }), { status: 400 });
    }
    const fileName = `poster_${typeof championshipId === "string" || typeof championshipId === "number" ? championshipId : ""}.webp`;
    // Eliminar el poster anterior si existe
    await supabase.storage.from("championshipposter").remove([fileName]);
    // Subir el nuevo poster
    const { error: uploadError } = await supabase.storage
      .from("championshipposter")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: "image/webp",
      });
    if (uploadError) throw uploadError;
    // Actualizar la tabla championship
    const { error: updateError } = await supabase
      .from("championship")
      .update({ champ_img: fileName })
      .eq("id", Number(championshipId));
    if (updateError) throw updateError;
    return new Response(JSON.stringify({ success: true, fileName }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error al subir el poster: " + error }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { championshipId } = await request.json();
    if (!championshipId) {
      return new Response(JSON.stringify({ error: "Falta championshipId" }), { status: 400 });
    }
    const fileName = `poster_${championshipId}.webp`;
    const { error } = await supabase.storage.from("championshipposter").remove([fileName]);
    if (error) throw error;
    // Quitar referencia en la tabla championship
    const { error: updateError } = await supabase
      .from("championship")
      .update({ champ_img: null })
      .eq("id", Number(championshipId));
    if (updateError) throw updateError;
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error al eliminar el poster: " + error }), { status: 500 });
  }
};
