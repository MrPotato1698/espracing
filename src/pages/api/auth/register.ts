import type { APIRoute } from "astro";
import { supabase } from "@/lib/supabase";
import { turso } from "@/turso";

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

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  const transaction = await turso.transaction("write");
  await transaction.execute({
    sql: `INSERT INTO User (email, name, steam_id, role) VALUES (?, ?, ?, ?)`,
    args: [email, name, steamId, 4],
  });

  await transaction.commit();

  return redirect("/");
};