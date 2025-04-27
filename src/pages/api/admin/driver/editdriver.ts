import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();

  const driver_idValue = formData.get("driver_id");
  const driver_id = typeof driver_idValue === "string" ? driver_idValue : undefined;
  const full_name = formData.get("name");
  const steam_id = formData.get("location");


  if (!driver_id) {
    return new Response(
      JSON.stringify({ error: "ID de carrera no proporcionado" }),
      { status: 400 }
    );
  }

  try {
      const updateData: any = {
        ...(full_name && { full_name: full_name }),
        ...(steam_id && { steam_id: steam_id }),
      };

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", driver_id);

        if (updateError) throw updateError;
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error al actualizar el piloto:", error);
    return new Response( JSON.stringify({ error: "Error al actualizar el piloto" }),{ status: 500 });
  }
};