import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const keyData = formData.get('keyData');
  const valueData = formData.get('valueData');

  if (!keyData || typeof keyData !== 'string') {
    return new Response(JSON.stringify({ error: 'Clave de ajuste no proporcionada o inválida' }), { status: 400 });
  }

  try {
    let updateData: any = {};
    if (valueData) updateData.value = valueData;

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('global_adjust')
        .update(updateData)
        .eq('key', keyData);

      if (updateError) throw updateError;
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error al actualizar el ajuste:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar el ajuste' }), { status: 500 });
  }
}