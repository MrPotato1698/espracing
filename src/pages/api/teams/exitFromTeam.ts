import type { APIRoute } from "astro";
import { turso } from "@/turso";


export const POST: APIRoute = async ({ request }) => {

  const { action, id } = await request.json();
  if(!id) {
    return new Response("Id is required", { status: 400 });
  }

  await turso.execute({
    sql: "UPDATE User SET Team = NULL, is_team_manager = 0 WHERE id = ?",
    args: [id],
  });

  return new Response("Piloto fuera de equipo con exito", { status: 200 });
};