import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const GET: APIRoute = async ({ request }) => {
  try{
    const { data, error } = await supabase.functions.invoke('open-inscriptions', {body: { name: 'Functions' },});
    if (error) {
      return new Response(
        JSON.stringify({
          error: true,
          message: error.message ?? "Unknown error",
          details: error.details ?? null,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: true,
        message: "Error al abrir inscripciones",
        details: error?.message ?? String(error),
        stack: error?.stack ?? null,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
