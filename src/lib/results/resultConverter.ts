import type { RaceData, RaceResult, RaceLap, Lap, BestLap, Consistency, BestSector, Incident, RaceConfig, RaceDriversResume, RaceCarResume } from "@/types/Results";
import type { GeneralDataJSON, CarJSON, EventJSON, LapJSON, ResultJSON } from "@/types/ResultsJSON";

interface DriverLapData {
  SteamID: string;
  timestamp: number;
}

/**
 * Función principal para crear los resultados de la carrera
 * @param {CarJSON[]} dcars - Array de objetos CarJSON
 * @param {EventJSON[]} devents - Array de objetos EventJSON
 * @param {LapJSON[]} dlaps - Array de objetos LapJSON
 * @param {ResultJSON[]} dresult - Array de objetos ResultJSON
 * @param {number} raceTime - Tiempo de carrera
 * @param {number} split - Número de división
 * @returns {RaceResult[]} - Array de objetos RaceResult
 */
function createRaceResults( dcars: CarJSON[], devents: EventJSON[], dlaps: LapJSON[], dresult: ResultJSON[], raceTime: number, split: number): RaceResult[] {
  let rr: RaceResult[] = [];
  let pos: number = 0;
    //-1 = no clasificado
    //-2 = descalificado
    //-3 = no presentado
    //-4 = SC o Staff ESP
    //0 = no clasificado
    //1 = primero
    //2 = segundo, etc.

  for (let itemR of dresult) {
    pos++;
    let uniqueRR: RaceResult = {} as RaceResult;

    uniqueRR.SteamID = itemR.DriverGuid;
    uniqueRR.CarId = itemR.CarId;
    uniqueRR.DriverName = itemR.DriverName;
    uniqueRR.Team = dcars[itemR.CarId].Driver.Team;
    uniqueRR.CarFileName = itemR.CarModel;
    uniqueRR.TotalTime = itemR.TotalTime / 1000;
    uniqueRR.Penalties = itemR.PenaltyTime / 1000000000;
    uniqueRR.Laps = itemR.NumLaps;
    uniqueRR.BestLap = itemR.BestLap / 1000;
    uniqueRR.LedLaps = 0;
    uniqueRR.Ballast = itemR.BallastKG;
    uniqueRR.Restrictor = itemR.Restrictor;
    uniqueRR.Split = split;

    uniqueRR.GridPosition = getGridPosition(itemR.GridPosition);
    uniqueRR.Pos = getFinalPosition(pos, itemR, uniqueRR, raceTime);

    uniqueRR.AvgLap = calculateAvgLap(dlaps, uniqueRR.CarId);
    uniqueRR.Collisions = countCollisions(devents, uniqueRR.CarId);

    rr.push(uniqueRR);
  }

  for (let itemdC of dcars) {
    const carID = itemdC.CarId;
    const driverFound = rr.some(result => result.CarId === carID);
    if (!driverFound && itemdC.Driver.Name !== "") {
      let uniqueRR: RaceResult = {} as RaceResult;
      uniqueRR.SteamID = itemdC.Driver.Guid;
      uniqueRR.CarId = itemdC.CarId;
      uniqueRR.DriverName = itemdC.Driver.Name;
      uniqueRR.Team = itemdC.Driver.Team;
      uniqueRR.CarFileName = itemdC.Model;
      uniqueRR.TotalTime = 0;
      uniqueRR.Penalties = 0;
      uniqueRR.Laps = 0;
      uniqueRR.BestLap = 0;
      uniqueRR.LedLaps = 0;
      uniqueRR.Ballast = itemdC.BallastKG;
      uniqueRR.Restrictor = itemdC.Restrictor;

      if (
        itemdC.Driver.Team === "ESP Racing Staff" ||
        itemdC.Driver.Team === "Safety Car" ||
        itemdC.Driver.Team === "STREAMING" ||
        itemdC.Driver.Name === "STREAMING"
      ) {
        uniqueRR.Pos = -4;
        uniqueRR.GridPosition = -4;
      } else {
        uniqueRR.GridPosition = -3;
        uniqueRR.Pos = -3;
      }
      uniqueRR.AvgLap = 0;
      uniqueRR.Collisions = 0;
      uniqueRR.Ballast = itemdC.BallastKG;
      uniqueRR.Restrictor = itemdC.Restrictor;
      rr.push(uniqueRR);
    }
  }

  return rr;
}

// Funciones Auxiliares para createRaceResults
/**
 * Función auxiliar de createRaceResults para obtener la posición de salida del piloto
 * @param gridPosition - Posición de salida del piloto
 * @returns {number} - Posición de salida ajustada
 */
function getGridPosition(gridPosition: number): number {
  return gridPosition !== 0 ? gridPosition : -1;
}

/**
 * Función auxiliar de createRaceResults para obtener la posición final del piloto
 * @param pos - Posición del piloto
 * @param itemR - Objeto ResultJSON del piloto
 * @param uniqueRR - Objeto RaceResult del piloto
 * @param raceTime - Tiempo de carrera
 * @returns {number} - Posición final ajustada
 */
function getFinalPosition(pos: number, itemR: ResultJSON, uniqueRR: RaceResult, raceTime: number): number {
  if (pos === 1) {
    return pos;
  } else if (itemR.Disqualified === true) {
    return -2;
  } else {
    const timerace = uniqueRR.TotalTime + uniqueRR.Penalties;
    const timeCondition =
      Math.trunc((timerace / 3600) % 60) + Math.trunc(timerace / 60);
    if (timeCondition >= raceTime) {
      return pos;
    } else {
      return -1;
    }
  }
}

/**
 * Función auxiliar de createRaceResults para calcular el tiempo medio por vuelta
 * @param dlaps - Array de objetos LapJSON
 * @param carId - ID del coche
 * @returns {number} - Tiempo medio por vuelta en segundos
 */
