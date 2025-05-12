import type { APIRoute } from 'astro';
import { supabase } from '@/db/supabase';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { lastRaceID, racename, champID, numrace, pointsystem, splits, race_data_1, race_data_2, race_date, filename } = body;

  const insertObj: any = {
    id: lastRaceID,
    name: racename,
    championship: champID,
    orderinchamp: numrace,
    pointsystem,
    splits,
    race_data_1,
    race_date,
    filename
  };
  if (race_data_2) insertObj.race_data_2 = race_data_2;

  const { error } = await supabase.from('race').insert([insertObj]);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
