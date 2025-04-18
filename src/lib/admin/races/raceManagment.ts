import { supabase } from '@/db/supabase';
import { createRaceData, createRaceDataMultipleSplits } from "@/lib/results/resultConverter";
import { showToast } from "@/lib/utils";

export function initRaceManagement() {
  const form = document.getElementById("uploadForm") as HTMLFormElement;
  const switchS2Element = document.getElementById("switch-S2") as HTMLInputElement | null;
  const switchR2Element = document.getElementById("switch-R2") as HTMLInputElement | null;

  const fileInputS1R1 = document.getElementById("fileInputS1R1") as HTMLInputElement;
  const fileInfoS1R1 = document.getElementById("fileInfoS1R1") as HTMLDivElement;
  const fileNameS1R1 = document.getElementById("fileNameS1R1") as HTMLSpanElement;

  const splitS2R1File = document.getElementById("split2R1File");
  const fileInputS2R1 = document.getElementById("fileInputS2R1") as HTMLInputElement;
  const fileInfoS2R1 = document.getElementById("fileInfoS2R1") as HTMLDivElement;
  const fileNameS2R1 = document.getElementById("fileNameS2R1") as HTMLSpanElement;

  const containerRace2 = document.getElementById("race2Files");
  const fileInputS1R2 = document.getElementById("fileInputS1R2") as HTMLInputElement;
  const fileInfoS1R2 = document.getElementById("fileInfoS1R2") as HTMLDivElement;
  const fileNameS1R2 = document.getElementById("fileNameS1R2") as HTMLSpanElement;

  const splitS2R2File = document.getElementById("split2R2File");
  const fileInputS2R2 = document.getElementById("fileInputS2R2") as HTMLInputElement;
  const fileInfoS2R2 = document.getElementById("fileInfoS2R2") as HTMLDivElement;
  const fileNameS2R2 = document.getElementById("fileNameS2R2") as HTMLSpanElement;


  function toggleInputsS2() {
    if (splitS2R1File && splitS2R2File && switchS2Element) {
      splitS2R1File.style.display = !switchS2Element.checked ? "none" : "block";
      splitS2R2File.style.display = !switchS2Element.checked ? "none" : "block";
      // Add a distinguishing behavior: toggle a class for edit mode
      splitS2R1File.classList.toggle("edit-mode", true);
      splitS2R2File.classList.toggle("edit-mode", true);
    }
  }

  function toggleInputR2() {
    if (containerRace2 && switchR2Element) {
      containerRace2.style.display = switchR2Element.checked ? "flex" : "none";
      containerRace2.classList.toggle("edit-mode", true);
    }
  }

  if (switchS2Element) switchS2Element.addEventListener("change", toggleInputsS2);
  if (switchR2Element) switchR2Element.addEventListener("change", toggleInputR2);

  fileInputS1R1.addEventListener("change", () => {
    const file = fileInputS1R1.files?.[0];
    if (file) {
      if (file.type === "application/json") {
        fileNameS1R1.textContent = file.name;
        fileInfoS1R1.classList.remove("hidden");
      } else {
        showToast("Por favor, selecciona un archivo JSON válido.", "error")
        fileInputS1R1.value = ""; // Limpiar la selección
        fileInfoS1R1.classList.add("hidden");
      }
    } else {
      fileInfoS1R1.classList.add("hidden");
    }
  });

  fileInputS2R1.addEventListener("change", () => {
    const file = fileInputS2R1.files?.[0];
    if (file) {
      if (file.type === "application/json") {
        fileNameS2R1.textContent = file.name;
        fileInfoS2R1.classList.remove("hidden");
      } else {
        showToast("Por favor, selecciona un archivo JSON válido.", "error")
        fileInputS2R1.value = ""; // Limpiar la selección
        fileInfoS2R1.classList.add("hidden");
      }
    } else {
      fileInfoS2R1.classList.add("hidden");
    }
  });

  fileInputS1R2.addEventListener("change", () => {
    const file = fileInputS1R2.files?.[0];
    if (file) {
      if (file.type === "application/json") {
        fileNameS1R2.textContent = file.name;
        fileInfoS1R2.classList.remove("hidden");
      } else {
        showToast("Por favor, selecciona un archivo JSON válido.", "error");
        fileInputS1R2.value = ""; // Limpiar la selección
        fileInfoS1R2.classList.add("hidden");
      }
    } else {
      fileInfoS1R2.classList.add("hidden");
    }
  });

  fileInputS2R2.addEventListener("change", () => {
    const file = fileInputS2R2.files?.[0];
    if (file) {
      if (file.type === "application/json") {
        fileNameS2R2.textContent = file.name;
        fileInfoS2R2.classList.remove("hidden");
      } else {
        showToast("Por favor, selecciona un archivo JSON válido.", "error");
        fileInputS2R2.value = ""; // Limpiar la selección
        fileInfoS2R2.classList.add("hidden");
      }
    } else {
      fileInfoS2R2.classList.add("hidden");
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate files and switches
    const { valid, files, numSplits } = validateRaceFiles();
    if (!valid) return;

    try {
      // Read and parse files
      const fileContents = await readRaceFiles(files);
      const formData = new FormData(form);
      const raceMeta = extractRaceMeta(formData);

      // Transform JSONs
      const { transformedJsonR1, transformedJsonR2 } = transformRaceJsons(
        fileContents, raceMeta, !!switchS2Element?.checked, !!switchR2Element?.checked
      );

      // Upload results to storage
      if (!files?.fileS1R1) {
        showToast("Error interno: archivos de carrera no definidos.", "error");
        return;
      }
      const URLBucketsResults = await uploadRaceResults(
        raceMeta, transformedJsonR1, transformedJsonR2, files.fileS1R1.name, switchR2Element?.checked ?? false
      );

      // Insert race into DB
      await insertRaceToDB(raceMeta, files.fileS1R1.name, numSplits, URLBucketsResults);

      // Update stats
      await updateRaceStats(transformedJsonR1, transformedJsonR2, URLBucketsResults);

      showToast("Carrera creada con éxito", "success");
      form.reset();
      fileInfoS1R1.classList.add("hidden");
      window.location.reload();
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      showToast("Hubo un error al procesar el archivo. Por favor, inténtalo de nuevo.", "error");
    }
  });

  function validateRaceFiles() {
    const fileS1R1 = fileInputS1R1.files?.[0];
    let fileS2R1, fileS1R2, fileS2R2;
    let numSplits: number = 1;
    if (!fileS1R1) {
      showToast("Por favor, selecciona un archivo JSON para la Carrera 1 del Split 1.", "error");
      return { valid: false };
    }
    if (switchR2Element?.checked) {
      fileS1R2 = fileInputS1R2.files?.[0];
      if (!fileS1R2) {
        showToast("Por favor, selecciona un archivo JSON para la Carrera 2 del Split 1.", "error");
        return { valid: false };
      }
    }
    if (switchS2Element?.checked) {
      fileS2R1 = fileInputS2R1.files?.[0];
      if (!fileS2R1) {
        showToast("Por favor, selecciona un archivo JSON para la Carrera 1 del Split 2.", "error");
        return { valid: false };
      }
      if (switchR2Element?.checked) {
        fileS2R2 = fileInputS2R2.files?.[0];
        if (!fileS2R2) {
          showToast("Por favor, selecciona un archivo JSON para la Carrera 2 del Split 2.", "error");
          return { valid: false };
        }
      }
      numSplits = 2;
    }
    return {
      valid: true,
      files: { fileS1R1, fileS2R1, fileS1R2, fileS2R2 },
      numSplits
    };
  }

  async function readRaceFiles(files: any) {
    const contentS1R1 = await files.fileS1R1.text();
    let contentS2R1, contentS1R2, contentS2R2;
    if (files.fileS2R1) contentS2R1 = await files.fileS2R1.text();
    if (files.fileS1R2) contentS1R2 = await files.fileS1R2.text();
    if (files.fileS2R2) contentS2R2 = await files.fileS2R2.text();
    return {
      contentS1R1,
      contentS2R1,
      contentS1R2,
      contentS2R2
    };
  }

  function extractRaceMeta(formData: FormData) {
    const racename = formData.get('racename') as string;
    const champID = formData.get('champID') as string;
    const numrace = formData.get('numrace') as string;
    const pointsystem = formData.get('pointsystem') as string;
    const racenameFile = racename.replace(/\s/g, '');
    return { racename, champID, numrace, pointsystem, racenameFile };
  }

  function transformRaceJsons(
    fileContents: any,
    raceMeta: any,
    isSplit2: boolean,
    isRace2: boolean
  ) {
    const jsonS1R1 = JSON.parse(fileContents.contentS1R1);
    let jsonS1R2, jsonS2R1, jsonS2R2;
    let transformedJsonR1: string;
    let transformedJsonR2: string = "{}";
    if (isRace2) {
      if (!fileContents.contentS1R2) throw new Error("Sin contenido en el archivo de Carrera 2 Split 1");
      jsonS1R2 = JSON.parse(fileContents.contentS1R2);
    }
    if (isSplit2) {
      if (isRace2) {
        if (!fileContents.contentS2R2) throw new Error("Sin contenido en el archivo de Carrera 2 Split 2");
        jsonS2R2 = JSON.parse(fileContents.contentS2R2);
        transformedJsonR2 = JSON.stringify(createRaceDataMultipleSplits(jsonS1R2, jsonS2R2));
      }
      if (!fileContents.contentS2R1) throw new Error("Sin contenido en el archivo de Carrera 2 Split 2");
      jsonS2R1 = JSON.parse(fileContents.contentS2R1);
      transformedJsonR1 = JSON.stringify(createRaceDataMultipleSplits(jsonS1R1, jsonS2R1));
    } else {
      transformedJsonR1 = JSON.stringify(createRaceData(jsonS1R1));
      if (isRace2) {
        transformedJsonR2 = JSON.stringify(createRaceData(jsonS1R2));
      }
    }
    return { transformedJsonR1, transformedJsonR2 };
  }

  async function uploadRaceResults(
    raceMeta: any,
    transformedJsonR1: string,
    transformedJsonR2: string,
    fileName: string,
    isRace2: boolean
  ) {
    let URLBucketsResults = new Array<string>(2).fill("");
    const { data: uploadRace1, error: uploadErrorR1 } = await supabase
      .storage
      .from('results')
      .upload(`${raceMeta.champID}/${raceMeta.numrace}_${raceMeta.racenameFile}Race1`, transformedJsonR1, {
        upsert: true
      });
    if (uploadErrorR1 || !uploadRace1) throw uploadErrorR1;
    URLBucketsResults[0] = uploadRace1.path;

    if (isRace2) {
      const { data: uploadRace2, error: uploadErrorR2 } = await supabase
        .storage
        .from('results')
        .upload(`${raceMeta.champID}/${raceMeta.numrace}_${raceMeta.racenameFile}Race2`, transformedJsonR2, {
          upsert: true
        });
      if (uploadErrorR2 || !uploadRace2) throw uploadErrorR2;
      URLBucketsResults[1] = uploadRace2.path;
    }
    return URLBucketsResults;
  }

  async function insertRaceToDB(
    raceMeta: any,
    fileName: string,
    numSplits: number,
    URLBucketsResults: string[]
  ) {
    const { data: getLastRace } = await supabase
      .from('race')
      .select('id')
      .order('id', { ascending: true });

    if (!getLastRace) throw new Error("Error al obtener el último ID de coche");
    let findID = false;
    let i = 1;
    while (!findID && i < getLastRace.length) {
      if (getLastRace[i - 1].id === i) {
        i++;
      } else {
        findID = true;
      }
    }
    if (!findID) i++;
    const lastRaceID = getLastRace ? i : 1;

    const { error: insertError } = await supabase
      .from('race')
      .insert({
        id: lastRaceID,
        name: raceMeta.racename,
        filename: fileName,
        championship: Number(raceMeta.champID),
        orderinchamp: Number(raceMeta.numrace),
        pointsystem: Number(raceMeta.pointsystem),
        splits: numSplits,
        race_data_1: URLBucketsResults[0],
        race_data_2: URLBucketsResults[1],
      });

    if (insertError) throw insertError;
  }

  async function updateRaceStats(
    transformedJsonR1: string,
    transformedJsonR2: string,
    URLBucketsResults: string[]
  ) {
    const raceData = JSON.parse(transformedJsonR1);
    const response = await fetch('/api/admin/stats/newRaceStats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resume: raceData.RaceDriversResume })
    });

    if (!response.ok) {
      throw new Error('Error actualizando estadísticas');
    }
    if (URLBucketsResults[1] !== "") {
      const raceData2 = JSON.parse(transformedJsonR2);
      const response2 = await fetch('/api/admin/stats/newRaceStats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume: raceData2.RaceDriversResume })
      });

      if (!response2.ok) {
        throw new Error('Error actualizando estadísticas de carrera 2');
      }
    }
  }
}

