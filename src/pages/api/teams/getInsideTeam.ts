import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";


export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();

  const selectTeamValue = form.get('select_team');
  const team_id = typeof selectTeamValue === "string" ? selectTeamValue : (selectTeamValue instanceof File ? undefined : String(selectTeamValue));
  const user_id = form.get("user_id");

  if (!team_id || !user_id) return new Response("Error en la asignación de equipo, hay algún campo nulo.", { status: 400 });

try{
  const {data: teamManager} = await supabase
    .from('profiles')
    .select('id')
    .eq('is_team_manager', true)
    .eq('team', Number(team_id))
    .single();

  console.log("Team Manager:", teamManager);
  console.log("Team ID:", team_id);
  const confirmManager = form.get("confirm_manager") === "true";

  // Comprobar si el equipo tiene usuarios
  const { count: teamMembersCount, error: teamMembersError } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('team', Number(team_id));
  if (teamMembersError) throw teamMembersError;

  if (teamMembersCount === 0 && !confirmManager) {
    return new Response(JSON.stringify({
      require_manager_confirmation: true,
      message: "El equipo no tiene pilotos. Si continúas, serás el jefe de equipo. ¿Deseas continuar?"
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  if(teamManager === null) {
    // Si el usuario ha confirmado, lo hacemos manager
    const { data: newManager, error: newManagerError } = await supabase
      .from('profiles')
      .update({is_team_manager: true, team: Number(team_id)})
      .eq('id', String(user_id));

    if (newManagerError) throw newManagerError;
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  const {data: lastIDTeamsApplication} = await supabase
    .from('teamsapplication')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  const lastTeamApplicationID = lastIDTeamsApplication ? (lastIDTeamsApplication.id + 1) : 1;

    const { error: insertError } = await supabase
    .from('teamsapplication')
    .insert({
      id: Number(lastTeamApplicationID),
      user_application: String(user_id),
      team_manager: teamManager?.id,
      team_requesting: Number(team_id),
      type: 'join'
    });
    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error al procesar la petición:", error);
    return new Response("Hubo un error al procesar la petición. Por favor, inténtalo de nuevo.", { status: 500 });
  }
};