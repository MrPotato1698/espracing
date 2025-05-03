import React, { useEffect, useState } from 'react';
import { supabase } from "@/db/supabase";
import { showToast } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Combobox } from "@/components/ui/combobox";
import MultiSelect from "@/components/ui/multiselect";
import { FilePlus2, Trophy } from 'lucide-react';

export default function NewChamp() {
  // Estados para pestañas
  const [activeTab, setActiveTab] = useState<string>('addChamp');

  // Estados para campeonatos/eventos
  const [championships, setChampionships] = useState<{ id: number, name: string | null, isfinished: boolean, number_of_races_total: number }[]>([]);
  const [races, setRaces] = useState<{ id: number, championship: number }[]>([]);
  // Estados para coches y clases
  const [cars, setCars] = useState<{ id: number, model: string | null, class: number, brand: { id: number, name: string | null } | null }[]>([]);
  const [carClasses, setCarClasses] = useState<{ id: number, name: string | null }[]>([]);
  // Estados para coches y clases filtrados por campeonato seleccionado
  const [champCars, setChampCars] = useState<{ id: number, model: string | null, class: number, brand: { id: number, name: string | null } | null }[]>([]);
  const [champClasses, setChampClasses] = useState<{ id: number, name: string | null }[]>([]);

  // Estados para formulario de campeón
  const [selectedChamp, setSelectedChamp] = useState("");
  const [isTeam, setIsTeam] = useState(false);
  const [winnerName, setWinnerName] = useState("");
  const [selectedCar, setSelectedCar] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedCars, setSelectedCars] = useState<string[]>([]);

  // Estado para el switch de evento/campeonato
  const [champORevent, setChampORevent] = useState(false);

  // Mensajes
  const [errorMsg, setErrorMsg] = useState<string|null>(null);
  const [successMsg, setSuccessMsg] = useState<string|null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      const { data: champs } = await supabase
        .from("championship")
        .select("id, name, isfinished, number_of_races_total")
        .order("id", { ascending: true });
      setChampionships(champs || []);

      // Traer también la marca (brand) para mostrar brand.name + model
      const { data: carsData } = await supabase
        .from("car")
        .select("id, model, class, brand:brand(id, name)")
        .order("id", { ascending: true });
      setCars(carsData || []);

      const { data: classesData } = await supabase
        .from("carclass")
        .select("id, name")
        .order("id", { ascending: true });
      setCarClasses(classesData || []);

      // Traer todas las carreras para filtrar campeonatos finalizados correctamente
      const { data: racesData } = await supabase
        .from("race")
        .select("id, championship");
      setRaces(racesData || []);
    };
    fetchData();
  }, []);

  // Cargar coches y clases del campeonato seleccionado
  useEffect(() => {
    const fetchChampCarsAndClasses = async () => {
      if (!selectedChamp) {
        setChampCars([]);
        setChampClasses([]);
        return;
      }
      // Obtener los coches asociados al campeonato
      const { data: champCarsRows } = await supabase
        .from("championshipcars")
        .select("car")
        .eq("championship", Number(selectedChamp));
      if (!champCarsRows) {
        setChampCars([]);
        setChampClasses([]);
        return;
      }
      const champCarIds = champCarsRows.map(row => row.car);
      // Filtrar los coches globales
      const filteredCars = cars.filter(car => champCarIds.includes(car.id));
      setChampCars(filteredCars);
      // Obtener las clases únicas de esos coches
      const classIds = Array.from(new Set(filteredCars.map(car => car.class)));
      const filteredClasses = carClasses.filter(cl => classIds.includes(cl.id));
      setChampClasses(filteredClasses);
    };
    fetchChampCarsAndClasses();
  }, [selectedChamp, cars, carClasses]);

  // Helper: Obtener nuevo ID de champwinner
  const getNewChampWinnerID = async () => {
    const { data: getLastChampWinner } = await supabase
        .from('champwinners')
        .select('id')
        .order('id', { ascending: true });

      if(getLastChampWinner?.length === 0) return 1;

      let findID = false;
      let i = 1;
      if (!getLastChampWinner) throw new Error("Error al obtener el último ID de ganador de campeonato");
      while (!findID && i < getLastChampWinner.length) {
        if (getLastChampWinner[i - 1].id === i) {
          i++;
        } else {
          findID = true;
        }
      }
      if (!findID) i++;
      return getLastChampWinner ? i : 1;
  };

  const insertChampion = async (lastID: number, winnerName: string, isTeam: boolean, carId: number | null, classId: number | null, selectedChamp: number) =>{
    const { error } = await supabase.from('champwinners').insert({
      id: lastID,
      winner: winnerName,
      isTeam: isTeam,
      car_name: carId,
      category: classId,
      championship: Number(selectedChamp)
    });
    if (error) throw error;
  };

  const isTeamWinner = (isTeam: boolean, carId: number | null) =>{
    if (isTeam) {
      return {
        carId: null,
        classId: Number(selectedClass),
      }
    } else {
      const car = cars.find(c => c.id === carId);
      return {
        carId: Number(selectedCar),
        classId: car ? car.class : null
      }
    }
  };

  // Handler submit campeón de campeonato
  const handleSubmitWinner = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (!selectedChamp || !winnerName || (!isTeam && !selectedCar) || (isTeam && !selectedClass)) {
        setErrorMsg("Por favor, completa todos los campos obligatorios.");
        return;
      }
      const lastID = await getNewChampWinnerID();

      const { carId: carIdResult, classId: classIdResult } = isTeamWinner(isTeam, Number(selectedCar));

      await insertChampion(lastID, winnerName, isTeam, carIdResult, classIdResult, Number(selectedChamp));
      setSuccessMsg("Campeón añadido con éxito");
      showToast("Campeón añadido con éxito", "success");
      setWinnerName(""); setSelectedCar(""); setSelectedClass("");
    } catch (err: any) {
      setErrorMsg("Error al añadir campeón: " + (err?.message ?? err));
      showToast("Error al añadir campeón: " + (err?.message ?? err), "error");
    }
  };

  const getNewChampID = async () => {
      const { data: getLastChamp } = await supabase
        .from('championship')
        .select('id')
        .order('id', { ascending: true });

      if(getLastChamp?.length === 0) return 1;

      let findID = false;
      let i = 1;
      if (!getLastChamp) throw new Error("Error al obtener el último ID de campeonato");
      while (!findID && i < getLastChamp.length) {
        if (getLastChamp[i - 1].id === i) {
          i++;
        } else {
          findID = true;
        }
      }
      if (!findID) i++;
      return getLastChamp ? i : 1;
  };

  const insertChamp = async (lastID: number, champname: string, keySearchAPI: string, yearChamp: number, season: string, champORevent: boolean, numberTotalRaces: number) => {
    const { error } = await supabase.from('championship').insert({
      id: lastID,
      name: champname,
      key_search: keySearchAPI,
      year: yearChamp,
      season: season,
      number_of_races_total: Number(numberTotalRaces),
      ischampionship: champORevent,
      isfinished: false
    });
    if (error) throw error;
  };

  const formatSeason = (season: string) => {
    const seasonPart1 = '20' + season.slice(0, 2);
    const seasonPart2 = '20' + season.slice(2, 4);
    return `${seasonPart1}/${seasonPart2}`;
  }

  // Handler submit campeonato/evento
  const handleSubmitChamp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const form = document.getElementById("uploadChampForm") as HTMLFormElement;
      const formData = new FormData(form);
      const champname = formData.get('champname') as string;
      const keySearchAPI = formData.get('keySearchAPI') as string;
      const yearChamp = formData.get('yearChamp') as string;
      const season = formData.get('season') as string;
      const numbertotalraces = formData.get('numbertotalraces') as string;
      if (!champname || !yearChamp || !season || !numbertotalraces) {
        setErrorMsg("Por favor, completa todos los campos obligatorios.");
        return;
      }

      const lastID = await getNewChampID();
      const formattedSeason = season === '0' ? '0' : formatSeason(season);
      await insertChamp(lastID, champname, keySearchAPI, Number(yearChamp), formattedSeason, champORevent, Number(numbertotalraces));
      // Insertar coches en championshipcars
      if (selectedCars.length > 0) {
        const champId = lastID;
        const carRows = selectedCars.map(carId => ({ championship: champId, car: Number(carId) }));
        await supabase.from('championshipcars').insert(carRows);
      }

      setSuccessMsg("Campeonato/Evento añadido con éxito");
      showToast("Campeonato/Evento añadido con éxito", "success");
      form.reset();
      setSelectedCars([]);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      setErrorMsg("Error al añadir campeonato: " + (err?.message ?? err));
      showToast("Error al añadir campeonato: " + (err?.message ?? err), "error");
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="addChamp" className="flex items-center gap-2">
          <FilePlus2 className="h-4 w-4" />
          Añadir Nuevo Campeonato
        </TabsTrigger>
        <TabsTrigger value="addWinner" className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          Añadir Campeón
        </TabsTrigger>
      </TabsList>
      <TabsContent value="addChamp">
        <p className="text-5xl font-bold border-b border-primary w-fit mx-auto">
          Añadir Campeonato/Evento Nuevo
        </p>
        <div className="box-border p-5 m-auto bg-darkPrimary rounded-md max-w-screen-2xl border border-primary">
          <form id="uploadChampForm" onSubmit={handleSubmitChamp}>
            <label className="text-lightPrimary text-lg font-medium" htmlFor="champname">
              Nombre del campeonato/evento
            </label>
            <input
              className="w-full p-3 border border-solid border-lightSecond rounded-md mt-2 mb-4 resize-y text-white bg-darkSecond hover:border-primary"
              type="text"
              id="champname"
              name="champname"
              placeholder="Campeonato X en cualquier sitio..."
              required
            />
            <label className="text-lightPrimary text-lg font-medium" htmlFor="keySearchAPI">
              Keysearch del campeonato/evento (sentencia para buscar el campeonato en la API del servidor)
            </label>
            <input
              className="w-full p-3 border border-solid border-lightSecond rounded-md mt-2 mb-4 resize-y text-white bg-darkSecond hover:border-primary"
              type="text"
              id="keySearchAPI"
              name="keySearchAPI"
              placeholder="+car_filename_1 +car_filename_2 +RACE"
            />
            <label className="text-lightPrimary text-lg font-medium" htmlFor="yearChamp">
              Año de inicio del campeonato/evento
            </label>
            <input
              className="w-full p-3 border border-solid border-lightSecond rounded-md mt-2 mb-4 resize-y text-white bg-darkSecond hover:border-primary"
              type="number"
              id="yearChamp"
              name="yearChamp"
              step="1"
              min="2000"
              placeholder="2020"
              required
            />
            <label className="text-lightPrimary text-lg font-medium" htmlFor="season">
              Temporada a la que pertenece
            </label>
            <select
              className="w-full p-3 border border-solid border-lightSecond rounded-md mt-2 mb-4 resize-y text-white bg-darkSecond hover:border-primary"
              id="season"
              name="season"
              required
            >
              <option value="2021">2020/2021</option>
              <option value="2122">2021/2022</option>
              <option value="2223">2022/2023</option>
              <option value="2324">2023/2024</option>
              <option value="2425">2024/2025</option>
              <option value="2526">2025/2026</option>
              <option value="2627">2026/2027</option>
              <option value="0">Sin Temporada / Otra</option>
            </select>
            <label className="text-lightPrimary text-lg font-medium" htmlFor="numbertotalraces">
              Número de carreras totales del campeonato/evento
            </label>
            <input
              className="w-full p-3 border border-solid border-lightSecond rounded-md mt-2 mb-4 resize-y text-white bg-darkSecond hover:border-primary"
              type="number"
              step="1"
              min="1"
              max="32760"
              id="numbertotalraces"
              name="numbertotalraces"
              placeholder="4"
              required
            />
            <label className="text-lightPrimary text-lg font-medium" htmlFor="carsChamp">
              Selecciona los coches que participan en el campeonato
            </label>
            <MultiSelect
              options={cars
                .slice()
                .sort((a, b) => {
                  const nameA = `${a.brand?.name ?? ''} ${a.model ?? ''}`.trim().toLowerCase();
                  const nameB = `${b.brand?.name ?? ''} ${b.model ?? ''}`.trim().toLowerCase();
                  return nameA.localeCompare(nameB);
                })
                .map(car => ({ label: `${car.brand?.name ?? ''} ${car.model ?? ''}`.trim(), value: car.id.toString() }))}
              values={selectedCars}
              onChange={setSelectedCars}
              placeholder="Selecciona uno o varios coches..."
              searchPlaceholder="Buscar..."
              emptyMessage="No se encontraron resultados."
            />
            <div className="mb-4">
              <label className="text-lightPrimary text-lg font-medium" htmlFor="champORevent">
                ¿Es un evento suelto o un campeonato completo?
              </label>
              <div className="flex items-center gap-2 mt-2">
                <label className="relative inline-flex cursor-pointer">
                  <input id="champORevent" name="champORevent" type="checkbox" className="sr-only peer" checked={champORevent} onChange={e => setChampORevent(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary dark:peer-focus:ring-primary dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
                <span className="text-lightPrimary text-sm font-medium">
                  {champORevent ? "Campeonato completo" : "Evento Suelto"}
                </span>
              </div>
            </div>
            {errorMsg && <div className="text-red-500 font-semibold mb-2">{errorMsg}</div>}
            {successMsg && <div className="text-green-500 font-semibold mb-2">{successMsg}</div>}
            <input
              className="bg-primary text-white font-bold py-3 px-5 border-solid border-primary border-2 rounded-md hover:bg-darkSecond hover:text-lightPrimary mt-4"
              type="submit"
              value="Enviar"
            />
          </form>
        </div>
      </TabsContent>
      <TabsContent value="addWinner">
        <p className="text-5xl font-bold border-b border-primary w-fit mx-auto">
          Añadir Campeón
        </p>
        <div className="box-border p-5 m-auto bg-darkPrimary rounded-md max-w-screen-2xl border border-primary">
          <form id="uploadWinnerForm" onSubmit={handleSubmitWinner}>
            <label className="text-lightPrimary text-lg font-medium" htmlFor="championship">
              Selecciona el campeonato/evento
            </label>
            <Combobox
              options={championships
                .filter(champ => {
                  if (!champ.isfinished) return false;
                  const numRaces = races.filter(r => r.championship === champ.id).length;
                  return numRaces === champ.number_of_races_total;
                })
                .map(c => ({ label: c.name ?? '', value: c.id.toString() }))}
              value={selectedChamp}
              onValueChange={setSelectedChamp}
              placeholder="Selecciona un campeonato..."
              searchPlaceholder="Buscar..."
              emptyMessage="No se encontraron resultados."
            />
            <input type="hidden" name="championship" value={selectedChamp} />
            <div className="flex items-center gap-2 mt-4 mb-4">
              <label className="relative inline-flex cursor-pointer">
                <input id="isTeam" name="isTeam" type="checkbox" className="sr-only peer" checked={isTeam} onChange={e => setIsTeam(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary dark:peer-focus:ring-primary dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
              <span className="text-lightPrimary text-sm font-medium">
                {isTeam ? "Equipo" : "Piloto"}
              </span>
            </div>
            <label className="text-lightPrimary text-lg font-medium" htmlFor="winnerName">
              Nombre del ganador
            </label>
            <input
              className="w-full p-3 border border-solid border-lightSecond rounded-md mt-2 mb-4 resize-y text-white bg-darkSecond hover:border-primary"
              type="text"
              id="winnerName"
              name="winnerName"
              value={winnerName}
              onChange={e => setWinnerName(e.target.value)}
              placeholder={isTeam ? "Nombre del equipo ganador" : "Nombre del piloto ganador"}
              required
            />
            {!isTeam ? (
              <>
                <label className="text-lightPrimary text-lg font-medium" htmlFor="car">
                  Coche con el que ganó
                </label>
                <Combobox
                  options={champCars
                    .slice()
                    .sort((a, b) => {
                      const nameA = `${a.brand?.name ?? ''} ${a.model ?? ''}`.trim().toLowerCase();
                      const nameB = `${b.brand?.name ?? ''} ${b.model ?? ''}`.trim().toLowerCase();
                      return nameA.localeCompare(nameB);
                    })
                    .map(car => ({ label: `${car.brand?.name ?? ''} ${car.model ?? ''}`.trim(), value: car.id.toString() }))
                  }
                  value={selectedCar}
                  onValueChange={setSelectedCar}
                  placeholder="Selecciona un coche..."
                  searchPlaceholder="Buscar..."
                  emptyMessage="No se encontraron resultados."
                />
                <input type="hidden" name="car" value={selectedCar} />
              </>
            ) : (
              <>
                <label className="text-lightPrimary text-lg font-medium" htmlFor="class">
                  Clase de coche
                </label>
                <Combobox
                  options={champClasses.map(cl => ({ label: cl.name ?? `Clase ${cl.id}`, value: cl.id.toString() }))}
                  value={selectedClass}
                  onValueChange={setSelectedClass}
                  placeholder="Selecciona una clase..."
                  searchPlaceholder="Buscar..."
                  emptyMessage="No se encontraron resultados."
                />
                <input type="hidden" name="class" value={selectedClass} />
              </>
            )}
            {errorMsg && <div className="text-red-500 font-semibold mb-2">{errorMsg}</div>}
            {successMsg && <div className="text-green-500 font-semibold mb-2">{successMsg}</div>}
            <input
              className="bg-primary text-white font-bold py-3 px-5 border-solid border-primary border-2 rounded-md hover:bg-darkSecond hover:text-lightPrimary mt-4"
              type="submit"
              value="Añadir"
            />
          </form>
        </div>
      </TabsContent>
    </Tabs>
  );
}
