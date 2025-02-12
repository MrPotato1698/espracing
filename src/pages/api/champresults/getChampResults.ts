import type { APIRoute } from 'astro';
import { supabase } from '@/db/supabase';

import type { RaceData } from '@/types/Results';
import type { ChampRacesData } from '@/types/Utils';
import type { Points } from '@/types/Points';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const championshipId = url.searchParams.get('champ');

    if (!championshipId) {
      return new Response(JSON.stringify({ error: 'ID de campeonato no proporcionado' }), {status: 400});
    }

    const { data: racesFromChamp, error: errorRacesFromChamp } = await supabase
      .from('race')
      .select('id, pointsystem!inner(name, points, fastestlap), race_data_1, race_data_2')
      .eq('championship', Number(championshipId))
      .order('orderinchamp', { ascending: true });


    if (errorRacesFromChamp) throw errorRacesFromChamp;

    const champRacesData: ChampRacesData[] = await Promise.all(
      racesFromChamp.map(async (race) => {
        let pointsSystem: Points;
        try {
          pointsSystem = {
            Name: race.pointsystem.name,
            Puntuation: race.pointsystem.points.split(',').map((point) => parseInt(point)),
            FastestLap: race.pointsystem.fastestlap
          };
        } catch (e) {
          console.error(`Error procesando puntos para carrera ${race.id}:`, e);
          pointsSystem = {
            Name: race.pointsystem.name,
            Puntuation: [],
            FastestLap: 0
          };
        }

        let raceData1: RaceData | null = null;
        let raceData2: RaceData | null = null;

        if (race.race_data_1) {
          try {
            const { data: raceFileData } = await supabase.storage
              .from('results')
              .download(race.race_data_1);

            if (raceFileData) {
              const text = await raceFileData.text();
              raceData1 = JSON.parse(text);
            }
          } catch (e) {
            console.error(`Error obteniendo datos de carrera 1 ${race.id}:`, e);
          }
        }
        if(race.race_data_2)
          try {
            const { data: raceFileData } = await supabase.storage
              .from('results')
              .download(race.race_data_2);

            if (raceFileData) {
              const text = await raceFileData.text();
              raceData2 = JSON.parse(text);
            }
          } catch (e) {
            console.error(`Error obteniendo datos de carrera 2 ${race.id}:`, e);
          }

        return {
          points: pointsSystem,
          raceData1: raceData1,
          raceData2: raceData2
        };
      })
    );

    return new Response(JSON.stringify({champRacesData, success: true}), {status: 200, headers: { 'Content-Type': 'application/json' }
  });

  } catch (error) {
    console.error('Error detallado:', error);
    return new Response(JSON.stringify({
      error: 'Error procesando resultados del campeonato',
      details: error instanceof Error ? error.message : String(error)
    }), { status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
};