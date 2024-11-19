import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  const { id } = await request.json();
  if (!id) {
    return new Response("Id is required", { status: 400 });
  }
  const { data: deleteData, error: errorDeleteData } = await supabase
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
