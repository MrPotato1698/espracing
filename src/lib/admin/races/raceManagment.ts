import { supabase } from '@/db/supabase';
import { createRaceData } from "@/lib/results/resultConverter";

export function initRaceManagement() {
  const form = document.getElementById("uploadForm") as HTMLFormElement;
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
        alert("Por favor, selecciona un archivo JSON válido.");
        fileInput.value = ""; // Limpiar la selección
        fileInfo.classList.add("hidden");
      }
    } else {
      fileInfo.classList.add("hidden");
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const file = fileInput.files?.[0];
    if (!file) {
      alert("Por favor, selecciona un archivo JSON.");
      return;
    }

    try {
      const content = await file.text();
      const formData = new FormData(form);
      const racename = formData.get('racename') as string;
      const champID = formData.get('champID') as string;
      const numrace = formData.get('numrace') as string;
      const pointsystem = formData.get('pointsystem') as string;

      const json = JSON.parse(content);
      const transformedJson = JSON.stringify(createRaceData(json));

      // const { data, error } = await supabase.storage
      //   .from('results')
      //   .upload(`${file.name}`, transformedJson, {
      //     contentType: 'application/json',
      //   });

      // if (error) throw error;

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
          filename: file.name,
          championship: Number(champID),
          orderinchamp: Number(numrace),
          pointsystem: Number(pointsystem),
          race_data: transformedJson,
        });

      if (insertError) throw insertError;

      alert("Carrera creada con éxito");
      form.reset();
      fileInfo.classList.add("hidden");
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