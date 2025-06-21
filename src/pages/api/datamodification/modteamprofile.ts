import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const name = formData.get("name")?.toString();
  const description = formData.get("description")?.toString();
  const id = formData.get("team_id")?.toString();


  if (!id) {
    return new Response("Id is required", { status: 400 });
  }

  if (!name || !description ) {
    return new Response("Todos los campos tienen que estar rellenos", { status: 400 });
  }

  const {data: updateData, error: errorUpdateData} = await supabase
  .from('team')
  .update({name: name, description: description})
  .eq('id', Number(id));

  if(errorUpdateData) {
    return new Response(
      JSON.stringify({ error: "Error al actualizar el equipo" }),
      { status: 500 }
    );
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200 }
  );
};