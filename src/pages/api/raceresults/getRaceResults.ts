import type { APIRoute } from "astro";
import { app } from "@/lib/firebase/server";
import { getFirestore } from "firebase-admin/firestore";

export const get: APIRoute = async ({ params, request }) => {
  console.log('API called with query: ', params);

  const url = new URL(request.url);
  const raceId = url.searchParams.get('race');

  console.log('Log 1');

  if (!raceId) {
    return new Response(JSON.stringify({ error: 'El nombre del fichero es obligatorio' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  console.log('Log 2');

  try {
    const db = getFirestore(app);
    console.log('Log 1 Dentro de Try');
    const raceresultRef = db.collection('ESPRacingRaceResults');
    console.log('Log 2 dentro de Try');
    const querySnapshot = await raceresultRef.doc(raceId).get();
    const datos = querySnapshot.data();

    return new Response(JSON.stringify(datos), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.log('Log ERROR: ' + error);
    console.error(error);
    return new Response(JSON.stringify({ error: 'Error al obtener los datos' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}