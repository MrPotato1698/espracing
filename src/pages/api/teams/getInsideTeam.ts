import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";


export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();

  const team_id = form.get('select_team')?.toString();
  const user_id = form.get("user_id");

  if (!team_id || !user_id) return new Response("Error en la asignación de equipo, hay algún campo nulo.", { status: 400 });

try{
  const {data: teamManager} = await supabase
    .from('profiles')
    .select('id')
    .eq('is_team_manager', true)
    .eq('team', Number(team_id))
    .single();

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
      team_manager: teamManager?.id,
      team_requesting: Number(team_id),
      type: 'join'
    });
    if (insertError) throw insertError;

    return redirect("/myteam");
  } catch (error) {
    console.error("Error al procesar la petición:", error);
    return new Response("Hubo un error al procesar la petición. Por favor, inténtalo de nuevo.", { status: 500 });
  }
};