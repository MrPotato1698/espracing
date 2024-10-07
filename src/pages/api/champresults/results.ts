import ApexCharts from 'apexcharts';

import { cars } from "@/consts/cars";
import { circuits } from "@/consts/circuits";
import { circuitlayouts } from "@/consts/circuitlayouts";
import { points } from "@/consts/pointsystem";

import { createRaceData, formatTwoIntegersPlusThreeDecimals, formatTwoIntegers, getClassShortName, getColorClass } from "@/lib/results/resultConverter";

import type { RaceData, RaceResult, RaceLap, Lap, BestLap, Consistency, BestSector, Incident, RaceConfig } from "@/types/Results";
import type { Points } from "@/types/Points";

/* *************************** */

function initializeScript() {
  const loadButton = document.getElementById('loadButton');

  const opcionesChamps = document.getElementById('select-champs') as HTMLSelectElement;

  const tablaIndyChamps = document.getElementById('resultsIndyChampsTable');
  const tablaTeamsChamps = document.getElementById('resultsTeamsChampsTable');
  const chartProgressionIndyChamp = document.getElementById('chartProgressiónIndyChamp');
  const chartProgressionTeamsChamp = document.getElementById('chartProgressiónTeamsChamp');
  const tablaOtrosPremios = document.getElementById('resultTableOtherPrizes');

  async function loadData() {
    const seleccion = opcionesChamps.value;
    try {
      console.log('Cargando datos del campeonato: ' + seleccion);
      const response = await fetch(`/api/champresults/getChampResults?champ=${seleccion}`);

      if (!response.ok) {
        console.error('Error al obtener los datos del campeonato: ' + response.statusText);
        return;
      }

      const data = await response.json();

      console.log('Data recibida de API: ' + data);


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

// Maneja las transiciones de página de Astro
document.addEventListener('astro:page-load', initializeScript);