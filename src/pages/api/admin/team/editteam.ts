import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const team_id = formData.get('champ_id');
  const team_name = formData.get('name');
  const imageTeam = formData.get('imageTeam');
  const descriptionTeam = formData.get('descriptionTeam');

  if (!team_id) {
    return new Response(JSON.stringify({ error: 'ID del equipo no proporcionado' }), { status: 400 });
  }

  try {
    let updateData: any = {};
    if (team_name) updateData.name = team_name;
    if (imageTeam) updateData.image = imageTeam;
    if (descriptionTeam) updateData.description = Number(descriptionTeam);

    console.log(updateData);

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
}