import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const name = formData.get("name")?.toString();
  const steamId = formData.get("steam_id")?.toString();

  if (!email || !password) {
    return new Response("Correo electrónico y contraseña obligatorios", { status: 400 });
  }

  if (!name) {
    return new Response("Nombre obligatorio", { status: 400 });
  }

  if (!steamId) {
    return new Response("Steam ID obligatorio", { status: 400 });
  }

  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        email: email,
        avatar: 'img/user/default.webp',
        steam_id: steamId,
        roleesp: 4
      }
    }
  });

  if (signUpError) {
    return new Response(signUpError.message, { status: 500 });
  } else {
    return redirect("/");
  }
};