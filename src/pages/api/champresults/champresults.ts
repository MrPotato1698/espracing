import ApexCharts from 'apexcharts';

import { cars } from "@/consts/cars";
import { circuits } from "@/consts/circuits";
import { circuitlayouts } from "@/consts/circuitlayouts";
import { points } from "@/consts/pointsystem";

import { createRaceData, formatTwoIntegersPlusThreeDecimals, formatTwoIntegers, getClassShortName, getColorClass } from "@/lib/results/resultConverter";

import type { RaceData, RaceResult, RaceLap, Lap, BestLap, Consistency, BestSector, Incident, RaceConfig } from "@/types/Results";
import type { Points } from "@/types/Points";

/* *************************** */
interface DriverDataChamp {
  name: string;
  guid: string;
  car: string;
  team: string;
  totalsPoints: number;
}

interface RaceDataChamp {
  raceNumber: number;
  name: string;
  results: RaceResult[];
  pointSystem: string;
  driverFastestLapGuid: string;
}

interface TeamDataChamp {
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

      const RacesChamp: RaceDataChamp[] = arrayRaceData.map((raceData, index) => {
        const racePointsSystems = seleccion.split('@');
        let pointSystem = 'Simple';
        if (racePointsSystems.length > 1) {
          const raceDuration = raceData.RaceConfig.RaceDurationTime;
          if (seleccion[0] === "16") {
            switch (raceDuration) {
              case 120:
                pointSystem = racePointsSystems[2];
                break;
              case 90:
                pointSystem = racePointsSystems[1];
                break;
              case 60:
                pointSystem = racePointsSystems[3];
                break;
              default:
                pointSystem = 'Simple';
                break;
            }
          }
        } else {
          pointSystem = racePointsSystems[1];
        }
        return {
          raceNumber: index + 1,
          name: arrayRaceData[index].RaceConfig.Track,
          results: raceData.RaceResult,
          pointSystem: pointSystem,
          driverFastestLapGuid: raceData.BestLap[0].SteamID

        };
      });

      const DriversChamp: DriverDataChamp[] = getDriverDataChamp(RacesChamp);
      const TeamsChamp: TeamDataChamp[] = getTeamsDataChamp(DriversChamp);

      // console.log('DriversChamp: ' + DriversChamp);
      // console.log('TeamsChamp: ' + TeamsChamp.length);

      // Tabla de resultados de pilotos
      let tablaIndyChampsHTML = `
      <p class="text-3xl font-bold border-b border-[#da392b] w-fit mx-auto mt-4 mb-2">Clasificación Campeonato Individual</p>
      <table class="table table-striped table-hover table-sm w-full border border-[#f9f9f9]">
        <thead class="font-medium bg-[#da392b]">
          <tr class="tabletitle">
            <th colspan="2">#</th>
            <th>Piloto</th>
            <th colspan="3">Coche</th>
            <th>Equipo</th>
            <th>Total</th>
          `;
      RacesChamp.map((raceData) => {
        const trackName = circuits.find((circuit) => circuit.filename === raceData.name);
        if (!trackName) {
          tablaIndyChampsHTML += `<th>${raceData.name}</th>`;
        } else {
          tablaIndyChampsHTML += `<th>${trackName?.name}</th>`;
        }
      });
      tablaIndyChampsHTML += `</tr></thead><tbody>`;

