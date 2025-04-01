// src/pages/api/admin/race/addnote.ts
import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { race_id, type, description } = await request.json();

    if (!race_id || !type || !description) {
      return new Response(
        JSON.stringify({ error: "Faltan datos requeridos" }),
        { status: 400 }
      );
    }

    const { data: getLastRace } = await supabase
        .from('racenotes')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single();

      const lastRaceID = getLastRace ? (getLastRace.id + 1) : 1;

    const { data, error } = await supabase
      .from("racenotes")
      .insert({
        id: lastRaceID,
        race: race_id,
        code: type,
        description
      });

    if (error) {
      throw new Error(error.message);
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500 }
    );
  }
};