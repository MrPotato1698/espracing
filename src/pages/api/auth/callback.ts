import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const authCode = url.searchParams.get("code");

  if (!authCode) {
    return new Response("No code provided", { status: 400 });
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);

  if (error) {
    console.error("Error exchanging code for session:", error);
    return new Response(error.message, { status: 500 });
  }

  const { access_token, refresh_token, user } = data.session;

  cookies.set("sb-access-token", access_token, {
    path: "/",
  });
  cookies.set("sb-refresh-token", refresh_token, {
    path: "/",
  });

  // Si el usuario viene de Google, obtenemos datos extra y actualizamos el perfil
  if (user?.app_metadata?.provider === "google" && user?.identities?.[0]?.identity_data) {
    const googleAccessToken = user.identities[0].identity_data.access_token;
    try {
      const googleRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${googleAccessToken}` }
      });
      if (googleRes.ok) {
        const googleProfile = await googleRes.json();
        // Actualizar el perfil en Supabase
        await supabase.from("profiles").update({
          avatar: "https://tavjuyhbdqnkgsosdymq.supabase.co/storage/v1/object/public/avatars//default.webp",
          full_name: googleProfile.name
        }).eq("id", user.id);
      }
    } catch (e) {
      // Si falla, no interrumpe el login
      console.error("Error updating Google profile in Supabase:", e);
    }
  }

  return redirect("/myprofile");
};