import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase"

export const POST: APIRoute = async ({ request, cookies }) => {
  const formData = await request.formData()
  const emailValue = formData.get("email")
  const passwordValue = formData.get("password")

  const email = typeof emailValue === "string" ? emailValue : undefined
  const password = typeof passwordValue === "string" ? passwordValue : undefined

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Correo electrónico y contraseña obligatorios" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return new Response(JSON.stringify({ error: "Credenciales incorrectas" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { access_token, refresh_token } = data.session

  cookies.set("sb-access-token", access_token, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  })
  cookies.set("sb-refresh-token", refresh_token, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  })

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
