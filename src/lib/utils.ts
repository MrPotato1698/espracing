import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import type { RaceData, RaceResult, RaceLap, BestLap } from "@/types/Results";
import type { Points } from "@/types/Points";
import type { ResultTableData, CarData, RaceFastestLap} from "@/types/Utils"

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getResultTableData(datos: RaceData, pointsystemName: string, pointArray: Points, cars: CarData[]): ResultTableData[] {
  let resultTableData: ResultTableData[] = [];
  const dresult: RaceResult[] = datos.RaceResult;
  const dlaps: RaceLap[] = datos.RaceLaps;
  const dbestlaps: BestLap[] = datos.BestLap;

  let driversQualifiedSplit1 = 0;
  if (datos.RaceConfig.NumberofSplits > 1) {
    driversQualifiedSplit1 = dresult.filter(driver => driver.Split === 1 && driver.Pos > 0).length;
  }

  let pos: number = 0;
  let postabla: number = 0;
  let vueltasLider: number = 0;

  const driversPerSplitQualified = dresult.reduce((acc: number[], driver) => {
    if (driver.Pos > 0) {
      const splitIndex = driver.Split - 1;
      if (!acc[splitIndex]) acc[splitIndex] = 0;
      acc[splitIndex]++;
    }
    return acc;
  }, []);

  const bestlapDriverID = dbestlaps[0].SteamID;

  for (let itemResult of dresult) {
    postabla++;
    pos = itemResult.Pos;

    // Usar la posición real del piloto en lugar de la posición en la tabla
    const positionsOtherSplits = driversPerSplitQualified.slice(0, itemResult.Split - 1).reduce((sum, current) => sum + current, 0);
    let gains = 0;

    // Solo calcular gains si el piloto tiene una posición válida
    if (pos > 0) {
      gains = itemResult.GridPosition - (pos + positionsOtherSplits);
    } else if (pos === -1 || pos === -2) {
      // DNF y DQ pueden tener gains basados en su GridPosition vs donde terminaron
      gains = itemResult.GridPosition - postabla;
    }
    // DNS, DQ, etc. mantienen gains = 0 (valor inicial)

    const { gridPositionClass, gainsAbs } = getGridPositionClass(gains, pos);

    const equipo = itemResult.Team;

    const carInfo = getCarInfo(itemResult.CarFileName, cars);

    const timeadjust = getTimeAdjust(itemResult);

    const vueltastotales = getTotalLaps(itemResult, dlaps);

    const tyreAndCuts = getTyreAndCuts(itemResult, dlaps);
    let tyre = tyreAndCuts.tyre;

    let { posicionFinal, vueltasLider: newVueltaLider } = getPosicionFinal(itemResult, pos, vueltastotales, vueltasLider);
    if (pos === 1) vueltasLider = newVueltaLider;

    let { bestlapToString, tyre: tyreOverride } = getBestLapString(itemResult, pos);
    if (typeof tyreOverride !== "undefined") tyre = tyreOverride;

    const gap = getGap(pos, postabla, vueltasLider, vueltastotales, dresult, itemResult);

    const interval = getInterval(pos, postabla, dresult, dlaps, itemResult, vueltastotales);

    const puntosString = getPointsString(pointsystemName, pos, itemResult, driversQualifiedSplit1, pointArray, bestlapDriverID);

    const flapClass = getFlapClass(bestlapDriverID, itemResult, pos);

    let vueltasTotalesString: string = "";
    if (pos > -2) {
      vueltasTotalesString = vueltastotales.toString();
    }

    resultTableData.push({
      gridPositionClass: gridPositionClass,
      gainsAbs: gainsAbs,
      posicionFinal: posicionFinal,
      driverName: itemResult.DriverName,
      carColorClass: carInfo.carColorClass,
      carClass: carInfo.carClass,
      carBrand: carInfo.carBrand,
      carName: carInfo.carName,
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
    });
  }
  return resultTableData;
}

