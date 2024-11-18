import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  const { id } = await request.json();
  if (!id) {
    return new Response("Id is required", { status: 400 });
  }
  const { error } = await supabase
    .from('championship')
    .delete()
    .eq('id', id);
  return new Response("Campeonato eliminada con exito", { status: 200 });
}
