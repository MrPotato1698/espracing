import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase"

export const GET: APIRoute = async () => {
  const { data, error } = await supabase
    .from("inscriptionscalendar")
    .select("*, championship:championship(id, name)")
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
    const { name, championship, order, inscriptions_open, inscriptions_close, url_time } = body;
        const { data: getLastCalendarInscription } = await supabase
      .from('inscriptionscalendar')
      .select('id')
      .order('id', { ascending: true });

    if(!getLastCalendarInscription) throw new Error("Error al obtener el último ID de la ultima fecha de inscripción");

    let lastCalendarInscriptionID = 1;
    if( getLastCalendarInscription.length > 0) {
      let findID = false;
      let i = 1;
      while (!findID && i < getLastCalendarInscription.length) {
        if (getLastCalendarInscription[i-1].id === i) {
          i++;
        } else {
          findID = true;
        }
      }
      if (!findID && getLastCalendarInscription[i-1].id === i) i++;
      lastCalendarInscriptionID = getLastCalendarInscription ? i : 1;
    }

    const { data, error } = await supabase
      .from("inscriptionscalendar")
      .insert([{ id: lastCalendarInscriptionID, name, championship, order, inscriptions_open, inscriptions_close, url_time }])
      .select()
      .single();
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    const { data, error } = await supabase
      .from("inscriptionscalendar")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("PUT /api/admin/inscriptionscalendar error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id } = body;
    const { error } = await supabase.from("inscriptionscalendar").delete().eq("id", id);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("DELETE /api/admin/inscriptionscalendar error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
