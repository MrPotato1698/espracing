import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";


export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();

  const user_id = form.get("user_id");
  const team_name = form.get("team_name")?.toString();
  const team_description = form.get("team_description")?.toString();

  if (!user_id || !team_name || !team_description) {
    return new Response("Error en la asignación de equipo, hay algún campo nulo.", { status: 400 });
  }
try{
  const { data: lastIDTeam } = await supabase
    .from('team')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  const lastTeamID = lastIDTeam ? (lastIDTeam.id + 1) : 1;

  const { data: insertDataTeam, error: insertErrorTeam } = await supabase
    .from('team')
    .insert({
      id: Number(lastTeamID),
      name: team_name,
      image: 'img/default.png',
      description: team_description,
      active: false
    });
  if (insertErrorTeam) throw insertErrorTeam;

  const {data: adminEmail} = await supabase
    .from('profiles')
    .select('id')
    .eq('roleesp', 1);

  const {data: lastIDTeamsApplication} = await supabase
    .from('teamsapplication')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  const lastRaceID = lastIDTeamsApplication ? (lastIDTeamsApplication.id + 1) : 1;

    const { data: insertData, error: insertError } = await supabase
    .from('teamsapplication')
    .insert({
      id: Number(lastRaceID),
      user_application: String(user_id),
      team_manager: adminEmail?.[0]?.id,
      team_requesting: Number(lastTeamID),
      type: 'create'
    });
    if (insertError) throw insertError;

    return redirect("/myteam");
  } catch (error) {
    console.error("Error al procesar la petición:", error);
    return new Response(
      "Hubo un error al procesar la petición. Por favor, inténtalo de nuevo.",
      { status: 500 }
    );
  }
};