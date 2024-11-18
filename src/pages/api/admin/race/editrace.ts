import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";
import { createRaceData } from "@/lib/results/resultConverter";

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const race_id = formData.get('race_id');
  const name = formData.get('name');
  const orderChamp = formData.get('orderChamp');
  const champID = formData.get('champID');
  const pointsystem = formData.get('pointsystem');
  const fileInput = formData.get('fileInput') as File | null;

  if (!race_id) {
    return new Response(JSON.stringify({ error: 'ID de carrera no proporcionado' }), { status: 400 });
  }

  try {
    let updateData: any = {};
    if (name) updateData.name = name;
    if (orderChamp) updateData.orderinchamp = Number(orderChamp);
    if (champID) updateData.championship = Number(champID);
    if (pointsystem) updateData.pointsystem = Number(pointsystem);

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('race')
        .update(updateData)
        .eq('id', race_id);

      if (updateError) throw updateError;
    }

    if (fileInput && fileInput.size > 0) {
      const content = await fileInput.text();
      const json = JSON.parse(content);
      const transformedJson = createRaceData(json);

      const { data: raceData } = await supabase
        .from('race')
        .select('filename')
        .eq('id', race_id)
        .single();

      if (raceData && raceData.filename) {
        const { error: storageError } = await supabase.storage
          .from('results')
          .update(raceData.filename, JSON.stringify(transformedJson), {
            contentType: 'application/json',
          });

        if (storageError) throw storageError;
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error al actualizar la carrera:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar la carrera' }), { status: 500 });
  }
}