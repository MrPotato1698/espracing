import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { id } = await request.json();
    if (!id) {
      return new Response("Id es requerido", { status: 400 });
    }
    const { error: deleteError } = await supabase
      .from("circuit")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw new Error(`Fallo al eliminar circuito: ${deleteError.message}`);
    }
    return new Response(JSON.stringify({ message: "Circuito y variantes eliminados con éxito" }), { status: 200 })
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
    });
  }
};
