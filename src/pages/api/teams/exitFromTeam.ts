import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {

  const { action, id, teamid } = await request.json();
  if(!id || !teamid) return new Response("Id es requerido", { status: 400 });


  const { error: errorTeamData, count: countMembers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: false })
    .eq('team', teamid)
    .single();

  if(errorTeamData) return new Response("Error al obtener el equipo", { status: 500 });

  if(countMembers && countMembers <= 1){ // Si el equipo se vacia, se elimina
    const { error: deleteTeam } = await supabase
      .from('team')
      .delete()
      .eq('id', teamid);

    if(deleteTeam) return new Response("Error al eliminar el equipo", { status: 500 });

  }else{
    const { count: countTeamManagers, error: errorNumberTeamManagers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: false })
      .eq('team', teamid)
      .eq('is_team_manager', true)
      .single();

    if(errorNumberTeamManagers) return new Response("Error al obtener el numero de managers", { status: 500 });

    if (countTeamManagers && countTeamManagers <= 1){
      const { data: checkTeamManager, error: errorCheckTeamManager } = await supabase
        .from('profiles')
        .select('id')
        .eq('team', teamid)
        .eq('is_team_manager', true)
        .single();

      if(errorCheckTeamManager) return new Response("Error al obtener el manager", { status: 500 });
      if(checkTeamManager?.id === id) return new Response("No puedes salir del equipo si eres el único manager. Elige a otro para ocupar tu lugar.", { status: 400 });
    }
  }

  const { data: updateDataProfile, error: errorUpdateDataProfile } = await supabase
      .from('profiles')
      .update({ team: null, is_team_manager: false })
      .eq('id', id)
      .select('roleesp')
      .single();

    if(errorUpdateDataProfile) return new Response("Error al actualizar el piloto", { status: 500 });


    if(updateDataProfile.roleesp === 2){
      const { data: updateDataProfileRole, error: errorUpdateDataProfileRole } = await supabase
        .from('profiles')
        .update({ roleesp: 3 })
        .eq('id', id)
        .single();

      if(errorUpdateDataProfileRole) return new Response("Error al actualizar el rol del piloto", { status: 500 });

    }

  return new Response("Piloto fuera de equipo con exito", { status: 200 });
};