import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {

  const { action, id } = await request.json();
  if (!id) {
    return new Response("Id is required", { status: 400 });
  }

  const { data: ReadedData } = await supabase
    .from('teamsapplication')
    .select('*')
    .eq('id', id)
    .single();

  if (ReadedData) {
    if(ReadedData.type === "join"){
      const { data: updateData, error: errorUpdateData } = await supabase
        .from('profiles')
        .update({ team: ReadedData.team_requesting })
        .eq('id', ReadedData.user_application);

      if (errorUpdateData) return new Response("Error al actualizar el usuario", { status: 400 });

      const { error: deleteData } = await supabase
        .from('teamsapplication')
        .delete()
        .eq('id', id);

      if(deleteData) return new Response("Error al eliminar la solicitud final después de actualizar los datos", { status: 400 });

    } else {
      const { error: errorAcceptNewTeam } = await supabase
      .from('team')
      .update({ active: true })
      .eq('id', ReadedData.team_requesting);

      if (errorAcceptNewTeam) return new Response("Error al aceptar el equipo", { status: 400 });

      const {error: errorNewTeamManager } = await supabase
        .from('profiles')
        .update({ is_team_manager: true, team: ReadedData.team_requesting })
        .eq('id', ReadedData.user_application);

      if (errorNewTeamManager) return new Response("Error al actualizar el usuario", { status: 400 });

      const { data: UserRole } = await supabase
        .from ('profiles')
        .select('roleesp')
        .eq('id', ReadedData.user_application)
        .single();

      if(UserRole?.roleesp && UserRole?.roleesp === 1){
        const {error: errorChangeRole } = await supabase
          .from('profiles')
          .update({ roleesp: 2 })
          .eq('id', ReadedData.user_application);

        if (errorChangeRole) return new Response("Error al actualizar el usuario en su rol", { status: 400 });
      }

      const { error: deleteData } = await supabase
        .from('teamsapplication')
        .delete()
        .eq('id', id);

      if(deleteData) return new Response("Error al eliminar la solicitud final después de actualizar los datos", { status: 400 });
    }

    return new Response("Petición aceptada con éxito", { status: 200 });
  } else {
    console.log("ID de solicitud no encontrado");
    return new Response("ID de solicitud no encontrado", { status: 400 });
  }
};