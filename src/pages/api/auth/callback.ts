import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const authCode = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/myprofile";

  console.log("Callback recibido con código:", authCode ? "Sí" : "No")

  if (!authCode) {
    console.error("No authorization code provided");
    return new Response("No code provided", { status: 400 });
  }
  try {
    console.log("Intercambiando código por sesión...")
    const { data, error } = await supabase.auth.exchangeCodeForSession(authCode)

    if (error) {
      console.error("Error exchanging code for session:", error)
      return redirect("/login?error=session_exchange_failed")
    }

    const { access_token, refresh_token, user } = data.session

    // Configurar cookies con opciones de seguridad
    cookies.set("sb-access-token", access_token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días
    })

    cookies.set("sb-refresh-token", refresh_token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 días
    })

    // Si el usuario viene de Google, obtenemos datos extra y actualizamos el perfil
    if (user?.app_metadata?.provider === "google" && user?.identities?.[0]?.identity_data) {
      try {
        // Verificar si ya existe un perfil
        const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", user.id).single()

        // Solo actualizar si no existe el perfil o si necesita actualización
        if (!existingProfile) {
          const googleAccessToken = user.identities[0].identity_data.access_token

          if (googleAccessToken) {
            const googleRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
              headers: {
                Authorization: `Bearer ${googleAccessToken}`,
                "User-Agent": "ESP-Racing-App/1.0",
              },
            });

            if (googleRes.ok) {
              const googleProfile = await googleRes.json();

              // Crear o actualizar el perfil en Supabase
              const { error: profileError } = await supabase.from("profiles")
                .update(
                  {
                    avatar: "https://tavjuyhbdqnkgsosdymq.supabase.co/storage/v1/object/public/avatars/default.webp",
                    full_name: googleProfile.name ?? user.user_metadata?.full_name,
                    email: user.email,
                    updated_at: new Date().toISOString(),
                  }
                )
                .eq("id", user.id);

              if (profileError) {
                console.error("Error updating profile:", profileError);
              }
            } else {
              console.warn("Failed to fetch Google profile:", googleRes.status);
            }
          }
        }
      } catch (profileError) {
        // Si falla, no interrumpe el login pero lo registramos
        console.error("Error updating Google profile in Supabase:", profileError);
      }
    }

    return redirect(next)
  } catch (error) {
    return redirect("login?error=Error al iniciar sesión");
  }
};