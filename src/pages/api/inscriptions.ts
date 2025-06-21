import type { APIRoute } from 'astro';
import { supabase } from '@/db/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { userId, raceName, position, validLaps, car } = body;
    if (!userId || !raceName || !position || !validLaps || !car) {
      return new Response(JSON.stringify({ error: 'Faltan campos obligatorios.' }), { status: 400 });
    }

    // Asignar id único incremental (como en carbrand.ts)
    const { data: allInscriptions } = await supabase
      .from('inscription')
      .select('id')
      .order('id', { ascending: true });
    let findID = false;
    let i = 1;
    if (allInscriptions && allInscriptions.length > 0) {
      while (!findID && i < allInscriptions.length) {
        if (allInscriptions[i-1].id === i) {
          i++;
        } else {
          findID = true;
        }
      }
      if (!findID) i++;
    }
    const newInscriptionId = i;

    // Insertar inscripción
    const { error: insertError } = await supabase
      .from('inscription')
      .insert([
        {
          id: newInscriptionId,
          profile: userId,
          race: raceName, // Guardar el nombre tal cual
          car: car, // Ya es el id del coche
          position: Number(position),
          valid_laps: Number(validLaps),
        }
      ]);
    if (insertError) {
      return new Response(JSON.stringify({ error: 'Error guardando inscripción.' }), { status: 500 });
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? 'Error inesperado.' }), { status: 500 });
  }
};
