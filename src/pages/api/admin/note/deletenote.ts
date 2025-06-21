import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
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
}