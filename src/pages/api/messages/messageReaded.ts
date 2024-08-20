import type { APIRoute } from "astro";
import { turso } from "@/turso";


export const POST: APIRoute = async ({ request, redirect }) => {

  const formData = await request.formData();
  const id = formData.get("id")?.toString();
  if (id === null || id === undefined) {
    return new Response("Id is required", { status: 400 });
  }
  let { rows: ReadedData } = await turso.execute({
    sql: "SELECT readed FROM Message WHERE id = ?",
    args: [id],
  });

  if (ReadedData[0].readed === 0) {
    await turso.execute({
      sql: "UPDATE Message SET readed = 1 WHERE id = ?",
      args: [id],
    });
  }

  return redirect("/messageList");
};