function calculateAvgLap(dlaps: LapJSON[], carId: number): number {
  let avg = 0;
  let lapsWithoutCuts = 0;
  for (let itemL of dlaps) {
    if (itemL.CarId === carId && itemL.Cuts < 1) {
      avg += itemL.LapTime;
      lapsWithoutCuts++;
    }
  }
  return lapsWithoutCuts > 0 ? (avg / lapsWithoutCuts) / 1000 : 0;
}

/**
 * Función auxiliar de createRaceResults para contar el número de colisiones del coche
 * @param devents - Array de eventos
 * @param carId - ID del coche
 * @returns {number} - Número de colisiones del coche
 */
function countCollisions(devents: EventJSON[], carId: number): number {
  return devents.filter(event => event.CarId === carId).length;
}

/**
 * Función para crear los resultados de la carrera con múltiples divisiones
 * @param rrS1 - Array de resultados de la primera división
 * @param rrS2 - Array de resultados de la segunda división
 * @returns {RaceResult[]} - Array de resultados de la carrera combinados
 */
function sortingPositionsMultipleSplits(rrS1: RaceResult[], rrS2: RaceResult[]): RaceResult[] {
  const rr: RaceResult[] = [];

  // Función Auxiliar para mezclar y ordenar por TotalTime + Penalties si es necesario
  function mergeAndSort( arr1: RaceResult[], arr2: RaceResult[], sort: boolean = false): RaceResult[] {
    if (arr1.length > 0 && arr2.length > 0) {
      const merged = arr1.concat(arr2);
      return sort
        ? merged.sort((a, b) => (a.TotalTime + a.Penalties) - (b.TotalTime + b.Penalties))
        : merged;
    } else if (arr1.length > 0) {
      return arr1;
    } else if (arr2.length > 0) {
      return arr2;
    }
    return [];
  }

  /**
   * Función Auxiliar para mezclar el Staff (evitar duplicados por SteamID o Equipo)
   * @param arr1 - Array de resultados de la primera división
   * @param arr2 - Array de resultados de la segunda división
   * @returns {RaceResult[]} - Array de resultados de la carrera combinados
   */
  function mergeStaff(arr1: RaceResult[], arr2: RaceResult[]): RaceResult[] {
    if (arr1.length > 0 && arr2.length > 0) {
      const filteredArr2 = arr2.filter(
        item => !arr1.some(item2 => item2.SteamID === item.SteamID || item2.Team === item.Team)
      );
      return arr1.concat(filteredArr2);
    } else if (arr1.length > 0) {
      return arr1;
    } else if (arr2.length > 0) {
      return arr2;
    }
    return [];
  }

  // Posiciones Normales, pilotos con carrera completa
  rr.push(...mergeAndSort(
    rrS1.filter(item => item.Pos > 0),
    rrS2.filter(item => item.Pos > 0)
  ));

  // Pilotos que no han completado la carrera
  rr.push(...mergeAndSort(
    rrS1.filter(item => item.Pos === -1),
    rrS2.filter(item => item.Pos === -1),
    true
  ));

  // Pilotos no presentados
  rr.push(...mergeAndSort(
    rrS1.filter(item => item.Pos === -3),
    rrS2.filter(item => item.Pos === -3)
  ));

  // Pilotos descalificados
  rr.push(...mergeAndSort(
    rrS1.filter(item => item.Pos === -2),
    rrS2.filter(item => item.Pos === -2),
    true
  ));

  // Personal de Staff
  rr.push(...mergeStaff(
    rrS1.filter(item => item.Pos === -4),
    rrS2.filter(item => item.Pos === -4)
  ));

  return rr;
}

/**
 * Función para crear los resultados de vueltas de carrera
 * @param dlaps - Array de objetos LapJSON
 * @param rr - Array de objetos RaceResult
 * @returns {RaceLap[]} - Array de objetos RaceLap
 */
function createRaceLap(dlaps: LapJSON[], rr: RaceResult[]): RaceLap[] {
  let rl: RaceLap[] = [];
  let i = 0;
  for (let driver of rr) {
    i++;
    let uniqueRL: RaceLap = {} as RaceLap;

    if (driver.Pos === -3 || driver.Pos === -4) {
      uniqueRL.DriverName = driver.DriverName;
      uniqueRL.SteamID = driver.SteamID;
      uniqueRL.Split = driver.Split;
      uniqueRL.Laps = [];
      uniqueRL.Average = [];
      uniqueRL.Best = [];
    } else {
      uniqueRL.DriverName = driver.DriverName;
      uniqueRL.SteamID = driver.SteamID;
      uniqueRL.Split = driver.Split;
      uniqueRL.Laps = createLap(dlaps, driver);
      uniqueRL.Average = getAvgLapTimes(uniqueRL.Laps);
      uniqueRL.Best = getBestLapTime(uniqueRL.Laps);
      uniqueRL.Optimal = getBestTheoricalTime(uniqueRL.Laps);
    }
    rl.push(uniqueRL);
  }

  // Obtener el valor de la posición de cada piloto en cada vuelta
  const rlAdjust = getPositionInEveryLap(rl);

  return rlAdjust;
}

/**
 * Función para crear los resultados de vueltas de carrera con múltiples splits
 * @param dlapsS1 - Array de objetos LapJSON para el primer split
 * @param dlapsS2 - Array de objetos LapJSON para el segundo split
 * @param rr - Array de objetos RaceResult
 * @returns {RaceLap[]} - Array de objetos RaceLap
 */
