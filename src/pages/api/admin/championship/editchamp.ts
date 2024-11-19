import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";
import { createRaceData } from "@/lib/results/resultConverter";

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const champ_id = formData.get('champ_id');
  const champ_name = formData.get('name');
  const keySearchAPI = formData.get('keySearchAPI');
  const yearChamp = formData.get('yearChamp');
  const season = formData.get('season') as string;
  const champORevent = formData.get('champORevent')  === 'on';

  const seasonPart1 = '20' + season.slice(0, 2);
      const seasonPart2 = '20' + season.slice(2, 4);
      const formattedSeason = `${seasonPart1}/${seasonPart2}`;


  if (!champ_id) {
    return new Response(JSON.stringify({ error: 'ID de campeonato no proporcionado' }), { status: 400 });
  }

  try {
    let updateData: any = {};
    if (champ_name) updateData.name = champ_name;
    if (keySearchAPI) updateData.key_search = keySearchAPI;
    if (yearChamp) updateData.year = Number(yearChamp);
    if (season) updateData.season = formattedSeason;
    if(champORevent) updateData.ischampionship = champORevent;

    console.log(updateData);

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('championship')
        .update(updateData)
        .eq('id', champ_id);

      if (updateError) throw updateError;
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error al actualizar la carrera:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar la carrera' }), { status: 500 });
  }
}