import { supabase } from '@/db/supabase';
import { parseAcd, findFileInAcd, parseIniContent } from '@/lib/ACDFiles/acdParser';
import { showToast } from '@/lib/utils';

import type { CarDataBase } from '@/types/Utils';

interface ProcessedCarData extends CarDataBase {
  cleanInstall: boolean;
}

interface CarJson {
  name: string;
  brand: string;
  description: string;
  class: string;
  specs:{
    bhp: string;
    torque: string;
    weight: string;
  }
  country: string;
  year: number;
}

export function initCarManagement() {
  const form = document.getElementById("uploadForm") as HTMLFormElement;
  const switchCleanInstall = document.getElementById("switch-clean_install") as HTMLInputElement | null;

  const dropZone = document.getElementById("dropZone") as HTMLInputElement;
  const fileData = document.getElementById('fileData') as HTMLElement;

  const previewName = document.getElementById('previewName') as HTMLElement;
  const previewYear = document.getElementById('previewYear') as HTMLElement;
  const previewLocation = document.getElementById('previewLocation') as HTMLElement;
  const previewFolder = document.getElementById('previewFolder') as HTMLElement;
  const previewClass = document.getElementById('previewClass') as HTMLElement;
  const previewPower = document.getElementById('previewPower') as HTMLElement;
  const previewTorque = document.getElementById('previewTorque') as HTMLElement;
  const previewWeight = document.getElementById('previewWeight') as HTMLElement;
  const previewTyreTime = document.getElementById('previewTyreTime') as HTMLElement;
  const previewMaxLiter = document.getElementById('previewMaxLiter') as HTMLElement;
  const previewFuelLiterTime = document.getElementById('previewFuelLiterTime') as HTMLElement;

  // NUEVO: Referencias para el switch y contenedor de edición avanzada
  const switchMoreData = document.getElementById("switch-moreData") as HTMLInputElement;
  const moreDataContainer = document.getElementById("moreDataContainer") as HTMLElement;
  const carBrandSelect = document.getElementById("carbrand") as HTMLSelectElement;

  const carClassSelect = document.getElementById("carClasses") as HTMLSelectElement;

  const newClassName = document.getElementById("newClassName") as HTMLSelectElement;
  const newClassShortName = document.getElementById("newClassShortName") as HTMLSelectElement;
  const newClassBackgroundColor = document.getElementById("newClassBackgroundColor") as HTMLSelectElement;
  const newClassTextColor = document.getElementById("newClassTextColor") as HTMLSelectElement;

  let carData: ProcessedCarData | null = null;

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
      carData = await processDroppedFolder(entry);
      updatePreview(carData);
      fileData.classList.remove('hidden');
      // NUEVO: Mostrar el switch de edición avanzada
      if (switchMoreData) switchMoreData.closest('.flex')?.classList.remove('hidden');
      if (moreDataContainer) moreDataContainer.classList.add('hidden'); // Ocultar campos avanzados por defecto
      // Resetear switches e inputs de edición avanzada
      const editFieldDivs = document.querySelectorAll('#moreDataContainer [data-edit-field]');
      editFieldDivs.forEach(div => {
        const sw = div.querySelector('[id$="Switch"]') as HTMLInputElement;
        const inp = div.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
        if (sw) sw.checked = false;
        if (inp) {
          inp.value = carData ? String(carData[inp.name as keyof ProcessedCarData] ?? '') : '';
          inp.classList.add('hidden');
        }
        if (sw) sw.closest('.flex')?.classList.add('hidden');
      });
    }
  });

  // NUEVO: Mostrar/ocultar contenedor de switches de edición avanzada
  if (switchMoreData) {
    switchMoreData.addEventListener('change', () => {
      if (switchMoreData.checked) {
        moreDataContainer?.classList.remove('hidden');
        // Mostrar switches de edición
        const editFieldDivs = document.querySelectorAll('#moreDataContainer [data-edit-field]');
        editFieldDivs.forEach(div => {
          const sw = div.querySelector('[id$="Switch"]') as HTMLInputElement;
          if (sw) sw.closest('.flex')?.classList.remove('hidden');
        });
      } else {
        moreDataContainer?.classList.add('hidden');
        const editFieldDivs = document.querySelectorAll('#moreDataContainer [data-edit-field]');
        editFieldDivs.forEach(div => {
          const sw = div.querySelector('[id$="Switch"]') as HTMLInputElement;
          const inp = div.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
          if (sw) sw.checked = false;
          if (inp) inp.classList.add('hidden');
        });
      }
    });
  }

  // NUEVO: Observer global para detectar checkboxes y asociarles el observer de aria-checked
  function setupEditFieldObservers() {
    const editFieldDivs = document.querySelectorAll('#moreDataContainer [data-edit-field]');
    editFieldDivs.forEach(div => {
      // Evitar duplicar observers
      if ((div as any).__observerAttached) return;
      const sw = div.querySelector('[id$="Switch"]');
      const inp = div.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
      const key = div.getAttribute('data-edit-field');
      if (sw && inp && key) {
        // Usar MutationObserver para detectar cambios en aria-checked
        const observer = new MutationObserver(() => {
          const isChecked = sw.getAttribute('aria-checked') === 'true';
          if (isChecked) {
            inp.classList.remove('hidden');
            inp.value = carData ? String(carData[key as keyof ProcessedCarData] ?? '') : '';
          } else {
            inp.classList.add('hidden');
          }
        });
        observer.observe(sw, { attributes: true, attributeFilter: ['aria-checked'] });
        // Actualizar carData en tiempo real
        inp.addEventListener('input', () => {
          if (!carData) return;
          let value: any = inp.value;
          if (["year", "power", "torque", "weight", "tyreTimeChange", "maxLiter", "fuelLiterTime"].includes(key)) {
            value = Number(value);
          }
          (carData as any)[key] = value;
          updatePreview(carData);
        });
        (div as any).__observerAttached = true;
      }
    });
  }

  // Observer global para detectar aparición de checkboxes en el DOM
  const moreDataContainerObserver = new MutationObserver(() => {
    setupEditFieldObservers();
  });
  if (moreDataContainer) {
    moreDataContainerObserver.observe(moreDataContainer, { childList: true, subtree: true });
    // Llamar una vez al inicio por si ya están montados
    setupEditFieldObservers();
  }

  async function processDroppedFolder(rootEntry: any): Promise<ProcessedCarData> {
    const result: ProcessedCarData = {
      id: 0,
      filename: rootEntry.name,
      model: "",
      year: 0,
      location: "",
      power: 0,
      torque: 0,
      weight: 0,
      description: "",
      tyreTimeChange: 0,
      fuelLiterTime: 0,
      maxLiter: 0,
      brandID: 0,
      brandName: "",
      classID: 0,
      className: "",

      cleanInstall: switchCleanInstall?.checked || false,
    };

    const uiDir = await getDirectoryEntry(rootEntry, 'ui');

    const baseData = await getCarBaseData(uiDir);
    const extraCarData = await getDataACD(rootEntry);
    Object.assign(result, baseData, extraCarData);

    return result;
  }

  async function getDirectoryEntry(parent: any, name: string) {
    return new Promise((resolve) => {
      parent.getDirectory(name, { create: false }, resolve, () => resolve(null));
    });
  }

  async function getCarBaseData(uiDir: any){
    let baseData = {
      model: '',
      year: 0,
      location: '',
      power: 0,
      torque: 0,
      weight: 0,
      description: '',
      brandID: 0,
      brandName: '',
      classID: 0,
      className: ''
    };

    if(uiDir){
      try{
        const baseJson = await getJsonFile(uiDir, 'ui_car.json');
        let classData ={ id: -1, name: '', shortname: '' }
        let brandData ={ id: -1, name: '' }
        const { data: carClassCoincidence, error: carClassCoincidenceError } = await supabase
          .from('carclass')
          .select("id, name, short_name")
          .like('name', '%'+(baseJson as CarJson).class+'%')
          .single();

        if(!carClassCoincidenceError) classData = { id: carClassCoincidence?.id ?? -1, name: carClassCoincidence?.name ?? 'No class', shortname: carClassCoincidence?.short_name ?? 'XXX'};

        const { data: carBrandCoincidence, error: carBrandCoincidenceError } = await supabase
          .from('carbrand')
          .select("id, name")
          .like('name', '%'+(baseJson as CarJson).brand+'%')
          .single();

        if (!carBrandCoincidenceError)
          brandData = {id: carBrandCoincidence?.id ?? -1, name: carBrandCoincidence?.name ?? 'No brand name'};

        // Elimina todas las apariciones (ignorando mayúsculas/minúsculas) de la marca en el nombre del modelo
        let rawModel = (baseJson as CarJson).name || 'No model name';
        const brandPattern = new RegExp(brandData.name, 'gi');
        let cleanedModel = rawModel.replace(brandPattern, '').replace(/\s+/g, ' ').trim();

        baseData = {
          model: cleanedModel || 'No model name',
          year: (baseJson as CarJson).year ?? 0,
          location: (baseJson as CarJson).country || 'No location',
          description: (baseJson as CarJson).description || 'No description',
          power: Number((baseJson as CarJson).specs.bhp.replace(/\D/g, '')) || 0,
          torque: Number((baseJson as CarJson).specs.torque.replace(/\D/g, '')) || 0,
          weight: Number((baseJson as CarJson).specs.weight.replace(/\D/g, '')) || 0,
          brandID: brandData.id,
          brandName: brandData.name,
          classID: classData.id,
          className: classData.name + ' (' + classData.shortname + ')'
        };
      } catch {
        baseData= {
          model: "No model name",
          year: 0,
          location: "No location",
          description: "No description",
          power: 0,
          torque: 0,
          weight: 0,
          brandID: -1,
          brandName: "No brand name",
          classID: -1,
          className: "No class"
        };

      }
    }
    return baseData;
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
      handleFileRead(file, resolve, reject);
    }, reject);
  }

  function handleFileRead(file: File, resolve: (value: unknown) => void, reject: (reason?: any) => void) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        if (typeof json === 'object' && json !== null) {
          resolve(json as CarJson);
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

  async function handleCarIniFile(carIniEntry: any): Promise<Partial<CarDataBase>> {
    try {
      const file: File = await new Promise<File>((resolveFile, rejectFile) => carIniEntry.file(resolveFile, rejectFile));
      const text = await file.text();
      const iniContent = parseIniContent(new TextEncoder().encode(text));
      return {
        tyreTimeChange: Number.parseFloat(iniContent["PIT_STOP"]?.["TYRE_CHANGE_TIME_SEC"] || "0"),
        fuelLiterTime: Number.parseFloat(iniContent["PIT_STOP"]?.["FUEL_LITER_TIME_SEC"] || "0"),
        maxLiter: Number.parseFloat(iniContent["FUEL"]?.["MAX_FUEL"] || "0"),
      };
    } catch (parseError) {
      console.error("Error al leer car.ini en carpeta data:", parseError);
      throw new Error("Error al procesar el archivo car.ini en carpeta data: " + (parseError instanceof Error ? parseError.message : String(parseError)));
    }
  }

  async function fallbackToAcd(dir: any): Promise<Partial<CarDataBase>> {
    try {
      const fileEntry = await getFileEntry(dir, "data.acd");
      const file: File = await getFileFromEntry(fileEntry);
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const files = parseAcd(data, dir.name);
      const carIniFile = findFileInAcd(files, "car.ini");
      if (!carIniFile) {
        throw new Error("No se encontró car.ini en el archivo data.acd");
      }
      const iniContent = parseIniContent(carIniFile.content);
      return {
        tyreTimeChange: Number.parseFloat(iniContent["PIT_STOP"]?.["TYRE_CHANGE_TIME_SEC"] || "0"),
        fuelLiterTime: Number.parseFloat(iniContent["PIT_STOP"]?.["FUEL_LITER_TIME_SEC"] || "0"),
        maxLiter: Number.parseFloat(iniContent["FUEL"]?.["MAX_FUEL"] || "0"),
      };
    } catch (parseError) {
      console.error("Error al parsear el archivo ACD:", parseError);
      throw new Error(
        "Error al procesar el archivo data.acd: " +
          (parseError instanceof Error ? parseError.message : String(parseError)),
      );
    }
  }

  function getFileEntry(dir: any, filename: string): Promise<any> {
    return new Promise((resolve, reject) => {
      dir.getFile(
        filename,
        { create: false },
        (fileEntry: any) => resolve(fileEntry),
        (fileError: any) => {
          console.error(`Error al obtener el archivo ${filename}:`, fileError);
          reject(new Error(`No se pudo acceder al archivo ${filename}: ` + fileError.message));
        }
      );
    });
  }

  function getFileFromEntry(fileEntry: any): Promise<File> {
    return new Promise<File>((resolve, reject) => {
      fileEntry.file(resolve, reject);
    });
  }

  async function getDataACD(dir: any): Promise<Partial<CarDataBase>> {
    return new Promise((resolve, reject) => {
      const handleCarIniSuccess = async (carIniEntry: any) => {
        try {
          const carData = await handleCarIniFile(carIniEntry);
          resolve(carData);
        } catch (err) {
          console.error("Error al manejar car.ini en carpeta data:", err);
          handleFallback();
        }
      };

      const handleCarIniError = async (_fileError: any) => {
        handleFallback();
      };

      const handleDataDirSuccess = (dataDir: any) => {
        dataDir.getFile("car.ini", { create: false }, handleCarIniSuccess, handleCarIniError);
      };

      const handleDataDirError = async (_dirError: any) => {
        handleFallback();
      };

      const handleFallback = async () => {
        try {
          const fallbackData = await fallbackToAcd(dir);
          resolve(fallbackData);
        } catch (fallbackErr) {
          reject(fallbackErr instanceof Error ? fallbackErr : new Error(String(fallbackErr)));
        }
      };

      dir.getDirectory("data", { create: false }, handleDataDirSuccess, handleDataDirError);
    });
  }

  function updatePreview(data: ProcessedCarData){
    previewName.textContent = data.brandName + " " + data.model;
    previewYear.textContent = data.year?.toString();
    previewLocation.textContent = data.location;
    previewFolder.textContent = data.filename;

    previewClass.textContent = data.className;
    previewPower.textContent = data.power?.toString();
    previewTorque.textContent = data.torque?.toString();
    previewWeight.textContent = data.weight?.toString();

    previewTyreTime.textContent = data.tyreTimeChange?.toString();
    previewMaxLiter.textContent = data.maxLiter?.toString();
    previewFuelLiterTime.textContent = data.fuelLiterTime?.toString();
  }
  async function getBrandId(carBrandValue: string, carData: ProcessedCarData): Promise<number> {
    if (carBrandValue === "-1") {
      return carData.brandID;
    }
    return Number(carBrandValue);
  }

  async function getClassId(carClassValue: string, carData: ProcessedCarData): Promise<number> {
    switch (carClassValue) {
      case "-1":
        return carData.classID;
      case "-2":
        try {
          const { data: getLastClass } = await supabase
            .from('carclass')
            .select('id')
            .order('id', { ascending: false })
            .limit(1)
            .single();
          const lastClassID = getLastClass ? (getLastClass.id + 1) : 1;
          const newClassDesign = ` bg-[${newClassBackgroundColor.value}] text-[${newClassTextColor.value}]`;
          const { error: insertClassError } = await supabase
            .from('carclass')
            .insert({
              id: Number(lastClassID),
              name: String(newClassName.value),
              short_name: String(newClassShortName.value),
              class_design: String(newClassDesign),
            });
          if (insertClassError) throw insertClassError;
          return lastClassID;
        } catch (error) {
          showToast("Error al crear la clase: "+ error, "error");
          console.error("Error al crear la clase: "+ error);
          return carData.classID;
        }
      default:
        return Number(carClassValue);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if(!carData) return;
    const carClassValue = carClassSelect?.value;
    const carBrandValue = carBrandSelect?.value;

    // NUEVO: Sobrescribir carData con los valores de los campos editados si su checkbox está activo
    const editFieldDivs = document.querySelectorAll('#moreDataContainer [data-edit-field]');
    editFieldDivs.forEach(div => {
      const sw = div.querySelector('[id$="Switch"]');
      const inp = div.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
      const key = div.getAttribute('data-edit-field');
      const isChecked = sw?.getAttribute('aria-checked') === 'true';
      if (isChecked && inp && key && inp.value !== undefined && inp.value !== null && inp.value !== '') {
        let value: any = inp.value;
        if (["year", "power", "torque", "weight", "tyreTimeChange", "maxLiter", "fuelLiterTime"].includes(key)) {
          value = Number(value);
        }
        (carData as any)[key] = value;
      }
    });

    try {
      const lastBrandID = await getBrandId(carBrandValue, carData);
      const lastClassID = await getClassId(carClassValue, carData);

      const { data: getLastCar } = await supabase
        .from('car')
        .select('id')
        .order('id', { ascending: true });

      if(!getLastCar) throw new Error("Error al obtener el último ID de coche");
      let findID = false;
      let i = 1;
      while (!findID && i < getLastCar.length) {
        if (getLastCar[i-1].id === i) {
          i++;
        } else {
          findID = true;
        }
      }
      if (!findID) i++;
      const lastCarID = getLastCar ? i : 1;

      const { error: insertError } = await supabase
        .from('car')
        .insert({
          id: Number(lastCarID),
          filename: carData.filename,
          brand: Number(lastBrandID),
          model: carData.model,
          year: carData.year,
          class: Number(lastClassID),
          power: carData.power,
          torque: carData.torque,
          weight: carData.weight,
          description: carData.description,
          tyreTimeChange: carData.tyreTimeChange,
          fuelLiterTime: carData.fuelLiterTime,
          maxLiter: carData.maxLiter,
        });

      if (insertError) throw insertError;
      showToast("Coche creado con éxito", "success");

      form.reset();
      window.location.reload();
    } catch (error) {
      console.error("Error al crear el coche:", error);
      showToast("Error al crear el coche: "+ error, "error");
    }
  });
}

export function initDeleteCarButtons() {
  const deleteCarButtons = document.querySelectorAll(".delete-car");

  deleteCarButtons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      const id = button.getAttribute("data-id");

      if (confirm("¿Estás seguro de que quieres eliminar este coche?")) {
        try {
          const response = await fetch("/api/admin/championship/deletecar", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
          });

          if (response.ok) {
            const closestTr = button.closest("tr");
            if (closestTr) {
              closestTr.remove();
            }
            window.location.reload();
            showToast("Coche eliminado con éxito", "success");
          } else {
            showToast("Error eliminando coche", "error");
            console.error("Error eliminando coche");
          }
        } catch (error) {
          showToast("Error: " + error, "error");
          console.error("Error:", error);
        }
      }
    });
  });
}