function createRaceLapMultipleSplits(dlapsS1: LapJSON[], dlapsS2: LapJSON[], rr: RaceResult[]): RaceLap[] {
  let rl: RaceLap[] = [];
  let i = 0;

  for (let driver of rr) {
    i++;
    let uniqueRL: RaceLap = {} as RaceLap;

    if (driver.Pos === -3 || driver.Pos === -4) {
      uniqueRL.DriverName = driver.DriverName;
      uniqueRL.SteamID = driver.SteamID;
      uniqueRL.Split = driver.Split;
      uniqueRL.Laps = [];
      uniqueRL.Average = [];
      uniqueRL.Best = [];
    } else {
      uniqueRL.DriverName = driver.DriverName;
      uniqueRL.SteamID = driver.SteamID;
      uniqueRL.Split = driver.Split;
      if (driver.Split === 1) {
        uniqueRL.Laps = createLap(dlapsS1, driver);
      } else {
        uniqueRL.Laps = createLap(dlapsS2, driver);
      }
      uniqueRL.Average = getAvgLapTimes(uniqueRL.Laps);
      uniqueRL.Best = getBestLapTime(uniqueRL.Laps);
      uniqueRL.Optimal = getBestTheoricalTime(uniqueRL.Laps);
    }

    rl.push(uniqueRL);
  }
  // Obtener el valor de la posición de cada piloto en cada vuelta
  const rlAdjust = getPositionInEveryLap(rl);

  return rlAdjust;
}

/**
 * Función para crear los resultados de una vuelta de carrera
 * @param dlaps - Array de objetos LapJSON
 * @param rr - Objeto RaceResult
 * @returns {Lap[]} - Array de objetos Lap
 */
function createLap(dlaps: LapJSON[], rr: RaceResult): Lap[] {
  return dlaps
    .filter(lapItem => rr.SteamID === lapItem.DriverGuid)
    .map((lapItem, index) => ({
      LapNumber: index + 1,
      Position: -1,
      CarFileName: lapItem.CarModel,
      LapTime: lapItem.LapTime / 1000,
      Sector: lapItem.Sectors,
      Tyre: lapItem.Tyre,
      Cut: lapItem.Cuts,
      Timestamp: lapItem.Timestamp
    } as Lap));
}

/**
 * Función para obtener el tiempo medio de las vueltas
 * @param rl - Array de objetos Lap
 * @returns {number[]} - Array de tiempos medios
 */
function getAvgLapTimes(rl: Lap[]): number[] {
  let avgTimes: number[] = [];

  let totalLapTime: number = 0;
  let totalSectors: number[] = rl[0].Sector.map(() => 0);

  for (let lap of rl) {
    totalLapTime += lap.LapTime;
    lap.Sector.forEach((sectorTime, index) => {
      totalSectors[index] += sectorTime;
    });
  }

  const avgLapTime = totalLapTime / rl.length;
  const avgSectorTimes = totalSectors.map(total => total / rl.length);

  avgTimes.push(avgLapTime, ...avgSectorTimes);
  return avgTimes;
}

/**
 * Función para obtener el mejor tiempo de vuelta
 * @param rl - Array de objetos Lap
 * @returns {number[]} - Array de mejores tiempos
 */
function getBestLapTime(rl: Lap[]): number[] {
  let BestTimes: number[] = [];

  let bestLapTime = Number.MAX_VALUE;
  let bestSectorTimes: number[] = rl[0].Sector.map(() => Number.MAX_VALUE);

  for (let lap of rl) {
    if ((lap.LapTime < bestLapTime) && (lap.Cut <= 0)) {
      bestLapTime = lap.LapTime;
      bestSectorTimes = lap.Sector;
    }
  }
  BestTimes.push(bestLapTime, ...bestSectorTimes);

  return BestTimes;
}

/**
 * Función para obtener el mejor tiempo teórico
 * @param rl - Array de objetos Lap
 * @returns {number[]} - Array de mejores tiempos teóricos
 */
function getBestTheoricalTime(rl: Lap[]): number[] {
  const bestSectorTimes = rl[0].Sector.map(() => Number.MAX_VALUE);

  let bestLapTime = Number.MAX_VALUE;
  for (const lap of rl) {
    bestLapTime = Math.min(bestLapTime, lap.LapTime);

    if (lap.Cut <= 0) {
      lap.Sector.forEach((sectorTime, index) => {
        bestSectorTimes[index] = Math.min(bestSectorTimes[index], sectorTime);
      });
    }
  }

  const bestTheoricalTime = [bestLapTime, ...bestSectorTimes];

  // Calculate sum of best sectors divided by 1000
  bestTheoricalTime[0] = bestSectorTimes.reduce((sum, time) => sum + time, 0) / 1000;

  return bestTheoricalTime;
}

/**
 * Función para obtener la posición de cada piloto en cada vuelta
 * @param rlAux - Array de objetos RaceLap
 * @returns {RaceLap[]} - Array de objetos RaceLap con posiciones actualizadas
 */
function getPositionInEveryLap(rlAux: RaceLap[]): RaceLap[] {
  let rl: RaceLap[] = rlAux;
  let rl1: RaceLap[] = rl.filter((item) => item.Split === 1);
  let rl2: RaceLap[] = rl.filter((item) => item.Split === 2);

  //- Asignar posiciones a los pilotos en cada vuelta
  function assignPositions(raceLaps: RaceLap[]) {
    if (raceLaps.length === 0 || raceLaps[0].Laps.length === 0) return;
    const numLaps = raceLaps[0].Laps.length;
    for (let i = 0; i < numLaps; i++) {
      const drivers: DriverLapData[] = raceLaps
        .filter(racelap => racelap.Laps[i] !== undefined)
        .map(racelap => ({ SteamID: racelap.SteamID, timestamp: racelap.Laps[i].Timestamp }));

      drivers.sort((a, b) => a.timestamp - b.timestamp);

      drivers.forEach((driver, j) => {
        const found = raceLaps.find(racelap => racelap.SteamID === driver.SteamID);
        if (found?.Laps[i]) {
          found.Laps[i].Position = j + 1;
        }
      });
    }
  }

  //- Actualizar la lista principal con los datos de las vueltas
  function updateMainList(raceLaps: RaceLap[], mainList: RaceLap[]) {
    for (let item of raceLaps) {
      const foundIndex = mainList.findIndex((item2) => item2.SteamID === item.SteamID);
      if (foundIndex !== -1) {
        mainList[foundIndex].Laps = item.Laps;
      }
    }
  }

  assignPositions(rl1);
  updateMainList(rl1, rl);

  if (rl2.length > 0) {
    assignPositions(rl2);
    updateMainList(rl2, rl);
  }

  return rl;
}

