import { supabase } from "@/db/supabase";
import { getResultTableData, showToast, formatTwoIntegersPlusThreeDecimals, formatTwoIntegers } from "@/lib/utils";

import type { Points } from "@/types/Points";
import type { RaceData, BestSector, Lap } from "@/types/Results";
import type { CarData, CircuitData } from "@/types/Utils";

/* *************************** */

function initializeScript() {
  async function loadData() {
    try {
      const isResultsPage = document.getElementById("chartChangePosition1") !== null;
      if (!isResultsPage) return;

      const dom = getDomElements();
      clearDom(dom);

      const filenameRace = window.location.pathname.split("/").pop();
      if (!filenameRace) return;

      const { datos, points, carData, flagMoreSplits } = await fetchRaceData(filenameRace);

      await renderCircuitData(dom.datosCircuito, datos[0]);
      renderResultsTable(dom.tablaResultados, datos, points, carData);
      renderPositionCharts(dom.chartChangePosition, datos);
      renderGapCharts(dom.chartGaps, datos);
      renderSectorTables(dom, datos, carData, flagMoreSplits);
      renderIndividualLaps(dom.tablasIndividuales, datos, carData, flagMoreSplits);

    } catch (error) {
      console.error("Error al cargar los datos de la carrera: ", error);
      showToast("Error al cargar los datos de la carrera: " + error, "error");
    }
  }

  function getDomElements() {
  const datosCircuito = document.getElementById("datosCircuito")
  const tablaResultados = document.getElementById("tablaResultados")
  const sectorTableR1 = document.getElementById("sectorTableR1")
  const sectorTableR2 = document.getElementById("sectorTableR2")
  const titleSectorR1 = document.getElementById("titleSectorR1")
  const titleSectorR2 = document.getElementById("titleSectorR2")
  const tablaIndividuales1 = document.getElementById("tableIndividualLaps1")
  const tablasIndividuales2 = document.getElementById("tableIndividualLaps2")
  const chartChangePosition = document.getElementById("chartChangePosition")
  const chartGaps = document.getElementById("chartGaps")

  // Verificar que todos los elementos existen
  if (!datosCircuito) throw new Error('Elemento con id "datosCircuito" no encontrado.')
  if (!tablaResultados) throw new Error('Elemento con id "tablaResultados" no encontrado.')
  if (!titleSectorR1) throw new Error('Elemento con id "titleSectorR1" no encontrado.')
  if (!titleSectorR2) throw new Error('Elemento con id "titleSectorR2" no encontrado.')
  if (!tablaIndividuales1) throw new Error('Elemento con id "tableIndividualLaps1" no encontrado.')
  if (!tablasIndividuales2) throw new Error('Elemento con id "tableIndividualLaps2" no encontrado.')
  if (!chartChangePosition) throw new Error('Elemento con id "chartChangePosition" no encontrado.')
  if (!chartGaps) throw new Error('Elemento con id "chartGaps" no encontrado.')
  if (!sectorTableR1) throw new Error('Elemento con id "sectorTableR1" no encontrado.')
  if (!sectorTableR2) throw new Error('Elemento con id "sectorTableR2" no encontrado.')

  return {
    datosCircuito,
    tablaResultados,
    sectorTableR1,
    sectorTableR2,
    titleSectorR1,
    titleSectorR2,
    tablaIndividuales1,
    tablasIndividuales2,
    chartChangePosition,
    chartGaps,
    tablasIndividuales: [tablaIndividuales1, tablasIndividuales2],
  }
}

  function clearDom(dom: any) {
    dom.datosCircuito.innerHTML = "";
    dom.tablaResultados.innerHTML = "";
    dom.titleSectorR1.innerHTML = "";
    dom.titleSectorR2.innerHTML = "";
    dom.tablaIndividuales1.innerHTML = "";
    dom.tablasIndividuales2.innerHTML = "";
  }

  async function fetchRaceData(filenameRace: string) {
    const { data: resultSetData, error } = await supabase
      .from("race")
      .select("pointsystem!inner(name, points, fastestlap), race_data_1, race_data_2")
      .eq("filename", filenameRace)
      .single();

    if (error || !resultSetData) throw new Error("No se encontraron datos de la carrera");

    const { data: raceDataJSON, error: errorRaceDataJSON } = await supabase
      .storage
      .from("results")
      .download(resultSetData.race_data_1);

    if (errorRaceDataJSON || !raceDataJSON) throw new Error("Error al cargar los datos de la carrera");

    const datosR1 = JSON.parse(await raceDataJSON.text());
    let datosR2 = null;
    if (resultSetData.race_data_2 !== null && resultSetData.race_data_2 !== "") {
      const { data: raceDataJSONR2, error: errorRaceDataJSON2 } = await supabase
        .storage
        .from("results")
        .download(resultSetData.race_data_2);

      if (!errorRaceDataJSON2 || raceDataJSONR2) datosR2 = JSON.parse(await raceDataJSONR2.text());
    }

    let datos: RaceData[] = [];
    datos.push(datosR1);
    if (datosR2 !== null) datos.push(datosR2);

    const flagMoreSplits: boolean = datos[0].RaceResult.some(
      (driver) => driver.Split > 1
    );

    const points: Points = {
      Name: resultSetData.pointsystem.name,
      Puntuation: resultSetData.pointsystem.points
        .split(",")
        .map((point) => parseInt(point)),
      FastestLap: resultSetData.pointsystem.fastestlap,
    };

    let carData: CarData[] = [];
    for (let carResume of datos[0].RaceCarResume) {
      const { data: carDataSupabase, error: errorCarData } = await supabase
        .from("car")
        .select("filename, carbrand!inner(name, imgbrand), model, carclass!inner(short_name, class_design)")
        .eq("filename", carResume.CarFileName)
        .single();

      if (carDataSupabase) {
        carData.push({
          filename: carDataSupabase.filename,
          brand: carDataSupabase.carbrand?.name ?? "",
          model: carDataSupabase.model ?? "",
          classShortName: carDataSupabase.carclass.short_name ?? "",
          classColor: carDataSupabase.carclass.class_design ?? "",
          imgbrand: carDataSupabase.carbrand?.imgbrand ?? "",
        });
      } else {
        console.error("Error al obtener los datos del coche: ", errorCarData);
      }
    }

    return { datos, points, carData, flagMoreSplits };
  }

  async function renderCircuitData(datosCircuito: HTMLElement, raceData: RaceData) {
    const { data: isCircuitExists } = await supabase
      .from("circuit")
      .select("id, name, shortname, filename, location")
      .eq("filename", raceData.RaceConfig.Track)
      .single();

    if (isCircuitExists) {
      const { data: layout } = await supabase
        .from("circuitLayout")
        .select("name, length, capacity")
        .eq("filename", raceData.RaceConfig.TrackLayout)
        .eq("circuit", isCircuitExists.id)
        .single();

      const circuitData: CircuitData = {
        name: isCircuitExists?.name ?? "",
        layout: layout?.name ?? "Indefinido",
        location: isCircuitExists?.location ?? "",
        length: layout?.length ?? 0,
        capacity: layout?.capacity ?? 0,
      };

      const datosCircuitoHTML = `
      <div class="text-center bg-darkSecond rounded-lg py-5" style = "width=99%">
      <p class = "text-3xl font-bold border-b border-primary w-fit mx-auto mb-2">Datos del circuito</p>
        <div class = "grid grid-cols-1">
          <p class="text-2xl font-semibold">Circuito: ${circuitData.name} (Variante ${circuitData.layout})</p>
          <p class="text-xl">Localización: ${circuitData.location}</p>
        </div>
        <div class = "grid grid-cols-2 text-lg mt-2">
          <p>Longitud: ${circuitData.length} m</p>
          <p>Capacidad: ${circuitData.capacity} pilotos</p>
        </div>
      </div>`;
      datosCircuito.innerHTML = datosCircuitoHTML;
    }
  }

  function renderResultsTable(tablaResultados: HTMLElement, datos: RaceData[], points: Points, carData: CarData[]) {
    let tablaResultadosHTML = "";
    for (let i = 0; i < datos.length; i++) {
      const resultTable = getResultTableData(
        datos[i],
        points.Name,
        points,
        carData
      );
      tablaResultadosHTML += `
    <p class="text-3xl font-bold border-b border-primary w-fit mx-auto mt-4 mb-2">Resultado de carrera ${i + 1}</p>
    <table class="w-full border-collapse border border-lightPrimary">
      <thead class="font-medium bg-primary">
        <tr class="tabletitle">
        <th colspan="2"></th>
        <th>Pos</th>
        <th>Nombre</th>
        <th>Clase</th>
        <th colspan="2">Coche</th>
        <th>Equipo</th>
        <th>Vueltas</th>
        <th>Tiempo Total</th>
        <th>Gap to 1st</th>
        <th>Intervalo</th>
        <th>Vuelta Rápida</th>
        <th>Ptos</th>
        </tr>
      </thead>
      <tbody class="font-normal">`;

      const createResultRow = (result: any, index: number) => `
        <tr class="bg-${index % 2 === 0 ? "darkPrimary" : "darkSecond"}">
          <td class="text-center">${result.gridPositionClass}</td>
          <td class="text-center">${result.gainsAbs}</td>
          <td class="font-medium text-center">${result.posicionFinal}</td>
          <td class="text-start">${result.driverName}</td>
          <td class="text-center"><span ${result.carColorClass}>${result.carClass}</span></td>
          <td class="text-center"><img class='w-4 justify-end' src='${result.carBrand}' alt=''></img></td>
          <td class="text-start">${result.carName}</td>
          <td class="text-start">${result.team}</td>
          <td class="text-center">${result.totalLaps}</td>
          <td class="text-center">${result.timeadjust}</td>
          <td class="text-center">${result.gap}</td>
          <td class="text-center">${result.interval}</td>
          <td class="text-center"><span class="${result.flapClass}">${result.bestlapToString} ${result.tyre}</span></td>
          <td class="text-center">${result.points}</td>
        </tr>`;

      let secondSplitInit = false;
      resultTable.forEach((result, index) => {
        if (result.splitNumber === 2 && !secondSplitInit) {
          tablaResultadosHTML += `
        <tr class="bg-primary text-center font-bold">
          <td colspan="14">Segundo Split</td>
        </tr>`;
          result.interval = "";
          secondSplitInit = true;
        }
        tablaResultadosHTML += createResultRow(result, index);
      });

      tablaResultadosHTML += "</tbody></table>";
    }
    tablaResultados.innerHTML = tablaResultadosHTML;
  }

  function renderPositionCharts(chartChangePosition: HTMLElement, datos: RaceData[]) {
    chartChangePosition.classList.remove("hidden")
  }

  function renderGapCharts(chartGaps: HTMLElement, datos: RaceData[]) {
    chartGaps.classList.remove("hidden");
  }

  function renderSectorTables(dom: any, datos: RaceData[], carData: CarData[], flagMoreSplits: boolean) {
    let flagSectorsR2 = false;
    for (let i = 0; i < datos.length; i++) {
      if (i === 1 && !flagSectorsR2) {
        dom.sectorTableR2.classList.remove('hidden');
        flagSectorsR2 = true;
      }
      let titleSector = "";
      if (datos.length > 1) {
        titleSector += `<p class="text-3xl font-bold border-b border-primary w-fit mx-auto mt-4 mb-2">Mejores Sectores (Carrera ${i + 1})</p>`;
        switch (i) {
          case 0:
            dom.titleSectorR1.innerHTML += titleSector;
            break;
          case 1:
            dom.titleSectorR2.innerHTML += titleSector;
            break;
        }
      }
      const sectorsList = datos[i].BestSector.reduce((acc, sector) => {
        const index = sector.SectorNumber - 1;
        if (!acc[index]) acc[index] = [];
        acc[index].push(sector);
        return acc;
      }, [] as BestSector[][]);

      const maxContenedores = 3;
      sectorsList.slice(0, maxContenedores).forEach((sector, index) => {
        renderSectorTable(sector, index, i, carData, flagMoreSplits);
      });
    }

    function renderSectorTable(
      sector: BestSector[],
      sectorIndex: number,
      raceIndex: number,
      carData: CarData[],
      flagMoreSplits: boolean
    ) {
      const sectorTable = document.getElementById(`tablaS${sectorIndex + 1}R${raceIndex + 1}`);
      if (!sectorTable) {
        console.warn(`Elemento con id "tablaS${sectorIndex + 1}R${raceIndex + 1}" no encontrado.`);
        return;
      }
      let sectorHTML = `<p class="text-3xl font-bold border-b border-primary w-fit mx-auto mt-4 mb-2">Mejor Sector ${sectorIndex + 1}</p>
        <table class="w-full border-collapse border border-lightPrimary">
        <thead class="font-medium bg-primary">
            <tr class="tabletitle">
                <th>Pos</th>
                <th>Nombre</th>
                <th colspan="3">Vehiculo</th>
                <th>Tiempo</th>
                <th>Gap</th>
            </tr>
        </thead>
        <tbody class="font-normal">`;
      let pos = 0;
      for (let i of sector) {
        pos++;
        let gap: string = "";
        if (pos === 1) {
          gap = "0.000";
        } else {
          gap = "+" + formatTwoIntegersPlusThreeDecimals((i.BestSector - sector[0].BestSector) / 1000);
        }
        const sectorTimeString: string =
          formatTwoIntegersPlusThreeDecimals(i.BestSector / 1000);

        const isCarExists = carData.find(
          (car) => car.filename === i.CarFileName
        );
        let carName: string;
        let carBrand: string;
        let carClass: string;
        let carColorClass: string;
        if (isCarExists) {
          carName = isCarExists.model;
          carBrand = isCarExists.imgbrand;
          carClass = isCarExists.classShortName;
          carColorClass = `style="background-color: ${isCarExists.classColor.split(" ")[0].replace("bg-[", "").replace("]", "")}; color: ${isCarExists.classColor.split(" ")[1].replace("text-[", "").replace("]", "")}"`;
          carColorClass += ' class = "rounded text-xs font-bold px-1 py-0.5 ml-1"';
        } else {
          carName = i.CarFileName;
          carBrand = "";
          carClass = "";
          carColorClass = "";
        }

        if (pos % 2 === 0) {
          sectorHTML += `<tr class="bg-darkPrimary text-center">`;
        } else {
          sectorHTML += `<tr class="bg-darkSecond text-center">`;
        }
        sectorHTML += `<td>${pos}</td>`;

        if (flagMoreSplits) {
          sectorHTML += `<td>${i.DriverName} (s${i.Split})</td>`;
        } else {
          sectorHTML += `<td>${i.DriverName}</td>`;
        }
        sectorHTML += `
            <td><span ${carColorClass}>${carClass}</span></td>
            <td><img class='w-4 justify-end' src='${carBrand}' alt=''></img></td>
            <td>${carName}</td>
            <td>${sectorTimeString}</td>
            <td>${gap}</td>
          </tr>`;
      }
      sectorHTML += `</tbody></table>`;
      sectorTable.innerHTML = sectorHTML;
    }
  }

  function renderIndividualLaps(tablasIndividuales: HTMLElement[], datos: RaceData[], carData: CarData[], flagMoreSplits: boolean) {
    for (let i = 0; i < datos.length; i++) {
      if (datos.length > 1) {
        tablasIndividuales[1].classList.remove('hidden');
      }
      tablasIndividuales[i].innerHTML = `<p class="text-3xl font-bold border-b border-primary w-fit mx-auto mt-4 mb-2">Vueltas individuales (Carrera ${i + 1})</p>`;
      const tablaIndividual = loadIndividualTimes(datos[i], carData, flagMoreSplits);
      tablasIndividuales[i].innerHTML += tablaIndividual;
      if (i < datos.length - 1)
        tablasIndividuales[i].innerHTML += `<div class="mt-6"><p class='border-t-8 border-t-primary text-darkPrimary'></p></div>`;
    }
  }

  let loadingData = false;

  async function handleLoad() {
    if (loadingData) return;
    loadingData = true;
    await loadData();
    loadingData = false;
  }

  handleLoad();
  document.addEventListener("astro:page-load", handleLoad);
}

