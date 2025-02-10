import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();

  const race_id = formData.get("circuit_id");
  const name = formData.get("name");
  const location = formData.get("location");


  if (!race_id) {
    return new Response(
      JSON.stringify({ error: "ID de carrera no proporcionado" }),
      { status: 400 }
    );
  }

  try {
    console.log('Entra aquí, API Editar')
      const updateData: any = {
        ...(name && { name: name }),
        ...(location && { location: location }),
      };

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from("circuit")
          .update(updateData)
          .eq("id", Number(race_id));

        if (updateError) throw updateError;
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error al actualizar el circuito:", error);
    return new Response(
      JSON.stringify({ error: "Error al actualizar el circuito" }),
      { status: 500 }
    );
  }
};