export function initDeleteRaceButtons() {
  const deleteRaceButtons = document.querySelectorAll(".delete-race");

  deleteRaceButtons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      const id = button.getAttribute("data-id");

      if (confirm("¿Estás seguro de que quieres eliminar esta carrera?")) {
        try {
          const response = await fetch("/api/admin/race/deleterace", {
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
            showToast("Carrera eliminada con éxito", "success");
            setTimeout(() => {window.location.reload();}, 100);
          } else {
            showToast("Error eliminando carrera", "error");
            console.error("Error eliminando carrera");
          }
        } catch (error) {
          showToast("Error eliminando carrera", "error");
          console.error("Error:", error);
        }
      }
    });
  });
}

export function initEditRace() {

  const form = document.getElementById('editRaceForm') as HTMLFormElement;

  const switchRacesElement = document.getElementById("switch-Races") as HTMLInputElement;
  const switchS2Element = document.getElementById("switch-S2") as HTMLInputElement;
  const switchR2Element = document.getElementById("switch-R2") as HTMLInputElement;


  const switchS2divElement = document.getElementById("switch-S2-DIV") as HTMLInputElement;
  const switchR2divElement = document.getElementById("switch-R2-DIV") as HTMLInputElement;

  const fileInputS1R1 = document.getElementById("fileInputS1R1") as HTMLInputElement;
  const fileInfoS1R1 = document.getElementById("fileInfoS1R1") as HTMLDivElement;
  const fileNameS1R1 = document.getElementById("fileNameS1R1") as HTMLSpanElement;

  const splitS1R1File = document.getElementById("split1R1File");
  const splitS2R1File = document.getElementById("split2R1File");
  const fileInputS2R1 = document.getElementById("fileInputS2R1") as HTMLInputElement;
  const fileInfoS2R1 = document.getElementById("fileInfoS2R1") as HTMLDivElement;
  const fileNameS2R1 = document.getElementById("fileNameS2R1") as HTMLSpanElement;

  const containerRace2 = document.getElementById("race2Files");
  const fileInputS1R2 = document.getElementById("fileInputS1R2") as HTMLInputElement;
  const fileInfoS1R2 = document.getElementById("fileInfoS1R2") as HTMLDivElement;
  const fileNameS1R2 = document.getElementById("fileNameS1R2") as HTMLSpanElement;

  const splitS2R2File = document.getElementById("split2R2File");
  const fileInputS2R2 = document.getElementById("fileInputS2R2") as HTMLInputElement;
  const fileInfoS2R2 = document.getElementById("fileInfoS2R2") as HTMLDivElement;
  const fileNameS2R2 = document.getElementById("fileNameS2R2") as HTMLSpanElement;

  function toggleInputsRaces(){
    if (switchRacesElement && switchS2divElement && switchR2divElement && splitS1R1File) {
      const isChecked = switchRacesElement.checked;
      splitS1R1File.style.display = isChecked ? "block" : "none";
      switchS2divElement.style.display = isChecked ? "block" : "none";
      switchR2divElement.style.display = isChecked ? "block" : "none";
    }
  }

  function toggleInputsS2() {
    if (splitS2R1File && splitS2R2File && switchS2Element) {
      splitS2R1File.style.display = !switchS2Element.checked ? "none" : "block";
      splitS2R2File.style.display = !switchS2Element.checked ? "none" : "block";
    }
  }

  function toggleInputR2() {
    if (containerRace2 && switchR2Element) {
      containerRace2.style.display = !switchR2Element.checked ? "none" : "block";
    }
  }

  if (switchRacesElement) switchRacesElement.addEventListener("change", toggleInputsRaces);
  if (switchS2Element) switchS2Element.addEventListener("change", toggleInputsS2);
  if (switchR2Element) switchR2Element.addEventListener("change", toggleInputR2);

  fileInputS1R1.addEventListener("change", () => {
    const file = fileInputS1R1.files?.[0];
    if (file) {
      if (file.type === "application/json") {
        fileNameS1R1.textContent = file.name;
        fileInfoS1R1.classList.remove("hidden");
      } else {
        alert("Por favor, selecciona un archivo JSON válido.");
        fileInputS1R1.value = ""; // Limpiar la selección
        fileInfoS1R1.classList.add("hidden");
      }
    } else {
      fileInfoS1R1.classList.add("hidden");
    }
  });

  fileInputS2R1.addEventListener("change", () => {
    const file = fileInputS2R1.files?.[0];
    if (file) {
      if (file.type === "application/json") {
        fileNameS2R1.textContent = file.name;
        fileInfoS2R1.classList.remove("hidden");
      } else {
        showToast("Por favor, selecciona un archivo JSON válido.", "error");
        fileInputS2R1.value = ""; // Limpiar la selección
        fileInfoS2R1.classList.add("hidden");
      }
    } else {
      fileInfoS2R1.classList.add("hidden");
    }
  });

  fileInputS1R2.addEventListener("change", () => {
    const file = fileInputS1R2.files?.[0];
    if (file) {
      if (file.type === "application/json") {
        fileNameS1R2.textContent = file.name;
        fileInfoS1R2.classList.remove("hidden");
      } else {
        showToast("Por favor, selecciona un archivo JSON válido.", "error");
        fileInputS1R2.value = ""; // Limpiar la selección
        fileInfoS1R2.classList.add("hidden");
      }
    } else {
      fileInfoS1R2.classList.add("hidden");
    }
  });

  fileInputS2R2.addEventListener("change", () => {
    const file = fileInputS2R2.files?.[0];
    if (file) {
      if (file.type === "application/json") {
        fileNameS2R2.textContent = file.name;
        fileInfoS2R2.classList.remove("hidden");
      } else {
        showToast("Por favor, selecciona un archivo JSON válido.", "error");
        fileInputS2R2.value = ""; // Limpiar la selección
        fileInfoS2R2.classList.add("hidden");
      }
    } else {
      fileInfoS2R2.classList.add("hidden");
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    formData.set('switch-Races', switchRacesElement?.checked.toString());
    formData.set('switch-S2', switchS2Element?.checked.toString());
    formData.set('switch-R2', switchR2Element?.checked.toString());

    try {
      const response = await fetch('/api/admin/race/editrace', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor: ' + response.statusText);
      }

      const result = await response.json();

      if (result.success) {
        showToast('Carrera actualizada con éxito', 'success');
        window.location.href = '/admin/adminraces';
      } else {
        throw new Error(result.error ?? 'Error desconocido');
      }
    } catch (error) {
      showToast('Error al actualizar la carrera: ' + error, 'error');
      console.error('Error:', error);
    }
  });
  switchRacesElement?.addEventListener("change", toggleInputsRaces);
  switchS2Element?.addEventListener("change", toggleInputsS2);
  switchR2Element?.addEventListener("change", toggleInputR2);
}