// 6. Inicialización más segura
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeScript);
} else {
  initializeScript();
}

// Helper functions outside main function to reduce cognitive complexity
function getDriverCarInfo(CarFileNameFromDriver: string | undefined, carData: CarData[]) {
  const isCarExists = carData.find(car => car.filename === CarFileNameFromDriver);
  if (isCarExists) {
    return {
      carName: isCarExists.brand + " " + isCarExists.model,
      carClass: isCarExists.classShortName,
      carColorClass: `style="background-color: ${isCarExists.classColor.split(" ")[0].replace("bg-[", "").replace("]", "")}; color: ${isCarExists.classColor.split(" ")[1].replace("text-[", "").replace("]", "")}" class = "rounded text-xs font-bold px-1 py-0.5 ml-1"`
    };
  }
  return {
    carName: CarFileNameFromDriver ?? "",
    carClass: "",
    carColorClass: ""
  };
}

function formatDriverBestLapTime(BestLap: number | undefined): string {
  if (!BestLap || BestLap >= 999999.999)
    return "Vuelta Rápida: No Time";
  const minutes = Math.trunc((BestLap / 60) % 60);
  const seconds = BestLap % 60;
  return `Vuelta Rápida: ${formatTwoIntegers(minutes)}:${formatTwoIntegersPlusThreeDecimals(seconds)}`;
}

