import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

// Listar imágenes de normativa y campeonatos
export const GET: APIRoute = async () => {
  // Imágenes de normativa
  const { data: images } = await supabase.from("racerulesimg").select("id, name, img_url").order("id");
  // Imágenes de campeonatos activos
  const { data: champData } = await supabase.from("championship").select("id, name, champ_img").eq("isfinished", false);
  let championshipImages = [];
  if (champData) {
    championshipImages = champData.map((champ: any) => {
      let img_url = "";
      if (champ.champ_img) {
        const { data: urlData } = supabase.storage.from("championshipposter").getPublicUrl(champ.champ_img);
        img_url = urlData?.publicUrl || "";
      }
      return { ...champ, img_url };
    });
  }
  return new Response(JSON.stringify({ images: images || [], championshipImages }), { status: 200 });
};

// Subir nueva imagen
export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const file = formData.get("file") as File;
  if (!name || !file) {
    return new Response(JSON.stringify({ error: "Faltan datos" }), { status: 400 });
  }
  const fileName = `rulesimg_${Date.now()}.webp`;
  const { error: uploadError } = await supabase.storage.from("rulesimg").upload(fileName, file, { upsert: true, contentType: "image/webp" });
  if (uploadError) return new Response(JSON.stringify({ error: uploadError.message }), { status: 500 });
  const { data: publicUrlData } = supabase.storage.from("rulesimg").getPublicUrl(fileName);
  const publicUrl = publicUrlData.publicUrl;
  const { data: insertData, error: insertError } = await supabase.from("racerulesimg").insert({ name, img_url: publicUrl }).select().single();
  if (insertError) return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
  return new Response(JSON.stringify({ image: insertData }), { status: 200 });
};

// Eliminar imagen
export const DELETE: APIRoute = async ({ request }) => {
  const { id, img_url } = await request.json();
  if (!id || !img_url) return new Response(JSON.stringify({ error: "Faltan datos" }), { status: 400 });
  const fileName = img_url.split("/").pop();
  if (fileName) {
    await supabase.storage.from("rulesimg").remove([fileName]);
  }
  const { error } = await supabase.from("racerulesimg").delete().eq("id", id);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
