import React, { useEffect, useState } from 'react';
import { supabase } from "@/db/supabase";
import { createRaceData, createRaceDataMultipleSplits } from "@/lib/results/resultConverter";
import { showToast } from "@/lib/utils";

//Importaciones de UI
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Combobox } from "@/components/ui/combobox";
import { FileJson, NotebookPen } from 'lucide-react';

type champData = {
  id: number;
  name: string | null;
}

type pointSystemData = {
  id: number;
  name: string;
}

export default function NewRace(){
  const [championshipContent, setChampionshipContent] = useState<champData[]>([]);
  const [pointsystemContent, setPointsystemContent] = useState<pointSystemData[]>([]);
  const [raceNames, setRaceNames] = useState<{ label: string, value: string }[]>([]);
  const [value, setValue] = useState("");
  const [activeTab, setActiveTab] = useState<string>('addRace');
  const [noteCode, setNoteCode] = useState("0");

  // Estados para switches
  const [split2, setSplit2] = useState(false);
  const [race2, setRace2] = useState(false);

  // Estados para archivos
  const [fileS1R1, setFileS1R1] = useState<File|null>(null);
  const [fileS2R1, setFileS2R1] = useState<File|null>(null);
  const [fileS1R2, setFileS1R2] = useState<File|null>(null);
  const [fileS2R2, setFileS2R2] = useState<File|null>(null);

  // Mensajes de error
  const [errorMsg, setErrorMsg] = useState<string|null>(null);
  const [successMsg, setSuccessMsg] = useState<string|null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: raceData, error: errorRaceData } = await supabase
        .from("race")
        .select("id, name, championship!inner(name)")
        .order("championship, orderinchamp", { ascending: true });

        if(raceData){
          const auxRaceNames = raceData.map(race => ({
            label: race.name + " (" + race.championship.name + ")",
            value: race.id.toString()
          }));
          setRaceNames(auxRaceNames);
        } else {
          showToast("Error al cargar las carreras: " + errorRaceData?.message, "error");
          console.error("Error al cargar las carreras: ", errorRaceData);
        }

      const { data: champsData, error: errorChamps } = await supabase
      .from("championship")
      .select("id, name")
      .order("id", { ascending: true });

    if(champsData){
      setChampionshipContent(champsData);
    }else{
      showToast("Error al cargar las carreras: " + errorRaceData?.message, "error");
      console.error("Error al cargar los campeonatos: ", errorChamps);
    }

    const { data: pointsystemData, error: errorPS } = await supabase
      .from("pointsystem")
      .select("id, name")
      .order("id", { ascending: true });

    if(pointsystemData){
      setPointsystemContent(pointsystemData);
    }else{
      showToast("Error al cargar las carreras: " + errorRaceData?.message, "error");
      console.error("Error al cargar los campeonatos: ", errorPS);
    }
    };

    checkAuth();
  }, []);

  // Handlers para switches
  const handleSplit2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSplit2(e.target.checked);
    if (!e.target.checked) {
      setFileS2R1(null);
      setFileS2R2(null);
    }
  };
  const handleRace2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRace2(e.target.checked);
    if (!e.target.checked) {
      setFileS1R2(null);
      setFileS2R2(null);
    }
  };

  // Handlers para archivos
  const handleFile = (setter: React.Dispatch<React.SetStateAction<File|null>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/json") {
      setter(file);
    } else {
      setter(null);
      if (file) setErrorMsg("Por favor, selecciona un archivo JSON válido.");
    }
  };

  // Helper: Validación de archivos requeridos
  const validateFiles = () => {
    if (!fileS1R1) {
      showToast("Por favor, selecciona un archivo JSON para la Carrera 1 del Split 1.", "error");
      return false;
    }
    if (race2 && !fileS1R2) {
      showToast("Por favor, selecciona un archivo JSON para la Carrera 2 del Split 1.", "error");
      return false;
    }
    if (split2 && !fileS2R1) {
      showToast("Por favor, selecciona un archivo JSON para la Carrera 1 del Split 2.", "error");
      return false;
    }
    if (split2 && race2 && !fileS2R2) {
      showToast("Por favor, selecciona un archivo JSON para la Carrera 2 del Split 2.", "error");
      return false;
    }
    return true;
  };

  // Helper: Leer archivos JSON
  const readAllFiles = async () => {
    const readFile = async (file: File|null) => file ? JSON.parse(await file.text()) : null;
    return {
      jsonS1R1: await readFile(fileS1R1),
      jsonS2R1: await readFile(fileS2R1),
      jsonS1R2: await readFile(fileS1R2),
      jsonS2R2: await readFile(fileS2R2),
    };
  };

  // Helper: Transformar JSONs
  const transformJsons = (jsons: any) => {
    let transformedJsonR1: any, transformedJsonR2: any = null;
    if (split2) {
      if (!jsons.jsonS2R1) throw new Error("Falta JSON Split 2 Carrera 1");
      transformedJsonR1 = createRaceDataMultipleSplits(jsons.jsonS1R1, jsons.jsonS2R1);
      if (race2) {
        if (!jsons.jsonS1R2 || !jsons.jsonS2R2) throw new Error("Falta JSON Split 2 Carrera 2");
        transformedJsonR2 = createRaceDataMultipleSplits(jsons.jsonS1R2, jsons.jsonS2R2);
      }
    } else {
      transformedJsonR1 = createRaceData(jsons.jsonS1R1);
      if (race2) {
        if (!jsons.jsonS1R2) throw new Error("Falta JSON Split 1 Carrera 2");
        transformedJsonR2 = createRaceData(jsons.jsonS1R2);
      }
    }
    return { transformedJsonR1, transformedJsonR2 };
  };

  // Helper: Subir resultados a Supabase Storage
  const uploadResults = async (champID: string, numrace: string, racenameFile: string, transformedJsonR1: any, transformedJsonR2: any) => {
    let URLBucketsResults = ["", ""];
    const { data: uploadRace1, error: uploadErrorR1 } = await supabase
      .storage
      .from('results')
      .upload(`${champID}/${numrace}_${racenameFile}Race1`, JSON.stringify(transformedJsonR1), { upsert: true });
    if (uploadErrorR1 || !uploadRace1) throw uploadErrorR1;
    URLBucketsResults[0] = uploadRace1.path;
    if (race2 && transformedJsonR2) {
      const { data: uploadRace2, error: uploadErrorR2 } = await supabase
        .storage
        .from('results')
        .upload(`${champID}/${numrace}_${racenameFile}Race2`, JSON.stringify(transformedJsonR2), { upsert: true });
      if (uploadErrorR2 || !uploadRace2) throw uploadErrorR2;
      URLBucketsResults[1] = uploadRace2.path;
    }
    return URLBucketsResults;
  };

  // Helper: Obtener nuevo ID de carrera
  const getNewRaceID = async () => {
    const { data: getLastRace } = await supabase
      .from('race')
      .select('id')
      .order('id', { ascending: true });

    if(getLastRace?.length === 0) return 1;

    let findID = false;
    let i = 1;
    if (!getLastRace) throw new Error("Error al obtener el último ID de carrera");
    while (!findID && i < getLastRace.length) {
      if (getLastRace[i - 1].id === i) {
        i++;
      } else {
        findID = true;
      }
    }
    if (!findID) i++;
    return getLastRace ? i : 1;
  };

  // Helper: Insertar carrera en la tabla race
  type InsertRaceParams = { lastRaceID: number; racename: string; fileS1R1: File; champID: string; numrace: string; pointsystem: string; split2: boolean; URLBucketsResults: string[];};

  const insertRace = async ({lastRaceID, racename, fileS1R1, champID, numrace, pointsystem, split2, URLBucketsResults}: InsertRaceParams) => {
    const { error: insertError } = await supabase
      .from('race')
      .insert({
        id: lastRaceID,
        name: racename,
        filename: fileS1R1.name,
        championship: Number(champID),
        orderinchamp: Number(numrace),
        pointsystem: Number(pointsystem),
        splits: split2 ? 2 : 1,
        race_data_1: URLBucketsResults[0],
        race_data_2: URLBucketsResults[1],
      });
    if (insertError) throw insertError;
  };

  // Helper: Actualizar estadísticas
  const updateStats = async (transformedJsonR1: any, transformedJsonR2: any) => {
    const raceData = transformedJsonR1;
    const response = await fetch('/api/admin/stats/newRaceStats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume: raceData.RaceDriversResume })
    });
    if (!response.ok) throw new Error('Error actualizando estadísticas');
    if (race2 && transformedJsonR2) {
      const raceData2 = transformedJsonR2;
      const response2 = await fetch('/api/admin/stats/newRaceStats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: raceData2.RaceDriversResume })
      });
      if (!response2.ok) throw new Error('Error actualizando estadísticas de carrera 2');
    }
  };

  // Validación y submit
  const handleSubmitRace = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!validateFiles()) return;

    try {
      const jsons = await readAllFiles();

      // Obtener datos del formulario
      const form = document.getElementById("uploadForm") as HTMLFormElement;
      const formData = new FormData(form);
      const racename = formData.get('racename') as string;
      const champID = formData.get('champID') as string;
      const numrace = formData.get('numrace') as string;
      const pointsystem = formData.get('pointsystem') as string;
      const racenameFile = racename.replace(/\s/g, '');

      // Transformar JSONs
      const { transformedJsonR1, transformedJsonR2 } = transformJsons(jsons);

      // Subir resultados a Supabase Storage
      const URLBucketsResults = await uploadResults(champID, numrace, racenameFile, transformedJsonR1, transformedJsonR2);

      // Insertar carrera en la tabla race
      const lastRaceID = await getNewRaceID();
      await insertRace({ lastRaceID, racename, fileS1R1: fileS1R1 as File, champID, numrace, pointsystem, split2, URLBucketsResults});

      // Actualizar estadísticas
      await updateStats(transformedJsonR1, transformedJsonR2);

      setSuccessMsg("Carrera creada con éxito");
      showToast("Carrera creada con éxito", "success");
      setFileS1R1(null); setFileS2R1(null); setFileS1R2(null); setFileS2R2(null);
      form.reset();
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setErrorMsg("Error al procesar la carrera: " + (err?.message ?? err));
      showToast("Error al procesar la carrera: " + (err?.message ?? err), "error");
    }
  };

  // Helper: Insertar nota en la tabla racenotes
  type InsertNoteParams = { lastNoteID: number; racename: string; description: string; penalty: string; noteCode: string; };
  const insertNote = async ({lastNoteID, racename, description, penalty, noteCode}: InsertNoteParams) => {
    const { error: insertError } = await supabase
      .from('racenotes')
      .insert({
        id: lastNoteID,
        race: Number(racename),
        code: Number(noteCode),
        description: description,
        penalty: penalty,
      });
    if (insertError) throw insertError;
  };

  // Helper: Obtener nuevo ID de nota
  const getNewNoteID = async () => {
    const { data: getLastRaceNotes } = await supabase
      .from('racenotes')
      .select('id')
      .order('id', { ascending: true });

    if(getLastRaceNotes?.length === 0) return 1;

    let findID = false;
    let i = 1;

    if (!getLastRaceNotes) throw new Error("Error al obtener el último ID de notas de carrera");
    while (!findID && i < getLastRaceNotes.length) {
      if (getLastRaceNotes[i - 1].id === i) {
        i++;
      } else {
        findID = true;
      }
    }
    if (!findID) i++;
    return getLastRaceNotes ? i : 1;
  };

  // Validación y submit de notas de carrera
  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try{
      // Obtener datos del formulario
      const form = document.getElementById("uploadNoteForm") as HTMLFormElement;
      const formData = new FormData(form);
      const racename = formData.get('racename') as string;
      const description = formData.get('description') as string;
      const penalty = formData.get('penalty') as string;
      const noteCode = formData.get('noteCode') as string;

      const lastNoteID = await getNewNoteID();
      await insertNote({lastNoteID, racename, description, penalty, noteCode});

      setSuccessMsg("Notas de Carrera creada con éxito");
      showToast("Notas de Carrera creada con éxito", "success")
      form.reset();
    }catch(err: any){
      setErrorMsg("Error al procesar la nota de carrera: " + (err?.message ?? err));
      showToast("Error al procesar la nota de carrera: " + (err?.message ?? err), "error");
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="addRace" className="flex items-center gap-2">
            <FileJson className="h-4 w-4" />
            Añadir Nueva Carrera
          </TabsTrigger>
          <TabsTrigger value="addNote" className="flex items-center gap-2">
            <NotebookPen className="h-4 w-4" />
            Añadir Nota de Carrera
          </TabsTrigger>
        </TabsList>

      <TabsContent value="addRace">
        <p className="text-5xl font-bold border-b border-primary w-fit mx-auto">
          Añadir Carrera Nueva
        </p>
        <div className="box-border p-5 m-auto bg-darkPrimary rounded-md max-w-screen-2xl border border-primary">
        <form id="uploadForm" onSubmit={handleSubmitRace}>
          <label className="text-lightPrimary text-lg font-medium" htmlFor="racename">
            Nombre de la carrera
          </label>
          <input
            className="w-full p-3 border border-solid border-lightSecond rounded-md mt-2 mb-4 resize-y text-white bg-darkSecond hover:border-primary"
            type="text"
            id="racename"
            name="racename"
            placeholder="Carrera X en cualquier sitio..."
            required
          />

          <label className="text-lightPrimary text-lg font-medium" htmlFor="champID">
            Campeonato a la que pertenece la carrera
          </label>
          <select
            className="w-full p-3 border border-solid border-lightSecond rounded-md mt-2 mb-4 resize-y text-white bg-darkSecond hover:border-primary"
            id="champID"
            name="champID"
            required
          >
            {
              championshipContent?.map((champ) => (
                <option key={champ.id} value={champ.id?.toString()}>{champ.name}</option>
              ))
            }
          </select>

          <label className="text-lightPrimary text-lg font-medium" htmlFor="numrace">
            Orden al que pertenece en el campeonato
          </label>
          <input
            className="w-full p-3 border border-solid border-lightSecond rounded-md mt-2 mb-4 resize-y text-white bg-darkSecond hover:border-primary"
            type="number"
            id="numrace"
            name="numrace"
            step="1"
            min="1"
            placeholder="1"
            required
          />

          <label className="text-lightPrimary text-lg font-medium" htmlFor="pointsystem">
            Sistema de Puntuación de la carrera
          </label>
          <select
            className="w-full p-3 border border-solid border-lightSecond rounded-md mt-2 mb-4 resize-y text-white bg-darkSecond hover:border-primary"
            id="pointsystem"
            name="pointsystem"
            required
          >
            {
              pointsystemContent?.map((ps) => (
                <option key={ps.id} value={ps.id?.toString()}>{ps.name}</option>
              ))
            }
          </select>

          <div className="flex items-center gap-2">
            <label className="relative inline-flex cursor-pointer">
              <input id="switch-S2" type="checkbox" className="peer sr-only" checked={split2} onChange={handleSplit2} />
              <label htmlFor="switch-S2" className="hidden"></label>
              <div
                className="peer h-4 w-11 rounded-full border bg-slate-200 after:absolute after:-top-1 after:left-0 after:h-6 after:w-6 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus:ring-primary"
              >
              </div>
            </label>
            <label className="text-lightPrimary text-lg font-medium" htmlFor="switch-S2">
              ¿1 o 2 splits?
            </label>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <label className="relative inline-flex cursor-pointer">
              <input id="switch-R2" type="checkbox" className="peer sr-only" checked={race2} onChange={handleRace2} />
              <label htmlFor="switch-R2" className="hidden"></label>
              <div
                className="peer h-4 w-11 rounded-full border bg-slate-200 after:absolute after:-top-1 after:left-0 after:h-6 after:w-6 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus:ring-primary"
              >
              </div>
            </label>
            <label className="text-lightPrimary text-lg font-medium" htmlFor="switch-R2">
              ¿1 o 2 carreras por GP?
            </label>
          </div>

          {/* Split 1 - Carrera 1 */}
          <div className="mb-6 p-6 border-2 border-primary rounded-lg bg-darkSecond">
            <div className="mb-4">
              <label htmlFor="fileInputS1R1" className="block text-lightPrimary text-lg font-semibold mb-3">
                Selecciona el archivo JSON de la carrera de Split 1 - Carrera 1
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="fileInputS1R1"
                  name="fileInputS1R1"
                  accept=".json"
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  onChange={handleFile(setFileS1R1)}
                />
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary rounded-lg bg-darkSecond text-lightPrimary cursor-pointer min-h-[150px] transition-colors hover:border-primary-dark">
                  <div className="flex items-center gap-2">
                    <svg className="w-12 h-12 mb-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    <span className="text-sm font-medium">Arrastra y suelta tu JSON aquí</span>
                    <span className="text-xs text-lightSecond mt-1">o haz clic para seleccionar</span>
                  </div>
                </div>
              </div>
            </div>
            {fileS1R1 && (
              <div className="mb-4">
                <p className="text-sm text-lightPrimary bg-darkPrimary p-3 rounded-lg border border-primary">
                  Archivo seleccionado: <span className="font-medium">{fileS1R1.name}</span>
                </p>
              </div>
            )}
          </div>

          {/* Split 2 - Carrera 1 */}
          {split2 && (
            <div className="mb-6 p-6 border-2 border-primary rounded-lg bg-darkSecond">
              <div className="mb-4">
                <label htmlFor="fileInputS2R1" className="block text-lightPrimary text-lg font-semibold mb-3">
                  Selecciona el archivo JSON de la carrera de Split 2 - Carrera 1
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="fileInputS2R1"
                    name="fileInputS2R1"
                    accept=".json"
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    onChange={handleFile(setFileS2R1)}
                  />
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary rounded-lg bg-darkSecond text-lightPrimary cursor-pointer min-h-[150px] transition-colors hover:border-primary-dark">
                    <div className="flex items-center gap-2">
                      <svg className="w-12 h-12 mb-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      <span className="text-sm font-medium">Arrastra y suelta tu JSON aquí</span>
                      <span className="text-xs text-lightSecond mt-1">o haz clic para seleccionar</span>
                    </div>
                  </div>
                </div>
              </div>
              {fileS2R1 && (
                <div className="mb-4">
                  <p className="text-sm text-lightPrimary bg-darkPrimary p-3 rounded-lg border border-primary">
                    Archivo seleccionado: <span className="font-medium">{fileS2R1.name}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Split 1 - Carrera 2 */}
          {race2 && (
            <div className="mb-6 p-6 border-2 border-primary rounded-lg bg-darkSecond">
              <div className="mb-4">
                <label htmlFor="fileInputS1R2" className="block text-lightPrimary text-lg font-semibold mb-3">
                  Selecciona el archivo JSON de la carrera de Split 1 - Carrera 2
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="fileInputS1R2"
                    name="fileInputS1R2"
                    accept=".json"
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    onChange={handleFile(setFileS1R2)}
                  />
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary rounded-lg bg-darkSecond text-lightPrimary cursor-pointer min-h-[150px] transition-colors hover:border-primary-dark">
                    <div className="flex items-center gap-2">
                      <svg className="w-12 h-12 mb-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      <span className="text-sm font-medium">Arrastra y suelta tu JSON aquí</span>
                      <span className="text-xs text-lightSecond mt-1">o haz clic para seleccionar</span>
                    </div>
                  </div>
                </div>
              </div>
              {fileS1R2 && (
                <div className="mb-4">
                  <p className="text-sm text-lightPrimary bg-darkPrimary p-3 rounded-lg border border-primary">
                    Archivo seleccionado: <span className="font-medium">{fileS1R2.name}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Split 2 - Carrera 2 */}
          {split2 && race2 && (
            <div className="mb-6 p-6 border-2 border-primary rounded-lg bg-darkSecond">
              <div className="mb-4">
                <label htmlFor="fileInputS2R2" className="block text-lightPrimary text-lg font-semibold mb-3">
                  Selecciona el archivo JSON de la carrera de Split 2 - Carrera 2
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="fileInputS2R2"
                    name="fileInputS2R2"
                    accept=".json"
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    onChange={handleFile(setFileS2R2)}
                  />
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary rounded-lg bg-darkSecond text-lightPrimary cursor-pointer min-h-[150px] transition-colors hover:border-primary-dark">
                    <div className="flex items-center gap-2">
                      <svg className="w-12 h-12 mb-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      <span className="text-sm font-medium">Arrastra y suelta tu JSON aquí</span>
                      <span className="text-xs text-lightSecond mt-1">o haz clic para seleccionar</span>
                    </div>
                  </div>
                </div>
              </div>
              {fileS2R2 && (
                <div className="mb-4">
                  <p className="text-sm text-lightPrimary bg-darkPrimary p-3 rounded-lg border border-primary">
                    Archivo seleccionado: <span className="font-medium">{fileS2R2.name}</span>
                  </p>
                </div>
              )}
            </div>
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
      <TabsContent value="addNote">
        <p className="text-5xl font-bold border-b border-primary w-fit mx-auto">
          Añadir Notas a la Carrera
        </p>
        <div className="box-border p-5 m-auto bg-darkPrimary rounded-md max-w-screen-2xl border border-primary">
        <form id="uploadNoteForm" onSubmit={handleSubmitNote}>
            <label className="text-lightPrimary text-lg font-medium" htmlFor="racename">
            Nombre de la carrera
            </label>
            <Combobox
            options={raceNames}
            value={value}
            onValueChange={setValue}
            placeholder="Carrera X en cualquier sitio..."
            searchPlaceholder="Buscar..."
            emptyMessage="No se encontraron resultados."
            />
          {/* Input oculto para enviar el id de la carrera seleccionada */}
          <input type="hidden" name="racename" value={value} />

          <label className="mt-5 text-lg font-semibold" htmlFor="noteCode">
            Código de nota
          </label>
          <select
            className="w-full p-3 border border-solid border-lightSecond rounded-md mt-2 mb-4 resize-y text-white bg-darkSecond hover:border-primary"
            id="noteCode"
            name="noteCode"
            value={noteCode}
            onChange={e => setNoteCode(e.target.value)}
          >
            <option value="0">Notas de Carrera</option>
            <option value="1">Lance de Carrera</option>
            <option value="2">Sanción Leve</option>
            <option value="3">Sanción Leve Primeras Vueltas</option>
            <option value="4">Sanción Media</option>
            <option value="5">Sanción Grave</option>
            <option value="6">Sanción Muy Grave</option>
            <option value="7">Sanción Antideportiva</option>
          </select>

          <label className="text-lightPrimary text-lg font-medium" htmlFor="description">
            Descripción
          </label>
          <input
            className="w-full p-3 border border-solid border-lightSecond rounded-md mt-2 mb-4 resize-y text-white bg-darkSecond hover:border-primary"
            type="textarea"
            id="description"
            name="description"
            placeholder="Descripción de la nota..."
            required
          />

          {noteCode !== "0" ? (
            <>
              <label className="text-lightPrimary text-lg font-medium" htmlFor="penalty">
                Sanción Final
              </label>
              <input
                className="w-full p-3 border border-solid border-lightSecond rounded-md mt-2 mb-4 resize-y text-white bg-darkSecond hover:border-primary"
                id="penalty"
                name="penalty"
                type="text"
                placeholder="20s"
                required
              />
            </>
          ) : (
            <div className="relative group">
              <label className="text-lightPrimary text-lg font-medium" htmlFor="penalty">
                Sanción Final
              </label>
              <input
                className="w-full p-3 border border-solid border-lightSecond rounded-md mt-2 mb-4 resize-y text-white bg-darkSecond opacity-60 cursor-not-allowed"
                id="penalty"
                name="penalty"
                type="text"
                placeholder="No disponible para Notas de Carrera"
                disabled
                tabIndex={-1}
                aria-disabled="true"
              />
              <div className="absolute left-0 top-full mt-1 w-max bg-darkSecond text-lightPrimary text-xs rounded px-3 py-2 border border-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Solo puedes añadir una sanción si el código de nota es distinto de "Notas de Carrera".
              </div>
            </div>
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
    )
}