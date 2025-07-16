import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase";

// Actualizar visibilidad de la normativa secundaria
export const PUT: APIRoute = async ({ request }) => {
  const { isVisible, userId } = await request.json();
  if (typeof isVisible !== "boolean" || !userId) {
    return new Response(JSON.stringify({ error: "Datos inválidos" }), { status: 400 });
  }
  try {
    const { error } = await supabase
      .from("racerules")
      .update({
        isVisible,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq("id", 2);
    if (error) {
      throw error;
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error al actualizar la visibilidad:", error);
    return new Response(JSON.stringify({ error: "Error al actualizar la visibilidad" }), { status: 500 });
  }
};

// Intercambiar normativas principal y secundaria
export const POST: APIRoute = async ({ request }) => {
  const { userId, isVisible } = await request.json();
  if (!userId || typeof isVisible !== "boolean") {
    return new Response(JSON.stringify({ error: "Datos inválidos" }), { status: 400 });
  }
  try {
    const { data: normativas, error: fetchError } = await supabase
      .from("racerules")
      .select("*")
      .in("id", [1, 2]);
    if (fetchError || !normativas || normativas.length !== 2) {
      throw fetchError || new Error("No se encontraron ambas normativas");
    }
    const primary = normativas.find((n: any) => n.id === 1);
    const secondary = normativas.find((n: any) => n.id === 2);
    if (!primary || !secondary) {
      throw new Error("No se encontraron ambas normativas");
    }
    await supabase.from("racerules").delete().in("id", [1, 2]);
    await supabase.from("racerules").upsert([
      {
        id: 1,
        content: secondary.content,
        championship: secondary.championship,
        isVisible: true,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      },
      {
        id: 2,
        content: primary.content,
        championship: primary.championship,
        isVisible,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      },
    ]);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error al intercambiar las normativas:", error);
    return new Response(JSON.stringify({ error: "Error al intercambiar las normativas" }), { status: 500 });
  }
};

// Actualizar contenido de una normativa
export const PATCH: APIRoute = async ({ request }) => {
  const { normativaId, content, championship, userId } = await request.json();
  if (!normativaId || !userId) {
    return new Response(JSON.stringify({ error: "Datos inválidos" }), { status: 400 });
  }
  try {
    const { error } = await supabase
      .from("racerules")
      .update({
        content,
        championship,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq("id", normativaId);
    if (error) throw error;
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error al guardar los cambios:", error);
    return new Response(JSON.stringify({ error: "Error al guardar los cambios" }), { status: 500 });
  }
};