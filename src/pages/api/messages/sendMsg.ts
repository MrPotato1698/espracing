import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";


export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const name_emissor = formData.get("nameemissor")?.toString();
  const name_receiver = formData.get("contactwho")?.toString();
  const discord = formData.get("discord")?.toString();
  const region = formData.get("region")?.toString();
  const description = formData.get("description")?.toString();

  if (!name_emissor || !name_receiver || !discord || !region || !description) {
    return new Response("Todos los campos son obligatorios", { status: 400 });
  }

  const {data: UserIDbyEmail} = await supabase
    .from('profiles')
    .select('id')
    .eq('email', name_receiver)
    .single();

  const { data: lastIDMessage } = await supabase
    .from('message')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  const lastMessageID = lastIDMessage ? (lastIDMessage.id + 1) : 1;

  const { data: insertData, error: insertError } = await supabase
    .from('message')
    .insert({
      id: Number(lastMessageID),
      name_emissor: name_emissor,
      name_receiver: UserIDbyEmail?.id,
      discord: discord,
      region: region,
      description: description,
      readed: false,
    });
  if (insertError) throw insertError;

  return redirect("/");
};