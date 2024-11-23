import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  const { id } = await request.json();
  if (!id) {
    return new Response("Id is required", { status: 400 });
  }
  const { error } = await supabase
    .from('team')
    .delete()
    .eq('id', id);
  return new Response("Equipo eliminado con exito", { status: 200 });
}