/**
 * Función para crear los mejores tiempos de vueltas
 * @param rl - Array de objetos RaceLap
 * @returns {BestLap[]} - Array de objetos BestLap
 */
function createBestLap(rl: RaceLap[]): BestLap[] {
  let bl: BestLap[] = [];

  for (let itemRL of rl) {
    for (let itemL of itemRL.Laps) {
      let uniqueBL: BestLap = {} as BestLap;
      uniqueBL.BestLap = itemL.LapTime;
      uniqueBL.DriverName = itemRL.DriverName;
      uniqueBL.CarFileName = itemL.CarFileName;
      uniqueBL.SteamID = itemRL.SteamID;
      uniqueBL.Tyre = itemL.Tyre;
      if (bl.length < 20) {
        bl.push(uniqueBL);
        if (bl.length > 1) {
          bl.sort((a, b) => a.BestLap - b.BestLap);
        }
      } else if (uniqueBL.BestLap < bl[bl.length - 1].BestLap) {
        bl.pop();
        bl.push(uniqueBL);
        bl.sort((a, b) => a.BestLap - b.BestLap);
      }
    }
  }

  const bestLap = bl[0].BestLap;
  bl.forEach((item) => {
    item.Gap = item.BestLap - bestLap;
  });

  return bl;
}

/**
 * Función para crear la consistencia de los pilotos
 * @param rr - Array de objetos RaceResult
 * @param rl - Array de objetos RaceLap
 * @returns {Consistency[]} - Array de objetos Consistency
 */
function createConsistency(rr: RaceResult[], rl: RaceLap[]): Consistency[] {
  function findDriverResult(rr: RaceResult[], steamID: string) {
    return rr.find(r => r.SteamID === steamID);
  }

  //- Obtener el mejor tiempo de vuelta del piloto
  function getBestLap(driverResult: RaceResult | undefined, driverLaps: Lap[]): number {
    if (!driverResult) return 0;
    if (driverResult.BestLap === 999999.999 && driverLaps.length > 1) {
      return driverLaps[1].LapTime;
    }
    return driverResult.BestLap;
  }

  //- Obtener los tiempos de vuelta de los demás pilotos
  function getOtherLapTimes(driverLaps: Lap[], bestLap: number): number[] {
    return driverLaps
      .filter(lap => lap.LapTime !== bestLap || lap.LapTime > (bestLap + 21000) || lap.Cut > 0)
      .map(lap => lap.LapTime);
  }

  //- Crear la entrada de consistencia para cada piloto
  function createConsistencyEntry(driver: RaceLap, rr: RaceResult[]): Consistency {
    const uniqueC: Consistency = {} as Consistency;
    const driverResult = findDriverResult(rr, driver.SteamID);

    if (driver.Laps.length <= 1) {
      if (driverResult) {
        uniqueC.DriverName = driverResult.DriverName;
        uniqueC.SteamID = driverResult.SteamID;
        uniqueC.CarFileName = driverResult.CarFileName;
        uniqueC.Consistency = -1;
      }
    } else {
      const bestLap = getBestLap(driverResult, driver.Laps);
      if (driverResult) {
        uniqueC.DriverName = driverResult.DriverName;
        uniqueC.SteamID = driverResult.SteamID;
        uniqueC.CarFileName = driverResult.CarFileName;
      }
      const otherLapTimes = getOtherLapTimes(driver.Laps, bestLap);
      const totalTimes = otherLapTimes.reduce((acc, time) => acc + time, 0);
      const averageTime = otherLapTimes.length > 0 ? totalTimes / otherLapTimes.length : 0;
      const consistency = parseFloat((averageTime - bestLap).toFixed(2));
      uniqueC.Consistency = 100 - consistency;
    }
    return uniqueC;
  }

  const c: Consistency[] = rl.map(driver => createConsistencyEntry(driver, rr));
  c.sort((a, b) => b.Consistency - a.Consistency);
  return c;
}

/**
 * Función para crear los mejores sectores
 * @param rl - Array de objetos RaceLap
 * @returns {BestSector[]} - Array de objetos BestSector
 */
function createBestSector(rl: RaceLap[]): BestSector[] {
  if (!rl.length || !rl[0].Laps.length || !rl[0].Laps[1]) return [];
  const numSectors = rl[0].Laps[1].Sector.length;
  let bs: BestSector[] = [];

  for (let s = 0; s < numSectors; s++) {
    bs.push(...findBestSectorsForSector(rl, s));
  }

  bs.sort(compareBestSectors);
  return bs;
}

/**
 * Función auxiliar para encontrar los mejores sectores para un sector específico
 * @param rl - Array de objetos RaceLap
 * @param sectorIndex - Índice del sector, indicando el sector a buscar
 * @returns {BestSector[]} - Array de objetos BestSector
 */
function findBestSectorsForSector(rl: RaceLap[], sectorIndex: number): BestSector[] {
  const bestSectors: BestSector[] = [];
  for (let itemRL of rl) {
    if (itemRL.Laps.length > 0) {
      const bestSector = getBestSectorForDriver(itemRL, sectorIndex);
      if (bestSector) {
        bestSectors.push(bestSector);
      }
    }
  }
  return bestSectors;
}

