import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { id } = await request.json();
    if (!id) {
      return new Response(JSON.stringify({ error: "Id es requerido" }), { status: 400 });
    }
    const { error: deleteError } = await supabase
      .from("circuit")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return new Response(JSON.stringify({ error: `Fallo al eliminar circuito: ${deleteError.message}` }), { status: 500 });
    }
    return new Response(JSON.stringify({ message: "Circuito y variantes eliminados con éxito" }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
