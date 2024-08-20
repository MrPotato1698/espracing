import type { APIRoute } from "astro";
import { turso } from "@/turso";


export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const name_emissor = formData.get("nameemissor")?.toString();
  const name_receiver = formData.get("contactwho")?.toString();
  const discord = formData.get("discord")?.toString();
  const region = formData.get("region")?.toString();
  const description = formData.get("description")?.toString();

  if (!name_emissor || !name_receiver || !discord || !region || !description) {
    return new Response("Todos los campos son obligatorios", { status: 400 });
  }

  await turso.execute({
    sql: 'INSERT INTO  Message (name_emissor, name_receiver, discord, region, description) VALUES ( ?, ?, ?,?, ?);',
    args: [name_emissor, name_receiver, discord, region, description],
  });

  return redirect("/");
};