/**
 * Función auxiliar para obtener el mejor sector para un piloto
 * @param itemRL - Objeto RaceLap con las vueltas del piloto
 * @param sectorIndex - Índice del sector a buscar
 * @returns {BestSector | null} - Objeto BestSector o null si no se encuentra
 */
function getBestSectorForDriver(itemRL: RaceLap, sectorIndex: number): BestSector | null {
  let bestTime = Number.MAX_VALUE;
  let bestLap: Lap | null = null;
  for (let itemL of itemRL.Laps) {
    if (itemL.Cut <= 0 && itemL.Sector[sectorIndex] < bestTime) {
      bestTime = itemL.Sector[sectorIndex];
      bestLap = itemL;
    }
  }
  if (bestLap) {
    return {
      SectorNumber: sectorIndex + 1,
      BestSector: bestTime,
      DriverName: itemRL.DriverName,
      SteamID: itemRL.SteamID,
      Split: itemRL.Split,
      CarFileName: bestLap.CarFileName,
    } as BestSector;
  }
  return null;
}

/**
 * Función auxiliar para comparar dos mejores sectores
 * @param a - Objeto BestSector
 * @param b - Objeto BestSector
 * @returns {number} - Resultado de la comparación
 */
function compareBestSectors(a: BestSector, b: BestSector): number {
  if (a.SectorNumber !== b.SectorNumber) {
    return a.SectorNumber - b.SectorNumber;
  }
  return a.BestSector - b.BestSector;
}

/**
 * Función para crear los incidentes
 * @param devents - Array de objetos EventJSON
 * @returns {Incident[]} - Array de objetos Incident
 */
function createIncident(devents: EventJSON[]): Incident[] {
  let i: Incident[] = [];

  for (let itemE of devents) {
    let uniqueI: Incident = {} as Incident;
    let timestamp = new Date(itemE.Timestamp);
    uniqueI.Date = timestamp.toString();
    let driverName = itemE.Driver.Name;
    let impactSpeed = itemE.ImpactSpeed.toFixed(3);

    let otherDriverName: string | undefined;
    switch (itemE.Type) {
      case "COLLISION_WITH_CAR":
        otherDriverName = itemE.OtherDriver.Name;
        uniqueI.Incident = `${driverName} colisionó contra el vehiculo de ${otherDriverName} a una velocidad de ${impactSpeed} km/h`;
        break;
      case "COLLISION_WITH_ENV":
        uniqueI.Incident = `${driverName} colisionó con el entorno a una velocidad de ${impactSpeed} km/h`;
        break;
    }

    uniqueI.AfterSession = itemE.AfterSessionEnd;
    i.push(uniqueI);
  }

  return i;
}

/**
 * Función para crear los incidentes con múltiples divisiones
 * @param deventsS1 - Array de objetos EventJSON para la primera división
 * @param deventsS2 - Array de objetos EventJSON para la segunda división
 * @returns {Incident[]} - Array de objetos Incident
 */
function createIncidentMultipleSplits(deventsS1: EventJSON[], deventsS2: EventJSON[]): Incident[] {
  let i: Incident[] = [];

  for (let itemE of deventsS1) {
    let uniqueI: Incident = {} as Incident;
    let timestamp = new Date(itemE.Timestamp);
    uniqueI.Date = timestamp.toString();
    let driverName = itemE.Driver.Name;
    let impactSpeed = itemE.ImpactSpeed.toFixed(3);

    let otherDriverName: string | undefined;
    switch (itemE.Type) {
      case "COLLISION_WITH_CAR":
        otherDriverName = itemE.OtherDriver.Name;
        uniqueI.Incident = `${driverName} colisionó contra el vehiculo de ${otherDriverName} a una velocidad de ${impactSpeed} km/h`;
        break;
      case "COLLISION_WITH_ENV":
        uniqueI.Incident = `${driverName} colisionó con el entorno a una velocidad de ${impactSpeed} km/h`;
        break;
    }

    uniqueI.AfterSession = itemE.AfterSessionEnd;
    i.push(uniqueI);
  }

  for (let itemE of deventsS2) {
    let uniqueI: Incident = {} as Incident;
    let timestamp = new Date(itemE.Timestamp);
    uniqueI.Date = timestamp.toString();
    let driverName = itemE.Driver.Name;
    let impactSpeed = itemE.ImpactSpeed.toFixed(3);
    let otherDriverName: string | undefined;

    switch (itemE.Type) {
      case "COLLISION_WITH_CAR":
        otherDriverName = itemE.OtherDriver.Name;
        uniqueI.Incident = `${driverName} colisionó contra el vehiculo de ${otherDriverName} a una velocidad de ${impactSpeed} km/h`;
        break;
      case "COLLISION_WITH_ENV":
        uniqueI.Incident = `${driverName} colisionó con el entorno a una velocidad de ${impactSpeed} km/h`;
        break;
    }

    uniqueI.AfterSession = itemE.AfterSessionEnd;
    i.push(uniqueI);
  }

  return i;
}

/**
 * Función para obtener las vueltas lideradas por cada piloto
 * @param rrAux - Array de objetos RaceResult
 * @param rl - Array de objetos RaceLap
 * @returns {RaceResult[]} - Array de objetos RaceResult con las vueltas lideradas
 */
function getLeadLaps(rrAux: RaceResult[], rl: RaceLap[]): RaceResult[] {
  return rrAux.map(raceResult => {
    const driverLaps = rl.find(raceLap => raceLap.SteamID === raceResult.SteamID);
    const lapsLed = driverLaps?.Laps.filter(lap => lap.Position === 1).length ?? 0;
    return { ...raceResult, LedLaps: lapsLed };
  });
}

/**
 * Función para crear la configuración de la carrera
 * @param data - Objeto GeneralDataJSON
 * @param rr - Array de objetos RaceResult
 * @param bestLap - Array de objetos BestLap
 * @returns {RaceConfig} - Objeto RaceConfig
 */
