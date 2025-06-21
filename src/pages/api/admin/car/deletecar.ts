import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  const { id } = await request.json();
  if (!id) {
    return new Response("Id is required", { status: 400 });
  }
  const { error: errorDeleteData } = await supabase
    .from('car')
    .delete()
    .eq('id', id)
    .select();

  if (errorDeleteData) {
    console.error("Error al eliminar el coche:", errorDeleteData);
    return new Response("Error al eliminar el coche", { status: 500 });
  }
  return new Response("Coche eliminada con exito", { status: 200 });
}
