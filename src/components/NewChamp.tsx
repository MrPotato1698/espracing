import React, { useState } from 'react';
import { showToast } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Combobox } from "@/components/ui/combobox";
import MultiSelect from "@/components/ui/multiselect";
import { FilePlus2, Trophy } from 'lucide-react';

export default function NewChamp({ championships, cars, carClasses, races, championshipCars }: {
  readonly championships: any[] | null;
  readonly cars: any[] | null;
  readonly carClasses: any[] | null;
  readonly races: any[] | null;
  readonly championshipCars: any[] | null;
}) {
  // Estados para pestañas
  const [activeTab, setActiveTab] = useState<string>('addChamp');

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

  // Estado para el año introducido manualmente
  const [yearInput, setYearInput] = useState<string>("");

  // Calcular años mínimo y máximo para temporadas
  const champYears = (championships ?? []).map(c => c.year).filter(y => typeof y === 'number');
  let minYear: number, maxYear: number;
  if (champYears.length > 0) {
    minYear = Math.min(...champYears);
    maxYear = Math.max(...champYears);
  } else if (yearInput && !isNaN(Number(yearInput))) {
    minYear = Number(yearInput);
    maxYear = Number(yearInput);
  } else {
    minYear = 2020;
    maxYear = 2020;
  }
  // Generar temporadas dinámicamente
  const seasonOptions = [];
  for (let y = minYear - 2; y <= maxYear + 1; y++) {
    const start = y.toString().slice(-2);
    const end = (y + 1).toString().slice(-2);
    seasonOptions.push({
      label: `${y}/${y + 1}`,
      value: `${start}${end}`
    });
  }

  // Cargar coches y clases del campeonato seleccionado
  React.useEffect(() => {
    if (!selectedChamp) {
      setChampCars([]);
      setChampClasses([]);
      return;
    }
    // Filtrar los coches asociados al campeonato usando championshipCars
    const champCarsRows = championshipCars?.filter(row => row.championship === Number(selectedChamp));
    if (!champCarsRows) {
      setChampCars([]);
      setChampClasses([]);
      return;
    }
    const champCarIds = champCarsRows.map(row => row.car);
    const filteredCars = cars?.filter(car => champCarIds.includes(car.id));
    setChampCars(filteredCars || []);
    const classIds = Array.from(new Set(filteredCars?.map(car => car.class)));
    const filteredClasses = carClasses?.filter(cl => classIds.includes(cl.id));
    setChampClasses(filteredClasses || []);
  }, [selectedChamp, cars, carClasses, championshipCars]);

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
      // Llamada a la API champwinner
      const response = await fetch('/api/admin/champwinner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winner: winnerName,
          isTeam,
          carId: isTeam ? null : Number(selectedCar),
          classId: isTeam ? Number(selectedClass) : (cars?.find(c => c.id === Number(selectedCar))?.class ?? null),
          championship: Number(selectedChamp)
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Error desconocido');
      setSuccessMsg("Campeón añadido con éxito");
      showToast("Campeón añadido con éxito", "success");
      setWinnerName(""); setSelectedCar(""); setSelectedClass("");
    } catch (err: any) {
      setErrorMsg("Error al añadir campeón: " + (err?.message ?? err));
      showToast("Error al añadir campeón: " + (err?.message ?? err), "error");
    }
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
      const yearChamp = formData.get('yearChamp') as string;
      const season = formData.get('season') as string;
      const numbertotalraces = formData.get('numbertotalraces') as string;
      if (!champname || !yearChamp || !season || !numbertotalraces) {
        setErrorMsg("Por favor, completa todos los campos obligatorios.");
        return;
      }
      // Validación: el año debe estar dentro de la temporada seleccionada (si no es '0')
      if (season !== '0') {
        const seasonStart = 2000 + parseInt(season.slice(0, 2));
        const seasonEnd = 2000 + parseInt(season.slice(2, 4));
        const yearNum = Number(yearChamp);
        if (yearNum !== seasonStart && yearNum !== seasonEnd) {
          setErrorMsg(`El año de inicio debe coincidir con alguno de los años de la temporada seleccionada (${seasonStart}/${seasonEnd}).`);
          return;
        }
      }
      const formattedSeason = season === '0' ? '0' : formatSeason(season);
      // Llamada a la API championship
      const response = await fetch('/api/admin/championship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: champname,
          year: Number(yearChamp),
          season: formattedSeason,
          number_of_races_total: Number(numbertotalraces),
          ischampionship: champORevent,
          cars: selectedCars.map(id => Number(id))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Error desconocido');
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
              value={yearInput}
              onChange={e => setYearInput(e.target.value)}
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
              <option value="0">Sin Temporada / Otra</option>
              {seasonOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
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
              options={(cars ?? [])
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
              options={(championships ?? [])
                .filter(champ => {
                  if (!champ.isfinished) return false;
                  const numRaces = races?.filter(r => r.championship === champ.id).length;
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
