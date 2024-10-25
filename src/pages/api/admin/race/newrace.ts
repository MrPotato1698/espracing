import type { APIRoute } from 'astro';
import { supabase } from '@/db/supabase';
import { createRaceData } from "@/lib/results/resultConverter";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const racename = url.searchParams.get('racename');
  const champID = url.searchParams.get('champID');
  const numrace = url.searchParams.get('numrace');
  const pointsystem = url.searchParams.get('pointsystem');
  const filename = url.searchParams.get('filename');
  const fileContent = url.searchParams.get('fileContent');

  if (!racename || !champID || !numrace || !pointsystem || !filename || !fileContent) {
    return new Response(JSON.stringify({ error: 'Faltan parámetros requeridos' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    const json = JSON.parse(fileContent);
    const transformedJson = createRaceData(json);

    const { data, error } = await supabase.storage
      .from('results')
      .upload(`${filename}`, JSON.stringify(transformedJson), {
        contentType: 'application/json',
      });

    if (error) throw error;

    const { data: getLastRace } = await supabase
      .from('race')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .single();

    const lastRaceID = getLastRace ? (getLastRace.id + 1) : 1;

    const { data: insertData, error: insertError } = await supabase
      .from('race')
      .insert({
        id: lastRaceID,
        name: racename,
        filename: filename,
        championship: Number(champID),
        orderinchamp: Number(numrace),
        pointsystem: Number(pointsystem),
      });

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true, message: 'Carrera creada con éxito' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    return new Response(JSON.stringify({ error: 'Error al procesar la solicitud' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};