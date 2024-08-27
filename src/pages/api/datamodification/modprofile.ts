import type { APIRoute } from "astro";
import { turso } from "@/turso";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const name = formData.get("name")?.toString();
  const steam_id = formData.get("steam_id")?.toString();
  const id = formData.get("id")?.toString();
  const races = formData.get("races")?.toString();
  const wins = formData.get("wins")?.toString();
  const poles = formData.get("poles")?.toString();
  const podiums = formData.get("podiums")?.toString();
  const top5 = formData.get("top5")?.toString();
  const top10 = formData.get("top10")?.toString();
  const flaps = formData.get("flaps")?.toString();
  const dnf = formData.get("dnf")?.toString();

  if (!id) {
    return new Response("Id is required", { status: 400 });
  }

  if (!name || !steam_id || !races || !wins || !poles || !podiums || !top5 || !top10 || !flaps || !dnf) {
    return new Response("Todos los campos tienen que estar rellenos", { status: 400 });
  }

  await turso.execute({
    sql: "UPDATE User SET name = ?, steam_id = ?, races = ?, wins = ?, poles = ?, podiums = ?, top5 = ?, top10 = ?, flaps = ?, dnf = ? WHERE id = ?",
    args: [name, steam_id, races, wins, poles, podiums, top5, top10, flaps, dnf, id],
  });

  return redirect("/myprofile");
};