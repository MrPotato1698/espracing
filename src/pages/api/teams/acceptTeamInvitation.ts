import type { APIRoute } from "astro";
import {supabase} from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {

  const { action, id } = await request.json();
  if(!id) {
    return new Response("Id is required", { status: 400 });
  }

  const {data: ReadedData} = await supabase
    .from('teamsapplication')
    .select('user_application, team_requesting')
    .eq('id', id)
    .single();

    console.log('Readed Data: ',ReadedData);

    if (ReadedData) {
      const {data: updateData} = await supabase
        .from('profiles')
        .update({team: ReadedData.team_requesting})
        .eq('id', ReadedData.user_application.toString());

        console.log('updateData: ',updateData);

      const {data: deleteData} = await supabase
        .from('teamsapplication')
        .delete()
        .eq('id', id);

        console.log('Delete Data: ',deleteData);
    } else {
      console.log("ID de usuario no encontrado");
      return new Response("ID de usuario no encontrado", { status: 400 });
    }


  return new Response("Petición aceptada con éxito", { status: 200 });
};