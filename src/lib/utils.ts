import { formatTwoIntegersPlusThreeDecimals, formatTwoIntegers} from "@/lib/results/resultConverter";

import type { RaceData, RaceResult, RaceLap, BestLap, RaceConfig } from "@/types/Results";
import type { Points } from "@/types/Points";
import type { ResultTableData, CarData } from "@/types/Utils";

export function getResultTableData(datos: RaceData, pointsystemName: String, pointArray: Points, cars: CarData[]): ResultTableData[] {
  let resultTableData: ResultTableData[] = [];
  const dresult: RaceResult[] = datos.RaceResult;
  const dlaps: RaceLap[] = datos.RaceLaps;
  const dbestlaps: BestLap[] = datos.BestLap;


  // Para calcular la disposición de puntos de una manera correcta cuando hay 2 splits
  let driversQualifiedSplit1 = 0;
  if(datos.RaceConfig.NumberofSplits>1){
      driversQualifiedSplit1 = dresult.filter(driver => driver.Split === 1 && driver.Pos > 0).length;
  }

  let pos: number = 0;
  let postabla: number = 0;
  let vueltasLider: number = 0;

  // Obtener el número de pilotos por split, que hayan terminado la carrera
  const driversPerSplitQualified = dresult.reduce((acc: number[], driver) => {
      if (driver.Pos > 0) {
          const splitIndex = driver.Split - 1;
          if (!acc[splitIndex]) acc[splitIndex] = 0;
          acc[splitIndex]++;
      }
      return acc;
  }, []);

  // *** Mejor vuelta de carrera ***
  const bestlapDriverID = dbestlaps[0].SteamID;

  for (let itemResult of dresult) {
      let item: ResultTableData;
      postabla++;
      pos = itemResult.Pos;
      let gridPositionClass = "";

      // Obtener ganancias/perdidas de posición
      const positionsOtherSplits = driversPerSplitQualified.slice(0, itemResult.Split - 1).reduce((sum, current) => sum + current, 0);
      let gains = itemResult.GridPosition - postabla + positionsOtherSplits;
      let gainsAbs: string = Math.abs(gains).toString();
      if ((gains > 0) && (pos > -2)) {
          gridPositionClass = '<svg viewBox="0 0 24 24" fill="#00f000" class="w-6 float mx-auto"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.375 6.22l-5 4a1 1 0 0 0 -.375 .78v6l.006 .112a1 1 0 0 0 1.619 .669l4.375 -3.501l4.375 3.5a1 1 0 0 0 1.625 -.78v-6a1 1 0 0 0 -.375 -.78l-5 -4a1 1 0 0 0 -1.25 0z" /></svg>';
      } else if ((gains < 0) && (pos > -2)) {
          gridPositionClass = '<svg viewBox="0 0 24 24" fill="#ff0000" class="w-6 float mx-auto rotate-180"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.375 6.22l-5 4a1 1 0 0 0 -.375 .78v6l.006 .112a1 1 0 0 0 1.619 .669l4.375 -3.501l4.375 3.5a1 1 0 0 0 1.625 -.78v-6a1 1 0 0 0 -.375 -.78l-5 -4a1 1 0 0 0 -1.25 0z" /></svg>';
      } else if (gains === 0 || pos <= -2) {
          gridPositionClass = '<svg viewBox="0 0 24 24" fill="#ffc800" class="w-6 float mx-auto rotate-90"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.375 6.22l-5 4a1 1 0 0 0 -.375 .78v6l.006 .112a1 1 0 0 0 1.619 .669l4.375 -3.501l4.375 3.5a1 1 0 0 0 1.625 -.78v-6a1 1 0 0 0 -.375 -.78l-5 -4a1 1 0 0 0 -1.25 0z" /></svg>';
          gainsAbs = "0";
      }
      if (pos <= -3) {
          gridPositionClass = "";
          gainsAbs = "";
      }

      // Obtener nombre de equipo + Ping Min-Max
      let equipo = itemResult.Team;


      // Obtener el nombre real del coche
      const isCarExists = cars.find((car) => car.filename === itemResult.CarFileName);
      let carName: string;
      let carBrand: string;
      let carClass: string;
      let carColorClass: string;
      if (isCarExists) {
          carName = isCarExists.brand + " " + isCarExists.model;
          carBrand = isCarExists.imgbrand;
          carClass = isCarExists.classShortName;
          carColorClass = `style="background-color: ${isCarExists.classColor.split(' ')[0].replace('bg-[', '').replace(']', '')}; color: ${isCarExists.classColor.split(' ')[1].replace('text-[', '').replace(']', '')}"`;
          carColorClass += ' class = "rounded text-xs font-bold px-1 py-0.5 ml-1"';
      } else {
          carName = itemResult.CarFileName;
          carBrand = "";
          carClass = "";
          carColorClass = "";
      }

      // Obtener tiempo total de carrera
      let timeadjust;
      if (itemResult.Pos !== -2) {
          if (itemResult.TotalTime >= 0) {
              timeadjust = itemResult.TotalTime + itemResult.Penalties;
              const seconds = formatTwoIntegersPlusThreeDecimals(timeadjust % 60);
              const minutes = formatTwoIntegers(Math.trunc((timeadjust / 60) % 60));
              const hours = formatTwoIntegers(Math.trunc(timeadjust / 3600));

              if (Number(hours) > 0) {
                  if (itemResult.Penalties !== 0) {
                      timeadjust = hours + ":" + minutes + ":" + seconds + " <span class='rounded bg-[#da392b] text-xs px-1 py-0.5 ml-1'> + " + (itemResult.Penalties) + "s</span>";
                  } else {
                      timeadjust = hours + ":" + minutes + ":" + seconds;
                  }
              } else {
                  if (itemResult.Penalties !== 0) {
                      timeadjust = minutes + ":" + seconds + " <span class='rounded bg-[#da392b] text-xs px-1 py-0.5 ml-1'> + " + (itemResult.Penalties) + "s";
                  } else {
                      timeadjust = minutes + ":" + seconds;
                  }
              }
          } else {
              timeadjust = "No Time";
          }
      } else {
          timeadjust = "DQ";
      }

      if (itemResult.Pos <= -3) {
          timeadjust = "";
      }

      // Obtener numero de vueltas totales / vuelta rapida / neumatico
      let vueltastotales = 0;
      if (itemResult.Laps === undefined || itemResult.Laps === null || itemResult.Laps === 0) {
          for (let itemLap of dlaps) {
              if (itemLap.SteamID === itemResult.SteamID) {
                  vueltastotales = itemLap.Laps.length;
              }
          }
      } else {
          vueltastotales = itemResult.Laps;
      }

      let tyre;
      let cuts = 0;

      for (let itemLap of dlaps) {
          if (itemLap.SteamID === itemResult.SteamID) {
              for (let itemLap2 of itemLap.Laps) {
                  if (itemLap2.LapTime === itemResult.BestLap) {
                      tyre = "(" + itemLap2.Tyre + ")";
                  }
              }
          }
      }

      for (let itemLap of dlaps) {
          if (itemLap.SteamID === itemResult.SteamID) {
              cuts += itemLap.Laps.filter((lap) => lap.Cut > 0).length;
          }
      }

      if (tyre === undefined || tyre === null || tyre === "") {
          tyre = "(ND)";
      }

      let posicionFinal: string = "";

      if (pos === 1) {
          vueltasLider = vueltastotales;
          posicionFinal = '1';
      } else {
          switch (itemResult.Pos) {
              case -1: posicionFinal = 'DNF'; break;
              case -2: posicionFinal = 'DQ'; break;
              case -3: posicionFinal = 'DNS'; break;
              case -4:
                  switch (itemResult.Team) {
                      case "STREAMING":
                          posicionFinal = 'TV';
                          break;
                      case "ESP Racing Staff":
                          posicionFinal = 'STAFF';
                          break;
                      case "Safety Car":
                          posicionFinal = 'SC';
                          break;
                      default:
                          posicionFinal = 'DNS';
                          break;
                  }
                  break;
              default:
                  posicionFinal = pos.toString();
          }
          if (itemResult.Pos === -4 && itemResult.DriverName === "STREAMING") {
              posicionFinal = 'TV';
          }
      }

      let bestlap = itemResult.BestLap;
      let secondsbl = formatTwoIntegersPlusThreeDecimals(bestlap % 60);
      let minutesbl = formatTwoIntegers(Math.trunc((bestlap / 60) % 60));

      let bestlapToString = "";
      if (pos >= -1) {
          bestlapToString = minutesbl.toString() + ":" + secondsbl.toString();
      } else {
          tyre = "";
      }

      if (itemResult.BestLap >= 999999.999) {
          bestlapToString = "No Time";
          tyre = "";
      }

      // *** Intervalo de tiempo con el lider ***
      let gap: string = "";
      if (pos <= -2) {
          gap = "";
      } else if (postabla > 1 && vueltasLider === vueltastotales) {
          const splitLeaderTime = dresult.find(driver => driver.Split === itemResult.Split)?.TotalTime ?? 0;
          const splitLeaderPenalties = dresult.find(driver => driver.Split === itemResult.Split)?.Penalties ?? 0;

          const gapTime = ((itemResult.TotalTime + itemResult.Penalties) - (splitLeaderTime + splitLeaderPenalties));
          let secondsgap = formatTwoIntegersPlusThreeDecimals(gapTime % 60);
          let minutesgap = formatTwoIntegers(Math.trunc((gapTime / 60) % 60));

          if (minutesgap === "00") {
              gap = "+ " + secondsgap;
          } else {
              gap = "+ " + minutesgap + ":" + secondsgap;
          }
          if (gapTime === 0) {
              gap = "";
          }
      } else if (postabla > 1 && vueltasLider !== vueltastotales) {
          gap = "+ " + (vueltasLider - vueltastotales) + "L";
      } else if (postabla === 1) {
          gap = "";
      }

      // *** Intervalo con el anterior piloto ***
      let interval: string = "";
      let vueltasPrevio: number = 0;
      if (postabla > 1) {
          for (let itemLap of dlaps) {
              if (itemLap.SteamID === dresult[postabla - 2].SteamID) {
                  vueltasPrevio = itemLap.Laps.length;
              }
          }
          if (pos <= -2) {
              interval = "";
          } else if (postabla > 1 && vueltasPrevio === vueltastotales) {
              const intervalTime = (itemResult.TotalTime + itemResult.Penalties) - (dresult[postabla - 2].TotalTime + dresult[postabla - 2].Penalties);
              let secondsInterval = formatTwoIntegersPlusThreeDecimals(intervalTime % 60);
              let minutesInterval = formatTwoIntegers(Math.trunc((intervalTime / 60) % 60));

              if (minutesInterval === "00") {
                  interval = "+ " + secondsInterval;
              } else {
                  interval = "+ " + minutesInterval + ":" + secondsInterval;
              }
          } else if (postabla > 1 && vueltasPrevio !== vueltastotales) {
              interval = "+ " + (vueltasPrevio - vueltastotales) + "L";
          }
      } else {
          interval = "";
      }

      // *** Añadir puntuaciones a la tabla ***
      let puntos: number = 0;
      let puntosString: string = "";
      if (pointsystemName !== "NoPoints") {
          if (pos > 0) {
              let posAux = pos;
              if(itemResult.Split === 2){
                  posAux += driversQualifiedSplit1;
              }
              puntos = pointArray?.Puntuation[posAux - 1] || 0;
              if (bestlapDriverID === itemResult.SteamID) {
                  puntos += pointArray?.FastestLap || 0;
              }
              puntosString = '+ ' + puntos.toString();
          } else if (pos === -1) {
              puntosString = "+ 0";
          }
      } else {
          puntosString = "";
      }

      let flapClass = "";
      if (bestlapDriverID === itemResult.SteamID) {
          if (pos >= -1) {
              flapClass = ' bg-[#c100ff] text-white font-bold rounded-full w-content px-5';
          } else {
              flapClass = '';
          }
      }

      let vueltasTotalesString: string = "";
      if (pos > -2) {
          vueltasTotalesString = vueltastotales.toString();
      } else {
          vueltasTotalesString = "";
      }
      item = {
          gridPositionClass: gridPositionClass,
          gainsAbs: gainsAbs,
          posicionFinal: posicionFinal,
          driverName: itemResult.DriverName,
          carColorClass: carColorClass,
          carClass: carClass,
          carBrand: carBrand,
          carName: carName,
          team: equipo,
          totalLaps: vueltasTotalesString,
          timeadjust: timeadjust,
          gap: gap,
          interval: interval,
          flapClass: flapClass,
          bestlapToString: bestlapToString,
          tyre: tyre,
          points: puntosString,
          splitNumber: itemResult.Split
      }
      resultTableData.push(item);
  }
  return resultTableData;
}