      let posDriver = 0;
      for (let itemDriver of DriversChamp) {
        posDriver++;

        const DriverName = itemDriver.name;
        const DriverGUID = itemDriver.guid;
        const isCarExists = cars.find((car) => car.filename === itemDriver.car);
        let carName: string;
        let carBrand: string;
        let carClass: string;
        let carColorClass: string;
        if (isCarExists) {
          carName = isCarExists.brand + " " + isCarExists.model;
          carBrand = isCarExists.imgbrand;
          carClass = getClassShortName(isCarExists.subclass);
          carColorClass = getColorClass(isCarExists.subclass);
        } else {
          carName = itemDriver.car;
          carBrand = "";
          carClass = "";
          carColorClass = "";
        }
        const teamName = itemDriver.team;
        const totalPoints = itemDriver.totalsPoints;

        if (posDriver % 2 === 0) {
          tablaIndyChampsHTML += `<tr class="bg-[#0f0f0f]">`;
        } else {
          tablaIndyChampsHTML += `<tr class="bg-[#19191c]">`;
        }
        tablaIndyChampsHTML += `
          <td class = "text-center font-bold">${posDriver}</td>
          <td></td>
          <td class = "text-start font-normal">${DriverName}</td>
          <td class = "text-center"><span ${carColorClass}>${carClass}</span></td>
          <td class = "text-center"><img class='w-4 justify-end' src='${carBrand}' alt=''></img></td>
          <td class = "text-start font-medium">${carName}</td>
          <td class = "text-center font-medium">${teamName}</td>
          <td class = "text-center font-medium">${totalPoints}</td>`;

        let vueltasLider: number = 0;
        for (let raceData of RacesChamp) {
          const pointArray = points.find((point) => point.Name === raceData.pointSystem);
          const driverPosition = raceData.results.find((driver) => driver.SteamID === DriverGUID);
          const fastestLap = pointArray && raceData.driverFastestLapGuid === DriverGUID ? pointArray.FastestLap : 0;
          const fastestLapClass = fastestLap !== 0 ? ` class = "bg-[#c100ff] text-white font-bold rounded-full w-content px-5"` : ``;
          let driverPoints = driverPosition && pointArray ? pointArray.Puntuation[driverPosition.Pos - 1] + fastestLap : 0;

          let posicionFinal = 'NP';
          let vueltastotales = 0;
          if (driverPosition) {
            if (posDriver === 1) {
              vueltasLider = vueltastotales;
              posicionFinal = '(1º)';
            } else {
              switch (driverPosition.Pos) {
                case -1:
                  if (teamName === "ESP Racing Staff") {
                    posicionFinal = 'STAFF';
                    driverPoints = 0;
                  } else {
                    posicionFinal = 'DNF';
                    driverPoints = 0;
                  }
                  break;
                case -2:
                  posicionFinal = 'DQ';
                  driverPoints = 0;
                  break;
                case -3:
                  posicionFinal = 'DNS';
                  driverPoints = 0;
                  break;
                case -4:
                  switch (teamName) {
                    case "STREAMING":
                      posicionFinal = 'TV';
                      driverPoints = 0;
                      break;
                    case "ESP Racing Staff":
                      posicionFinal = 'STAFF';
                      driverPoints = 0;
                      break;
                    case "Safety Car":
                      posicionFinal = 'SC';
                      driverPoints = 0;
                      break;
                    default:
                      posicionFinal = 'DNS';
                      driverPoints = 0;
                      break;
                  }
                  break;
                default:
                  const timerace = (driverPosition.TotalTime) + (driverPosition.Penalties);
                  const condicion1 = (Math.trunc((timerace / 60) % 60) + Math.trunc(timerace / 60));
                  const rConfig = arrayRaceData[raceData.raceNumber - 1].RaceConfig;

                  if (vueltastotales < vueltasLider * 0.9 && ((condicion1 < rConfig.RaceDurationTime) || (vueltastotales < rConfig.RaceDurationLaps * 0.9))) {
                    posicionFinal = 'DNF';
                    driverPoints = 0;
                  } else {
                    posicionFinal = "(" + posDriver.toString() + 'º)';
                  }
              }
              if (driverPosition.Pos === -4 && raceData.name === "STREAMING") {
                posicionFinal = 'TV';
              }
            }
          }
          tablaIndyChampsHTML += `
          <td class = "text-center"><span ${fastestLapClass}>${driverPoints}</span> - ${posicionFinal}</td>`;
        }
        tablaIndyChampsHTML += `</tr>`;

      }


      if (tablaIndyChamps) {
        tablaIndyChamps.innerHTML = tablaIndyChampsHTML;
      }

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

// function cleanupEventListeners() {
//   const loadButton = document.getElementById('loadButtonChamp');
//   if (loadButton) {
//     loadButton.removeEventListener('click', loadData);
//   }
// }

// Maneja las transiciones de página de Astro
document.addEventListener('astro:page-load', initializeScript);

// Limpiar event listeners antes de descargar la página
// document.addEventListener('astro:page-unload', cleanupEventListeners);


// Obtener los datos globales de los pilotos
function getDriverDataChamp(result: RaceDataChamp[]): DriverDataChamp[] {
  let respuesta: DriverDataChamp[] = [];
  result.map((raceData) => {
    const pointArray = points.find((point) => point.Name === raceData.pointSystem);
    if (pointArray !== undefined) {
      for (let item of raceData.results) {
        const driverIndex = respuesta.findIndex((driver) => driver.guid === item.SteamID);

        if (driverIndex === -1) {
          if (item.Pos > 0) {
            if (item.SteamID === raceData.driverFastestLapGuid) {
              respuesta.push({
                name: item.DriverName,
                guid: item.SteamID,
                car: item.CarFileName,
                team: item.Team,
                totalsPoints: pointArray.Puntuation[item.Pos - 1] + pointArray.FastestLap
              });

            } else {
              respuesta.push({
                name: item.DriverName,
                guid: item.SteamID,
                car: item.CarFileName,
                team: item.Team,
                totalsPoints: pointArray.Puntuation[item.Pos - 1]
              });
            }

          } else if (item.Pos !== -4) {
            respuesta.push({
              name: item.DriverName,
              guid: item.SteamID,
              car: item.CarFileName,
              team: item.Team,
              totalsPoints: 0
            });
          }

        } else {
          if (item.Pos > 0) {
            if (item.SteamID === raceData.driverFastestLapGuid) {
              respuesta[driverIndex].totalsPoints += pointArray.FastestLap;
            }
            respuesta[driverIndex].totalsPoints += pointArray.Puntuation[item.Pos - 1];
          }
        }
      }
    }
  });

  return respuesta.sort((a, b) => b.totalsPoints - a.totalsPoints);
}

// Obtener los datos globales de los equipos
function getTeamsDataChamp(result: DriverDataChamp[]): TeamDataChamp[] {
  let respuesta: TeamDataChamp[] = [];
  result.map((raceData) => {
    const teamIndex = respuesta.findIndex((team) => team.name === raceData.team);
    if (teamIndex === -1) {
      if (raceData.team !== 'No Team' && raceData.team !== '') {
        respuesta.push({
          name: raceData.team,
          guidDriver1: raceData.guid,
          guidDriver2: '',
          points: raceData.totalsPoints
        });
      }
    } else {
      if (respuesta[teamIndex].guidDriver2 === '') {
        respuesta[teamIndex].guidDriver2 = raceData.guid;
      }
      respuesta[teamIndex].points += raceData.totalsPoints;
    }
  });

  return respuesta.sort((a, b) => b.points - a.points);
}
