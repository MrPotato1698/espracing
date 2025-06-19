import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase"

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData()
  const emailRaw = formData.get("email")
  const passwordRaw = formData.get("password")
  const nameRaw = formData.get("name")
  const steamIdRaw = formData.get("steam_id")

  const email = typeof emailRaw === "string" ? emailRaw : ""
  const password = typeof passwordRaw === "string" ? passwordRaw : ""
  const name = typeof nameRaw === "string" ? nameRaw : ""
  const steamId = typeof steamIdRaw === "string" ? steamIdRaw : ""

  if (!email || !password) {
    return new Response("Correo electrónico y contraseña obligatorios", { status: 400 })
  }

  if (!name) {
    return new Response("Nombre obligatorio", { status: 400 })
  }

  if (!steamId) {
    return new Response("Steam ID obligatorio", { status: 400 })
  }

  try {
  const { data: user, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        email: email,
        avatar: 'img/user/default.webp',
        steam_id: steamId
      }
    }
  });

  if (signUpError) {
    console.error("Error en signUp:", signUpError)
    return new Response(signUpError.message, { status: 500 })
  }

  // Verificar si el perfil se creó correctamente
  if (!user.user?.id) {
    return new Response("Error: User ID not found", { status: 400 })
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.user.id)
    .single()

  if (profileError) {
    console.error("Error al verificar el perfil:", profileError)
    return new Response("Error al verificar el perfil del usuario: "+ profileError.message, { status: 500 })
  }

  return redirect("/")
} catch (error) {
  console.error("Error inesperado:", error)
  return new Response("Error inesperado al registrar usuario: "+ error, { status: 500 })
}
}