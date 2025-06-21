import type { APIRoute } from "astro";
import { supabaseAdmin } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  const { id } = await request.json();
  if (!id) {
    return new Response("Id is required", { status: 400 });
  }

  // Obtener el perfil del piloto para saber si tiene avatar
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('avatar')
    .eq('id', id)
    .single();

  if (profileError) {
    return new Response("Error al obtener el perfil: " + profileError.message, { status: 500 });
  }

  // Si tiene avatar, eliminarlo del bucket
  if (profile?.avatar) {
    // Extraer el path relativo del archivo desde la URL pública
    const avatarRegex = /\/storage\/v1\/object\/public\/avatars\/(.+)$/;
    const match = avatarRegex.exec(profile.avatar);
    const avatarPath = match ? match[1] : null;
    if (avatarPath) {
      const { error: storageError } = await supabaseAdmin.storage.from('avatars').remove([avatarPath]);
      if (storageError) {
        return new Response("Error al eliminar el avatar: " + storageError.message, { status: 500 });
      }
    }
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) {
    return new Response("Error al eliminar el perfil: " + error.message , { status: 500 });
  }
  return new Response("Perfil eliminada con exito", { status: 200 });
}