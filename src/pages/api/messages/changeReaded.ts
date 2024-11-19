import type { APIRoute } from "astro";
import {supabase} from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {

  const { action, id } = await request.json();
  if(!id) {
    return new Response("Id is required", { status: 400 });
  }

  const {data: ReadedData} = await supabase
    .from('message')
    .select('readed')
    .eq('id', id)
    .single();

    if(ReadedData?.readed){
      const {data: updateData} = await supabase
        .from('message')
        .update({readed: false})
        .eq('id', id);
    }else{
      const {data: updateData} = await supabase
        .from('message')
        .update({readed: true})
        .eq('id', id);
    }

  return new Response("Mensaje cambio de estado", { status: 200 });
};