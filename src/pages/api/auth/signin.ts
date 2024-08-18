import type { APIRoute } from "astro";
import { supabase } from "@/lib/supabase";
import { turso } from "@/turso";


export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return new Response("Correo electrónico y contraseña obligatorios", { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  console.log(formData);
  console.log(data.session);
  console.log(data.user);
  console.log(data.weakPassword);

  const { access_token, refresh_token } = data.session;
  cookies.set("sb-access-token", access_token, {
    path: "/",
  });
  cookies.set("sb-refresh-token", refresh_token, {
    path: "/",
  });

  // TODO: Asign ID to user in Turso if it doesn't exist

  return redirect("/myprofile");
};