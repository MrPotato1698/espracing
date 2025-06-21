import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  const { id } = await request.json();
  if (!id) {
    return new Response("Id is required", { status: 400 });
  }
  const { error } = await supabase
    .from('global_adjust')
    .delete()
    .eq('key', id);
  if (error) {
    return new Response("Error al eliminar el ajuste global: " + error.message , { status: 500 });
  }
  return new Response("Ajuste eliminado con exito", { status: 200 });
}