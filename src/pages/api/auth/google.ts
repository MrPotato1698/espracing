import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase"

export const GET: APIRoute = async ({ redirect, url }) => {
  // Obtener la URL base correcta
  const baseUrl = url.origin // Esto será https://espracing.vercel.app en producción
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${baseUrl}/api/auth/callback`, // URL completa y correcta
      scopes: "https://www.googleapis.com/auth/userinfo.email",
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  })

  if (error) {
    console.error("Error al iniciar OAuth:", error)
    return redirect("/login?error=oauth_error")
  }

  return redirect(data.url)
}