function createRaceConfig(data: GeneralDataJSON, rr: RaceResult[], bestLap: BestLap): RaceConfig {
  const mostLapsLeader = rr.reduce((prev, curr) => curr.LedLaps > prev.LedLaps ? curr : prev, rr.length > 0 ? rr[0] : {} as RaceResult);

  return {
    RaceID: data.SessionFile,
    Date: data.Date,
    Session: data.Type,
    Track: data.TrackName,
    TrackLayout: data.TrackConfig,
    Winner: rr[0].DriverName,
    LedMostLaps: mostLapsLeader.DriverName,
    BestLap: bestLap,
    NumberOfLaps: rr[0].Laps,
    RaceDurationTime: data.SessionConfig.time > 0 ? data.SessionConfig.time : 0,
    RaceDurationLaps: data.SessionConfig.time > 0 ? 0 : data.SessionConfig.laps,
    DisableP2P: data.SessionConfig.disable_push_to_pass,
    NumberofSplits: 1
  };
}

/**
 * Función para crear la configuración de la carrera con múltiples splits
 * @param dataS1 - Objeto GeneralDataJSON para el primer split
 * @param dataS2 - Objeto GeneralDataJSON para el segundo split
 * @param rr - Array de objetos RaceResult
 * @param bestLap - Array de objetos BestLap
 * @returns {RaceConfig} - Objeto RaceConfig
 */
function createRaceConfigMultipleSplits(dataS1: GeneralDataJSON, dataS2: GeneralDataJSON, rr: RaceResult[], bestLap: BestLap): RaceConfig {
  const mostLapsLeader = rr.reduce((prev, curr) => curr.LedLaps > prev.LedLaps ? curr : prev, rr.length > 0 ? rr[0] : {} as RaceResult);

  return {
    RaceID: `${dataS1.SessionFile}#${dataS2.SessionFile}`,
    Date: dataS1.Date,
    Session: dataS1.Type,
    Track: dataS1.TrackName,
    TrackLayout: dataS1.TrackConfig,
    Winner: rr[0].DriverName,
    LedMostLaps: mostLapsLeader.DriverName,
    BestLap: bestLap,
    NumberOfLaps: rr[0].Laps,
    RaceDurationTime: dataS1.SessionConfig.time > 0 ? dataS1.SessionConfig.time : 0,
    RaceDurationLaps: dataS1.SessionConfig.time > 0 ? 0 : dataS1.SessionConfig.laps,
    DisableP2P: dataS1.SessionConfig.disable_push_to_pass,
    NumberofSplits: 2
  };
}

/**
 * Función para calcular el número de vueltas de cada piloto
 * @param rr - Array de objetos RaceResult
 * @param rl - Array de objetos RaceLap
 * @returns {RaceResult[]} - Array de objetos RaceResult con el número de vueltas
 */
function calculateNumLaps(rr: RaceResult[], rl: RaceLap[]): RaceResult[] {
  return rr.map(itemRR => ({
    ...itemRR,
    Laps: rl.find(itemRL => itemRR.SteamID === itemRL.SteamID)?.Laps.length ?? 0
  }));
}

/**
 * Función para calcular la posición de la parrilla de cada piloto
 * @param rr - Array de objetos RaceResult
 * @param rl - Array de objetos RaceLap
 * @returns {RaceResult[]} - Array de objetos RaceResult con la posición de la parrilla
 */
function calculateGridPosition(rr: RaceResult[], rl: RaceLap[]): RaceResult[] {
  let rrAdjusted: RaceResult[] = rr;
  for (let itemRR of rrAdjusted) {
    let gridPosition = 0;
    const matchingLap = rl.find(itemRL => itemRL.SteamID === itemRR.SteamID && itemRL.Laps.length > 0);
    gridPosition = matchingLap ? matchingLap.Laps[0].Position : gridPosition;
    itemRR.GridPosition = gridPosition;
  }

  return rrAdjusted;
}

/**
 * Función para calcular el gap al primer piloto
 * @param rr - Array de objetos RaceResult
 * @param rl - Array de objetos RaceLap
 * @param numberOfSplits - Número de splits
 * @returns {RaceLap[]} - Array de objetos RaceLap con el gap al primer piloto
 */
function getGapToFirst(rr: RaceResult[], rl: RaceLap[], numberOfSplits: number): RaceLap[] {
  let raceLaps: RaceLap[] = rl;

  const numberOfLapsBySplit = getNumberOfLapsBySplit(rr, raceLaps, numberOfSplits);

  for (let splitIndex = 0; splitIndex < numberOfSplits; splitIndex++) {
    const currentSplit = splitIndex + 1;
    const numberOfLaps = numberOfLapsBySplit[splitIndex];

    for (let lapIndex = 0; lapIndex < numberOfLaps; lapIndex++) {
      const firstLapTime = findFirstLapTime(raceLaps, lapIndex, currentSplit);
      if (firstLapTime !== null) {
        updateGapsForSplit(raceLaps, lapIndex, currentSplit, firstLapTime);
      }
    }
  }
  return raceLaps;
}

/**
 * Función auxiliar para obtener el número de vueltas por split
 * @param rr - Array de objetos RaceResult
 * @param raceLaps - Array de objetos RaceLap
 * @param numberOfSplits - Número de splits
 * @returns {number[]} - Array con el número de vueltas por split
 */
function getNumberOfLapsBySplit(rr: RaceResult[], raceLaps: RaceLap[], numberOfSplits: number): number[] {
  return Array.from({ length: numberOfSplits }, (_, splitIndex) => {
    const splitNumber = splitIndex + 1;
    const firstDriverInSplit = rr.find(driver => driver.Split === splitNumber);
    if (!firstDriverInSplit) return 0;
    const matchingLaps = raceLaps.find(item => item.SteamID === firstDriverInSplit.SteamID);
    return matchingLaps ? matchingLaps.Laps.length : 0;
  });
}

