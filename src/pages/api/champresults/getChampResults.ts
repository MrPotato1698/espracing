import type { APIRoute } from 'astro';
import { turso } from '@/turso';
import type { RaceData } from '@/types/Results';
import { createRaceData } from '@/lib/results/resultConverter';

/* *************************** */

export const all: APIRoute = async ({ request }) => {
  console.log('API getChampResults llamada');
  const url = new URL(request.url);
  const championshipId = url.searchParams.get('champ');

  if (!championshipId) {
    return new Response(JSON.stringify({ error: 'El nombre del fichero es obligatorio' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    // Obtener carreras del campeonato desde Turso
    const racesResult = await turso.execute(`SELECT filename FROM Race WHERE championship = ${championshipId}`,);
    const races = racesResult.rows;

    // Obtener resultados de carreras desde Firestore
    let raceData:RaceData[] = [];
    races.map(async (race) => {
      const response = await fetch(`/api/raceresults/getRaceResults?race=${race.filename}`);
      const datosRAW = await response.json();
      const datos: RaceData = createRaceData(datosRAW);
      raceData.push(datos);
    });
    console.log('raceData en API: '+raceData);

    return new Response(JSON.stringify({raceData}), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error obteniendo resultados de las carreras:', error);
    return new Response(JSON.stringify({ error: 'Error obteniendo resultados de las carreras' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};