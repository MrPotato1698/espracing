import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase"

export const GET: APIRoute = async ({ request }) => {
  try {
    const { data, error: getListError } = await supabase.rpc("get_point_system_with_race_count");

    if (getListError) throw getListError;

    return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error('Error al leer el sistema de puntos:', error);
    return new Response(JSON.stringify({ error: 'Error al leer el sistema de puntos' }), { status: 500 });
  }
};


export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { name, points, fastestlap } = body

    const { data: getLastPS } = await supabase
        .from('pointsystem')
        .select('id')
        .order('id', { ascending: true });


      if(!getLastPS) throw new Error("Error al obtener el último ID de Sistema de Puntos");
      let findID = false;
      let i = 1;
      const getLastPSfix = getLastPS.slice(1, getLastPS.length); // Exclude the first element (ID 0)
      while (!findID && i < getLastPSfix.length) {
        if (getLastPSfix[i-1].id === i) {
          i++;
        } else {
          findID = true;
        }
      }
      if (!findID) i++;
      const lastPSID = getLastPSfix ? i : 1;

    const { data, error } = await supabase
      .from("pointsystem")
      .insert([{ id: lastPSID, name, points, fastestlap }])
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error in POST /api/admin/pointsystem:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { id, name, points, fastestlap, isSpecial } = body

    // Si es el sistema especial (ID = 0), solo actualizar el nombre
    const updateData = isSpecial ? { name } : { name, points, fastestlap }

    const { data, error } = await supabase.from("pointsystem")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error in PUT /api/admin/pointsystem:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { id } = body

    // No permitir eliminar el sistema especial
    if (id === 0) {
      return new Response(JSON.stringify({ error: "No puedes eliminar el sistema para eventos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { error } = await supabase.from("pointsystem").delete().eq("id", id)

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error in DELETE /api/admin/pointsystem:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
