import type { APIRoute } from 'astro';
import { supabase } from '@/db/supabase';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { lastNoteID, racename, description, penalty, noteCode } = body;

  const { error } = await supabase.from('racenotes').insert([
    {
      id: lastNoteID,
      race: racename,
      description,
      penalty,
      code: noteCode
    }
  ]);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
