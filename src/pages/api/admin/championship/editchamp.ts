import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const champ_id = formData.get('champ_id');
  const champ_name = formData.get('name');
  const keySearchAPI = formData.get('keySearchAPI');
  const yearChamp = formData.get('yearChamp');
  const season = formData.get('season') as string;
  const champORevent = formData.get('champORevent')  !== null;
  const numberTotalRaces = formData.get('numbertotalraces');
  const isfinished = formData.get('isFinished') !== null;

  const seasonPart1 = '20' + season.slice(0, 2);
      const seasonPart2 = '20' + season.slice(2, 4);
      const formattedSeason = `${seasonPart1}/${seasonPart2}`;


  if (!champ_id) {
    return new Response(JSON.stringify({ error: 'ID de campeonato no proporcionado' }), { status: 400 });
  }

  try {
    const updateData: any = {
      ...(champ_name && { name: champ_name }),
      ...(keySearchAPI && { key_search: keySearchAPI }),
      ...(yearChamp && { year: Number(yearChamp) }),
      ...(season && { season: formattedSeason }),
      ischampionship: champORevent,
      ...(numberTotalRaces && { number_of_races_total: Number(numberTotalRaces) }),
      isfinished: isfinished
    };

    const { error: updateError } = await supabase
      .from('championship')
      .update(updateData)
      .eq('id', Number(champ_id));

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error al actualizar la carrera:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar la carrera' }), { status: 500 });
  }
}