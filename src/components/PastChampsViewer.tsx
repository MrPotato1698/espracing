import React, { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';

interface Championship {
  id: number;
  name: string | null;
  year: number;
  ischampionship: boolean | null;
  champ_img: string | null;
  isfinished?: boolean;
  number_of_races_total?: number;
}

interface ChampionshipWithImgUrl extends Championship {
  imgUrl?: string;
  isCancelled?: boolean;
  numRaces?: number;
}

interface Race {
  id: number;
  name: string | null;
  orderinchamp: number;
  race_date: string;
  championship: number;
}

interface ChampWinner {
  id: number;
  isTeam: boolean;
  winner: string;
  car_name: number | null;
  category: number | null;
}

interface Car {
  id: number;
  model: string | null;
}

interface CarClass {
  id: number;
  name: string | null;
  short_name: string | null;
}

interface PastChampsViewerProps {
  years: number[];
}

const PastChampsViewer: React.FC<PastChampsViewerProps> = ({ years }) => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [champs, setChamps] = useState<ChampionshipWithImgUrl[]>([]);
  const [races, setRaces] = useState<Record<number, Race[]>>({});
  const [winners, setWinners] = useState<Record<number, ChampWinner[]>>({});
  const [cars, setCars] = useState<Record<number, Car>>({});
  const [carClasses, setCarClasses] = useState<Record<number, CarClass>>({});

  const fetchData = async () => {
    if (!selectedYear) return;
    setLoading(true);
    // Obtener campeonatos y eventos del año
    const { data: championships } = await supabase
      .from('championship')
      .select('*')
      .eq('year', selectedYear)
      .eq('isactive', true)
      .order('ischampionship', { ascending: false })
      .order('id');
    if (!championships) {
      setChamps([]);
      setLoading(false);
      return;
    }
    // Obtener carreras de todos los campeonatos
    const champIds = championships.map((c: any) => c.id);
    const { data: allRaces } = await supabase
      .from('race')
      .select('*')
      .in('championship', champIds);
    const racesByChamp: Record<number, Race[]> = {};
    if (allRaces) {
      allRaces.forEach((r: any) => {
        if (!racesByChamp[r.championship]) racesByChamp[r.championship] = [];
        racesByChamp[r.championship].push(r);
      });
      Object.keys(racesByChamp).forEach(cid => {
        racesByChamp[Number(cid)].sort((a, b) => a.orderinchamp - b.orderinchamp);
      });
    }
    setRaces(racesByChamp);
    // Filtrar campeonatos finalizados sin carreras
    const champsWithImgUrl = championships
      .filter((champ: any) => {
        if (champ.isfinished && (!racesByChamp[champ.id] || racesByChamp[champ.id].length === 0)) {
          return false;
        }
        return true;
      })
      .map((champ: any) => {
        let imgUrl = undefined;
        if (champ.champ_img) {
          const { data } = supabase.storage.from('championshipposter').getPublicUrl(champ.champ_img);
          imgUrl = data?.publicUrl;
        }
        // Calcular si está cancelado
        const numRaces = racesByChamp[champ.id]?.length || 0;
        const isCancelled = champ.isfinished && numRaces < champ.number_of_races_total;
        return { ...champ, imgUrl, isCancelled, numRaces };
      });
    setChamps(champsWithImgUrl);
    // Obtener ganadores
    const { data: allWinners } = await supabase
      .from('champwinners')
      .select('*')
      .in('championship', champIds);
    const winnersByChamp: Record<number, ChampWinner[]> = {};
    if (allWinners) {
      allWinners.forEach((w: any) => {
        if (!winnersByChamp[w.championship]) winnersByChamp[w.championship] = [];
        winnersByChamp[w.championship].push(w);
      });
    }
    setWinners(winnersByChamp);
    // Obtener coches y categorías si hace falta
    const carIds = allWinners?.map((w: any) => w.car_name).filter((id: number | null) => id !== null) || [];
    if (carIds.length > 0) {
      const { data: carData } = await supabase
        .from('car')
        .select('id,model')
        .in('id', carIds);
      const carMap: Record<number, Car> = {};
      carData?.forEach((c: any) => { carMap[c.id] = c; });
      setCars(carMap);
    }
    const catIds = allWinners?.map((w: any) => w.category).filter((id: number | null) => id !== null) || [];
    if (catIds.length > 0) {
      const { data: catData } = await supabase
        .from('carclass')
        .select('id,name,short_name')
        .in('id', catIds);
      const catMap: Record<number, CarClass> = {};
      catData?.forEach((c: any) => { catMap[c.id] = c; });
      setCarClasses(catMap);
    }
    setLoading(false);
  };

  return (
    <div className="w-11/12 mx-auto p-6 bg-darkPrimary rounded-lg border border-primary shadow-lg mt-8">
      <h2 className="text-5xl font-bold text-lightPrimary mb-6 text-center border-b border-primary pb-2">El Pasado de ESP Racing</h2>
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8 justify-center">
        <select
          className="p-3 rounded-md border border-lightSecond bg-darkSecond text-lightPrimary focus:border-primary focus:outline-none min-w-[280px]"
          value={selectedYear ?? ''}
          onChange={e => setSelectedYear(Number(e.target.value))}
        >
          <option value='' disabled>Selecciona un año</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <button
          onClick={fetchData}
          disabled={!selectedYear || loading}
          className="bg-primary text-white font-bold py-2 px-6 rounded-md border-2 border-primary hover:bg-darkSecond hover:text-lightPrimary transition-colors disabled:opacity-60"
        >
          Mostrar Año
        </button>
      </div>
      {loading && <div className="text-center text-lg text-lightSecond">Cargando...</div>}
      {!loading && champs.length > 0 && (
        <div className="space-y-10">
          {/* Carreras (Campeonatos) */}
          <h3 className="text-3xl font-bold text-lightPrimary mb-4 mt-8 text-center">Carreras</h3>
          {champs.filter(c => c.ischampionship).length === 0 && (
            <div className="text-lightSecond mb-8">No hay campeonatos para este año.</div>
          )}
          {champs.filter(c => c.ischampionship).map(champ => (
            <div key={champ.id} className="border-2 border-primary rounded-lg bg-darkSecond p-6 shadow-md flex flex-col md:flex-row gap-6 items-start">
              {champ.imgUrl && (
                <img src={champ.imgUrl} alt={champ.name ?? ''} className="max-w-xs w-full rounded-md mb-4 md:mb-0 mx-auto border border-primary md:mx-0" />
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-lightPrimary mb-2">
                  {champ.name}
                  {champ.isCancelled && (
                    <span className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded align-middle">CANCELADO</span>
                  )}
                  {!champ.isfinished && (
                    <span className="ml-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded align-middle">En Proceso</span>
                  )}
                  {champ.isfinished && !champ.isCancelled && (
                    <span className="ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded align-middle">Finalizado</span>
                  )}
                </h3>
                <div className="mb-2">
                  <span className="font-semibold text-lightPrimary">Carreras:</span>
                  <ul className="list-disc ml-6 mt-1">
                    {(races[champ.id] || []).map((race, idx) => (
                      <li key={race.id} className="text-lightSecond">
                        {`R${idx + 1}: ${race.name ?? 'Sin nombre'} `}
                        <span className="text-xs text-primary">({new Date(race.race_date).toLocaleDateString()})</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-semibold text-lightPrimary">Campeones:</span>
                  <ul className="list-disc ml-6 mt-1">
                    {champ.isCancelled ? (
                      <li className="text-lightSecond">Campeonato cancelado. No tiene campeones.</li>
                    ) : !champ.isfinished ? (
                      <li className="text-lightSecond">Campeonato activo. Campeones aun por decidir.</li>
                    ) : champ.isfinished && (!winners[champ.id] || winners[champ.id].length === 0) ? (
                      <li className="text-lightSecond">Campeonato finalizado. Campeones del campeonato aun por decidir</li>
                    ) : (
                      (winners[champ.id] || []).map(w => (
                        <li key={w.id} className="text-lightSecond">
                          {w.isTeam
                            ? <>Campeón de equipos: <b className="text-lightPrimary">{w.winner}</b></>
                            : <>Campeón por pilotos: <b className="text-lightPrimary">{w.winner}</b>{w.car_name && cars[w.car_name] ? ` (Coche: ${cars[w.car_name].model})` : ''}</>
                          }
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ))}
          {/* Eventos */}
          <h3 className="text-3xl font-bold text-lightPrimary mb-4 mt-12 text-center">Eventos</h3>
          {champs.filter(c => !c.ischampionship).length === 0 && (
            <div className="text-lightSecond mb-8">No hay eventos para este año.</div>
          )}
          {champs.filter(c => !c.ischampionship).map(event => (
            <div key={event.id} className="border-2 border-primary rounded-lg bg-darkSecond p-6 shadow-md flex flex-col md:flex-row gap-6 items-start">
              {event.imgUrl && (
                <img src={event.imgUrl} alt={event.name ?? ''} className="max-w-xs w-full rounded-md mb-4 md:mb-0 mx-auto border border-primary md:mx-0" />
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-lightPrimary mb-2">
                  {event.name}
                  {event.isCancelled && (
                    <span className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded align-middle">CANCELADO</span>
                  )}
                  {!event.isfinished && (
                    <span className="ml-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded align-middle">En Proceso</span>
                  )}
                  {event.isfinished && !event.isCancelled && (
                    <span className="ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded align-middle">Finalizado</span>
                  )}
                </h3>
                <div className="mb-2">
                  <span className="font-semibold text-lightPrimary">Carrera:</span>
                  <ul className="list-disc ml-6 mt-1">
                    {(races[event.id] || []).map((race, idx) => (
                      <li key={race.id} className="text-lightSecond">
                        {`R${idx + 1}: ${race.name ?? 'Sin nombre'} `}
                        <span className="text-xs text-primary">({new Date(race.race_date).toLocaleDateString()})</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-semibold text-lightPrimary">Ganadores:</span>
                  <ul className="list-disc ml-6 mt-1">
                    {(winners[event.id] || []).map(w => (
                      <li key={w.id} className="text-lightSecond">
                        {w.isTeam
                          ? <>Campeón de equipos: <b className="text-lightPrimary">{w.winner}</b>{w.category && carClasses[w.category] ? ` (Categoría: ${carClasses[w.category].name})` : ''}</>
                          : <>Campeón por pilotos: <b className="text-lightPrimary">{w.winner}</b>{w.car_name && cars[w.car_name] ? ` (Coche: ${cars[w.car_name].model}` : ''}{w.category && carClasses[w.category] ? ` - Categoría: ${carClasses[w.category].name})` : ''}</>
                        }
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PastChampsViewer;
