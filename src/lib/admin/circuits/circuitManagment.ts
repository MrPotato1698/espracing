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
      const response = await fetch('/api/admin/circuit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ circuitData }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error ?? 'Error desconocido');
      }
      showToast("Circuito creado con éxito, junto a sus variantes", "success");
      form.reset();
      window.location.reload();
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      showToast("Hubo un error al procesar el archivo. Por favor, inténtalo de nuevo.", "error");
    }
  });
}
