import type { APIRoute } from "astro";
import { turso } from "@/turso";


export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();

  const team_id = formData.get('select_team')?.toString();
  const user_id = formData.get("user_id")?.toString();

  console.log('Team id: '+team_id);
  console.log('User id: '+user_id);

  if (!team_id || !user_id ) {
    return new Response("Error en la asignación de equipo, hay algún campo nulo.", { status: 400 });
  }

  await turso.execute({
    sql: "UPDATE User SET Team = ?, is_team_manager = 0 WHERE id = ?",
    args: [team_id, user_id],
  });

  return redirect("/myteam");
};