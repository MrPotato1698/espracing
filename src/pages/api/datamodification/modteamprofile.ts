import type { APIRoute } from "astro";
import { turso } from "@/turso";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const name = formData.get("name")?.toString();
  const description = formData.get("description")?.toString();
  const id = formData.get("team_id")?.toString();


  if (!id) {
    return new Response("Id is required", { status: 400 });
  }

  if (!name || !description ) {
    return new Response("Todos los campos tienen que estar rellenos", { status: 400 });
  }

  await turso.execute({
    sql: "UPDATE Team SET name = ?, description = ? WHERE id = ?",
    args: [name, description, id],
  });

  return redirect("/myteam");
};