/**
 * Función auxiliar para encontrar el primer tiempo de vuelta
 * @param raceLaps - Array de objetos RaceLap
 * @param lapIndex - Índice de la vuelta
 * @param currentSplit - Número de la división actual
 * @returns {number | null} - Tiempo de la vuelta o null si no se encuentra
 */
function findFirstLapTime(raceLaps: RaceLap[], lapIndex: number, currentSplit: number): number | null {
  for (let driverLap of raceLaps) {
    if (
      driverLap.Laps[lapIndex] &&
      driverLap.Laps[lapIndex].Position === 1 &&
      driverLap.Split === currentSplit
    ) {
      return driverLap.Laps[lapIndex].LapTime;
    }
  }
  return null;
}

/**
 * Función auxiliar para actualizar los gaps al primer piloto
 * @param raceLaps - Array de objetos RaceLap
 * @param lapIndex - Índice de la vuelta
 * @param currentSplit - Número de la división actual
 * @param firstLapTime - Tiempo de la primera vuelta
 */
function updateGapsForSplit(raceLaps: RaceLap[], lapIndex: number, currentSplit: number, firstLapTime: number): void {
  for (let driverLap of raceLaps) {
    if (driverLap.Laps[lapIndex] && driverLap.Split === currentSplit) {
      if (lapIndex > 0) {
        const lastLapGap = driverLap.Laps[lapIndex - 1].GaptoFirst;
        driverLap.Laps[lapIndex].GaptoFirst = parseFloat(
          ((driverLap.Laps[lapIndex].LapTime - firstLapTime) + lastLapGap).toFixed(3)
        );
        if (
          driverLap.Laps[lapIndex].GaptoFirst <= 0 ||
          driverLap.Laps[lapIndex].Position === 1
        ) {
          driverLap.Laps[lapIndex].GaptoFirst = 0;
        }
      } else {
        driverLap.Laps[lapIndex].GaptoFirst = parseFloat(
          (driverLap.Laps[lapIndex].LapTime - firstLapTime).toFixed(3)
        );
      }
    }
  }
}

/**
 * Función para recalcular las posiciones de los pilotos
 * @param rr - Array de objetos RaceResult
 * @param raceTime - Tiempo de la carrera
 * @returns {RaceResult[]} - Array de objetos RaceResult con las posiciones recalculadas
 */
function recalculatePositions(rr: RaceResult[], raceTime: number): RaceResult[] {
  rr.forEach(item => {
    if (item.Split === 1) {
      recalculateSplitOne(item, raceTime);
    } else {
      recalculateOtherSplits(item, raceTime);
    }
  });
  return rr;
}

/**
 * Función para recalcular la posición de los pilotos en el primer split
 * @param item - Objeto RaceResult
 * @param raceTime - Tiempo de la carrera
 */
function recalculateSplitOne(item: RaceResult, raceTime: number): void {
  if (item.Pos === -2) {
    item.Pos = -2;
    return;
  }
  const timerace = item.TotalTime + item.Penalties;
  const timeCondition = Math.trunc((timerace / 3600) % 60) + Math.trunc(timerace / 60);
  if (timeCondition < raceTime) {
    if (isStaffOrStreaming(item)) {
      item.Pos = -4; // Organización
    } else if (item.TotalTime <= 0) {
      item.Pos = -3; // DNS
    } else {
      item.Pos = -1; // DNF
    }
  }
}

/**
 * Función para recalcular la posición de los pilotos en otros splits
 * @param item - Objeto RaceResult
 * @param raceTime - Tiempo de la carrera
 */
function recalculateOtherSplits(item: RaceResult, raceTime: number): void {
  if (item.Pos === -2) {
    item.Pos = -2;
    return;
  }
  const timerace = item.TotalTime + item.Penalties;
  const timeCondition = Math.trunc((timerace / 3600) % 60) + Math.trunc(timerace / 60);
  if (timeCondition >= raceTime) {
    // Position remains unchanged
  }
}

/**
 * Función para verificar si el piloto es parte del staff o está en streaming
 * @param item - Objeto RaceResult
 * @returns {boolean} - Verdadero si el piloto es parte del staff o está en streaming, falso en caso contrario
 */
function isStaffOrStreaming(item: RaceResult): boolean {
  return (
    item.Team === 'ESP Racing Staff' ||
    item.Team === 'STREAMING' ||
    item.Team === 'Safety Car' ||
    item.DriverName === 'STREAMING'
  );
}

/**
 * Función para crear el resumen de los pilotos de la carrera
 * @param rr - Array de objetos RaceResult
 * @param bl - Array de objetos BestLap
 * @param rl - Array de objetos RaceLap
 * @returns {RaceDriversResume[]} - Array de objetos RaceDriversResume
 */
function createRaceDriversResume(rr: RaceResult[], bl: BestLap[], rl: RaceLap[]): RaceDriversResume[] {
  let rdr: RaceDriversResume[] = [];

  for (let item of rr) {
    let uniqueRDR: RaceDriversResume = {} as RaceDriversResume;
    const driverLaps = rl.find(itemRL => item.SteamID === itemRL.SteamID);
    uniqueRDR.SteamID = item.SteamID;
    uniqueRDR.DriverName = item.DriverName;
    uniqueRDR.Position = item.Pos;
    if(item.Pos > -3) {
    uniqueRDR.PolePosition = driverLaps?.Laps[0].Position === 1;
  }
    uniqueRDR.BestLap = uniqueRDR.SteamID === bl[0].SteamID;
    rdr.push(uniqueRDR);
  }

  return rdr;
}

/**
 * Función para crear el resumen de los coches de la carrera
 * @param rr - Array de objetos RaceResult
 * @returns {RaceCarResume[]} - Array de objetos RaceCarResume
 */