export function getResultFastestLap(datos: RaceData, pointArray: Points, cars: CarData[], layoutLength: number | null): RaceFastestLap {
  const { BestLap, RaceResult, RaceLaps } = datos;
  const bestLap = BestLap[0];
  const car = cars.find(car => car.filename === bestLap.CarFileName);
  const driver = RaceResult.find(driver => driver.SteamID === bestLap.SteamID);
  const lapInfo = RaceLaps.find(d => d.SteamID === bestLap.SteamID)?.Laps.find(lap => lap.LapTime === bestLap.BestLap);

  const minutes = formatTwoIntegers(Math.trunc((bestLap.BestLap / 60) % 60));
  const seconds = formatTwoIntegersPlusThreeDecimals(bestLap.BestLap % 60);
  let avgSpeed = "";
  if (layoutLength !== null && layoutLength > 0) {
    avgSpeed = ((layoutLength / (bestLap.BestLap / 3600)) / 1000).toFixed(3);
  }

  return {
    driverName: bestLap.DriverName,
    carColorClass: car?.classColor
      ? `style="background-color: ${car.classColor.split(' ')[0].replace('bg-[', '').replace(']', '')}; color: ${car.classColor.split(' ')[1].replace('text-[', '').replace(']', '')}" class = "rounded text-xs font-bold px-1 py-0.5 ml-1"`
      : "",
    carClass: car?.classShortName ?? "",
    carBrand: car?.imgbrand ?? "",
    carName: car?.model ? car?.model : "",
    team: driver?.Team ?? "",
    time: `${minutes}:${seconds}`,
    tyre: bestLap.Tyre,
    lap: lapInfo?.LapNumber.toString() ?? "",
    avgspeed: avgSpeed + " km/h",
    points: (driver?.Pos ?? 0) > 0 ? `+${pointArray.FastestLap}` : "0"
  };
}

