import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";


export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();

  const user_id = form.get("user_id");
  const team_nameValue = form.get("team_name");
  const team_name = typeof team_nameValue === "string" ? team_nameValue : "";
  const team_descriptionValue = form.get("team_description");
  const team_description = typeof team_descriptionValue === "string" ? team_descriptionValue : "";

  if (!user_id || !team_name || !team_description) {
    return new Response("Error en la asignación de equipo, hay algún campo nulo.", { status: 400 });
  }
try {
  const { data: lastIDTeam, error: lastIDTeamError } = await supabase
    .from('team')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .single();
  if (lastIDTeamError) {
    console.error("Error obteniendo el último ID de equipo:", lastIDTeamError);
    return new Response("Error obteniendo el último ID de equipo.", { status: 500 });
  }

  const lastTeamID = lastIDTeam ? (lastIDTeam.id + 1) : 1;

  const { error: insertErrorTeam } = await supabase
    .from('team')
    .insert({
      id: Number(lastTeamID),
      name: team_name,
      image: 'img/default.png',
      description: team_description,
      active: false
    });
  if (insertErrorTeam) {
    console.error("Error insertando el equipo:", insertErrorTeam);
    return new Response("Error al crear el equipo.", { status: 500 });
  }

  const { data: adminEmail, error: adminEmailError } = await supabase
    .from('profiles')
    .select('id')
    .eq('roleesp', 1);
  if (adminEmailError || !adminEmail || adminEmail.length === 0) {
    console.error("Error obteniendo el administrador:", adminEmailError);
    return new Response("No se pudo encontrar un administrador.", { status: 500 });
  }

  const { data: lastIDTeamsApplication, error: lastIDTeamsApplicationError } = await supabase
    .from('teamsapplication')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .single();
  if (lastIDTeamsApplicationError) {
    console.error("Error obteniendo el último ID de teamsapplication:", lastIDTeamsApplicationError);
    return new Response("Error obteniendo el último ID de teamsapplication.", { status: 500 });
  }

  const lastTeamApplicationID = lastIDTeamsApplication ? (lastIDTeamsApplication.id + 1) : 1;

  const { error: insertError } = await supabase
    .from('teamsapplication')
    .insert({
      id: Number(lastTeamApplicationID),
      user_application: String(user_id),
      team_manager: adminEmail?.[0]?.id,
      team_requesting: Number(lastTeamID),
      type: 'create'
    });
  if (insertError) {
    console.error("Error insertando en teamsapplication:", insertError);
    return new Response("Error al crear la solicitud de equipo.", { status: 500 });
  }

  return new Response(JSON.stringify({success: true}), { status: 201, headers: { "Content-Type": "application/json" } });
} catch (error) {
    console.error("Error al procesar la petición:", error);
    return new Response(
      "Hubo un error al procesar la petición. Por favor, inténtalo de nuevo.",
      { status: 500 }
    );
  }
};