function createRaceCarResume(rr: RaceResult[]): RaceCarResume[] {
  const rcr = Array.from(
    rr.reduce((acc, { CarFileName }) =>
      acc.set(CarFileName, (acc.get(CarFileName) ?? 0) + 1), new Map<string, number>()))
    .map(([CarFileName, numberOfCars]) => ({ CarFileName, numberOfCars }));
  return rcr;
}

// FUNCIONES A EXPORTAR

/**
 * Función base para crear los datos de la carrera con 1 Split
 * @param dataFile - Objeto GeneralDataJSON
 * @returns {RaceData} - Objeto RaceData
 */
export function createRaceData(dataFile: any): RaceData{
  let rd: RaceData = {} as RaceData;
  const dcars = dataFile.Cars as CarJSON[];
  const devents = dataFile.Events;
  const dlaps = dataFile.Laps;
  const dresult = dataFile.Result;

  rd.RaceResult = createRaceResults(dcars, devents, dlaps, dresult, dataFile.SessionConfig.time, 1);
  rd.RaceLaps = createRaceLap(dlaps, rd.RaceResult);
  if (dataFile.Version < 6) {
    rd.RaceResult = calculateNumLaps(rd.RaceResult, rd.RaceLaps);
  }

  rd.BestLap = createBestLap(rd.RaceLaps);
  rd.Consistency = createConsistency(rd.RaceResult, rd.RaceLaps);
  rd.BestSector = createBestSector(rd.RaceLaps);
  rd.Incident = createIncident(devents);

  rd.RaceResult = getLeadLaps(rd.RaceResult, rd.RaceLaps);

  rd.RaceConfig = createRaceConfig(dataFile, rd.RaceResult, rd.BestLap[0]);
  rd.RaceConfig.NumberofSplits = 1;

  if (rd.RaceResult[0].GridPosition === -1) {
    rd.RaceResult = calculateGridPosition(rd.RaceResult, rd.RaceLaps);
  }

  rd.RaceLaps = getGapToFirst(rd.RaceResult, rd.RaceLaps, rd.RaceConfig.NumberofSplits);

  rd.RaceResult.forEach((itemRD) => {
    if (itemRD.Laps === 0) {
      itemRD.Laps = rd.RaceLaps
        .filter((item1) => item1.SteamID === itemRD.SteamID)
        .map((item2) => item2.Laps.length)
        .reduce((acc, laps) => acc + laps, 0);
    }
  });

  rd.RaceResult = recalculatePositions(rd.RaceResult, dataFile.SessionConfig.time);
  rd.RaceDriversResume = createRaceDriversResume(rd.RaceResult, rd.BestLap, rd.RaceLaps);
  rd.RaceCarResume = createRaceCarResume(rd.RaceResult);

  return rd;
}

/**
 * Función base para crear los datos de la carrera con múltiples splits
 * @param dataFileS1 - Objeto GeneralDataJSON para el primer split
 * @param dataFileS2 - Objeto GeneralDataJSON para el segundo split
 * @returns {RaceData} - Objeto RaceData
 */
export function createRaceDataMultipleSplits(dataFileS1: any, dataFileS2: any): RaceData {
  let rd: RaceData = {} as RaceData;
  const dcarsS1 = dataFileS1.Cars as CarJSON[];
  const deventsS1 = dataFileS1.Events;
  const dlapsS1 = dataFileS1.Laps;
  const dresultS1 = dataFileS1.Result;

  const dcarsS2 = dataFileS2.Cars as CarJSON[];
  const deventsS2 = dataFileS2.Events;
  const dlapsS2 = dataFileS2.Laps;
  const dresultS2 = dataFileS2.Result;

  const rr1 = createRaceResults(dcarsS1, deventsS1, dlapsS1, dresultS1, dataFileS1.SessionConfig.time, 1);
  const rr2 = createRaceResults(dcarsS2, deventsS2, dlapsS2, dresultS2, dataFileS2.SessionConfig.time, 2);

  rd.RaceResult = sortingPositionsMultipleSplits(rr1, rr2);

  rd.RaceLaps = createRaceLapMultipleSplits(dlapsS1, dlapsS2, rd.RaceResult);

  if (dataFileS1.Version < 6) {
    rd.RaceResult = calculateNumLaps(rd.RaceResult, rd.RaceLaps);
  }

  rd.BestLap = createBestLap(rd.RaceLaps);
  rd.Consistency = createConsistency(rd.RaceResult, rd.RaceLaps);

  rd.BestSector = createBestSector(rd.RaceLaps);
  rd.Incident = createIncidentMultipleSplits(deventsS1, deventsS2);

  rd.RaceResult = getLeadLaps(rd.RaceResult, rd.RaceLaps);

  rd.RaceConfig = createRaceConfigMultipleSplits(dataFileS1, dataFileS2, rd.RaceResult, rd.BestLap[0]);
  rd.RaceConfig.NumberofSplits = 2;

  if (rd.RaceResult[0].GridPosition === -1) {
    rd.RaceResult = calculateGridPosition(rd.RaceResult, rd.RaceLaps);
  }

  rd.RaceLaps = getGapToFirst(rd.RaceResult, rd.RaceLaps, rd.RaceConfig.NumberofSplits);

  rd.RaceResult.forEach((itemRD) => {
    if (itemRD.Laps === 0) {
      itemRD.Laps = rd.RaceLaps
        .filter((item1) => item1.SteamID === itemRD.SteamID)
        .map((item2) => item2.Laps.length)
        .reduce((acc, laps) => acc + laps, 0);
    }
  });

  rd.RaceResult = recalculatePositions(rd.RaceResult, dataFileS1.SessionConfig.time);
  rd.RaceDriversResume = createRaceDriversResume(rd.RaceResult, rd.BestLap, rd.RaceLaps);
  rd.RaceCarResume = createRaceCarResume(rd.RaceResult);

  return rd;
}