import type { Car } from "@/types/Car";
import { cars } from "@/consts/cars";
import { supabase } from "@/db/supabase";

export function initializeFuelFormControls() {
  const switchElement = document.getElementById("switch-2") as HTMLInputElement | null;
  const timeContainer = document.getElementById("timeContainer")
  const lapsContainer = document.getElementById("lapsContainer");
  const carSelect = document.getElementById("carname") as HTMLInputElement | null;
  const otherCarFuelTank = document.getElementById("otherCarFuelTank");
  const formulario = document.getElementById('fuelForm') as HTMLFormElement | null;
  const resultadoDiv = document.getElementById('resultadoCalculo');

  function toggleInputs() {
    if (timeContainer && lapsContainer && switchElement) {
      timeContainer.style.display = switchElement.checked ? "none" : "block";
      lapsContainer.style.display = switchElement.checked ? "block" : "none";
    }
  }

  function toggleFuelTankInput() {
    if (otherCarFuelTank && carSelect) {
      otherCarFuelTank.style.display = carSelect.value === "othercar" ? "block" : "none";
    }
  }

  async function handleSubmit(event: Event) {
    event.preventDefault(); // Prevenir el envío del formulario

    // Obtener los datos del formulario
    if (!formulario) {
      console.error("Formulario no encontrado");
      return;
    }

    const formData = new FormData(formulario);
    const CarFileName = formData.get('carname') as string;
    const {data: carData} = await supabase
      .from('car')
      .select("tyreTimeChange, fuelLiterTime, maxLiter")
      .eq('filename', CarFileName)
      .single();
    let fuelTank: number;

    if (CarFileName === 'othercar') {
      const fuelTankInput = document.getElementById('fuelTankCapacity') as HTMLInputElement;
      if (!fuelTankInput) {
        alert('Por favor, ingrese la capacidad del tanque de combustible');
        return;
      }
      fuelTank = parseFloat(fuelTankInput.value);
    } else {
      console.log('Car data:', carData);
      fuelTank = carData?.maxLiter ?? 0;
    }

    const fuelConsumption = parseFloat(formData.get('fuelConsumption') as string);
    console.log('Fuel tank:', fuelTank);
    const isLapsBased = switchElement?.checked;

    let distance: number;
    if (isLapsBased) {
      distance = parseInt(formData.get('racedurationLaps') as string);
    } else {
      const hours = parseInt(formData.get('racedurationTimeHours') as string);
      const minutes = parseInt(formData.get('racedurationTimeMinutes') as string);
      distance = hours * 3600 + minutes * 60;
    }

    const laptimeMinutes = parseInt(formData.get('laptimeMinutes') as string);
    const laptimeSeconds = parseInt(formData.get('laptimeSeconds') as string);
    const laptime = laptimeMinutes * 60 + laptimeSeconds;

    // Tratar los datos
    let VueltasTotales: number;
    if (!isLapsBased) {
      VueltasTotales = Math.ceil(distance / laptime);
    } else {
      VueltasTotales = distance;
    }

    //Tanque de combustible del coche, tiempo en repostar y tiempo en cambiar gomas
    const carFuelTimeperLiter = carData?.fuelLiterTime ?? 0;
    const carTiresTime = carData?.tyreTimeChange ?? 0;

    //Calcular vueltas con un solo deposito
    const maxLapsperTank = fuelTank / fuelConsumption;

    //Número de stints que habrá que hacer y litros a usar durante la carrera
    const stints = VueltasTotales / maxLapsperTank;
    const totalFuel = fuelTank * stints;
    const minimumStints = Math.ceil(VueltasTotales / maxLapsperTank);
    const completeStints = Math.floor(VueltasTotales / maxLapsperTank);

    console.log('Minimum stints:', minimumStints);
    console.log('Complete stints:', completeStints);

    let stintLaps: number[] = [];
    let stintFuel: number[] = [];
    let extraLap: boolean = false;
    if (minimumStints >= completeStints && minimumStints > 1) {
      for (let i = 0; i < completeStints; i++) {
        const laps = Math.floor(maxLapsperTank);
        stintLaps.push(laps);
        const fuel = i === 0 ? fuelTank : (laps * fuelConsumption);
        stintFuel.push(fuel);
      }
      // Ultimo Stint
      let lastStintLaps = VueltasTotales - (completeStints) * Math.floor(maxLapsperTank);
      let lastStintFuel;
      if (lastStintLaps > Math.floor(maxLapsperTank)) {
        const laps = Math.floor(maxLapsperTank);
        stintLaps.push(laps);
        const fuel = (laps * fuelConsumption);
        stintFuel.push(fuel);
        lastStintLaps -= laps;
        lastStintFuel = (lastStintLaps * fuelConsumption) - (fuelTank - stintFuel[stintFuel.length - 1]);
        stintLaps.push(lastStintLaps);
        stintFuel.push(lastStintFuel);
        extraLap = true;
      } else {
        lastStintFuel = (lastStintLaps * fuelConsumption) - (fuelTank - stintFuel[stintFuel.length - 1]);
        stintLaps.push(lastStintLaps);
        stintFuel.push(lastStintFuel);
        extraLap = false;
      }
    } else if (minimumStints === 1) {
      stintLaps.push(VueltasTotales);
      stintFuel.push(VueltasTotales * fuelConsumption);
    }

    // Calcular tiempo total de repostaje
    const totalFuelperStint = stintFuel.map(fuel => fuel * carFuelTimeperLiter);


    // Mostrar el resultado con AJAX
    if (resultadoDiv) {
      let resultHTML = `
      <h2 class="font-bold">Resultado</h2>
      <p class="font-semibold">Para completar la carrera necesitas:</p>
      <ul>`;
      if (extraLap) {
        resultHTML += `
        <li><span class = 'font-medium text-[#da392b]'>${stints.toFixed(2)} stints</span> (${Math.floor(stints) + 1} paradas, si no se ahorra combustible lo que 
        indica el ultimo stint).</li>`;
      } else {
        resultHTML += `
        <li><span class = 'font-medium text-[#da392b]'>${stints.toFixed(2)} stints</span> (${Math.floor(stints)} paradas).</li>`;
      }
      if (stints > 1) {
        resultHTML += `
          <li><span class = 'font-medium text-[#da392b]'>${totalFuel.toFixed(2)} litros</span> de combustible para completar la carrera.</li>
          <li><span class = 'font-medium text-[#da392b]'>${fuelTank} litros</span> de tanque de combustible.</li>
          <li><span class = 'font-medium text-[#da392b]'>${maxLapsperTank.toFixed(0)} vueltas</span> completas por deposito.</li>
        </ul>
        <p class = "mt-2 font-semibold">Detalle de los diferentes stints:</p>
        <ul>
          ${stintLaps.map((item, index) => {
          return `<li><span class = 'font-medium text-[#da392b]'>Stint ${index + 1}:</span> ${item} vueltas, ${stintFuel[index].toFixed(2)} litros 
          para realizar el stint, ${totalFuelperStint[index].toFixed(2)} segundos solo la parada + tiempo de paso por boxes. (${carFuelTimeperLiter} s/litros repostado).
          </li>`;
        }).join('')}
        </ul>
        `;
      } else {
        resultHTML += `
        <p class = "mt-2 font-semibold">Detalle del stint de carrera:</p>
        <ul>
          <li><span class = 'font-medium text-[#da392b]'>Unico stint:</span> ${stintLaps[0]} vueltas, ${stintFuel[0].toFixed(2)} litros.
          No es necesario parar, pero recuerda que cada litro añadido en la parada son ${carFuelTimeperLiter} segundos sin contar paso por boxes.</li>
        </ul>
        `;
      }
      if (carTiresTime > 0) {
        resultHTML += `
        <p class = "mt-4">*Si se quiere realizar un cambio de gomas, recuerde que en este coche son <span class = 'font-medium text-[#da392b]'>
        ${carTiresTime} segundos</span>, mire los diferentes stints y si el tiempo de parada es superior al cambio de goma, recuerde que tiene un
        cambio de gomas "gratis" en lo que perdida de tiempo se refiere.</p>
      `;
      }
      resultadoDiv.innerHTML = resultHTML;
      resultadoDiv.style.display = "block";
    }

  }

  // Configurar el estado inicial
  toggleInputs();
  toggleFuelTankInput();
  if (resultadoDiv) {
    resultadoDiv.style.display = "none"; //Doble check para ocultar el div
  }

  // Agregar el event listener para el cambio del switch
  switchElement?.addEventListener("change", toggleInputs);
  carSelect?.addEventListener("change", toggleFuelTankInput);
  formulario?.addEventListener('submit', handleSubmit);
};