import { supabase } from '@/db/supabase';

export function initCarManagement() {
  const form = document.getElementById("uploadForm") as HTMLFormElement;

  form.addEventListener("submit", async (e) => {
    try {
      const formData = new FormData(form);
      const carfilename = formData.get('filenameCarName') as string;

      const carBrandSelect = formData.get("carbrand") as string;

      const newBrandCar = formData.get("newBrandCar") as string;
      const newImgBrandCar = formData.get("newImgBrandCar") as string;
      const newCountryCar = formData.get("newCountryCar") as string;
      const newFoundationCar = formData.get("newFoundationCar") as string;

      const modelCar = formData.get("modelCar") as string;
      const yearCar = formData.get("yearCar") as string;

      const carClassSelect = formData.get("carClasses") as string;

      const newClassName = formData.get("newClassName") as string;
      const newClassShortName = formData.get("newClassShortName") as string;
      const newClassDesign = formData.get("newClassDesign") as string;

      const powerCar = formData.get("powerCar") as string;
      const torqueCar = formData.get("torqueCar") as string;
      const weightCar = formData.get("weightCar") as string;
      const tyreTimeChange = formData.get("tyreTimeChange") as string;
      const fuelLiterTime = formData.get("fuelLiterTime") as string;
      const maxFuel = formData.get("maxFuel") as string;
      const descriptionCar = formData.get("descriptionCar") as string;

      const { data: getLastCar } = await supabase
        .from('car')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single();

      const lastCarID = getLastCar ? (getLastCar.id + 1) : 1;
      let lastBrandID = 0;
      let lastClassID = 0;

      if (carBrandSelect === 'new') {
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
              id: lastBrandID,
              name: newBrandCar,
              imgbrand: newImgBrandCar,
              location: newCountryCar,
              foundation: Number(newFoundationCar),
            });
            if (insertBrandError) throw insertBrandError;

        } catch (error) {
          console.error("Error al crear la marca del coche:", error);
          alert("Hubo un error al crear la marca del coche. Por favor, inténtalo de nuevo.");
        }
      } else {
        lastBrandID = Number(carBrandSelect);
      }

      if(carClassSelect === 'new') {
        try{
          const { data: getLastClass } = await supabase
            .from('carclass')
            .select('id')
            .order('id', { ascending: false })
            .limit(1)
            .single();

            lastClassID = getLastClass ? (getLastClass.id + 1) : 1;

            const { data: insertBrandData, error: insertClassError } = await supabase
            .from('carclass')
            .insert({
              id: lastClassID,
              name: newClassName,
              short_name: newClassShortName,
              class_design: newClassDesign,
            });

            if (insertClassError) throw insertClassError;

        }catch(error){
          console.error("Error al crear la clase del coche:", error);
          alert("Hubo un error al crear la clase del coche. Por favor, inténtalo de nuevo.");
        }
      } else{
        lastClassID = Number(carClassSelect);
      }

      console.log('BrandID'+lastBrandID);
      console.log('ClassID'+lastClassID);

      const { data: insertData, error: insertError } = await supabase
        .from('car')
        .insert({
          id: lastCarID,
          filename: carfilename,
          brand: lastBrandID,
          model: modelCar,
          year: Number(yearCar),
          class: lastClassID,
          power: Number(powerCar),
          torque: Number(torqueCar),
          weight: Number(weightCar),
          description: descriptionCar,
          tyreTimeChange: Number(tyreTimeChange),
          fuelLiterTime: Number(fuelLiterTime),
          maxLiter: Number(maxFuel),
        });

      if (insertError) throw insertError;
      alert("Coche creado con éxito");

      form.reset();
      window.location.reload();
    } catch (error) {
      console.error("Error al crear el coche:", error);
      alert("Hubo un error al crear el coche. Por favor, inténtalo de nuevo.");
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