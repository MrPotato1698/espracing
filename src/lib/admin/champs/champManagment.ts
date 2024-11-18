import { supabase } from '@/db/supabase';

export function initRaceManagement() {
  const form = document.getElementById("uploadForm") as HTMLFormElement;

  form.addEventListener("submit", async (e) => {
    try {
      const formData = new FormData(form);
      const champname = formData.get('champname') as string;
      const keysearchAPI = formData.get('keySearchAPI') as string;
      const year = formData.get('yearChamp') as string;
      const season = formData.get('season') as string;
      const champORevent = formData.get('champORevent')  === 'on';

      const { data: getLastChamp } = await supabase
        .from('championship')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single();

      const lastChampID = getLastChamp ? (getLastChamp.id + 1) : 1;

      const { data: insertData, error: insertError } = await supabase
        .from('championship')
        .insert({
          id: lastChampID,
          name: champname,
          key_search: Number(keysearchAPI),
          year: Number(year),
          season: Number(season),
          ischampionship: champORevent,
        });

      if (insertError) throw insertError;

      alert("Campeonato creado con éxito");
      form.reset();
      window.location.reload();
    } catch (error) {
      console.error("Error al crear el campeonato:", error);
      alert(
        "Hubo un error al crear el campeonato. Por favor, inténtalo de nuevo."
      );
    }
  });
}

export function initDeleteRaceButtons() {
  const deleteRaceButtons = document.querySelectorAll(".delete-champ");

  deleteRaceButtons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      const id = button.getAttribute("data-id");

      if (confirm("¿Estás seguro de que quieres eliminar este campeonato?")) {
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