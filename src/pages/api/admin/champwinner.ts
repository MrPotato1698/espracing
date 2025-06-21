import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const GET: APIRoute = async ({ request }) => {
  const { data, error } = await supabase
    .from("champwinners")
    .select("*, category!inner(*), car_name!inner(*), championship!inner(*)")
    .order("id", { ascending: true });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { winner, isTeam, carId, classId, championship } = body;
    if (!winner || championship == null) {
      return new Response(JSON.stringify({ error: "Faltan datos obligatorios" }), { status: 400 });
    }
    // Obtener nuevo ID
    const { data: getLastChampWinner } = await supabase
      .from('champwinners')
      .select('id')
      .neq('id', 0)
      .order('id', { ascending: true });
    let newId = 1;
    if (getLastChampWinner && getLastChampWinner.length > 0) {
      let findID = false;
      let i = 1;
      while (!findID && i < getLastChampWinner.length) {
        if (getLastChampWinner[i - 1].id === i) {
          i++;
        } else {
          findID = true;
        }
      }
      if (!findID) i++;
      newId = i;
    }
    const { error } = await supabase.from('champwinners').insert({
      id: newId,
      winner,
      isTeam,
      car_name: carId,
      category: classId,
      championship
    });
    if (error) throw error;
    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error al crear el campeón: " + error }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  const { id } = await request.json();
  if (!id) {
    return new Response("Id es requerido", { status: 400 });
  }

  const { error: errorDeleteData } = await supabase
    .from('champwinners')
    .delete()
    .eq('id', id)
    .select();

  if (errorDeleteData) {
    console.error("Error al eliminar al campeón:", errorDeleteData);
    return new Response("Error al eliminar al campeón", { status: 500 });
  }
  return new Response("Campeón eliminada con exito", { status: 200 });
}
