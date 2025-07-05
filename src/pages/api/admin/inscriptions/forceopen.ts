import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  const { id } = await request.json();
  if (!id) {
    return new Response(JSON.stringify({
      error: true,
      message: "Missing 'id' in request body",
    }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const { data: actualDates, error: actualDatesError } = await supabase
      .from('inscriptionscalendar')
      .select('inscriptions_open, inscriptions_close')
      .eq('id', id)
      .single();
    if (actualDatesError || !actualDates) {
      throw new Error(actualDatesError.message);
    }

    const now = new Date();
    const oldOpenDate = new Date(actualDates.inscriptions_open);
    const oldCloseDate = new Date(actualDates.inscriptions_close);
    const newOpenDate = new Date(now); // Un día antes
    const newCloseDate = new Date(now.getTime() + 1000 * 60 * 60 * 24); // Un día después

    // Actualizar las fechas de inscripción
    const { error: updateError } = await supabase
      .from('inscriptionscalendar')
      .update({
        inscriptions_open: newOpenDate.toISOString(),
        inscriptions_close: newCloseDate.toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      return new Response(
        JSON.stringify({
          error: true,
          message: "Error al actualizar las fechas de inscripción",
          details: updateError.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { data, error } = await supabase
      .functions.invoke('open-inscriptions', { body: { name: 'Functions' }, });
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

    // Volver a poner la fecha de inscripcion original
    const { error: revertError } = await supabase
      .from('inscriptionscalendar')
      .update({
        inscriptions_open: oldOpenDate.toISOString(),
        inscriptions_close: oldCloseDate.toISOString(),
      })
      .eq('id', id);

    if (revertError) {
      return new Response(
        JSON.stringify({
          error: true,
          message: "Error al revertir las fechas de inscripción",
          details: revertError.message,
        }),
        {
          status: 500,
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
