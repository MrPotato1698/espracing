import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {

  const { action, id } = await request.json();
  if(!id) {
    return new Response("Id is required", { status: 400 });
  }

  const {data: updateData, error: errorUpdateData} = await supabase
    .from('profiles')
    .update({team: null})
    .eq('id', id);

    if(errorUpdateData) {
      return new Response("Error al actualizar el piloto", { status: 500 });
    }

  return new Response("Piloto fuera de equipo con exito", { status: 200 });
};