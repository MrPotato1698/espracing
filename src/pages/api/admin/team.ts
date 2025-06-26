import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase";

export const PUT: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const team_id = formData.get('team_id');
  const team_name = formData.get('name');
  const descriptionTeam = formData.get('descriptionTeam');

  if (!team_id) {
    return new Response(JSON.stringify({ error: 'ID del equipo no proporcionado' }), { status: 400 });
  }

  try {
    let updateData: any = {};
    if (team_name) updateData.name = team_name;
    if (descriptionTeam) updateData.description = descriptionTeam;

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('team')
        .update(updateData)
        .eq('id', Number(team_id));

      if (updateError) throw updateError;
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error al actualizar el equipo:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar el equipo' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  const { id } = await request.json();
  if (!id) {
    return new Response("Id is required", { status: 400 });
  }
  const { error } = await supabase
    .from('team')
    .delete()
    .eq('id', id);
  if (error) {
    return new Response("Error al eliminar el equipo: " + error.message , { status: 500 });
  }
  return new Response("Equipo eliminado con exito", { status: 200 });
}