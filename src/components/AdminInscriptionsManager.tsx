import React, { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Edit2, Trash2, Plus, Save, X, Download } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export interface AdminInscriptionRow {
  id: number;
  race: string;
  profile: {
    id: string;
    full_name: string;
    steam_id: string;
    team?: { name: string } | null;
  };
  valid_laps: number;
  car: {
    brand: { name: string };
    model: string;
    class: { short_name: string; class_design: string };
  };
}

export interface AdminInscriptionsManagerProps {
  inscriptions: AdminInscriptionRow[];
  calendar: any[];
  championships: { id: number; name: string }[];
}

function getClassTagStyle(class_design: string) {
  const bgMatch = class_design?.match(/bg-\[#([0-9a-fA-F]{6})\]/);
  const textMatch = class_design?.match(/text-\[#([0-9a-fA-F]{6})\]/);
  const bgColor = bgMatch ? `#${bgMatch[1]}` : '#006fba';
  const textColor = textMatch ? `#${textMatch[1]}` : '#f9f9f9';
  return { backgroundColor: bgColor, color: textColor, padding: '2px 8px', borderRadius: '6px', fontSize: '0.85em', fontWeight: 600 };
}

function downloadCSV(rows: AdminInscriptionRow[], raceName: string) {
  const header = [
    'Piloto', 'Steam_ID', 'Equipo', 'Clase', 'Coche', 'Vueltas válidas'
  ];
  const csvRows = rows.map(row => [
    row.profile.full_name,
    row.profile.steam_id,
    row.profile.team?.name || '',
    row.car.class.short_name,
    `${row.car.brand.name} ${row.car.model}`,
    row.valid_laps
  ]);
  const csvContent = [header, ...csvRows].map(r => r.map(x => `"${x ?? ''}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${raceName}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export const AdminInscriptionsManager: React.FC<AdminInscriptionsManagerProps> = ({ inscriptions, calendar, championships }) => {
  const [tab, setTab] = useState('list');
  const raceName = inscriptions[0]?.race || '';

  // Estado para el formulario de nueva fecha
  const [newName, setNewName] = useState("");
  const [newChamp, setNewChamp] = useState<number | null>(null);  const [newOrder, setNewOrder] = useState(1);
  const [openDate, setOpenDate] = useState<Date | undefined>();
  const [openTime, setOpenTime] = useState("21:00");
  const [closeDate, setCloseDate] = useState<Date | undefined>();
  const [closeTime, setCloseTime] = useState("18:00");
  const [urlTime, setUrlTime] = useState("https://es2.assettohosting.com:10018/stracker/lapstat");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  interface EditFields {
    name: string;
    championship: number | null;
    order: number;
    openDate?: Date;
    openTime: string;
    closeDate?: Date;
    closeTime: string;
    url_time: string;
  }

  const [editId, setEditId] = useState<number | null>(null);
  const [editFields, setEditFields] = useState<EditFields>({
    name: "",
    championship: null,
    order: 1,
    openDate: undefined,
    openTime: "21:00",
    closeDate: undefined,
    closeTime: "18:00",
    url_time: "",
  });

  // Función para combinar fecha y hora en string ISO
  function combineDateTime(date?: Date, time?: string) {
    if (!date || !time) return "";
    const [h, m] = time.split(":");
    const d = new Date(date);
    d.setHours(Number(h), Number(m), 0, 0);
    return d.toISOString();
  }

  // Función para extraer hora en formato HH:mm de un string ISO
  function extractTime(iso: string) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toISOString().slice(11, 16);
  }
  // Función para extraer fecha (Date) de un string ISO
  function extractDate(iso: string) {
    if (!iso) return undefined;
    return new Date(iso);
  }

  const [champSearch, setChampSearch] = useState("");
  const filteredChamps = useMemo(() => championships.filter(c => c.name.toLowerCase().includes(champSearch.toLowerCase())), [championships, champSearch]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;
  const totalPages = Math.ceil(inscriptions.length / pageSize);
  const paginated = inscriptions.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const handleDelete = async (row: any) => {
    try {
      const response = await fetch("/api/admin/inscriptionscalendar", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id })
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert("Error al eliminar la fecha");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar la fecha");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold">Inscritos para: <span className="text-primary">{raceName}</span></h3>
          <Button onClick={() => downloadCSV(inscriptions, raceName)} variant="outline" className="flex gap-2"><Download className="h-4 w-4" />Descargar CSV</Button>
        </div>
        <Table>
          <TableHeader className="font-medium bg-primary">
            <TableRow>
              <TableHead className="text-white text-center">Piloto</TableHead>
              <TableHead className="text-white text-center">Steam_ID</TableHead>
              <TableHead className="text-white text-center">Equipo</TableHead>
              <TableHead className="text-white text-center">Clase</TableHead>
              <TableHead className="text-white text-center">Coche</TableHead>
              <TableHead className="text-white text-center">Vueltas válidas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((row, idx) => (
              <TableRow key={row.id} className={idx % 2 === 0 ? "bg-darkPrimary" : "bg-darkSecond"}>
                <TableCell className="text-center">{row.profile.full_name}</TableCell>
                <TableCell className="text-center">{row.profile.steam_id}</TableCell>
                <TableCell className="text-center">{row.profile.team?.name || '-'}</TableCell>
                <TableCell className="text-center">
                  <span style={getClassTagStyle(row.car.class.class_design)}>{row.car.class.short_name}</span>
                </TableCell>
                <TableCell className="text-center">{row.car.brand.name} {row.car.model}</TableCell>
                <TableCell className="text-center">{row.valid_laps}</TableCell>
              </TableRow>
            ))}
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
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink isActive={currentPage === i + 1} onClick={e => { e.preventDefault(); setCurrentPage(i + 1); }}>{i + 1}</PaginationLink>
                  </PaginationItem>
                ))}
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
      <div className="mt-8">
        <Tabs defaultValue="list" value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Fechas de Inscripción</TabsTrigger>
            <TabsTrigger value="new">Añadir Nueva Fecha</TabsTrigger>
          </TabsList>
          <TabsContent value="list">
            <Card className="border-2 border-primary max-w-5xl mx-auto">
              <CardHeader>
                <CardTitle>Fechas de Inscripción</CardTitle>
                <CardDescription>Gestiona las fechas del calendario</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader className="bg-primary">
                    <TableRow>
                      <TableHead className="text-white">Nombre</TableHead>
                      <TableHead className="text-white">Campeonato</TableHead>
                      <TableHead className="text-white">Orden</TableHead>
                      <TableHead className="text-white text-center">Apertura</TableHead>
                      <TableHead className="text-white text-center">Cierre</TableHead>
                      <TableHead className="text-white">URL</TableHead>
                      <TableHead className="text-white text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calendar.map((row: any) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{row.championship?.name || '-'}</TableCell>
                          <TableCell>{row.order}</TableCell>
                          <TableCell className="text-center">{row.inscriptions_open ? new Date(row.inscriptions_open).toLocaleString() : '-'}</TableCell>
                          <TableCell className="text-center">{row.inscriptions_close ? new Date(row.inscriptions_close).toLocaleString() : '-'}</TableCell>
                          <TableCell className="truncate max-w-[180px]">{row.url_time}</TableCell>
                          <TableCell className="flex gap-2 justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                window.location.href = `/admin/inscriptions/${row.id}`;
                              }}
                              className="text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white"
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se eliminará permanentemente la fecha de inscripción "{row.name}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(row)}>
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="new">
            <Card className="border-2 border-primary max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Añadir Nueva Fecha al Calendario</CardTitle>
                <CardDescription>Rellena los campos para crear una nueva fecha de inscripción</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre de la carrera</Label>
                  <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre de la carrera" />
                </div>
                <div className="space-y-2">
                  <Label>Campeonato</Label>
                  <Select value={newChamp?.toString() ?? ""} onValueChange={v => setNewChamp(Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un campeonato" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="px-2 py-1">
                        <Input
                          type="text"
                          placeholder="Buscar campeonato..."
                          value={champSearch}
                          onChange={e => setChampSearch(e.target.value)}
                          className="mb-2"
                          autoFocus
                        />
                      </div>
                      {filteredChamps.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Orden en el campeonato</Label>
                  <Input type="number" min={1} value={newOrder} onChange={e => setNewOrder(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Fecha y hora de apertura</Label>
                  <div className="flex gap-2 items-center">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-36 justify-start">
                          {openDate ? openDate.toLocaleDateString() : "Selecciona fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="p-0">
                        <Calendar selected={openDate} onSelect={setOpenDate} mode="single" weekStartsOn={1} />
                      </PopoverContent>
                    </Popover>
                    <Input type="time" value={openTime} onChange={e => setOpenTime(e.target.value)} className="w-28" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Fecha y hora de cierre</Label>
                  <div className="flex gap-2 items-center">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-36 justify-start">
                          {closeDate ? closeDate.toLocaleDateString() : "Selecciona fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="p-0">
                        <Calendar selected={closeDate} onSelect={setCloseDate} mode="single" weekStartsOn={1} />
                      </PopoverContent>
                    </Popover>
                    <Input type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)} className="w-28" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>URL de resultados</Label>
                  <Input value={urlTime} onChange={e => setUrlTime(e.target.value)} />
                </div>
                {error && <div className="text-red-500 text-center">{error}</div>}
                {success && <div className="text-green-500 text-center">{success}</div>}
                <Button
                  onClick={async () => {
                    setLoading(true); setError(""); setSuccess("");
                    if (!newName || !newChamp || !openDate || !closeDate) {
                      setError("Rellena todos los campos obligatorios"); setLoading(false); return;
                    }
                    const inscriptions_open = combineDateTime(openDate, openTime);
                    const inscriptions_close = combineDateTime(closeDate, closeTime);
                    try {
                      const res = await fetch("/api/admin/inscriptionscalendar", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: newName,
                          championship: newChamp,
                          order: newOrder,
                          inscriptions_open,
                          inscriptions_close,
                          url_time: urlTime,
                        })
                      });
                      if (!res.ok) throw new Error("Error al crear la fecha");

                      setSuccess("Fecha creada correctamente");
                      setNewName(""); setNewChamp(null);
                      setNewOrder(1); setOpenDate(undefined);
                      setCloseDate(undefined);
                      setOpenTime("21:00");
                      setCloseTime("18:00");
                      setUrlTime("https://es2.assettohosting.com:10018/stracker/lapstat");
                      window.location.reload();
                    } catch (err: any) {
                      setError(err.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="w-full"
                >Añadir Fecha</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};