function formatDriverSectors(sectors: number[]): string {
  return (
    "(" +
    sectors
      .map((sector, index) => {
        sector = sector / 1000;
        const timeStr =
          sector > 60
            ? `${formatTwoIntegers(Math.trunc((sector / 60) % 60))}:${formatTwoIntegersPlusThreeDecimals(sector % 60)}`
            : formatTwoIntegersPlusThreeDecimals(sector);
        return `S${index + 1}: ${timeStr}`;
      })
      .join(" | ") +
    ")"
  );
}

function createDriverHeaderHTML(
  driverName: string,
  carName: string,
  carClass: string,
  carColorClass: string,
  bestlapToString: string,
  avglapToString: string,
  consistencyString: string,
  optimallapToString: string,
  bestSectorsString: string,
  avgSectorString: string,
  optimalSectorsString: string,
  splitInfo: string)
{
  return `
    <div class="mt-8">
      <div class="text-center bg-darkSecond rounded-lg py-5">
        <p class="text-3xl font-bold border-b border-primary w-fit mx-auto mb-2">${driverName} ${splitInfo}</p>
        <div class="grid grid-cols-1">
          <p class="text-2xl font-semibold align-middle">Coche: ${carName}</p>
          <div class="block">
            <span ${carColorClass}>${carClass}</span>
          </div>
        </div>
        <div class="grid grid-cols-3 text-lg mt-2">
          <p>${bestlapToString}</p>
          <p>${avglapToString} ${consistencyString}</p>
          <p>${optimallapToString}</p>
        </div>
        <div class="grid grid-cols-3 text-lg mt-2">
          <p>${bestSectorsString}</p>
          <p>${avgSectorString}</p>
          <p>${optimalSectorsString}</p>
        </div>
      </div>
  `;
}

