import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  if (action === "list") {
    try {
      const { data, error } = await supabase.rpc("get_car_classes_with_model_count");
      if (error) throw error;
      return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (error) {
      console.error('Error fetching car classes:', error);
      return new Response(JSON.stringify({ error: "Error al obtener las clases" }), { status: 500 });
    }
  }
  if (action === "nextid") {
    const { data: lastClass } = await supabase
      .from('carclass')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .single();
    const nextId = lastClass ? lastClass.id + 1 : 1;
    return new Response(JSON.stringify({ nextId }), { status: 200 });
  }
  return new Response(JSON.stringify({ error: "Acción no soportada" }), { status: 400 });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, name, short_name, class_design } = body;
    if (!name || !short_name || !class_design) {
      return new Response(JSON.stringify({ error: "Faltan datos obligatorios" }), { status: 400 });
    }
    const { error } = await supabase.from('carclass').insert({
      id,
      name,
      short_name,
      class_design
    });
    if (error) throw error;
    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (error) {
    console.error('Error creating car class:', error);
    return new Response(JSON.stringify({ error: "Error al crear la clase" }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) {
      return new Response(JSON.stringify({ error: "ID de clase es obligatorio" }), { status: 400 });
    }
    // Verificar si tiene coches asociados
    const { data: carCount } = await supabase
      .from("car")
      .select("id", { count: 'exact' })
      .eq("class", id);
    if (carCount && carCount.length > 0) {
      return new Response(JSON.stringify({
        error: `No se puede eliminar esta clase porque tiene ${carCount.length} modelo${carCount.length > 1 ? 's' : ''} asociado${carCount.length > 1 ? 's' : ''}. Elimina primero los modelos de esta clase.`
      }), { status: 400 });
    }
    const { error: deleteError } = await supabase
      .from("carclass")
      .delete()
      .eq("id", id);
    if (deleteError) throw deleteError;
    return new Response(JSON.stringify({ message: "Clase eliminada correctamente" }), { status: 200 });
  } catch (error) {
    console.error('Error deleting car class:', error);
    return new Response(JSON.stringify({ error: "Error al eliminar la clase" }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    console.log('PUT /api/admin/carclass body:', body);
    const { id, name, short_name, class_design } = body;
    if (!id || !name || !short_name || !class_design) {
      return new Response(JSON.stringify({ error: "Faltan datos obligatorios", body }), { status: 400 });
    }
    const { error } = await supabase
      .from('carclass')
      .update({ name, short_name, class_design })
      .eq('id', id);
    if (error) throw error;
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error updating car class:', error);
    return new Response(JSON.stringify({ error: "Error al actualizar la clase" }), { status: 500 });
  }
};
