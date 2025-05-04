import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  const { id } = await request.json();
  if (!id) {
    return new Response("Id es requerido", { status: 400 });
  }

  const { data: championship, error: getError } = await supabase
    .from("championship")
    .select("champ_img")
    .eq("id", id)
    .single();

  if (getError) throw getError;

  if (championship?.champ_img) {
    // Siempre eliminamos usando la ruta 'poster_{id}.webp'
    const posterPath = `poster_${id}.webp`;
    const { error: deleteStorageError } = await supabase.storage
      .from("championshipposter")
      .remove([posterPath]);

    if (deleteStorageError) {
      console.error("Error eliminado el poster del campeonato:", deleteStorageError);
    }
  }

  const { error: errorDeleteData } = await supabase
    .from('championship')
    .delete()
    .eq('id', id)
    .select();

  if (errorDeleteData) {
    console.error("Error al eliminar el campeonato:", errorDeleteData);
    return new Response("Error al eliminar el campeonato", { status: 500 });
  }
  return new Response("Campeonato eliminada con exito", { status: 200 });
}
