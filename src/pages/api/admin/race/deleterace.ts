import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  const { id } = await request.json();
  if (!id) {
    return new Response("Id is required", { status: 400 });
  }

  const { data: RaceDataSearch, error: RaceDataSearchError } = await supabase
    .from('race')
    .select('race_data_1, race_data_2')
    .eq('id', id)
    .single();

  if (RaceDataSearchError || !RaceDataSearch) throw RaceDataSearchError;

  const pathR1 = RaceDataSearch.race_data_1 ?? '';
  console.log('Path R1:', pathR1);

  const { data: removeRaceR1, error: ErrorRemoveRaceR1 } = await supabase
    .storage
    .from('results')
    .remove([pathR1]);

  if (ErrorRemoveRaceR1 || !removeRaceR1) throw ErrorRemoveRaceR1;


  let pathR2 = '';
  if (RaceDataSearch.race_data_2 !== null) {
    pathR2 = RaceDataSearch.race_data_2?.replace('results/', '') ?? '';
    const { data: removeRaceR2, error: ErrorRemoveRaceR2 } = await supabase
      .storage
      .from('results')
      .remove([pathR2]);

    if (ErrorRemoveRaceR2 || !removeRaceR2) throw ErrorRemoveRaceR2;
  }

  const { error } = await supabase
    .from('race')
    .delete()
    .eq('id', id);
  return new Response("Carrera eliminada con exito", { status: 200 });
}
