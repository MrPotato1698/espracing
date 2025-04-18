import { supabase } from '@/db/supabase';
import { parseAcd, exportFilesToJson, findFileInAcd, parseIniContent } from '@/lib/ACDFiles/acdParser';
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
  const fileInfo = document.getElementById('fileInfo') as HTMLElement;

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

  // NUEVO: Referencias a switches y campos de edición avanzada
  const editFields = [
    { key: 'model', switchId: 'editModelSwitch', inputId: 'editModelInput' },
    { key: 'year', switchId: 'editYearSwitch', inputId: 'editYearInput' },
    { key: 'description', switchId: 'editDescriptionSwitch', inputId: 'editDescriptionInput' },
    { key: 'power', switchId: 'editPowerSwitch', inputId: 'editPowerInput' },
    { key: 'torque', switchId: 'editTorqueSwitch', inputId: 'editTorqueInput' },
    { key: 'weight', switchId: 'editWeightSwitch', inputId: 'editWeightInput' },
    { key: 'tyreTimeChange', switchId: 'editTyreTimeSwitch', inputId: 'editTyreTimeInput' },
    { key: 'maxLiter', switchId: 'editMaxLiterSwitch', inputId: 'editMaxLiterInput' },
    { key: 'fuelLiterTime', switchId: 'editFuelLiterTimeSwitch', inputId: 'editFuelLiterTimeInput' },
  ];

  const carBrandSelect = document.getElementById("carbrand") as HTMLSelectElement;

  const newBrandCar = document.getElementById("newBrandCar") as HTMLSelectElement;
  const newImgBrandCar = document.getElementById("newImgBrandCar") as HTMLSelectElement;
  const newCountryCar = document.getElementById("newCountryCar") as HTMLSelectElement;
  const newFoundationCar = document.getElementById("newFoundationCar") as HTMLSelectElement;

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
      editFields.forEach(({switchId, inputId}) => {
        const sw = document.getElementById(switchId) as HTMLInputElement;
        const inp = document.getElementById(inputId) as HTMLInputElement;
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
        editFields.forEach(({switchId}) => {
          const sw = document.getElementById(switchId) as HTMLInputElement;
          if (sw) sw.closest('.flex')?.classList.remove('hidden');
        });
      } else {
        moreDataContainer?.classList.add('hidden');
        editFields.forEach(({switchId, inputId}) => {
          const sw = document.getElementById(switchId) as HTMLInputElement;
          const inp = document.getElementById(inputId) as HTMLInputElement;
          if (sw) sw.checked = false;
          if (inp) inp.classList.add('hidden');
        });
      }
    });
  }

  // NUEVO: Mostrar campo de edición si se activa el switch correspondiente
  editFields.forEach(({switchId, inputId, key}) => {
    const sw = document.getElementById(switchId) as HTMLInputElement;
    const inp = document.getElementById(inputId) as HTMLInputElement;
    if (sw && inp) {
      sw.addEventListener('change', () => {
        if (sw.checked) {
          inp.classList.remove('hidden');
          inp.value = carData ? String(carData[key as keyof ProcessedCarData] ?? '') : '';
        } else {
          inp.classList.add('hidden');
        }
      });
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
    }
  });

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

        if(!carClassCoincidenceError) classData = { id: carClassCoincidence?.id || -1, name: carClassCoincidence?.name || 'No class', shortname: carClassCoincidence?.short_name || 'XXX'};

        const { data: carBrandCoincidence, error: carBrandCoincidenceError } = await supabase
          .from('carbrand')
          .select("id, name")
          .like('name', '%'+(baseJson as CarJson).brand+'%')
          .single();

        if(!carBrandCoincidenceError) brandData = { id: carBrandCoincidence?.id || -1, name: carBrandCoincidence?.name || 'No brand name'};

        baseData= {
          model: (baseJson as CarJson).name || 'No model name',
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
        fileEntry.file((file: File) => {
          const reader = new FileReader();
          reader.onload = () => {
            const json = JSON.parse(reader.result as string);
            if (typeof json === 'object' && json !== null) {
              resolve(json as CarJson);
            } else {
              reject(new Error('Invalid JSON format'));
            }
          };
          reader.onerror = reject;
          reader.readAsText(file);
        }, reject);
      }, reject);
    });
  }

  async function getDataACD(dir: any): Promise<Partial<CarDataBase>> {
    return new Promise((resolve, reject) => {
      //console.log("Iniciando getDataACD para directorio:", dir.name);
      dir.getFile("data.acd",{ create: false }, async (fileEntry: any) => {
          try {
            //console.log("Archivo data.acd encontrado, obteniendo File object");
            const file = await new Promise<File>((resolveFile) => {fileEntry.file(resolveFile)});
            //console.log("File object obtenido:", file.name, "Tamaño:", file.size, "bytes");

            const arrayBuffer = await file.arrayBuffer()
            const data = new Uint8Array(arrayBuffer)
            //console.log(`Tamaño del archivo data.acd: ${data.length} bytes`)

            try {
              // Usar nuestro parser ACD
              const files = parseAcd(data, dir.name)
              //console.log("Archivos encontrados:",files.map((f) => `${f.name} (${f.content.length} bytes)`),)

              // Exportar todos los archivos a JSON para inspección (opcional)
              const jsonExport = exportFilesToJson(files)
              //console.log("Exportación JSON de archivos:", jsonExport)

              const carIniFile = findFileInAcd(files, "car.ini")
              if (!carIniFile) {
                //console.error("Archivos disponibles:",files.map((f) => f.name),)
                throw new Error("No se encontró car.ini en el archivo data.acd")
              }

              const iniContent = parseIniContent(carIniFile.content)
              //console.log("Secciones encontradas en car.ini:", Object.keys(iniContent))

              // Mostrar contenido de secciones importantes
              if (iniContent["PIT_STOP"]) {
                //console.log("Sección PIT_STOP:", iniContent["PIT_STOP"])
              }
              if (iniContent["FUEL"]) {
                //console.log("Sección FUEL:", iniContent["FUEL"])
              }

              const carData: Partial<CarDataBase> = {
                tyreTimeChange: Number.parseFloat(iniContent["PIT_STOP"]?.["TYRE_CHANGE_TIME_SEC"] || "0"),
                fuelLiterTime: Number.parseFloat(iniContent["PIT_STOP"]?.["FUEL_LITER_TIME_SEC"] || "0"),
                maxLiter: Number.parseFloat(iniContent["FUEL"]?.["MAX_FUEL"] || "0"),
              }

              //console.log("Datos extraídos:", carData)
              resolve(carData)
            } catch (parseError) {
              console.error("Error al parsear el archivo ACD:", parseError)
              reject(
                new Error(
                  "Error al procesar el archivo data.acd: " +
                    (parseError instanceof Error ? parseError.message : String(parseError)),
                ),
              )
            }
          } catch (error) {
            console.error("Error en getDataACD:", error)
            reject(new Error("Error al procesar el archivo data.acd: " + (error as Error).message))
          }
        },
        (fileError: any) => {
          console.error("Error al obtener el archivo data.acd:", fileError);
          reject(new Error("No se pudo acceder al archivo data.acd: " + fileError.message));
        },
      )
    })
  }


  function updatePreview(data: ProcessedCarData){
    // Elimina el nombre de la marca del modelo si ya está incluido (ignorando mayúsculas/minúsculas)
    const brandName = data.brandName.trim();
    let model = data.model.trim();
    if (brandName && model.toLowerCase().startsWith(brandName.toLowerCase())) {
      model = model.slice(brandName.length).trim();
    }
    previewName.textContent = brandName + (model ? ' ' + model : '');
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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if(!carData) return;
    const carClassValue = carClassSelect?.value;
    const carBrandValue = carBrandSelect?.value;

    // NUEVO: Sobrescribir carData con los valores de los campos editados si su checkbox está activo
    editFields.forEach(({switchId, inputId, key}) => {
      const sw = document.getElementById(switchId);
      const inp = document.getElementById(inputId) as HTMLInputElement;
      // Radix Checkbox usa aria-checked en vez de checked
      const isChecked = sw?.getAttribute('aria-checked') === 'true';
      if (isChecked && inp && inp.value !== undefined && inp.value !== null && inp.value !== '') {
        let value: any = inp.value;
        if (["year", "power", "torque", "weight", "tyreTimeChange", "maxLiter", "fuelLiterTime"].includes(key)) {
          value = Number(value);
        }
        (carData as any)[key] = value;
      }
    });

    try {
      let lastBrandID: Number = 0;
      let lastClassID: Number = 0;

      switch (carBrandValue) {
        case "-1": // No variar
          lastBrandID = carData.brandID;
          break;

        case "-2": // Crear nueva marca
          try {
            const { data: getLastCarBrand } = await supabase
              .from('carbrand')
              .select('id')
              .order('id', { ascending: false })
              .limit(1)
              .single();

            lastBrandID = getLastCarBrand ? (getLastCarBrand.id + 1) : 1;

            const { data: insertBrandData, error: insertBrandError } = await supabase
              .from('carbrand')
              .insert({
                id: Number(lastBrandID),
                name: String(newBrandCar),
                imgbrand: String(newImgBrandCar),
                location: String(newCountryCar),
                foundation: Number(newFoundationCar.value)
              });
            if (insertBrandError) throw insertBrandError;

          } catch (error) {
            showToast("Error al crear la marca del coche: "+ error, "error");
            console.error("Error al crear la marca del coche: "+ error);
          }
          break;

        default:
          lastBrandID = Number(carBrandValue);
          break;
      }

      switch (carClassValue) {
        case "-1": // No variar
          lastClassID = carData.classID;
          break;

        case "-2": // Crear nueva clase
          try {
            const { data: getLastClass } = await supabase
            .from('carclass')
            .select('id')
            .order('id', { ascending: false })
            .limit(1)
            .single();

          lastClassID = getLastClass ? (getLastClass.id + 1) : 1;

          const newClassDesign = ` bg-[${newClassBackgroundColor}] text-[${newClassTextColor}]`;

          const { data: insertClassData, error: insertClassError } = await supabase
            .from('carclass')
            .insert({
              id: Number(lastClassID),
              name: String(newClassName),
              short_name: String(newClassShortName),
              class_design: String(newClassDesign),
            });

          if (insertClassError) throw insertClassError;

          } catch (error) {
            showToast("Error al crear la clase: "+ error, "error");
            console.error("Error al crear la clase: "+ error);
          }
          break;

        default:
          lastClassID = Number(carClassValue);
          break;
      }

      //console.log('BrandID' + lastBrandID);
      //console.log('ClassID' + lastClassID);

      const { data: getLastCar } = await supabase
        .from('car')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single();

      const lastCarID = getLastCar ? (getLastCar.id + 1) : 1;

      const { data: insertData, error: insertError } = await supabase
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
          } else {
            console.error("Error eliminando coche");
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }
    });
  });
}