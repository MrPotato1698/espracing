import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  const { user } = await request.json();

  if (!user) {
    return new Response("Usuario no proporcionado", { status: 400 });
  }
  try {
    // Iniciar la actualización de estadísticas en segundo plano
    if (user.user_metadata.needs_stats_update) {
      fetch("/api/admin/stats/newUserStats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      }).catch(console.error); // Manejamos el error aquí para no bloquear la respuesta
    }

    return new Response("Cuenta confirmada con éxito", { status: 200 });
  } catch (error) {
    console.error("Error en confirmAccount:", error);
    return new Response("Error interno del servidor", { status: 500 });
  }
};