import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase"

export const GET: APIRoute = async ({ request }) => {
  const { data, error } = await supabase
    .from("championship")
    .select("*")
    .order("id", { ascending: true });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, year, season, number_of_races_total, ischampionship, cars } = body;

    const { data: getLastChamp } = await supabase
      .from('championship')
      .select('id')
      .neq('id', 0)
      .order('id', { ascending: true });

    if(!getLastChamp) throw new Error("Error al obtener el último ID de campeonato");
    let findID = false;
    let i = 1;
    while (!findID && i < getLastChamp.length) {
      if (getLastChamp[i-1].id === i) {
        i++;
      } else {
        findID = true;
      }
    }
    if (!findID && getLastChamp[i-1].id === i) i++;
    const lastChampID = getLastChamp ? i : 1;

    const { error: insertError } = await supabase
      .from('championship')
      .insert({
        id: Number(lastChampID),
        name: name,
        year: Number(year),
        season: season,
        number_of_races_total: Number(number_of_races_total),
        ischampionship: ischampionship,
      });

    if (insertError) throw insertError;
    if (cars && cars.length > 0) {
      const carRows = cars.map((carId: number) => ({ championship: lastChampID, car: carId }));
      const { error: insertCarsError } = await supabase.from("championshipcars").insert(carRows);
      if (insertCarsError) throw insertCarsError;
    }
    return new Response(JSON.stringify({ success: true }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error al crear el coche:", error);
    return new Response(JSON.stringify({ error: "Error al crear el coche: " + error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const champ_id = formData.get('champ_id');
  const champ_name = formData.get('name');
  const yearChamp = formData.get('yearChamp');
  const season = formData.get('season') as string;
  const champORevent = formData.get('champORevent')  !== null;
  const numberTotalRaces = formData.get('numbertotalraces');
  const isfinished = formData.get('isFinished') !== null;

  if (!champ_id) {
    return new Response(JSON.stringify({ error: 'ID de campeonato no proporcionado' }), { status: 400 });
  }

  try {
    const updateData: any = {
      ...(champ_name && { name: champ_name }),
      ...(yearChamp && { year: Number(yearChamp) }),
      ...(season && { season: season }),
      ischampionship: champORevent,
      ...(numberTotalRaces && { number_of_races_total: Number(numberTotalRaces) }),
      isfinished: isfinished
    };

    const { error: updateError } = await supabase
      .from('championship')
      .update(updateData)
      .eq('id', Number(champ_id));

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error al actualizar el campeonato:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar el campeonato' }), { status: 500 });
  }
}

export const DELETE: APIRoute = async ({ request, cookies }) => {
  const { id } = await request.json();
  if (!id) {
    return new Response("Id es requerido", { status: 400 });
  }

  const { data: championship, error: getError } = await supabase
    .from("championship")
    .select("champ_img")
    .eq("id", id)
    .single();

  if (getError) throw getError;

  if (championship?.champ_img) {
    // Siempre eliminamos usando la ruta 'poster_{id}.webp'
    const posterPath = `poster_${id}.webp`;
    const { error: deleteStorageError } = await supabase.storage
      .from("championshipposter")
      .remove([posterPath]);

    if (deleteStorageError) {
      console.error("Error eliminado el poster del campeonato:", deleteStorageError);
    }
  }

  const { error: errorDeleteData } = await supabase
    .from('championship')
    .delete()
    .eq('id', id)
    .select();

  if (errorDeleteData) {
    console.error("Error al eliminar el campeonato:", errorDeleteData);
    return new Response("Error al eliminar el campeonato", { status: 500 });
  }
  return new Response("Campeonato eliminada con exito", { status: 200 });
}