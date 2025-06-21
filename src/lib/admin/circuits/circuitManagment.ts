import { supabase } from '@/db/supabase';
import { showToast } from "@/lib/utils";

interface CircuitLayoutData {
  name: string;
  filename: string;
  length: number;
  capacity: number;
}

interface CircuitDataFile {
  name: string;
  shortname: string;
  filename: string;
  location: string;
  layouts: CircuitLayoutData[];
}

interface ProcessedCircuitData extends CircuitDataFile {
  shortname: string;
  cleanInstall: boolean;
}

interface TrackJson {
  name: string;
  city: string;
  country: string;
  length?: number;
  pitboxes?: number;
}

export function initCircuitManagement() {
  const form = document.getElementById("uploadForm") as HTMLFormElement;
  const switchCleanInstall = document.getElementById("switch-clean_install") as HTMLInputElement | null;

  const shortNameCircuit = document.getElementById("circuitshotname") as HTMLInputElement;
  const dropZone = document.getElementById("dropZone") as HTMLInputElement;
  const fileInfo = document.getElementById('fileInfo') as HTMLElement;
  const previewName = document.getElementById('previewName') as HTMLElement;
  const previewLocation = document.getElementById('previewLocation') as HTMLElement;
  const previewFolder = document.getElementById('previewFolder') as HTMLElement;
  const previewLayouts = document.getElementById('previewVariants') as HTMLElement;

  let circuitData: ProcessedCircuitData | null = null;

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add('border-darkPrimary', 'bg-darkSecond');
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove('border-darkPrimary', 'bg-darkSecond');
  });

  dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-darkPrimary', 'bg-darkSecond');

    if (!e.dataTransfer?.items.length) return;
    const entry = e.dataTransfer.items[0].webkitGetAsEntry();
    if(entry?.isDirectory){
      circuitData = await processDroppedFolder(entry);
      updatePreview(circuitData);
      fileInfo.classList.remove('hidden');
    }
  });

  async function processDroppedFolder(rootEntry: any): Promise<ProcessedCircuitData> {
    const result: ProcessedCircuitData = {
      filename: rootEntry.name,
      name: "",
      shortname: "",
      location: "",
      layouts: [],
      cleanInstall: switchCleanInstall?.checked || false,
    };

    const uiDir = await getDirectoryEntry(rootEntry, 'ui');

    const baseData = await getCircuitBaseData(uiDir);
    Object.assign(result, baseData);

    result.layouts = await processLayouts(uiDir);

    return result;
  }

  async function getDirectoryEntry(parent: any, name: string) {
    return new Promise((resolve) => {
      parent.getDirectory(name, { create: false }, resolve, () => resolve(null));
    });
  }

  async function getCircuitBaseData(uiDir: any){
    let baseData = {
      name: '',
      location: ''
    };

    if(uiDir){
      try{
        const baseJson = await getJsonFile(uiDir, 'ui_track.json');
        baseData= {
          name: (baseJson as TrackJson).name,
          location: (baseJson as TrackJson).city + ', ' + (baseJson as TrackJson).country
        };
      } catch {
        const firstLayout = await getFirstLayout(uiDir);
        if (firstLayout?.json){
          baseData = {
            name: firstLayout.json.name,
            location: firstLayout.json.city + ', ' + firstLayout.json.country
          };
        }
      }
    }
    return baseData;
  }

  async function processLayouts(uiDir: any) {
    const layouts: CircuitLayoutData[] = [];

    // Procesar variante base, si existe
    try {
      const baseJson = await getJsonFile(uiDir, 'ui_track.json');
      layouts.push(await createLayout(baseJson, ''));
    } catch {}

    // Procesar subcarpetas, si existen
    const subDirs = await getLayoutsDirectories(uiDir);
    for (const dir of subDirs) {
      try {
        const variantJson = await getJsonFile(dir, 'ui_track.json');
        layouts.push(await createLayout(variantJson, dir.name));
      } catch {}
    }
    return layouts;
  }

  async function createLayout(json: any, filename: string): Promise<CircuitLayoutData> {
    return {
      name: json.name,
      filename,
      length: json.length,
      capacity: json.pitboxes
    };
  }

  async function getJsonFile(dir: any, filename: string) {
    return new Promise((resolve, reject) => {
      dir.getFile(filename, { create: false }, (fileEntry: any) => {
        handleFileEntry(fileEntry, resolve, reject);
      }, reject);
    });
  }

  function handleFileEntry(fileEntry: any, resolve: (value: unknown) => void, reject: (reason?: any) => void) {
    fileEntry.file((file: File) => {
      readFileAsJson(file, resolve, reject);
    }, reject);
  }

  function readFileAsJson(file: File, resolve: (value: unknown) => void, reject: (reason?: any) => void) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        if (typeof json === 'object' && json !== null) {
          resolve(json as TrackJson);
        } else {
          reject(new Error('Invalid JSON format'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  }

  async function getLayoutsDirectories(uiDir: any) {
    if (!uiDir) return [];
    const reader = uiDir.createReader();
    const entries = await new Promise<FileSystemEntry[]>((resolve) => reader.readEntries(resolve));
    return entries.filter(entry => entry.isDirectory && entry.name !== 'ui') as FileSystemDirectoryEntry[];
  }

  async function getFirstLayout(uiDir: any){
    const subDirs = await getLayoutsDirectories(uiDir);
    for (const dir of subDirs) {
      try {
        const json = await getJsonFile(dir, 'ui_track.json') as TrackJson;
        return { name: json.name, json };
      } catch {}
    }
    return null;
  }

  function updatePreview(data: ProcessedCircuitData){
    previewName.textContent = data.name;
    previewLocation.textContent = data.location;
    previewFolder.textContent = data.filename;

    previewLayouts.innerHTML = data.layouts.map(l => `<li>${l.name} (${l.filename || 'base'}): ${l.length}m, ${l.capacity} boxes</li>`).join('');
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!circuitData) return;

    circuitData.shortname = shortNameCircuit.value;
    circuitData.cleanInstall = switchCleanInstall?.checked || false;
    try {
      let lastRaceID = await getNextCircuitId(circuitData);

      const { error: insertError } = await supabase
        .from('circuit')
        .insert({
          id: lastRaceID,
          name: circuitData.name,
          shortname: circuitData.shortname,
          filename: circuitData.filename,
          location: circuitData.location,
        });

      if (insertError) throw insertError;

      await insertLayouts(circuitData.layouts, lastRaceID);

      showToast("Circuito creado con éxito, junto a sus variantes", "success");
      form.reset();
      window.location.reload();
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      showToast("Hubo un error al procesar el archivo. Por favor, inténtalo de nuevo.", "error");
    }
  });

  async function getNextCircuitId(circuitData: ProcessedCircuitData): Promise<number> {
    let lastRaceID = -1;
    if (circuitData.cleanInstall) {
      const { data: cleanInstallData } = await supabase
        .from('circuit')
        .delete()
        .eq('filename', circuitData.filename)
        .select('id')
        .single();
      lastRaceID = cleanInstallData?.id ?? -1;
    }

    if (!circuitData.cleanInstall || lastRaceID === -1) {
      const { data: getLastRace } = await supabase
        .from('circuit')
        .select('id')
        .order('id', { ascending: true });

      if (!getLastRace) throw new Error("Error al obtener el último ID de campeonato");
      const length = getLastRace.length;
      let i = 1;
      let findID = false;
      console.log('Circuit: ',getLastRace);
      while (!findID && i < length) {
        if (getLastRace[i - 1].id === i) {
          i++;
        } else {
          findID = true;
        }
      }
      if (!findID) i++;

      console.log('Circuit NEW ID: ',i);
      console.log('Circuit LAST ID: ',getLastRace[length-1].id);

      lastRaceID = getLastRace ? i : 1;
    }
    return lastRaceID;
  }

  async function insertLayouts(layouts: CircuitLayoutData[], lastRaceID: number) {
    // Obtener todos los IDs existentes ordenados
    const { data: allLayouts } = await supabase
      .from('circuitLayout')
      .select('id')
      .order('id', { ascending: true });

    const existingIds = allLayouts ? allLayouts.map((l: any) => l.id) : [];
    const needed = layouts.length;
    const startId = findConsecutiveStartId(existingIds, needed);

    for (let index = 0; index < layouts.length; index++) {
      const layout = layouts[index];
      const { error: insertLayoutError } = await supabase
        .from('circuitLayout')
        .insert({
          id: Number(startId + index),
          name: layout.name,
          filename: layout.filename,
          circuit: lastRaceID,
          length: Number(String(layout.length).replace(/\D/g, '')),
          capacity: Number(String(layout.capacity).replace(/\D/g, ''))
        });

      if (insertLayoutError) throw insertLayoutError;
    }
  }

  function findConsecutiveStartId(existingIds: number[], needed: number): number {
    console.log('Layouts: ',existingIds);
    if (existingIds.length === 0) {
      return 1;
    }
    let i = 1;
    while (true) {
      let fits = true;
      for (let j = 0; j < needed; j++) {
        if (existingIds.includes(i + j)) {
          fits = false;
          break;
        }
      }
      if (fits) {
        return i;
      }
      i++;
    }
  }
}



export function initEditCircuit() {

  const form = document.getElementById('editCircuitForm') as HTMLFormElement;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    try {
      const response = await fetch('/api/admin/circuit/editcircuit', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor: ' + response.statusText);
      }

      const result = await response.json();

      if (result.success) {
        showToast('Circuito actualizado con éxito', 'success');
        window.location.href = '/admin/admincircuits';
      } else {
        throw new Error(result.error ?? 'Error desconocido');
      }
    } catch (error) {
      showToast('Error al actualizar el circuito: ' + error, 'error');
      console.error('Error:', error);
    }
  });
}