function processOptimalLapData(optimalLap: number[] | undefined, pos: number): { optimallapToString: string, optimalSectorsString: string } {
  let optimallapToString = "";
  let optimalSectorsString = "";

  if (optimalLap && pos >= -2) {
    const [totalTime, ...OptimalSectors] = optimalLap;
    const minutes = Math.trunc((totalTime / 60) % 60);
    const seconds = totalTime % 60;

    optimallapToString = `Vuelta Optima: ${formatTwoIntegers(minutes)}:${formatTwoIntegersPlusThreeDecimals(seconds)}`;

    optimalSectorsString =
      "(" +
      OptimalSectors.map((sector, index) => {
        sector = sector / 1000;
        const sectorTime =
          sector > 60
            ? `${formatTwoIntegers(Math.trunc((sector / 60) % 60))}:${formatTwoIntegersPlusThreeDecimals(sector % 60)}`
            : formatTwoIntegersPlusThreeDecimals(sector);

        return `S${index + 1}: ${sectorTime}`;
      }).join(" | ") +
      ")";
  }

  return { optimallapToString, optimalSectorsString };
}

function processAverageLapData(average: number[], pos: number): { avglapToString: string, avgSectorString: string } {
  let avglapToString = "";
  let avgSectorString = "";
  
  if (pos >= -2) {
    const AvgSectors = average.slice(1);
    const secondsavg = formatTwoIntegersPlusThreeDecimals(average[0] % 60);
    const minutesavg = formatTwoIntegers(Math.trunc((average[0] / 60) % 60));
    
    avglapToString = `Vuelta Media: ${minutesavg}:${secondsavg}`;
    avgSectorString += `(`;
    AvgSectors.forEach((sector, index, array) => {
      sector /= 1000;
      const minutes = Math.trunc(sector / 60);
      const seconds = sector % 60;
      avgSectorString += `S${index + 1}: ${
        minutes
          ? `${formatTwoIntegers(minutes)}:${formatTwoIntegersPlusThreeDecimals(seconds)}`
          : formatTwoIntegersPlusThreeDecimals(seconds)
      }${index < array.length - 1 ? " | " : ""}`;
    });
    avgSectorString += `)`;
  }

  return { avglapToString, avgSectorString };
}

