import { supabase } from "@/db/supabase"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const posterName = url.searchParams.get("name")

    if (!posterName) {
      return new Response(JSON.stringify({ success: false, error: "Nombre del poster no proporcionado" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
    const { data } = supabase.storage
      .from("championshipposter")
      .getPublicUrl(posterName);

    if (!data?.publicUrl || data.publicUrl?.includes("null")) {
      return new Response("Poster no encontrado", { status: 404 })
    }

    // Comprobar realmente si el archivo existe con un HEAD
    const head = await fetch(data.publicUrl, { method: 'HEAD' });
    if (!head.ok) return new Response("Poster no encontrado", { status: 404 });

    return Response.redirect(data.publicUrl);
  } catch (error) {
    console.error("Error obteniendo el poster del campeonato:", error);
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}