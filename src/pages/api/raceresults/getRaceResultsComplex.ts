import ApexCharts from 'apexcharts';
import { supabase } from "@/db/supabase";
import { getResultTableData, showToast, formatTwoIntegersPlusThreeDecimals, formatTwoIntegers } from "@/lib/utils";

import type { Points } from "@/types/Points";
import type { RaceData, RaceResult, RaceLap, BestLap, Consistency, BestSector, Incident, RaceConfig, } from "@/types/Results";
import type { CarData, CircuitData } from "@/types/Utils";

/* *************************** */

function initializeScript() {
  async function loadData() {
    try {
      const filenameRace = window.location.pathname.split('/').pop(); // Obtiene el ID de la URL
      if (!filenameRace) return;

      const datosCircuito = document.getElementById('datosCircuito');
      const tablaResultados = document.getElementById('tablaResultados');
      const tablaIndividuales = document.getElementById('tableIndividualLaps');

      if (tablaResultados) {
        tablaResultados.innerHTML = '';
      } else {
        throw new Error('Elemento con id "resultado" no encontrado.');
      }

      if (datosCircuito) {
        datosCircuito.innerHTML = '';
      } else {
        throw new Error('Elemento con id "resultado2" no encontrado.');
      }

      if (tablaIndividuales) {
        tablaIndividuales.innerHTML = '';
      } else {
        throw new Error('Elemento con id "tablaIndividuales" no encontrado.');
      }

      // *** Datos de la carrera (JSON Completo) ***
      console.log('Filename: ', filenameRace);
      const { data: resultSetData, error } = await supabase
        .from("race")
        .select("pointsystem!inner(name, points, fastestlap), race_data_1")
        .eq("filename", filenameRace as string)
        .single();

      if (error || !resultSetData) {
        throw new Error("No se encontraron datos de la carrera");
      }

      const { data: raceDataJSON, error: errorRaceDataJSON } = await supabase
        .storage
        .from('results')
        .download(resultSetData.race_data_1);

      if (errorRaceDataJSON || !raceDataJSON) throw new Error ('Error al cargar los datos de la carrera');
      const datos = JSON.parse(await raceDataJSON.text());
      const dresult: RaceResult[] = datos.RaceResult;
      const dlaps: RaceLap[] = datos.RaceLaps;
      const dbestlaps: BestLap[] = datos.BestLap;
      const dconsistency: Consistency[] = datos.Consistency;
      const dbestsectors: BestSector[] = datos.BestSector;
      const devents: Incident[] = datos.Incident;
      const dconfig: RaceConfig = datos.RaceConfig;

      // Flag para indicar si hay más de un split
      const flagMoreSplits: Boolean = dresult.some((driver) => driver.Split > 1);

      // *** Sistema de puntuación ***
      const points: Points = {
        Name: resultSetData.pointsystem.name,
        Puntuation: resultSetData.pointsystem.points
          .split(",")
          .map((point) => parseInt(point)),
        FastestLap: resultSetData.pointsystem.fastestlap,
      };

      console.log("Datos a usar: ", datos);

      // Datos de los coches involucrados en la carrera
      let carData: CarData[] = [];
      for (let carResume of datos.RaceCarResume) {
        const { data: carDataSupabase, error: errorCarData } = await supabase
          .from("car")
          .select(
            "filename, carbrand!inner(name, imgbrand), model, carclass!inner(short_name, class_design)"
          )
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
          console.log("Error al obtener los datos del coche: ", errorCarData);
        }
      }

      // *** Datos del circuito ***
      const { data: isCircuitExists, error: errorCircuitExists } = await supabase
        .from("circuit")
        .select("id, name, shortname, filename, location")
        .eq("filename", dconfig.Track)
        .single();

      if (isCircuitExists) {
      const { data: layout, error: errorLayout } = await supabase
        .from("circuitLayout")
        .select("name, length, capacity")
        .eq("filename", dconfig.TrackLayout)
        .eq("circuit", isCircuitExists.id)
        .single();

      const circuitData: CircuitData = {
        name: isCircuitExists?.name || "",
        layout: layout?.name || "Indefinido",
        location: isCircuitExists?.location || "",
        length: layout?.length || 0,
        capacity: layout?.capacity || 0
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
      </div>
      <p class="text-3xl font-bold border-b border-primary w-fit mx-auto mt-4 mb-2">Resultado de carrera</p>`;

      datosCircuito.innerHTML = datosCircuitoHTML;
    }

      // *** Datos simples de la carrera ***
      const resultTable = getResultTableData(datos, points.Name, points, carData);
      let tablaResultadosHTML = `
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
      <tr class="bg-[${index % 2 === 0 ? '#0f0f0f' : '#19191c'}]">
        <td class="text-center">${result.gridPositionClass}</td>                                                        <!-- Gan/Per (Flechas)-->
        <td class="text-center">${result.gainsAbs}</td>                                                                 <!-- Gan/Per (Número)-->
        <td class="font-medium text-center">${result.posicionFinal}</td>                                                <!-- Posicion -->
        <td class="text-start">${result.driverName}</td>                                                                <!-- Nombre -->
        <td class="text-center"><span ${result.carColorClass}>${result.carClass}</span></td>                            <!-- Clase del Coche -->
        <td class="text-center"><img class='w-4 justify-end' src='${result.carBrand}' alt=''></img></td>                <!-- Logo Coche -->
        <td class="text-start">${result.carName}</td>                                                                   <!-- Coche -->
        <td class="text-start">${result.team}</td>                                                                      <!-- Equipo -->
        <td class="text-center">${result.totalLaps}</td>                                                                <!-- Nº Vueltas -->
        <td class="text-center">${result.timeadjust}</td>                                                               <!-- Tiempo Total -->
        <td class="text-center">${result.gap}</td>                                                                      <!-- Gap con primero -->
        <td class="text-center">${result.interval}</td>                                                                 <!-- Intervalo -->
        <td class="text-center"><span class="${result.flapClass}">${result.bestlapToString} ${result.tyre}</span></td>  <!-- Vuelta Rapida  + Neumaticos-->
        <td class="text-center">${result.points}</td>                                                                   <!-- Puntos -->
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

      tablaResultadosHTML += '</tbody></table>';

      tablaResultados.innerHTML = tablaResultadosHTML;

      // *** Cambios de posiciones ***
      // Crea un array para almacenar los datos de la serie para cada split
      let seriesDataPositions: { name: string; data: number[] }[][] = [];

      // Obtiene todos los splits de los resultados, sin duplicados
      const splitsPositionChange = [
        ...new Set(dresult.map((result) => result.Split)),
      ];

      // Inicializa un array para cada split
      splitsPositionChange.forEach(() => seriesDataPositions.push([]));
      // Mapea los datos para cada split
      dlaps
        .filter((lapData) => lapData.Laps.length > 0)
        .forEach((lapData) => {
          const driverResult = dresult.find(
            (result) => result.SteamID === lapData.SteamID
          );
          if (driverResult) {
            const splitIndex = driverResult.Split - 1;
            const gridPosition = driverResult.GridPosition;

            seriesDataPositions[splitIndex].push({
              name: lapData.DriverName,
              data: [gridPosition, ...lapData.Laps.map((lap) => lap.Position)],
            });
          }
        });

      const numlaps: number[] = Array.from(
        { length: dlaps[0].Laps.length + 1 },
        (_, i) => i
      );
      let nameChartPositions = "Cambios de posiciones (Carrera1 - Split 1)";
      var optionsChangePositions = {
        title: {
          text: nameChartPositions,
          align: "center",
          style: {
            color: "#f9f9f9",
            fontSize: "24px",
            fontWeight: "bold",
          },
        },

        series: seriesDataPositions[0],
        colors: [
          "#2E93fA",
          "#66DA26",
          "#E91E63",
          "#FF9800",
          "#fff700",
          "#00ffd4",
          "#0036ff",
          "#e91ec4",
          "#9e57ff",
          "#ff0000",
          "#00ffbd",
          "#546E7A",
        ],

        chart: {
          type: "line",
          zoom: {
            enable: false,
            type: "x",
            autoScaleYaxis: true,
          },
          locales: [
            {
              name: "es",
              options: {
                toolbar: {
                  download: "Descargar SVG",
                  selection: "Seleccionar",
                  selectionZoom: "Seleccionar Zoom",
                  zoomIn: "Zoom In",
                  zoomOut: "Zoom Out",
                  pan: "Mover",
                  reset: "Reiniciar Zoom",
                },
              },
            },
          ],
          defaultLocale: "es",
          toolbar: {
            show: true,
            tools: {
              download: false,
              selection: false,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
              reset: true,
            },
          },
          animation: {
            enabled: true,
            easing: "linear",
            speed: 850,
            animateGradually: {
              enabled: false,
            },
          },
        },

        xaxis: {
          categories: numlaps,
          labels: {
            style: {
              colors: "#f9f9f9",
            },
          },
          title: {
            text: "Vueltas",
            style: {
              color: "#f9f9f9",
              fontSize: "16px",
            },
          },
        },

        yaxis: {
          stepSize: 1,
          min: 1,
          position: "top",
          reversed: true,
          title: {
            text: "Posiciones",
            style: {
              color: "#f9f9f9",
              fontSize: "16px",
            },
          },
          labels: {
            style: {
              colors: "#f9f9f9",
            },
          },
        },

        stroke: {
          curve: "smooth",
        },

        markers: {
          size: 1,
        },

        tooltip: {
          theme: "dark",
        },

        legend: {
          labels: {
            colors: "#f9f9f9",
          },
        },
      };

      var chartChangePosition = new ApexCharts(
        document.querySelector("#chartChangePosition"),
        optionsChangePositions
      );
      //chartChangePosition.resetSeries();
      chartChangePosition.render();

      // *** Gaps durante las vueltas ***
      let seriesDataGaps: { name: string; data: number[] }[][] = [];

      // Obtiene todos los splits de los resultados, sin duplicados
      const splitsGapVariation = [...new Set(dresult.map((result) => result.Split))];

      // Inicializa un array para cada split
      splitsGapVariation.forEach(() => seriesDataGaps.push([]));

      // Mapea los datos para cada split
      dlaps
        .filter((lapData) => lapData.Laps.length > 0)
        .forEach((lapData) => {
          const driverResult = dresult.find(
            (result) => result.SteamID === lapData.SteamID
          );
          if (driverResult) {
            const splitIndex = driverResult.Split - 1;
            seriesDataGaps[splitIndex].push({
              name: lapData.DriverName,
              data: lapData.Laps.map((lap) => lap.GaptoFirst),
            });
          }
        });

      let nameChartGaps = "Distancia al líder (Carrera 1 - Split 1)";
      var optionsGaps = {
        title: {
          text: nameChartGaps,
          align: "center",
          style: {
            color: "#f9f9f9",
            fontSize: "24px",
            fontWeight: "bold",
          },
        },

        series: seriesDataGaps[0],
        colors: [
          "#2E93fA",
          "#66DA26",
          "#546E7A",
          "#E91E63",
          "#FF9800",
          "#fff700",
          "#00ffd4",
          "#0036ff",
          "#e91ec4",
          "#9e57ff",
          "#ff0000",
          "#00ffbd",
        ],

        chart: {
          type: "line",
          zoom: {
            enable: false,
            type: "x",
            autoScaleYaxis: true,
          },
          locales: [
            {
              name: "es",
              options: {
                months: [
                  "Enero",
                  "Febrero",
                  "Marzo",
                  "Abril",
                  "Mayo",
                  "Junio",
                  "Julio",
                  "Agosto",
                  "Septiembre",
                  "Octubre",
                  "Noviembere",
                  "Diciembre",
                ],
                shortMonths: [
                  "Ene",
                  "Feb",
                  "Mar",
                  "Abr",
                  "May",
                  "Jun",
                  "Jul",
                  "Ago",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ],
                days: [
                  "Lunes",
                  "Martes",
                  "Miercoles",
                  "Jueves",
                  "Viernes",
                  "Sábado",
                  "Domingo",
                ],
                shortDays: ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"],
                toolbar: {
                  download: "Descargar SVG",
                  selection: "Seleccionar",
                  selectionZoom: "Seleccionar Zoom",
                  zoomIn: "Zoom In",
                  zoomOut: "Zoom Out",
                  pan: "Mover",
                  reset: "Reiniciar Zoom",
                },
              },
            },
          ],
          defaultLocale: "es",
          toolbar: {
            show: true,
            tools: {
              download: false,
              selection: false,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
              reset: true,
            },
          },
          animation: {
            enabled: true,
            easing: "linear",
            speed: 850,
            animateGradually: {
              enabled: false,
            },
          },
        },

        xaxis: {
          categories: numlaps,
          labels: {
            style: {
              colors: "#f9f9f9",
            },
          },
          title: {
            text: "Vueltas",
            style: {
              color: "#f9f9f9",
              fontSize: "16px",
            },
          },
        },

        yaxis: {
          stepSize: 8,
          min: 0,
          position: "top",
          reversed: true,
          title: {
            text: "Distancia al líder (segundos)",
            style: {
              color: "#f9f9f9",
              fontSize: "16px",
            },
          },
          labels: {
            style: {
              colors: "#f9f9f9",
            },
          },
        },

        stroke: {
          curve: "smooth",
        },

        markers: {
          size: 1,
        },

        tooltip: {
          theme: "dark",
        },

        legend: {
          labels: {
            colors: "#f9f9f9",
          },
        },
        grid: {
          borderColor: "#5a5a5a",
        },
      };

      var chartGapsProgression = new ApexCharts(
        document.querySelector("#chartGaps"),
        optionsGaps
      );
      //chartGapsProgression.resetSeries();
      chartGapsProgression.render();

      // *** Sectores ***
      const sectorsList = dbestsectors.reduce((acc, sector) => {
        const index = sector.SectorNumber - 1;
        if (!acc[index]) acc[index] = [];
        acc[index].push(sector);
        return acc;
      }, [] as BestSector[][]);

      sectorsList.forEach((sector, index) => {
        const sectorTable = document.getElementById(`tablaS${index + 1}`);
        if (sectorTable) {
          let sectorHTML = `<p class="text-3xl font-bold border-b border-primary w-fit mx-auto mt-4 mb-2">Mejor Sector ${index + 1}</p>
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
            pos === 1
              ? (gap = "0.000")
              : (gap =
                "+" +
                formatTwoIntegersPlusThreeDecimals(
                  (i.BestSector - sector[0].BestSector) / 1000
                ));
            const sectorTimeString: string = formatTwoIntegersPlusThreeDecimals(
              i.BestSector / 1000
            );

            // Obtener el nombre real del coche
            const isCarExists = carData.find((car) => car.filename === i.CarFileName);
            let carName: string;
            let carBrand: string;
            let carClass: string;
            let carColorClass: string;
            if (isCarExists) {
              carName = isCarExists.brand + " " + isCarExists.model;
              carBrand = isCarExists.imgbrand;
              carClass = isCarExists.classShortName;
              carColorClass = `style="background-color: ${isCarExists.classColor.split(" ")[0].replace("bg-[", "").replace("]", "")}; color: ${isCarExists.classColor.split(" ")[1].replace("text-[", "").replace("]", "")}"`;
              carColorClass +=
                ' class = "rounded text-xs font-bold px-1 py-0.5 ml-1"';
            } else {
              carName = i.CarFileName;
              carBrand = "";
              carClass = "";
              carColorClass = "";
            }

            pos % 2 === 0
              ? (sectorHTML += `<tr class="bg-darkPrimary text-center">`)
              : (sectorHTML += `<tr class="bg-darkSecond text-center">`);
            sectorHTML += `<td>${pos}</td>`;

            flagMoreSplits
              ? (sectorHTML += `<td>${i.DriverName} (s${i.Split})</td>`)
              : (sectorHTML += `<td>${i.DriverName}</td>`);
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
        } else {
          console.warn(`Elemento con id "tablaS${index + 1}" no encontrado.`);
        }
      });

      // *** Tabla de vueltas de carrera por piloto ***
      const BestLapGeneral = dbestlaps[0].BestLap;

      // Dividir la generación de HTML en chunks para una carga más rápida
      const chunkSize = 1; // Número de pilotos por chunk
      const drivers = dlaps;

      for (let i = 0; i < drivers.length; i += chunkSize) {
        const chunk = drivers.slice(i, i + chunkSize);
        let chunkHTML = '';

        i == 0 ?
          chunkHTML += '<p class="text-3xl font-bold border-b border-primary w-fit mx-auto mt-4 mb-2">Vuelta a vuelta de pilotos</p>'
          : chunkHTML += '';

        for (const itemRL of chunk) {
          const driverName = itemRL.DriverName;
          const driverID = itemRL.SteamID;
          const laps = itemRL.Laps;
          const totalLaps = laps.length;
          const bestLap = itemRL.Best;
          const optimalLap: number[] = itemRL.Optimal;
          const average = itemRL.Average;
          const consistency = dconsistency.find(
            (consistency) => consistency.SteamID === driverID
          )?.Consistency;

          let pos = dresult.find((driver) => driver.SteamID === driverID)?.Pos;
          if (pos === undefined) pos = -3;

          const BestLap = dresult.find(
            (driver) => driver.SteamID === driverID
          )?.BestLap;
          let BestLapFound: boolean = false;

          const CarFileNameFromDriver = dresult.find(
            (driver) => driver.SteamID === driverID
          )?.CarFileName;

          // Obtener el nombre real del coche
          const isCarExists = carData.find(
            (car) => car.filename === CarFileNameFromDriver
          );
          let carName: string;
          let carBrand: string;
          let carClass: string;
          let carColorClass: string;
          if (isCarExists) {
            carName = isCarExists.brand + " " + isCarExists.model;
            carBrand = isCarExists.imgbrand;
            carClass = isCarExists.classShortName;
            carColorClass = `style="background-color: ${isCarExists.classColor.split(" ")[0].replace("bg-[", "").replace("]", "")}; color: ${isCarExists.classColor.split(" ")[1].replace("text-[", "").replace("]", "")}"`;
            carColorClass += ' class = "rounded text-xs font-bold px-1 py-0.5 ml-1"';
          } else {
            carName = CarFileNameFromDriver ?? "";
            carBrand = "";
            carClass = "";
            carColorClass = "";
          }

          const AvgSectors: number[] = average.slice(1);
          let secondsavg = formatTwoIntegersPlusThreeDecimals(average[0] % 60);
          let minutesavg = formatTwoIntegers(Math.trunc((average[0] / 60) % 60));
          let avglapToString: string = "";
          let avgSectorString: string = "";
          if (pos >= -2) {
            avglapToString = `Vuelta Media: ${minutesavg}:${secondsavg}`;
            avgSectorString += `(`;
            AvgSectors.map((sector, index, array) => {
              sector /= 1000;
              const minutes = Math.trunc(sector / 60);
              const seconds = sector % 60;
              avgSectorString += `S${index + 1}: ${minutes
                  ? `${formatTwoIntegers(minutes)}:${formatTwoIntegersPlusThreeDecimals(seconds)}`
                  : formatTwoIntegersPlusThreeDecimals(seconds)
                }${index < array.length - 1 ? " | " : ""}`;
            });
            avgSectorString += `)`;
          }

          let optimallapToString: string = "";
          let optimalSectorsString: string = "";

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

          const formatBestLapTime = (BestLap: number | undefined): string => {
            if (!BestLap || BestLap >= 999999.999) return "Vuelta Rápida: No Time";

            const minutes = Math.trunc((BestLap / 60) % 60);
            const seconds = BestLap % 60;
            return `Vuelta Rápida: ${formatTwoIntegers(minutes)}:${formatTwoIntegersPlusThreeDecimals(seconds)}`;
          };

          const formatSectors = (sectors: number[]): string => {
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
          };

          const bestlapToString = formatBestLapTime(BestLap);
          const bestSectorsString =
            pos >= -2 && BestLap && BestLap < 999999.999
              ? formatSectors(bestLap.slice(1))
              : "";

          let consistencyString =
            consistency === undefined || consistency === -1
              ? ""
              : ` | Consistencia: ${consistency}% ( ${(consistency - 100).toFixed(2)} )`;

          if (pos < -3) return;

          const createDriverHeader = () => {
            const splitInfo = flagMoreSplits ? `(Split ${itemRL.Split})` : '';
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
          };

          const formatLapRow = (lap: any, bestGlobalSectors: number[], bestSectorsDriverID: number[]) => {
            const getBestLapClass = () => {
              if (lap.LapTime === BestLapGeneral && !BestLapFound) {
                BestLapFound = true;
                return '"bg-[#c100ff] text-white font-bold rounded-full w-content px-5"';
              }
              if (lap.LapTime === BestLap && !BestLapFound) {
                BestLapFound = true;
                return '"bg-[#00ee07] text-black font-bold rounded-full w-content px-5"';
              }
              return '""';
            };

            const formatSectorTime = (time: number) => {
              time /= 1000;
              if (time >= 60) {
                const seconds = formatTwoIntegersPlusThreeDecimals(time % 60);
                const minutes = formatTwoIntegers(Math.trunc((time / 60) % 60));
                return `${minutes}:${seconds}`;
              }
              return formatTwoIntegersPlusThreeDecimals(time);
            };

            const getSectorClass = (sectorIndex: number) => {
              const sectorTime = lap.Sector[sectorIndex];
              if (sectorTime === bestSectorsDriverID[sectorIndex]) {
                return sectorTime === bestGlobalSectors[sectorIndex]
                  ? '"bg-[#c100ff] text-white font-bold rounded-full w-content px-5"'
                  : '"bg-[#00ee07] text-black font-bold rounded-full w-content px-5"';
              }
              return '""';
            };

            const lapTime = pos >= -1
              ? `${formatTwoIntegers(Math.trunc((lap.LapTime / 60) % 60))}:${formatTwoIntegersPlusThreeDecimals(lap.LapTime % 60)}`
              : '';

            const bgClass = lap.LapNumber % 2 === 0 ? 'bg-darkPrimary' : 'bg-darkSecond';
            const cutClass = lap.Cut > 0 ? '"bg-primary text-black font-semibold rounded-full w-content px-5"' : '""';

            return `
            <tr class="${bgClass} text-center">
              <td>${lap.LapNumber}</td>
              <td><span class=${getBestLapClass()}>${lapTime}</span></td>
              ${lap.Sector.map((sector: number, idx: number) =>
              `<td><span class=${getSectorClass(idx)}>${formatSectorTime(sector)}</span></td>`
            ).join('')}
              <td>${lap.Tyre}</td>
              <td>${lap.Position}</td>
              <td><span class=${cutClass}>${lap.Cut}</span></td>
            </tr>`;
          };

          chunkHTML += createDriverHeader();

          if (pos >= -2) {
            const bestGlobalSectors = sectorsList.map(sector => sector[0].BestSector);
            const bestSectorsDriverID = sectorsList.map(sector => sector.find(s => s.SteamID === driverID)?.BestSector ?? 999999999);

            chunkHTML += `
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
                ${laps.map(lap => formatLapRow(lap, bestGlobalSectors, bestSectorsDriverID)).join('')}
              </tbody>
            </table>
          </div>`;
          } else {
            chunkHTML += `
            <p class="w-fit mx-auto font-medium text-xl">Piloto sin vueltas: No empezó la prueba / no completó ninguna vuelta</p>
            </div>`;
          }
        }

        // Actualizar el DOM de forma incremental
        if (tablaIndividuales) {
          tablaIndividuales.insertAdjacentHTML('beforeend', chunkHTML);
        }

        // Dar tiempo al navegador para renderizar
        await new Promise(resolve => setTimeout(resolve, 250));
      }
      await new Promise(resolve => setTimeout(resolve, 250));

    } catch (error) {
      console.error("Error al cargar los datos de la carrera: ", error);
      showToast("Error al cargar los datos de la carrera: " + error, "error");
    }
  };

  let loadingData = false;

  async function handleLoad() {
    if (loadingData) return;
    loadingData = true;
    await loadData();
    loadingData = false;
  }

  handleLoad();
  document.addEventListener('astro:page-load', handleLoad);
}

// 6. Inicialización más segura
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeScript);
} else {
  initializeScript();
}