import { supabase } from '@/db/supabase';
import { showToast, processDirectoryCircuits } from "@/lib/utils";

export function initCircuitManagement() {
  const form = document.getElementById("uploadForm") as HTMLFormElement;
  const switchCleanInstall = document.getElementById("switch-clean_install") as HTMLInputElement | null;

  const shortNameCircuit = document.getElementById("circuitshotname") as HTMLInputElement;
  const fileInput = document.getElementById("fileInput") as HTMLInputElement;
  const fileInfo = document.getElementById("fileInfo") as HTMLDivElement;
  const fileName = document.getElementById("fileName") as HTMLSpanElement;


  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (file) {
      if (file.type === "application/json") {
        fileName.textContent = file.name;
        fileInfo.classList.remove("hidden");
      } else {
        showToast("Por favor, selecciona un archivo JSON válido.", "error")
        fileInput.value = ""; // Limpiar la selección
        fileInfo.classList.add("hidden");
      }
    } else {
      fileInfo.classList.add("hidden");
    }
  });


  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fileS1R1 = fileInput.files?.[0];
    if (!fileS1R1) {
      showToast("Por favor, selecciona un archivo JSON para la Carrera 1 del Split 1.", "error");
      return;
    }

    try {
      const contentS1R1 = await fileS1R1.text();
      let circuitname = "";
      let circuitfilename = "";
      let circuitlocation = "";

      const { data: getLastRace } = await supabase
        .from('race')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single();

      const lastRaceID = getLastRace ? (getLastRace.id + 1) : 1;

      const { data: insertData, error: insertError } = await supabase
        .from('circuit')
        .insert({
          id: lastRaceID,
          name: circuitname,
          shortname: shortNameCircuit.value,
          filename: circuitfilename,
          location: circuitlocation,
        });

      if (insertError) throw insertError;


      showToast("Circuito creado con éxito", "success");
      form.reset();
      fileInfo.classList.add("hidden");
      window.location.reload();
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      showToast("Hubo un error al procesar el archivo. Por favor, inténtalo de nuevo.", "error");
    }
  });
}

export function initDeleteCircuitButtons() {
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

  switchRacesElement ? switchRacesElement.addEventListener("change", toggleInputsRaces) : null;
  switchS2Element ? switchS2Element.addEventListener("change", toggleInputsS2) : null;
  switchR2Element ? switchR2Element.addEventListener("change", toggleInputR2) : null;

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
        throw new Error(result.error || 'Error desconocido');
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