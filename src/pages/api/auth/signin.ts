import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";
import type { Provider } from "@supabase/supabase-js";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");

  const email = typeof emailValue === "string" ? emailValue : undefined;
  const password = typeof passwordValue === "string" ? passwordValue : undefined;

  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: "Correo electrónico y contraseña obligatorios" }),
      { status: 400 }
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(
      JSON.stringify({ error: "Credenciales incorrectas" }),
      { status: 401 }
    );
  }

  const { access_token, refresh_token } = data.session;
  cookies.set("sb-access-token", access_token, { path: "/" });
  cookies.set("sb-refresh-token", refresh_token, { path: "/" });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};

export const GET: APIRoute = async ({ request, redirect }) => {
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider");
  const validProviders = ["google", "github", "apple"];

  if (provider && validProviders.includes(provider)) {
    const { data: signInOAuth, error: signInOAuthError } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: `espracing.vercel.app/api/auth/callback`,
      },
    });
    if (signInOAuthError) {
      return new Response(JSON.stringify({ error: signInOAuthError.message }), { status: 500 });
    }
    return redirect(signInOAuth.url);
  }
  return new Response("Provider inválido o no especificado", { status: 400 });
};