function generateLapRows(
  laps: Lap[],
  bestGlobalSectors: number[],
  bestSectorsDriverID: number[],
  BestLapGeneral: number,
  BestLap: number | undefined,
  pos: number
): string {
  return laps.map(lap => {
    // Format lap time
    const lapTime = pos >= -2
      ? `${formatTwoIntegers(Math.trunc((lap.LapTime / 60) % 60))}:${formatTwoIntegersPlusThreeDecimals(lap.LapTime % 60)}`
      : "";

    // Determine row background class
    const bgClass = lap.LapNumber % 2 === 0 ? "bg-darkPrimary" : "bg-darkSecond";

    // Determine lap time class
    let lapTimeClass = '""';
    if (lap.LapTime === BestLapGeneral) {
      lapTimeClass = '"bg-[#c100ff] text-white font-bold rounded-full w-content px-2"';
    } else if (typeof BestLap !== "undefined" && lap.LapTime === BestLap) {
      lapTimeClass = '"bg-[#00ee07] text-black font-bold rounded-full w-content px-2"';
    } else if (lap.Cut > 0) {
      lapTimeClass = '"bg-primary text-black font-bold rounded-full w-content px-2"';
    }

    // Determine cut class
    const cutClass = lap.Cut > 0
      ? '"bg-primary text-black font-semibold rounded-full w-content px-2"'
      : '""';

    // Determine position class
    let positionClass = '""';
    if (lap.Position === 1) {
      positionClass = '"bg-[#ffc750] text-black font-bold rounded-full w-content px-2"';
    } else if (lap.Position === 2) {
      positionClass = '"bg-[#c0c0c0] text-black font-bold rounded-full w-content px-2"';
    } else if (lap.Position === 3) {
      positionClass = '"bg-[#cd7f32] text-white font-bold rounded-full w-content px-2"';
    }

    // Format sectors
    const sectors = lap.Sector.map((sectorTime, idx) => {
      // Format sector time
      const formattedTime = (() => {
        let time = sectorTime / 1000;
        if (time >= 60) {
          const seconds = formatTwoIntegersPlusThreeDecimals(time % 60);
          const minutes = formatTwoIntegers(Math.trunc((time / 60) % 60));
          return `${minutes}:${seconds}`;
        }
        return formatTwoIntegersPlusThreeDecimals(time);
      })();

      // Determine sector class
      let sectorClass = '""';
      if (sectorTime === bestSectorsDriverID[idx]) {
        sectorClass = sectorTime === bestGlobalSectors[idx]
          ? '"bg-[#c100ff] text-white font-bold rounded-full w-content px-2"'
          : '"bg-[#00ee07] text-black font-bold rounded-full w-content px-2"';
      }

      return `<td><span class=${sectorClass}>${formattedTime}</span></td>`;
    }).join("");

    return `
      <tr class="${bgClass} text-center">
        <td>${lap.LapNumber}</td>
        <td><span class=${lapTimeClass}>${lapTime}</span></td>
        ${sectors}
        <td>${lap.Tyre}</td>
        <td><span class=${positionClass}>${lap.Position}</span></td>
        <td><span class=${cutClass}>${lap.Cut}</span></td>
      </tr>`;
  }).join("");
}

