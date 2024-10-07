import ApexCharts from 'apexcharts';

import { cars } from "@/consts/cars";
import { circuits } from "@/consts/circuits";
import { circuitlayouts } from "@/consts/circuitlayouts";
import { points } from "@/consts/pointsystem";

import { createRaceData, formatTwoIntegersPlusThreeDecimals, formatTwoIntegers, getClassShortName, getColorClass } from "@/lib/results/resultConverter";

import type { RaceData, RaceResult, RaceLap, Lap, BestLap, Consistency, BestSector, Incident, RaceConfig } from "@/types/Results";
import type { Points } from "@/types/Points";

/* *************************** */
interface DriverDataChamp{
  name: string;
  guid: string;
  car: string;
  team: string;
  points: number;
}

interface TeamDataChamp{
  name: string;
  guidDriver1: string;
  guidDriver2: string;
  points: number;
}



/* *************************** */

function initializeScript() {
  const loadButton = document.getElementById('loadButtonChamp');

  const opcionesChamps = document.getElementById('select-champs') as HTMLSelectElement;

  const tablaIndyChamps = document.getElementById('resultsIndyChampsTable');
  const tablaTeamsChamps = document.getElementById('resultsTeamsChampsTable');
  const chartProgressionIndyChamp = document.getElementById('chartProgressiónIndyChamp');
  const chartProgressionTeamsChamp = document.getElementById('chartProgressiónTeamsChamp');
  const tablaOtrosPremios = document.getElementById('resultTableOtherPrizes');

  async function loadData() {
    const seleccion = opcionesChamps.value;
    try {
      const response = await fetch(`/api/champresults/getChampResults?champ=${seleccion}`);

      if (!response.ok) {
        console.error('Error al obtener los datos del campeonato: ' + response.statusText);
        return;
      }

      let dataRAW = await response.text();
      //console.log('Datos crudos de la API: ' + dataRAW);

      dataRAW = dataRAW.replace('{"raceData":', '');
      dataRAW = dataRAW.slice(0, -1);

      const arrayRaceData = JSON.parse(dataRAW) as RaceData[];

      //console.log('Data recibida de API: ' + arrayRaceData[0].BestLap[0].CarFileName);

      const numRaces = arrayRaceData.length;


    } catch (error) {
      console.error('Error al cargar los datos del campeonato: ' + error);
    }

  }

  if (loadButton) {
    loadButton.addEventListener('click', loadData);
  } else {
    console.error('Elemento con id "loadButton" no encontrado.');
  }
}


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeScript);
} else {
  initializeScript();
}

function cleanupEventListeners() {
  const loadButton = document.getElementById('loadButtonChamp');
  if (loadButton) {
    loadButton.removeEventListener('click', loadData);
  }
}

// Maneja las transiciones de página de Astro
document.addEventListener('astro:page-load', initializeScript);

// Limpiar event listeners antes de descargar la página
document.addEventListener('astro:page-unload', cleanupEventListeners);