export function showToast(message: string, type: ToastType = 'info') {
  const id = `toast-${Date.now()}`;
  const toastHTML = document.createElement('div');
  const duration = 3000; // 3 segundos

  const styles = {
    success: { border: 'border-green-500', progress: 'bg-green-500' },
    error: { border: 'border-red-500', progress: 'bg-red-500' },
    warning: { border: 'border-yellow-500', progress: 'bg-yellow-500' },
    info: { border: 'border-blue-500', progress: 'bg-blue-500' }
  }[type];

  toastHTML.innerHTML = `
    <div id="${id}"
      class="fixed bottom-4 right-4 p-4 rounded-lg border bg-darkPrimary ${styles.border} text-ligth-primary
      shadow-lg flex flex-col gap-2 opacity-0 transition-all duration-300 ease-in-out transform translate-y-2">
      <div class="flex items-center gap-3">
        <img src="/ESPRACINGLogoBlanco.webp" class="h-auto w-10" />
        <p class="font-medium">${message}</p>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-auto">
          <svg class = "w-4 h-4"viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div class="h-full ${styles.progress} rounded-full transition-all duration-[3000ms] ease-linear w-0"></div>
      </div>
    </div>
  `;

  if (toastHTML.firstElementChild) {
    document.body.appendChild(toastHTML.firstElementChild);
  }

  requestAnimationFrame(() => {
    const toast = document.getElementById(id);
    if (toast) {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
      // Animar la barra de progreso
      const progressBar = toast.querySelector('div > div:last-child > div');
      if (progressBar instanceof HTMLElement) {
        progressBar.style.width = '100%';
      }

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(2rem)';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }
  });
}

export function checkAndShowSavedToast() {
  const savedToast = localStorage.getItem('toastMessage');
  if (savedToast) {
    const { message, type } = JSON.parse(savedToast);
    showToast(message, type as 'success' | 'error' | 'warning' | 'info');
    localStorage.removeItem('toastMessage');
  }
}

export function formatTwoIntegersPlusThreeDecimals(num: number) {
  const integerPart = Math.floor(Math.abs(num)).toString().padStart(2, '0');
  const decimalPart = Math.abs(num % 1).toFixed(3).slice(2);
  const sign = num < 0 ? '-' : '';
  return `${sign}${integerPart}.${decimalPart}`;
}

export function formatTwoIntegers(num: number): string {
  return Math.abs(num).toString().padStart(2, '0').slice(-2);
}

// Funciones de apoyo for getResultTableData
function getCarInfo(carFileName: string, cars: CarData[]) {
  const car = cars.find((c) => c.filename === carFileName);
  if (car) {
    return {
      carName: `${car.model}`,
      carBrand: car.imgbrand,
      carClass: car.classShortName,
      carColorClass: `style="background-color: ${car.classColor.split(' ')[0].replace('bg-[', '').replace(']', '')}; color: ${car.classColor.split(' ')[1].replace('text-[', '').replace(']', '')}" class = "rounded text-xs font-bold px-1 py-0.5 ml-1"`
    };
  }
  return {
    carName: carFileName,
    carBrand: "",
    carClass: "",
    carColorClass: ""
  };
}

function getTimeAdjust(itemResult: RaceResult) {
  if (itemResult.Pos === -2) return "DQ";
  if (itemResult.Pos <= -3) return "";
  if (itemResult.TotalTime < 0) return "No Time";
  let timeadjust = itemResult.TotalTime + itemResult.Penalties;
  const seconds = formatTwoIntegersPlusThreeDecimals(timeadjust % 60);
  const minutes = formatTwoIntegers(Math.trunc((timeadjust / 60) % 60));
  const hours = formatTwoIntegers(Math.trunc(timeadjust / 3600));
  if (Number(hours) > 0) {
    return itemResult.Penalties !== 0
      ? `${hours}:${minutes}:${seconds} <span class='rounded bg-[#da392b] text-xs px-1 py-0.5 ml-1'> + ${itemResult.Penalties}s</span>`
      : `${hours}:${minutes}:${seconds}`;
  } else {
    return itemResult.Penalties !== 0
      ? `${minutes}:${seconds} <span class='rounded bg-primary text-xs px-1 py-0.5 ml-1'> + ${itemResult.Penalties}s`
      : `${minutes}:${seconds}`;
  }
}

function getTotalLaps(itemResult: RaceResult, dlaps: RaceLap[]) {
  if (itemResult.Laps) return itemResult.Laps;
  const lap = dlaps.find(l => l.SteamID === itemResult.SteamID);
  return lap ? lap.Laps.length : 0;
}

function getTyreAndCuts(itemResult: RaceResult, dlaps: RaceLap[]) {
  let tyre = "";
  let cuts = 0;
  for (const itemLap of dlaps) {
    if (itemLap.SteamID === itemResult.SteamID) {
      for (const itemLap2 of itemLap.Laps) {
        if (itemLap2.LapTime === itemResult.BestLap) {
          tyre = `(${itemLap2.Tyre})`;
        }
      }
      cuts += itemLap.Laps.filter((lap) => lap.Cut > 0).length;
    }
  }
  if (!tyre) tyre = "(ND)";
  return { tyre, cuts };
}

function getPosicionFinal(itemResult: RaceResult, pos: number, vueltastotales: number, vueltasLider: number) {
  if (pos === 1) {
    return { posicionFinal: '1', vueltasLider: vueltastotales };
  }
  let posicionFinal = "";
  switch (pos) {
    case -1: posicionFinal = 'DNF'; break;
    case -2: posicionFinal = 'DQ'; break;
    case -3: posicionFinal = 'DNS'; break;
    case -4:
      switch (itemResult.Team) {
        case "STREAMING": posicionFinal = 'TV'; break;
        case "ESP Racing Staff": posicionFinal = 'STAFF'; break;
        case "Safety Car": posicionFinal = 'SC'; break;
        default: posicionFinal = 'DNS'; break;
      }
      break;
    default:
      if (pos > 0) {
        posicionFinal = pos.toString();
      } else {
        posicionFinal = 'DNS'; // Fallback para posiciones inválidas
      }
  }
  if (itemResult.Pos === -4 && itemResult.DriverName === "STREAMING") {
    posicionFinal = 'TV';
  }

  return { posicionFinal, vueltasLider };
}

function getBestLapString(itemResult: RaceResult, pos: number) {
  if (itemResult.BestLap >= 999999.999) return { bestlapToString: "No Time", tyre: "" };
  const secondsbl = formatTwoIntegersPlusThreeDecimals(itemResult.BestLap % 60);
  const minutesbl = formatTwoIntegers(Math.trunc((itemResult.BestLap / 60) % 60));
  if (pos >= -1) {
    return { bestlapToString: `${minutesbl}:${secondsbl}`, tyre: undefined };
  }
  return { bestlapToString: "", tyre: "" };
}

function getGridPositionClass(gains: number, pos: number) {
  if (pos <= -3) return { gridPositionClass: "", gainsAbs: "" };
  if (gains > 0 && pos > -2) {
    return {
      gridPositionClass: '<svg viewBox="0 0 24 24" fill="#00f000" class="w-6 float mx-auto"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.375 6.22l-5 4a1 1 0 0 0 -.375 .78v6l.006 .112a1 1 0 0 0 1.619 .669l4.375 -3.501l4.375 3.5a1 1 0 0 0 1.625 -.78v-6a1 1 0 0 0 -.375 -.78l-5 -4a1 1 0 0 0 -1.25 0z" /></svg>',
      gainsAbs: Math.abs(gains).toString()
    };
  } else if (gains < 0 && pos > -2) {
    return {
      gridPositionClass: '<svg viewBox="0 0 24 24" fill="#ff0000" class="w-6 float mx-auto rotate-180"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.375 6.22l-5 4a1 1 0 0 0 -.375 .78v6l.006 .112a1 1 0 0 0 1.619 .669l4.375 -3.501l4.375 3.5a1 1 0 0 0 1.625 -.78v-6a1 1 0 0 0 -.375 -.78l-5 -4a1 1 0 0 0 -1.25 0z" /></svg>',
      gainsAbs: Math.abs(gains).toString()
    };
  } else if (gains === 0 || pos <= -2) {
    return {
      gridPositionClass: '<svg viewBox="0 0 24 24" fill="#ffc800" class="w-6 float mx-auto rotate-90"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.375 6.22l-5 4a1 1 0 0 0 -.375 .78v6l.006 .112a1 1 0 0 0 1.619 .669l4.375 -3.501l4.375 3.5a1 1 0 0 0 1.625 -.78v-6a1 1 0 0 0 -.375 -.78l-5 -4a1 1 0 0 0 -1.25 0z" /></svg>',
      gainsAbs: "0"
    };
  }
  return { gridPositionClass: "", gainsAbs: "" };
}

function getGap(pos: number, postabla: number, vueltasLider: number, vueltastotales: number, dresult: RaceResult[], itemResult: RaceResult) {
  if (pos <= -2) return "";
  if (postabla <= 1) return "";
  if (vueltasLider === vueltastotales) {
    const splitLeader = dresult.find(driver => driver.Split === itemResult.Split);
    const splitLeaderTime = splitLeader?.TotalTime ?? 0;
    const splitLeaderPenalties = splitLeader?.Penalties ?? 0;
    const gapTime = (itemResult.TotalTime + itemResult.Penalties) - (splitLeaderTime + splitLeaderPenalties);
    const secondsgap = formatTwoIntegersPlusThreeDecimals(gapTime % 60);
    const minutesgap = formatTwoIntegers(Math.trunc((gapTime / 60) % 60));
    return minutesgap === "00" ? `+ ${secondsgap}` : `+ ${minutesgap}:${secondsgap}`;
  } else {
    return `+ ${vueltasLider - vueltastotales}L`;
  }
}

function getInterval(pos: number, postabla: number, dresult: RaceResult[], dlaps: RaceLap[], itemResult: RaceResult, vueltastotales: number) {
  if (postabla <= 1) return "";
  const prevDriver = dresult[postabla - 2];
  const prevLapData = dlaps.find(lap => lap.SteamID === prevDriver.SteamID);
  const vueltasPrevio = prevLapData ? prevLapData.Laps.length : 0;
  if (pos > -2) {
    if (vueltasPrevio === vueltastotales) {
      const intervalTime = (itemResult.TotalTime + itemResult.Penalties) - (prevDriver.TotalTime + prevDriver.Penalties);
      const secondsInterval = formatTwoIntegersPlusThreeDecimals(intervalTime % 60);
      const minutesInterval = formatTwoIntegers(Math.trunc((intervalTime / 60) % 60));
      return minutesInterval === "00"
        ? `+ ${secondsInterval}`
        : `+ ${minutesInterval}:${secondsInterval}`;
    } else {
      return `+ ${vueltasPrevio - vueltastotales}L`;
    }
  }
  return "";
}

function getPointsString(pointsystemName: string, pos: number, itemResult: RaceResult, driversQualifiedSplit1: number, pointArray: Points, bestlapDriverID: string) {
  if (pointsystemName === "NoPoints") return "";
  if (pos > 0) {
    let posAux = pos;
    if (itemResult.Split === 2) {
      posAux += driversQualifiedSplit1;
    }
    let puntos = pointArray?.Puntuation[posAux - 1] || 0;
    if (bestlapDriverID === itemResult.SteamID) {
      puntos += pointArray?.FastestLap || 0;
    }
    return '+ ' + puntos.toString();
  } else if (pos === -1) {
    return "+ 0";
  }
  return "";
}

function getFlapClass(bestlapDriverID: string, itemResult: RaceResult, pos: number) {
  if (bestlapDriverID === itemResult.SteamID && pos >= -1) {
    return ' bg-[#c100ff] text-white font-bold rounded-full w-content px-2';
  }
  return '';
}