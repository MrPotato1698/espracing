import { showToast } from "@/lib/utils";

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
      const response = await fetch('/api/admin/race', {
        method: 'PUT',
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

export function initEditRaceNote() {
  const form = document.getElementById('editRaceNoteForm') as HTMLFormElement;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    try {
      const response = await fetch('/api/admin/racenote', {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor: ' + response.statusText);
      }

      const result = await response.json();

      if (result.success) {
        showToast('Nota de Carrera actualizada con éxito', 'success');
        window.location.href = '/admin/adminraces';
      } else {
        throw new Error(result.error ?? 'Error desconocido');
      }
    } catch (error) {
      showToast('Error al actualizar la nota de carrera: ' + error, 'error');
      console.error('Error:', error);
    }
  });
}