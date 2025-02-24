import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { userId, isTeamManager } = await request.json();

    console.log('userId:', userId);
    console.log('isTeamManager:', isTeamManager);

    const { data, error } = await supabase
      .from('profiles')
      .update({ is_team_manager: isTeamManager })
      .eq('id', userId)
      .select('*')
      .single();

    console.log('Piloto: ',  data?.full_name, ' es manager de equipo:', data?.is_team_manager);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response( JSON.stringify({error: error instanceof Error ? error.message : 'Error desconocido'}),
      {status: 500, headers: {"Content-Type": "application/json"}}
    );
  }
};