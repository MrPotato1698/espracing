import type { APIRoute } from "astro";
import {supabase} from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {

  const { action, id } = await request.json();
  if(!id) return new Response("Id is required", { status: 400 });

  const {data: ReadedData} = await supabase
    .from('teamsapplication')
    .select('*')
    .eq('id', id)
    .single();

    if (ReadedData) {
      if(ReadedData.type === "create") {
        const {error: deleteTeam} = await supabase.from('team').delete().eq('id', ReadedData.team_requesting);
        if(deleteTeam) return new Response("Error al eliminar el equipo", { status: 400 });
      }

      const {error: deleteData} = await supabase
        .from('teamsapplication')
        .delete()
        .eq('id', id);

      if(deleteData) return new Response("Error al eliminar la solicitud", { status: 400 });

      return new Response("Petición rechazada con éxito", { status: 200 });
    } else return new Response("ID de usuario no encontrado", { status: 400 });
};