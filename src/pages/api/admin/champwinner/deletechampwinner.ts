import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  const { id } = await request.json();
  if (!id) {
    return new Response("Id es requerido", { status: 400 });
  }

  const { error: errorDeleteData } = await supabase
    .from('champwinners')
    .delete()
    .eq('id', id)
    .select();

  if (errorDeleteData) {
    console.error("Error al eliminar al campeón:", errorDeleteData);
    return new Response("Error al eliminar al campeón", { status: 500 });
  }
  return new Response("Campeón eliminada con exito", { status: 200 });
}
