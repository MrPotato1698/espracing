import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase";

export const PUT: APIRoute = async ({ request }) => {
  try {
    const { champId, carIds } = await request.json();
    if (!champId || !Array.isArray(carIds)) {
      return new Response(JSON.stringify({ error: 'Datos inválidos' }), { status: 400 });
    }
    // Eliminar todos los coches actuales del campeonato
    await supabase.from("championshipcars").delete().eq("championship", champId);
    // Insertar los nuevos coches
    if (carIds.length > 0) {
      const carRows = carIds.map((carId: number) => ({ championship: champId, car: carId }));
      const { error: insertError } = await supabase.from("championshipcars").insert(carRows);
      if (insertError) {
        return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
      }
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error al actualizar el equipo:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar el equipo' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  const { id } = await request.json();
  if (!id) {
    return new Response("Id is required", { status: 400 });
  }
  const { error } = await supabase
    .from('championshipcars')
    .delete()
    .eq('id', id);
  if (error) {
    return new Response("Error al eliminar el coche del campeonato: " + error.message , { status: 500 });
  }
  return new Response("Coche del campeonato eliminado con exito", { status: 200 });
}