import { supabase } from "@/db/supabase"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { championshipId, posterName } = data

    if (!championshipId) {
      return new Response(JSON.stringify({ success: false, error: "ID de campeonato no proporcionado" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
    const { error } = await supabase
      .from("championship")
      .update({ champ_img: posterName ?? null })
      .eq("id", championshipId);

    if (error) throw error

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error actualizando el poster del campeonato:", error)
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
