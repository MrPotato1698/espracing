import type { APIRoute } from "astro";
import { turso } from "@/turso";


export const POST: APIRoute = async ({ redirect, request }) => {

  const { action, id } = await request.json();
  if(!id) {
    return new Response("Id is required", { status: 400 });
  }
  await turso.execute({
    sql: "DELETE FROM Message WHERE id = ?",
    args: [id],
  });


  return redirect("/messageList");
};