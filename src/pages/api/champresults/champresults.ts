import { supabase } from "@/db/supabase";
import { showToast } from "@/lib/utils";

import type { Points } from "@/types/Points";
import type { RaceResult, RaceCarResume } from "@/types/Results";
import type { CarData, ChampRacesData } from "@/types/Utils";

/* *************************** */
interface DriverDataChamp {
  name: string;
  guid: string;
  car: string;
  team: string;
  totalPoints: number;
}

interface DriverPointsPerRace {
  name: string;
  guid: string;
  racenumber: number;
  points: number;
}

interface RaceDataChamp {
  raceNumber: number;
  name: string;
  results: RaceResult[];
  pointSystem: Points;
  driverFastestLapGuid: string;
}

interface TeamDataChamp {
  name: string;
  guidDriver1: string;
  guidDriver2: string;
  points: number;
}

/* *************************** */

async function initializeScript() {
  const isResultsPage = document.getElementById('resultsIndyChampsTable') !== null;

  if (!isResultsPage) {
    return; // Salir si no estamos en la página de resultados
  }

  const loadButton = document.getElementById('loadButtonChamp');
  const opcionesChamps = document.getElementById('select-champ') as HTMLSelectElement;
  const tablaIndyChamps = document.getElementById('resultsIndyChampsTable');
  const tablaTeamsChamps = document.getElementById('resultsTeamsChampsTable');

  async function loadData() {
    const seleccion = opcionesChamps.value;
    try {
      const championshipData = await fetchChampionshipData(seleccion);
      if (!championshipData) return;

      const champChartsContainer = document.getElementById('champChartsContainer');
      updateChampChartsContainer(champChartsContainer, seleccion);

      const { RacesChamp, flagRace2 } = processChampionshipRaces(championshipData);
      let DriversChamp: DriverDataChamp[] = getDriverDataChamp(RacesChamp);
      const TeamsChamp: TeamDataChamp[] = getTeamsDataChamp(DriversChamp);
      const CarsData = await getCarsInChampionship(
        championshipData.flatMap((raceData) => raceData.raceData1?.RaceCarResume || [])
      );

      DriversChamp = filterDriversChamp(DriversChamp, RacesChamp);

      const tablaIndyChampsHTML = await renderDriversTable(RacesChamp, DriversChamp, CarsData, flagRace2);
      const tablaTeamChampsHTML = await renderTeamsTable(RacesChamp, TeamsChamp, flagRace2);

      if (tablaIndyChamps) {
        tablaIndyChamps.innerHTML = tablaIndyChampsHTML;
      }
      if (tablaTeamsChamps) {
        tablaTeamsChamps.innerHTML = tablaTeamChampsHTML;
      }
    } catch (error) {
      showToast('Error al cargar los datos del campeonato.' + error, 'error');
      console.error('Error al cargar los datos del campeonato: ' + error);
    }
  }

  async function fetchChampionshipData(seleccion: string): Promise<ChampRacesData[] | null> {
    const response = await fetch(`/api/champresults/getChampResults?champ=${seleccion}`);
    if (!response.ok) {
      console.error('Error al obtener los datos del campeonato: ' + response.statusText);
      return null;
    }
    const dataRAW = await response.json();
    return dataRAW.champRacesData;
  }

  function updateChampChartsContainer(container: HTMLElement | null, seleccion: string) {
    if (!container) return;
    let chartElement = document.querySelector('espr-champ-charts');
    if (!chartElement) {
      chartElement = document.createElement('espr-champ-charts');
      container.appendChild(chartElement);
    }
    chartElement.setAttribute('champid', seleccion);
    container.setAttribute('data-champid', seleccion);
    const event = new CustomEvent('champ-id-changed', {
      detail: { champId: seleccion }
    });
    document.dispatchEvent(event);
  }

  function processChampionshipRaces(championshipData: ChampRacesData[]) {
    const numRaces = championshipData.length;
    let numRaceProccesed = 0;
    let flagRace2 = false;
    let RacesChamp: RaceDataChamp[] = [];
    for (let i = 0; i < numRaces; i++) {
      numRaceProccesed++;
      if (championshipData[i].raceData2) {
        if (!flagRace2) flagRace2 = true;
        RacesChamp.push({
          raceNumber: numRaceProccesed,
          name: championshipData[i].raceData1?.RaceConfig.Track + '@' + championshipData[i].raceData1?.RaceConfig.TrackLayout || '',
          results: championshipData[i].raceData1?.RaceResult || [],
          pointSystem: championshipData[i].points,
          driverFastestLapGuid: championshipData[i].raceData1?.BestLap[0].SteamID ?? ''
        });
        numRaceProccesed++;
        RacesChamp.push({
          raceNumber: numRaceProccesed,
          name: championshipData[i].raceData2?.RaceConfig.Track + '@' + championshipData[i].raceData2?.RaceConfig.TrackLayout || '',
          results: championshipData[i].raceData2?.RaceResult || [],
          pointSystem: championshipData[i].points,
          driverFastestLapGuid: championshipData[i].raceData2?.BestLap[0].SteamID ?? ''
        });
      } else {
        RacesChamp.push({
          raceNumber: numRaceProccesed,
          name: championshipData[i].raceData1?.RaceConfig.Track + '@' + championshipData[i].raceData1?.RaceConfig.TrackLayout || '',
          results: championshipData[i].raceData1?.RaceResult || [],
          pointSystem: championshipData[i].points,
          driverFastestLapGuid: championshipData[i].raceData1?.BestLap[0].SteamID ?? ''
        });
      }
    }
    return { RacesChamp, flagRace2 };
  }

  function filterDriversChamp(DriversChamp: DriverDataChamp[], RacesChamp: RaceDataChamp[]) {
    return DriversChamp.filter(driver => {
      return driver.totalPoints > 0 && !RacesChamp.every(race => {
        const result = race.results.find(r => r.SteamID === driver.guid);
        return !result || result.Pos === -3;
      });
    });
  }

  async function renderDriversTable(
    RacesChamp: RaceDataChamp[],
    DriversChamp: DriverDataChamp[],
    CarsData: CarData[],
    flagRace2: boolean
  ): Promise<string> {
    const header = await renderDriversTableHeader(RacesChamp, flagRace2);
    const body = await renderDriversTableBody(RacesChamp, DriversChamp, CarsData);
    return `
      <p class="text-3xl font-bold border-b-2 border-primary w-fit mx-auto mt-4 mb-2">Clasificación Campeonato Individual</p>
      <table class="table table-striped table-hover table-sm w-full border border-lightPrimary">
        ${header}
        ${body}
      </table>
    `;
  }

  async function renderDriversTableHeader(
    RacesChamp: RaceDataChamp[],
    flagRace2: boolean
  ): Promise<string> {
    let headerHTML = `
      <thead class="font-medium bg-primary">
        <tr class="tabletitle">
          <th colspan="2">#</th>
          <th>Piloto</th>
          <th colspan="3">Coche</th>
          <th>Equipo</th>
          <th>Total</th>
    `;
    for (let i = 0; i < RacesChamp.length; i++) {
      const raceData = RacesChamp[i];
      const { data: trackData } = await supabase
        .from('circuit')
        .select('*')
        .eq('filename', raceData.name.split('@')[0])
        .single();
      if (flagRace2) {
        if (!trackData) {
          headerHTML += `<th>${raceData.name.split('@')[0]} R${(i % 2) + 1}</th>`;
        } else {
          headerHTML += `<th>${trackData?.shortname} R${(i % 2) + 1}</th>`;
        }
      } else if (!trackData) {
        headerHTML += `<th>${raceData.name.split('@')[0]}</th>`;
      }
      if (trackData) {
        headerHTML += `<th>${trackData?.shortname}</th>`;
      }
    }
    headerHTML += `</tr></thead>`;
    return headerHTML;
  }

  async function renderDriversTableBody(
    RacesChamp: RaceDataChamp[],
    DriversChamp: DriverDataChamp[],
    CarsData: CarData[]
  ): Promise<string> {
    let bodyHTML = `<tbody>`;
    let posDriver = 0;
    for (let itemDriver of DriversChamp) {
      posDriver++;
      bodyHTML += await renderDriverRow(itemDriver, posDriver, RacesChamp, CarsData);
    }
    bodyHTML += `</tbody>`;
    return bodyHTML;
  }

  async function renderDriverRow(
    itemDriver: DriverDataChamp,
    posDriver: number,
    RacesChamp: RaceDataChamp[],
    CarsData: CarData[]
  ): Promise<string> {
    const DriverName = itemDriver.name;
    const DriverGUID = itemDriver.guid;
    const isCarExists = CarsData.find((car) => car.filename === itemDriver.car);
    let carName: string;
    let carBrand: string;
    let carClass: string;
    let carColorClass: string;
    if (isCarExists) {
      carName = isCarExists.brand + ' ' + isCarExists.model;
      carBrand = isCarExists.imgbrand;
      carClass = isCarExists.classShortName;
      carColorClass = `style="background-color: ${isCarExists.classColor.split(' ')[0].replace('bg-[', '').replace(']', '')}; color: ${isCarExists.classColor.split(' ')[1].replace('text-[', '').replace(']', '')}" class = "rounded text-xs font-bold px-1 py-0.5 ml-1"`;
    } else {
      carName = itemDriver.car;
      carBrand = '';
      carClass = '';
      carColorClass = '';
    }
    const teamName = itemDriver.team;
    const totalPoints = itemDriver.totalPoints;
    let rowHTML = `<tr class="${posDriver % 2 === 0 ? 'bg-darkPrimary' : 'bg-darkSecond'}">`;
    rowHTML += `
      <td class = "text-center font-bold">${posDriver}</td>
      <td></td>
      <td class = "text-start font-normal">${DriverName}</td>
      <td class = "text-center"><span ${carColorClass}>${carClass}</span></td>
      <td class = "text-center"><img class='w-4 justify-end' src='${carBrand}' alt=''></img></td>
      <td class = "text-start font-medium">${carName}</td>
      <td class = "text-center font-medium">${teamName}</td>
      <td class = "text-center font-medium">${totalPoints}</td>`;
    rowHTML += await renderDriverRaceCells(DriverGUID, RacesChamp);
    rowHTML += `</tr>`;
    return rowHTML;
  }

  async function renderDriverRaceCells(
    DriverGUID: string,
    RacesChamp: RaceDataChamp[]
  ): Promise<string> {
    let cellsHTML = '';
    for (let raceData of RacesChamp) {
      const itemResults = raceData.results.find((result) => result.SteamID === DriverGUID);
      if (itemResults) {
        const flapPoint = (itemResults.SteamID === raceData.driverFastestLapGuid ? raceData.pointSystem.FastestLap : 0);
        const points = itemResults.Pos > 0 ? raceData.pointSystem.Puntuation[itemResults.Pos - 1] + flapPoint : 0;
        cellsHTML += `<td class = "text-center">${points > 0 ? points : '-'}</td>`;
      } else {
        cellsHTML += `<td class = "text-center">-</td>`;
      }
    }
    return cellsHTML;
  }

  async function renderTeamsTable(
    RacesChamp: RaceDataChamp[],
    TeamsChamp: TeamDataChamp[],
    flagRace2: boolean
  ): Promise<string> {
    const header = await renderTeamsTableHeader(RacesChamp, flagRace2);
    const body = await renderTeamsTableBody(RacesChamp, TeamsChamp);
    return `
      <p class="text-3xl font-bold border-b-2 border-primary w-fit mx-auto mt-4 mb-2">Clasificación Campeonato Por Equipos</p>
      <table class="table table-striped table-hover table-sm w-full border border-lightPrimary">
        ${header}
        ${body}
      </table>
    `;
  }

  async function renderTeamsTableHeader(
    RacesChamp: RaceDataChamp[],
    flagRace2: boolean
  ): Promise<string> {
    let headerHTML = `
      <thead class="font-medium bg-primary">
        <tr class="tabletitle">
          <th colspan="2">#</th>
          <th>Equipo</th>
          <th>Total</th>
    `;
    for (let i = 0; i < RacesChamp.length; i++) {
      const raceData = RacesChamp[i];
      const { data: trackData } = await supabase
        .from('circuit')
        .select('*')
        .eq('filename', raceData.name.split('@')[0])
        .single();
      if (flagRace2) {
        if (!trackData) {
          headerHTML += `<th>${raceData.name.split('@')[0]} R${(i % 2) + 1}</th>`;
        } else {
          headerHTML += `<th>${trackData?.shortname} R${(i % 2) + 1}</th>`;
        }
      } else if (!trackData) {
        headerHTML += `<th>${raceData.name.split('@')[0]}</th>`;
      } else {
        headerHTML += `<th>${trackData?.shortname}</th>`;
      }
    }
    headerHTML += `</tr></thead>`;
    return headerHTML;
  }

  async function renderTeamsTableBody(
    RacesChamp: RaceDataChamp[],
    TeamsChamp: TeamDataChamp[]
  ): Promise<string> {
    let bodyHTML = `<tbody>`;
    let posTeam = 0;
    for (let itemTeam of TeamsChamp) {
      posTeam++;
      bodyHTML += await renderTeamRow(itemTeam, posTeam, RacesChamp);
    }
    bodyHTML += `</tbody>`;
    return bodyHTML;
  }

  async function renderTeamRow(
    itemTeam: TeamDataChamp,
    posTeam: number,
    RacesChamp: RaceDataChamp[]
  ): Promise<string> {
    const TeamName = itemTeam.name;
    const Driver1GUID = itemTeam.guidDriver1;
    const Driver2GUID = itemTeam.guidDriver2;
    const totalPoints = itemTeam.points;
    let rowHTML = `<tr class="${posTeam % 2 === 0 ? 'bg-darkPrimary' : 'bg-darkSecond'}">`;
    rowHTML += `
      <td class = "text-center font-bold">${posTeam}</td>
      <td></td>
      <td class = "text-start font-normal">${TeamName}</td>
      <td class = "text-center font-medium">${totalPoints}</td>`;
    rowHTML += await renderTeamRaceCells(Driver1GUID, Driver2GUID, RacesChamp);
    rowHTML += `</tr>`;
    return rowHTML;
  }

  async function renderTeamRaceCells(
    Driver1GUID: string,
    Driver2GUID: string,
    RacesChamp: RaceDataChamp[]
  ): Promise<string> {
    let cellsHTML = '';
    for (let raceData of RacesChamp) {
      let pointsRace = 0;
      pointsRace += getDriverPointsForRace(raceData, Driver1GUID);
      pointsRace += getDriverPointsForRace(raceData, Driver2GUID);
      cellsHTML += `<td class = "text-center">${pointsRace > 0 ? pointsRace : '-'}</td>`;
    }
    return cellsHTML;
  }

  function getDriverPointsForRace(raceData: RaceDataChamp, driverGUID: string): number {
    const itemResult = raceData.results.find((result) => result.SteamID === driverGUID);
    if (itemResult) {
      const flapPoint = itemResult.SteamID === raceData.driverFastestLapGuid ? raceData.pointSystem.FastestLap : 0;
      return itemResult.Pos > 0 ? raceData.pointSystem.Puntuation[itemResult.Pos - 1] + flapPoint : 0;
    }
    return 0;
  }

  if (loadButton) {
    loadButton.addEventListener('click', loadData);
  } else {
    showToast('Elemento con id "loadButton" no encontrado.', 'error');
    console.error('Elemento con id "loadButton" no encontrado.');
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeScript);
else initializeScript();

// Maneja las transiciones de página de Astro
document.addEventListener('astro:page-load', initializeScript);

// Obtener los datos globales de los pilotos
function getDriverDataChamp(result: RaceDataChamp[]): DriverDataChamp[] {
  let respuesta: DriverDataChamp[] = [];
  result.forEach((raceData) => {
    processRaceResults(raceData, respuesta);
  });

  return respuesta.sort((a, b) => driverChampSort(a, b, result));
}

function processRaceResults(raceData: RaceDataChamp, respuesta: DriverDataChamp[]) {
  const pointArray = raceData.pointSystem.Puntuation;
  const pointFL = raceData.pointSystem.FastestLap;

  if (pointArray === undefined) return;

  raceData.results.forEach(item => {
    const pos = item.Pos;
    const driverIndex = respuesta.findIndex((driver) => driver.guid === item.SteamID);

    if (driverIndex === -1) {
      addNewDriver(item, pos, raceData, pointArray, pointFL, respuesta);
    } else if (pos > 0) {
      addPointsToExistingDriver(item, pos, raceData, pointArray, pointFL, respuesta, driverIndex);
    }
  });
}

function addNewDriver(
  item: RaceResult,
  pos: number,
  raceData: RaceDataChamp,
  pointArray: number[],
  pointFL: number,
  respuesta: DriverDataChamp[]
) {
  const flapPoint = item.SteamID === raceData.driverFastestLapGuid ? pointFL : 0;
  const points = pos > 0 ? pointArray[pos - 1] + flapPoint : 0;
  if (pos > 0 || pos !== -4) {
    respuesta.push({
      name: item.DriverName,
      guid: item.SteamID,
      car: item.CarFileName,
      team: item.Team,
      totalPoints: points,
    });
  }
}

function addPointsToExistingDriver(
  item: RaceResult,
  pos: number,
  raceData: RaceDataChamp,
  pointArray: number[],
  pointFL: number,
  respuesta: DriverDataChamp[],
  driverIndex: number
) {
  const additionalPoints = pointArray[pos - 1] + (item.SteamID === raceData.driverFastestLapGuid ? pointFL : 0);
  respuesta[driverIndex].totalPoints += additionalPoints;
}

function driverChampSort(a: DriverDataChamp, b: DriverDataChamp, result: RaceDataChamp[]): number {
  if (b.totalPoints !== a.totalPoints) {
    return b.totalPoints - a.totalPoints;
  }

  const aPositionCounts = getPositionCounts(a, result);
  const bPositionCounts = getPositionCounts(b, result);

  for (let i = 0; i < aPositionCounts.length; i++) {
    if (bPositionCounts[i] !== aPositionCounts[i]) {
      return bPositionCounts[i] - aPositionCounts[i];
    }
  }

  const aFastestLaps = countFastestLaps(a, result);
  const bFastestLaps = countFastestLaps(b, result);

  if (bFastestLaps !== aFastestLaps) {
    return bFastestLaps - aFastestLaps;
  }

  return getFirstBestPositionRaceNumber(a, result) - getFirstBestPositionRaceNumber(b, result);
}

function getPositionCounts(driver: DriverDataChamp, result: RaceDataChamp[]): number[] {
  const positionCounts = new Array(100).fill(0);
  result.forEach((raceData) => {
    const driverResult = raceData.results.find((res) => res.SteamID === driver.guid);
    if (driverResult && driverResult.Pos > 0) {
      positionCounts[driverResult.Pos - 1]++;
    }
  });
  return positionCounts;
}

function countFastestLaps(driver: DriverDataChamp, result: RaceDataChamp[]): number {
  return result.reduce((count, raceData) => count + (raceData.driverFastestLapGuid === driver.guid ? 1 : 0), 0);
}

function getFirstBestPositionRaceNumber(driver: DriverDataChamp, result: RaceDataChamp[]): number {
  for (let raceData of result) {
    const driverResult = raceData.results.find((res) => res.SteamID === driver.guid);
    if (driverResult && driverResult.Pos > 0) {
      return raceData.raceNumber;
    }
  }
  return Infinity;
}

function getDriverPointsPerRace(result: RaceDataChamp[], orderChamp: DriverDataChamp[]): DriverPointsPerRace[] {
  let respuesta: DriverPointsPerRace[] = [];

  for (let raceData of result) {
    const nRace = raceData.raceNumber;
    const pointSystem = raceData.pointSystem.Puntuation;
    const pointSystemFastestLap = raceData.pointSystem.FastestLap;

    for (let itemR of raceData.results) {
      const flapPoint = itemR.SteamID === raceData.driverFastestLapGuid ? pointSystemFastestLap : 0;
      respuesta.push({
        name: itemR.DriverName,
        guid: itemR.SteamID,
        racenumber: nRace,
        points: (itemR.Pos > 0 ? pointSystem[itemR.Pos - 1] + flapPoint : 0)
      });
    }
  }

  return respuesta.sort((a, b) => {
    const indexA = orderChamp.findIndex(driver => driver.guid === a.guid);
    const indexB = orderChamp.findIndex(driver => driver.guid === b.guid);
    return indexA - indexB;
  });
}

// Obtener los datos globales de los equipos
function getTeamsDataChamp(result: DriverDataChamp[]): TeamDataChamp[] {
  let respuesta: TeamDataChamp[] = [];
  result.forEach((raceData) => {
    const teamIndex = respuesta.findIndex((team) => team.name.toLowerCase() === raceData.team.toLowerCase());
    if (teamIndex === -1) {
      if (raceData.team !== 'No Team' && raceData.team !== '') {
        respuesta.push({
          name: raceData.team,
          guidDriver1: raceData.guid,
          guidDriver2: '',
          points: raceData.totalPoints,
        });
      }
    } else {
      if (respuesta[teamIndex].guidDriver2 === '') {
        respuesta[teamIndex].guidDriver2 = raceData.guid;
      }
      respuesta[teamIndex].points += raceData.totalPoints;
    }
  });


  // Ordenar por puntos, victorias, podios, mejor posición, vueltas rápidas y mejor posición antes, si hay empate para un equipo
  return respuesta.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }

    const getPositionCounts = (team: TeamDataChamp) => {
      const positionCounts = new Array(100).fill(0);
      result.forEach(driver => {
        if (driver.team === team.name) {
          const driverResult = result.find(res => res.guid === driver.guid);
          if (driverResult) {
            positionCounts[driverResult.totalPoints - 1]++;
          }
        }
      });
      return positionCounts;
    };

    const aPositionCounts = getPositionCounts(a);
    const bPositionCounts = getPositionCounts(b);

    for (let i = 0; i < aPositionCounts.length; i++) {
      if (bPositionCounts[i] !== aPositionCounts[i]) {
        return bPositionCounts[i] - aPositionCounts[i];
      }
    }

    const aFastestLaps = result.reduce((count, driver) => count + (driver.team === a.name && (driver.guid === a.guidDriver1 || driver.guid === a.guidDriver2) ? 1 : 0), 0);
    const bFastestLaps = result.reduce((count, driver) => count + (driver.team === b.name && (driver.guid === b.guidDriver1 || driver.guid === b.guidDriver2) ? 1 : 0), 0);

    if (bFastestLaps !== aFastestLaps) {
      return bFastestLaps - aFastestLaps;
    }

    const getFirstBestPositionRaceNumber = (team: TeamDataChamp) => {
      for (let driver of result) {
        if (driver.team === team.name) {
          return driver.totalPoints;
        }
      }
      return Infinity;
    };

    return getFirstBestPositionRaceNumber(a) - getFirstBestPositionRaceNumber(b);
  });
}

// Obtener los datos de todos los coches que han participado en el campeonato
async function getCarsInChampionship(carResume: RaceCarResume[]): Promise<CarData[]> {
  const result: CarData[] = [];
  const filenameCars = [...new Set(carResume.map((car) => car.CarFileName))];
  for (let filename of filenameCars) {
    const { data: carDB } = await supabase
      .from("car")
      .select("filename, carbrand!inner(name, imgbrand), model, carclass!inner(short_name, class_design)")
      .eq("filename", filename)
      .single();

    if (carDB) {
      result.push({
        filename: carDB.filename,
        brand: carDB.carbrand?.name ?? "",
        model: carDB.model ?? "",
        classShortName: carDB.carclass.short_name ?? "",
        classColor: carDB.carclass.class_design ?? "",
        imgbrand: carDB.carbrand?.imgbrand ?? "",
      });
    }
  }

  return result;
}
