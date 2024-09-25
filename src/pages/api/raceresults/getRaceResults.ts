import type { APIRoute } from "astro";
import { app } from "@/lib/firebase/server";
import { getFirestore } from "firebase-admin/firestore";
import { createRaceData } from "@/lib/results/resultConverter";
import type { RaceData } from "@/types/Results";


export const GET: APIRoute = async ({ request }) => {
  let finaldata:RaceData = {} as RaceData;

  const url = new URL(request.url);
  const raceId = url.searchParams.get('race');
  const collection = 'Results';
  //console.log('API called with query: ', raceId);

  if (!raceId) {
    return new Response(JSON.stringify({ error: 'El nombre del fichero es obligatorio' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    const db = getFirestore(app);
    //console.log('DB: ',db);

    const projectID = "esp-racing-46042";
    const apiKey = "AIzaSyBWOMmdgzvgwmwjt64M1Qhw8ArWstcsFXE";
    const baseURL = `https://firestore.googleapis.com/v1/projects/${projectID}/databases/(default)/documents/`;

    // const raceresultRef = db.collection(collection);
    // console.log('RaceResultRef: ',raceresultRef);
    // const querySnapshot = await raceresultRef.doc(raceId).get();
    // console.log('QuerySnapshot: ',querySnapshot);
    // //const querySnapshot = await raceresultRef.where('raceId', '==', raceId).get();
    // const datos = querySnapshot.data();
    // console.log('Datos: ',datos);

    const response = await fetch(`${baseURL}${collection}/${raceId}?key=${apiKey}`);
    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Error al obtener los datos' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const datos = await response.json();
    let jsonData = null;
    // console.log('Datos: ', datos);
    // console.log('Datos Field: ', datos.fields);
    // console.log('Datos Field StringValue: ', datos.fields.URL.stringValue);

    try {
      const responseJSON = await fetch(datos.fields.URL.stringValue);
      if (!responseJSON.ok) {
        return new Response(JSON.stringify({ error: 'Error al obtener los datos' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      jsonData = await responseJSON.json();

      //console.log('Datos JSON: ', jsonData);

    } catch (error) {
      console.error('Error al descargar el archivo:', error);
      alert('Hubo un error al descargar el archivo. Por favor, intenta de nuevo.');
    }

    return new Response(JSON.stringify(jsonData), {
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