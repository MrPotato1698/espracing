import type { APIRoute } from 'astro';
import { turso } from '@/turso';

import { createRaceData } from '@/lib/results/resultConverter';

import type { RaceData } from '@/types/Results';

/* *************************** */

export const GET: APIRoute = async ({ request }) => {
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
    async function fetchRaceResults() {
      try {
        const promises = races.map(async (race) => {
          // Construye una URL absoluta
          const apiUrl = new URL(`/api/raceresults/getRaceResults?race=${race.filename}`, url.origin);
          const response = await fetch(apiUrl);
          if (!response.ok) {
            console.error('Error al obtener los datos de la carrera: ', response.status, response.statusText);
            return;
          }
          const datosRAW = await response.json();
          return createRaceData(datosRAW);
        });
        return await Promise.all(promises);
      } catch (error) {
        console.error('Error obteniendo resultados de la carrera: ', error);
      }
    }

    const raceData = await fetchRaceResults();

    return new Response(JSON.stringify({ raceData }), {
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