function loadIndividualTimes(datos: RaceData, carData: CarData[], flagMoreSplits: boolean): string {
  const BestLapGeneral = datos.BestLap[0].BestLap;
  const sectorsList = datos.BestSector.reduce((acc, sector) => {
    const index = sector.SectorNumber - 1;
    if (!acc[index]) acc[index] = [];
    acc[index].push(sector);
    return acc;
  }, [] as BestSector[][]);

  const drivers = datos.RaceLaps;
  let result = "";

  for (const itemRL of drivers) {
    const driverName = itemRL.DriverName;
    const driverID = itemRL.SteamID;
    const laps = itemRL.Laps;
    const bestLap = itemRL.Best;
    const optimalLap: number[] = itemRL.Optimal;
    const average = itemRL.Average;
    const consistency = datos.Consistency.find((c) => c.SteamID === driverID)?.Consistency;

    // Get driver position
    let pos = datos.RaceResult.find((driver) => driver.SteamID === driverID)?.Pos ?? -3;
    if (pos < -3) continue;

    // Get driver best lap
    const BestLap = datos.RaceResult.find((driver) => driver.SteamID === driverID)?.BestLap;

    // Get driver car
    const CarFileNameFromDriver = datos.RaceResult.find((driver) => driver.SteamID === driverID)?.CarFileName;
    const { carName, carClass, carColorClass } = getDriverCarInfo(CarFileNameFromDriver, carData);

    // Process average and optimal lap data
    const { avglapToString, avgSectorString } = processAverageLapData(average, pos);
    const { optimallapToString, optimalSectorsString } = processOptimalLapData(optimalLap, pos);

    // Format best lap and consistency
    const bestlapToString = formatDriverBestLapTime(BestLap);
    const bestSectorsString = (pos >= -2 && BestLap && BestLap < 999999.999) ? formatDriverSectors(bestLap.slice(1)) : "";
    const consistencyString = (consistency === undefined || consistency === -1) ? "" :
        ` | Consistencia: ${consistency.toFixed(2)}% ( ${(consistency - 100).toFixed(2)} )`;

    // Add driver header
    const splitInfo = flagMoreSplits ? `(Split ${itemRL.Split})` : "";
    result += createDriverHeaderHTML(
      driverName, carName, carClass, carColorClass,
      bestlapToString, avglapToString, consistencyString,
      optimallapToString, bestSectorsString, avgSectorString,
      optimalSectorsString, splitInfo
    );

    // Add driver laps
    if (pos >= -2) {
      const bestGlobalSectors = sectorsList.map(sector => sector[0].BestSector);
      const bestSectorsDriverID = sectorsList.map(sector =>
        sector.find(s => s.SteamID === driverID)?.BestSector ?? 999999999
      );

      result += `
      <table class="w-full border-collapse border border-lightPrimary">
        <thead class="font-medium bg-primary">
          <tr class="tabletitle">
            <th>Nº</th>
            <th>Tiempo</th>
            <th colspan="3">Sectores</th>
            <th>Rueda</th>
            <th>Posición en Carrera</th>
            <th>Cut</th>
          </tr>
        </thead>
        <tbody class="font-normal">
          ${generateLapRows(laps, bestGlobalSectors, bestSectorsDriverID, BestLapGeneral, BestLap, pos)}
        </tbody>
      </table>
    </div>`;
    } else {
      result += `
      <p class="w-fit mx-auto font-medium text-xl">Piloto sin vueltas: No empezó la prueba / no completó ninguna vuelta</p>
      </div>`;
    }
  }

  return result;
}