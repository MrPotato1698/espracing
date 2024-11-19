import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {

  const formData = await request.formData();
  const id = formData.get("id")?.toString();
  if (id === null || id === undefined) {
    return new Response("Id is required", { status: 400 });
  }

  const {data: ReadedData} = await supabase
  .from('message')
  .select('readed')
  .eq('id', id)
  .single();

  if(ReadedData?.readed === false){
    const {data: updateData} = await supabase
      .from('message')
      .update({readed: true})
      .eq('id', id);
  }

  return redirect("/messageList");
};