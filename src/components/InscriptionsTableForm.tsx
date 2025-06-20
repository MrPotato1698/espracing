import React, { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

interface InscriptionTimeRow {
  car: string;
  carInfo?: { brand: string; model: string; class: string };
  gap: number;
  date: string;
  laps: number;
  vMax: number;
  tyres: string;
  driver: string;
  bestLap: number;
  sectors: number[];
  position: number;
}

interface CarOption {
  id: number;
  brand: string;
  model: string;
  class: string;
  class_design: string;
}

interface InscriptionsTableFusionProps {
  inscriptionsOpen: boolean;
  isLoggedIn: boolean;
  userId?: string;
  userAlreadyInscribed: boolean;
  data: InscriptionTimeRow[];
  raceName: string;
  onLogin: () => void;
  cars: CarOption[]; // Nuevo prop: array de coches con id y nombre legible
}

function msToTime(ms: number) {
  if (!ms || ms === 0) return "-";
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  const mil = ms % 1000;
  return `${min}:${sec.toString().padStart(2, "0")}.${mil.toString().padStart(3, "0")}`;
}

export const InscriptionsTableFusion: React.FC<InscriptionsTableFusionProps> = ({
  inscriptionsOpen,
  isLoggedIn,
  userId,
  userAlreadyInscribed,
  data,
  raceName,
  onLogin,
  cars,
}) => {
  // Tabla
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15; // Cambiado a 15 pilotos por página

  // Formulario
  const [position, setPosition] = useState("");
  const [validLaps, setValidLaps] = useState("");
  const [selectedCar, setSelectedCar] = useState<number | null>(null);
  const [searchCar, setSearchCar] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Cálculo de mejores sectores y mejores coches
  const bestLap = useMemo(() => Math.min(...data.map(d => d.bestLap).filter(Boolean)), [data]);
  const bestSectors = useMemo(() => [0, 1, 2].map(i => Math.min(...data.map(d => d.sectors[i] || Infinity))), [data]);
  const bestCarTimes: Record<string, number> = useMemo(() => {
    const carBest: Record<string, number> = {};
    data.forEach(d => {
      if (!carBest[d.car] || d.bestLap < carBest[d.car]) {
        carBest[d.car] = d.bestLap;
      }
    });
    return carBest;
  }, [data]);

  // Filtro por nombre
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    return data.filter(d => d.driver.toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

  // Paginación
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Paginación UI
  const paginationItems = [];
  for (let i = 1; i <= totalPages; i++) {
    paginationItems.push(
      <PaginationItem key={i}>
        <PaginationLink isActive={i === currentPage} onClick={e => { e.preventDefault(); setCurrentPage(i); }}>{i}</PaginationLink>
      </PaginationItem>
    );
  }

  // Para mostrar el nombre legible en la tabla
  const carIdToName = Object.fromEntries(cars.map(c => [c.id, `${c.brand} ${c.model} ${c.class}`]));
  // Para el combobox
  const filteredCars = cars.filter(car => `${car.brand} ${car.model} ${car.class}`.toLowerCase().includes(searchCar.toLowerCase()));

  // Obtener datos del coche por ID
  const getCarData = (id: number) => cars.find(c => c.id === id);

  // Formulario submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/inscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          raceName,
          position: Number(position),
          validLaps: Number(validLaps),
          car: selectedCar, // id numérico
        }),
      });
      if (!res.ok) throw new Error("Error al inscribirse");
      setSuccess(true);
      window.location.reload(); // Recargar la página tras éxito
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!inscriptionsOpen) {
    if (!isLoggedIn) {
      // No inscripciones y no logueado
      return (
        <div className="relative">
          <div className="blur-sm pointer-events-none select-none">
            <Table>
              <TableHeader className="font-medium bg-primary">
                <TableRow>
                  <TableHead className="text-white text-center">Pos</TableHead>
                  <TableHead className="text-white text-center">Piloto</TableHead>
                  <TableHead className="text-white text-center">Clase</TableHead>
                  <TableHead className="text-white text-center">Coche</TableHead>
                  <TableHead className="text-white text-center">Mejor Vuelta</TableHead>
                  <TableHead className="text-white text-center">v. MAX</TableHead>
                  <TableHead className="text-white text-center">Diferencia</TableHead>
                  <TableHead className="text-white text-center">S1</TableHead>
                  <TableHead className="text-white text-center">S2</TableHead>
                  <TableHead className="text-white text-center">S3</TableHead>
                  <TableHead className="text-white text-center">Vueltas</TableHead>
                  <TableHead className="text-white text-center">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i} className={i % 2 === 0 ? "bg-darkPrimary" : "bg-darkSecond"}>
                    {/* Posición */}
                    <TableCell className="text-center font-medium text-lg"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                    {/* Piloto */}
                    <TableCell className="text-center font-medium"><Skeleton className="h-4 w-32 mx-auto" /></TableCell>
                    {/* Clase */}
                    <TableCell className="text-center"><Skeleton className="h-4 w-16 mx-auto rounded" style={{ backgroundColor: '#006fba' }} /></TableCell>
                    {/* Coche */}
                    <TableCell className="text-center"><Skeleton className="h-4 w-32 mx-auto" /></TableCell>
                    {/* Mejor Vuelta */}
                    <TableCell className="text-center">
                      {i === 0 ? (
                        <Skeleton className="h-4 w-20 mx-auto rounded bg-purple-600/80" />
                      ) : i === 1 ? (
                        <Skeleton className="h-4 w-20 mx-auto rounded bg-green-400/80" />
                      ) : (
                        <Skeleton className="h-4 w-20 mx-auto" />
                      )}
                    </TableCell>
                    {/* v. MAX */}
                    <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                    {/* Diferencia */}
                    <TableCell className="text-center"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                    {/* S1 */}
                    <TableCell className="text-center">
                      {i === 0 ? (
                        <Skeleton className="h-4 w-14 mx-auto rounded bg-purple-400/80" />
                      ) : (
                        <Skeleton className="h-4 w-14 mx-auto" />
                      )}
                    </TableCell>
                    {/* S2 */}
                    <TableCell className="text-center">
                      {i === 0 ? (
                        <Skeleton className="h-4 w-14 mx-auto rounded bg-purple-400/80" />
                      ) : (
                        <Skeleton className="h-4 w-14 mx-auto" />
                      )}
                    </TableCell>
                    {/* S3 */}
                    <TableCell className="text-center">
                      {i === 0 ? (
                        <Skeleton className="h-4 w-14 mx-auto rounded bg-purple-400/80" />
                      ) : (
                        <Skeleton className="h-4 w-14 mx-auto" />
                      )}
                    </TableCell>
                    {/* Vueltas */}
                    <TableCell className="text-center"><Skeleton className="h-4 w-10 mx-auto" /></TableCell>
                    {/* Fecha */}
                    <TableCell className="text-center"><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center min-h-[400px] p-4">
            <div className="bg-darkSecond border border-primary rounded-lg p-8 text-center w-full max-w-md">
              <p className="text-lg font-semibold mb-4">Las inscripciones aún no están abiertas.<br/>Para inscribirse en las carreras, primero hay que estar dado de alta en ESP Racing.</p>
              <Button asChild>
                <a href="/login">Ir a Login</a>
              </Button>
            </div>
          </div>
        </div>
      );
    } else {
      // No inscripciones pero logueado
      return (
        <div className="relative">
          <div className="blur-sm pointer-events-none select-none">
            <Table>
              <TableHeader className="font-medium bg-primary">
                <TableRow>
                  <TableHead className="text-white text-center">Pos</TableHead>
                  <TableHead className="text-white text-center">Piloto</TableHead>
                  <TableHead className="text-white text-center">Clase</TableHead>
                  <TableHead className="text-white text-center">Coche</TableHead>
                  <TableHead className="text-white text-center">Mejor Vuelta</TableHead>
                  <TableHead className="text-white text-center">v. MAX</TableHead>
                  <TableHead className="text-white text-center">Diferencia</TableHead>
                  <TableHead className="text-white text-center">S1</TableHead>
                  <TableHead className="text-white text-center">S2</TableHead>
                  <TableHead className="text-white text-center">S3</TableHead>
                  <TableHead className="text-white text-center">Vueltas</TableHead>
                  <TableHead className="text-white text-center">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i} className={i % 2 === 0 ? "bg-darkPrimary" : "bg-darkSecond"}>
                    {/* Posición */}
                    <TableCell className="text-center font-medium text-lg"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                    {/* Piloto */}
                    <TableCell className="text-center font-medium"><Skeleton className="h-4 w-32 mx-auto" /></TableCell>
                    {/* Clase */}
                    <TableCell className="text-center"><Skeleton className="h-4 w-16 mx-auto rounded" style={{ backgroundColor: '#006fba' }} /></TableCell>
                    {/* Coche */}
                    <TableCell className="text-center"><Skeleton className="h-4 w-32 mx-auto" /></TableCell>
                    {/* Mejor Vuelta */}
                    <TableCell className="text-center">
                      {i === 0 ? (
                        <Skeleton className="h-4 w-20 mx-auto rounded bg-purple-600/80" />
                      ) : i === 1 ? (
                        <Skeleton className="h-4 w-20 mx-auto rounded bg-green-400/80" />
                      ) : (
                        <Skeleton className="h-4 w-20 mx-auto" />
                      )}
                    </TableCell>
                    {/* v. MAX */}
                    <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                    {/* Diferencia */}
                    <TableCell className="text-center"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                    {/* S1 */}
                    <TableCell className="text-center">
                      {i === 0 ? (
                        <Skeleton className="h-4 w-14 mx-auto rounded bg-purple-400/80" />
                      ) : (
                        <Skeleton className="h-4 w-14 mx-auto" />
                      )}
                    </TableCell>
                    {/* S2 */}
                    <TableCell className="text-center">
                      {i === 0 ? (
                        <Skeleton className="h-4 w-14 mx-auto rounded bg-purple-400/80" />
                      ) : (
                        <Skeleton className="h-4 w-14 mx-auto" />
                      )}
                    </TableCell>
                    {/* S3 */}
                    <TableCell className="text-center">
                      {i === 0 ? (
                        <Skeleton className="h-4 w-14 mx-auto rounded bg-purple-400/80" />
                      ) : (
                        <Skeleton className="h-4 w-14 mx-auto" />
                      )}
                    </TableCell>
                    {/* Vueltas */}
                    <TableCell className="text-center"><Skeleton className="h-4 w-10 mx-auto" /></TableCell>
                    {/* Fecha */}
                    <TableCell className="text-center"><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center min-h-[400px] p-4">
            <div className="bg-darkSecond border border-primary rounded-lg p-8 text-center w-full max-w-md">
              <p className="text-lg font-semibold mb-4">Las inscripciones aún no están abiertas.</p>
            </div>
          </div>
        </div>
      );
    }
  }

  if (!isLoggedIn) {
    // Mostrar la tabla falsa y el mensaje de login, igual que cuando no hay inscripciones
    return (
      <div className="relative">
        <div className="blur-sm pointer-events-none select-none">
          <Table>
            <TableHeader className="font-medium bg-primary">
              <TableRow>
                <TableHead className="text-white text-center">Pos</TableHead>
                <TableHead className="text-white text-center">Piloto</TableHead>
                <TableHead className="text-white text-center">Clase</TableHead>
                <TableHead className="text-white text-center">Coche</TableHead>
                <TableHead className="text-white text-center">Mejor Vuelta</TableHead>
                <TableHead className="text-white text-center">v. MAX</TableHead>
                <TableHead className="text-white text-center">Diferencia</TableHead>
                <TableHead className="text-white text-center">S1</TableHead>
                <TableHead className="text-white text-center">S2</TableHead>
                <TableHead className="text-white text-center">S3</TableHead>
                <TableHead className="text-white text-center">Vueltas</TableHead>
                <TableHead className="text-white text-center">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i} className={i % 2 === 0 ? "bg-darkPrimary" : "bg-darkSecond"}>
                  <TableCell className="text-center font-medium text-lg"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                  <TableCell className="text-center font-medium"><Skeleton className="h-4 w-32 mx-auto" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-4 w-16 mx-auto rounded" style={{ backgroundColor: '#006fba' }} /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-4 w-32 mx-auto" /></TableCell>
                  <TableCell className="text-center">{i === 0 ? (<Skeleton className="h-4 w-20 mx-auto rounded bg-purple-600/80" />) : i === 1 ? (<Skeleton className="h-4 w-20 mx-auto rounded bg-green-400/80" />) : (<Skeleton className="h-4 w-20 mx-auto" />)}</TableCell>
                  <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                  <TableCell className="text-center">{i === 0 ? (<Skeleton className="h-4 w-14 mx-auto rounded bg-purple-400/80" />) : (<Skeleton className="h-4 w-14 mx-auto" />)}</TableCell>
                  <TableCell className="text-center">{i === 0 ? (<Skeleton className="h-4 w-14 mx-auto rounded bg-purple-400/80" />) : (<Skeleton className="h-4 w-14 mx-auto" />)}</TableCell>
                  <TableCell className="text-center">{i === 0 ? (<Skeleton className="h-4 w-14 mx-auto rounded bg-purple-400/80" />) : (<Skeleton className="h-4 w-14 mx-auto" />)}</TableCell>
                  <TableCell className="text-center"><Skeleton className="h-4 w-10 mx-auto" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center min-h-[400px] p-4">
          <div className="bg-darkSecond border border-primary rounded-lg p-8 text-center w-full max-w-md">
            <p className="text-lg font-semibold mb-4">Debes iniciar sesión para acceder a las inscripciones.</p>
            <Button asChild>
              <a href="/login">Ir a Login</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-col md:flex-row gap-4 my-4">
          <div className="relative flex-grow h-full my-auto">
            <Input
              type="text"
              placeholder="Buscar piloto..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="pl-9 bg-darkPrimary border-lightSecond text-white w-full"
            />
          </div>
        </div>
        <Table>
          <TableHeader className="font-medium bg-primary">
            <TableRow>
              <TableHead className="text-white text-center">Pos</TableHead>
              <TableHead className="text-white text-center">Piloto</TableHead>
              <TableHead className="text-white text-center">Clase</TableHead>
              <TableHead className="text-white text-center">Coche</TableHead>
              <TableHead className="text-white text-center">Mejor Vuelta</TableHead>
              <TableHead className="text-white text-center">v. MAX</TableHead>
              <TableHead className="text-white text-center">Diferencia</TableHead>
              <TableHead className="text-white text-center">S1</TableHead>
              <TableHead className="text-white text-center">S2</TableHead>
              <TableHead className="text-white text-center">S3</TableHead>
              <TableHead className="text-white text-center">Vueltas</TableHead>
              <TableHead className="text-white text-center">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((row, idx) => {
              // Alternancia de fondo para filas normales y verdes
              const isBestLap = row.bestLap === bestLap;
              const isBestCar = row.bestLap === bestCarTimes[row.car] && !isBestLap;
              const isEven = idx % 2 === 0;
              let rowBg = isEven ? "bg-darkPrimary" : "bg-darkSecond";
              if (isBestCar) rowBg = isEven ? "bg-green-300/60" : "bg-green-500/60";
              // Obtener datos del coche para la fila actual
              const car = getCarData(typeof row.car === 'number' ? row.car : Number(row.car));
              // Si es el mejor tiempo general, no colorear toda la fila, solo la celda
              return (
                <TableRow
                  key={row.position}
                  className={rowBg}
                >
                  <TableCell className="text-center">{row.position}</TableCell>
                  <TableCell className="text-center">{row.driver}</TableCell>
                  <TableCell className="text-center">
                    {(() => {
                      if (!car) return row.car;
                      // Extraer color de fondo y texto de class_design
                      const bgMatch = car?.class_design?.match(/bg-\[#([0-9a-fA-F]{6})\]/);
                      const textMatch = car?.class_design?.match(/text-\[#([0-9a-fA-F]{6})\]/);
                      const bgColor = bgMatch ? `#${bgMatch[1]}` : '#006fba';
                      const textColor = textMatch ? `#${textMatch[1]}` : '#f9f9f9';
                      return (
                        <span style={{ backgroundColor: bgColor, color: textColor, padding: '2px 8px', borderRadius: '6px', fontSize: '0.85em', fontWeight: 600 }}>
                          {car.class}
                        </span>
                      );
                    })()}
                  </TableCell>
                  <TableCell className={`text-center ${isBestCar ? "bg-green-400/90 text-black font-bold" : ""}`}>{car ? `${car.brand} ${car.model}` : row.car}</TableCell>
                  <TableCell className={`text-center ${isBestLap ? "bg-purple-600/80 text-white font-bold" : ""}`}>{msToTime(row.bestLap)}</TableCell>
                  <TableCell className="text-center">{row.vMax}</TableCell>
                  <TableCell className="text-center">{row.gap}</TableCell>
                  {row.sectors.map((sector, i) => (
                    <TableCell key={row.position + "-s" + i} className={`text-center ${sector === bestSectors[i] && sector !== Infinity ? "bg-purple-500/80 text-white font-bold" : ""}`}>{msToTime(sector)}</TableCell>
                  ))}
                  <TableCell className={`text-center ${row.laps > 10 ? "bg-green-400/80 text-black font-bold" : ""}`}>{row.laps}</TableCell>
                  <TableCell className="text-center">{row.date}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={e => { e.preventDefault(); setCurrentPage(Math.max(1, currentPage - 1)); }}
                    className={currentPage === 1 ? "opacity-50 pointer-events-none" : ""}
                  />
                </PaginationItem>
                {paginationItems}
                <PaginationItem>
                  <PaginationNext
                    onClick={e => { e.preventDefault(); setCurrentPage(Math.min(totalPages, currentPage + 1)); }}
                    className={currentPage === totalPages ? "opacity-50 pointer-events-none" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
      <div className="bg-darkPrimary border-primary border-2 rounded-lg px-8 pt-6 pb-8">
        {userAlreadyInscribed ? (
          <div className="text-center text-green-400 font-bold text-lg">Ya estás inscrito en esta carrera.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="position" className="block text-lightPrimary font-medium mb-2">Posición</label>
                <Input
                  id="position"
                  type="number"
                  value={position}
                  onChange={e => setPosition(e.target.value)}
                  required
                  min={1}
                  className="bg-darkSecond text-white"
                  placeholder="Tu posición en la tabla"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="validLaps" className="block text-lightPrimary font-medium mb-2">Vueltas Válidas</label>
                <Input
                  id="validLaps"
                  type="number"
                  value={validLaps}
                  onChange={e => setValidLaps(e.target.value)}
                  required
                  min={1}
                  className="bg-darkSecond text-white"
                  placeholder="Número de vueltas válidas"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="car" className="block text-lightPrimary font-medium mb-2">Coche</label>
                <Combobox
                  value={selectedCar?.toString() ?? ""}
                  onValueChange={id => setSelectedCar(Number(id))}
                  placeholder="Buscar coche..."
                  options={filteredCars.map(car => ({
                    value: car.id.toString(),
                    label: `${car.brand} ${car.model}`
                  }))}
                  className="bg-darkSecond text-white"
                />
              </div>
            </div>
            {error && <div className="text-red-500 text-center">{error}</div>}
            {success && <div className="text-green-500 text-center">Inscripción realizada correctamente.</div>}
            <Button type="submit" className="w-full" disabled={loading || !selectedCar}>Inscribirse</Button>
          </form>
        )}
      </div>
    </div>
  );
};
