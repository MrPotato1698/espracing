import type { APIRoute } from "astro";
import {supabase} from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {

  const { action, id } = await request.json();
  if(!id) {
    return new Response("Id is required", { status: 400 });
  }

  const {data: deleteData} = await supabase
    .from('message')
    .delete()
    .eq('id', id);

  return new Response("Mensaje eliminado con exito", { status: 200 });
};