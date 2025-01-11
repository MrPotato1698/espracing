import { supabase } from '@/db/supabase';
import { createRaceData, createRaceDataMultipleSplits } from "@/lib/results/resultConverter";

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
    }
  }

  function toggleInputR2() {
    if (containerRace2 && switchR2Element) {
      containerRace2.style.display = !switchR2Element.checked ? "none" : "block";
    }
  }

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
        alert("Por favor, selecciona un archivo JSON válido.");
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
        alert("Por favor, selecciona un archivo JSON válido.");
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
        alert("Por favor, selecciona un archivo JSON válido.");
        fileInputS2R2.value = ""; // Limpiar la selección
        fileInfoS2R2.classList.add("hidden");
      }
    } else {
      fileInfoS2R2.classList.add("hidden");
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fileS1R1 = fileInputS1R1.files?.[0];
    let fileS2R1;
    let fileS1R2;
    let fileS2R2;
    let numSplits: number = 1;
    if (!fileS1R1) {
      alert("Por favor, selecciona un archivo JSON para la Carrera 1 del Split 1.");
      return;
    }

    if (switchR2Element?.checked) {
      fileS1R2 = fileInputS1R2.files?.[0];
      if (!fileS1R2) {
        alert("Por favor, selecciona un archivo JSON para la Carrera 2 del Split 1.");
        return;
      }
    }

    if (switchS2Element?.checked) {
      fileS2R1 = fileInputS2R1.files?.[0];
      if (!fileS2R1) {
        alert("Por favor, selecciona un archivo JSON para la Carrera 1 del Split 2.");
        return;
      }
      if (switchR2Element?.checked) {
        fileS2R2 = fileInputS2R2.files?.[0];
        if (!fileS2R2) {
          alert("Por favor, selecciona un archivo JSON para la Carrera 2 del Split 2.");
          return;
        }
      }
      numSplits = 2;
    }


    try {
      const contentS1R1 = await fileS1R1.text();
      const formData = new FormData(form);
      const racename = formData.get('racename') as string;
      const champID = formData.get('champID') as string;
      const numrace = formData.get('numrace') as string;
      const pointsystem = formData.get('pointsystem') as string;

      const jsonS1R1 = JSON.parse(contentS1R1);
      let jsonS1R2;
      let transformedJsonR1: string;
      let transformedJsonR2: string = "{}";
      if (switchR2Element?.checked) {
        const contentS1R2 = await fileS1R2?.text();
        if (!contentS1R2) throw new Error("Sin contenido en el archivo de Carrera 2 Split 1");
        jsonS1R2 = JSON.parse(contentS1R2);
      }
      if (switchS2Element?.checked) {
        if (switchR2Element?.checked) {
          const contentS2R2 = await fileS1R2?.text();
          if (!contentS2R2) throw new Error("Sin contenido en el archivo de Carrera 2 Split 2");
          const jsonS2R2 = JSON.parse(contentS2R2);
          transformedJsonR2 = JSON.stringify(createRaceDataMultipleSplits(jsonS1R2, jsonS2R2));
        }
        const contentS2R1 = await fileS2R1?.text();
        if (!contentS2R1) throw new Error("Sin contenido en el archivo de Carrera 2 Split 2");
        const jsonS2R1 = JSON.parse(contentS2R1);
        transformedJsonR1 = JSON.stringify(createRaceDataMultipleSplits(jsonS1R1, jsonS2R1));
      } else {
        transformedJsonR1 = JSON.stringify(createRaceData(jsonS1R1));
        if (switchR2Element?.checked) {
          transformedJsonR2 = JSON.stringify(createRaceData(jsonS1R2));
        }
      }

      const { data: getLastRace } = await supabase
        .from('race')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single();

      const lastRaceID = getLastRace ? (getLastRace.id + 1) : 1;

      const { data: insertData, error: insertError } = await supabase
        .from('race')
        .insert({
          id: lastRaceID,
          name: racename,
          filename: fileS1R1.name,
          championship: Number(champID),
          orderinchamp: Number(numrace),
          pointsystem: Number(pointsystem),
          splits: numSplits,
          race_data_1: transformedJsonR1,
          race_data_2: transformedJsonR2,
        });

      if (insertError) throw insertError;

      alert("Carrera creada con éxito");
      form.reset();
      fileInfoS1R1.classList.add("hidden");
      window.location.reload();
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      alert(
        "Hubo un error al procesar el archivo. Por favor, inténtalo de nuevo."
      );
    }
  });
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
            window.location.reload();
          } else {
            console.error("Error eliminando carrera");
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }
    });
  });
}

export function initEditRace() {

  const form = document.getElementById('editRaceForm') as HTMLFormElement;

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
    }
  }

  function toggleInputR2() {
    if (containerRace2 && switchR2Element) {
      containerRace2.style.display = !switchR2Element.checked ? "none" : "block";
    }
  }

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
        alert("Por favor, selecciona un archivo JSON válido.");
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
        alert("Por favor, selecciona un archivo JSON válido.");
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
        alert("Por favor, selecciona un archivo JSON válido.");
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
        alert('Carrera actualizada con éxito');
        window.location.href = '/admin/adminraces';
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error al actualizar la carrera:', error);
      alert('Hubo un error al actualizar la carrera. Por favor, inténtalo de nuevo. Error: '+error);
    }
  });
}