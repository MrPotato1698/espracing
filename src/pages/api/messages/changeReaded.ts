import type { APIRoute } from "astro";
import { turso } from "@/turso";


export const POST: APIRoute = async ({ request }) => {

  const { action, id } = await request.json();
  if(!id) {
    return new Response("Id is required", { status: 400 });
  }
  let { rows: ReadedData } = await turso.execute({
    sql: "SELECT readed FROM Message WHERE id = ?",
    args: [id],
  });

  if(ReadedData[0].readed === 1){
    await turso.execute({
      sql: "UPDATE Message SET readed = 0 WHERE id = ?",
      args: [id],
    });
  }else{
    await turso.execute({
      sql: "UPDATE Message SET readed = 1 WHERE id = ?",
      args: [id],
    });
  }

  return new Response("Mensaje cambio de estado", { status: 200 });
};