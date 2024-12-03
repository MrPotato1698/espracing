import type { RaceData, RaceResult, RaceLap, Lap, BestLap, Consistency, BestSector, Incident, RaceConfig } from "@/types/Results";
import type { GeneralDataJSON, CarJSON, EventJSON, LapJSON, ResultJSON } from "@/types/ResultsJSON";

interface DriverLapData {
  SteamID: string;
  timestamp: number;
}

function createRaceResults(dcars: CarJSON[], devents: EventJSON[], dlaps: LapJSON[], dresult: ResultJSON[], raceTime: number): RaceResult[] {
  let rr: RaceResult[] = [];
  let pos: number = 0; // Posición en la carrera:
  //-1 = no clasificado
  //-2 = descalificado
  //-3 = no presentado
  //-4 = SC o Staff ESP
  //0 = no clasificado
  //1 = primero
  //2 = segundo, etc.
  let vueltasLider = 0;

  for (let itemR of dresult) {
    pos++;
    let uniqueRR: RaceResult = {} as RaceResult;

    uniqueRR.SteamID = itemR.DriverGuid;
    uniqueRR.CarId = itemR.CarId;
    uniqueRR.DriverName = itemR.DriverName;
    uniqueRR.Team = dcars[itemR.CarId].Driver.Team;
    uniqueRR.CarFileName = itemR.CarModel;
    uniqueRR.TotalTime = (itemR.TotalTime / 1000);
    uniqueRR.Penalties = (itemR.PenaltyTime / 1000000000);
    uniqueRR.Laps = itemR.NumLaps;
    uniqueRR.BestLap = (itemR.BestLap / 1000);
    uniqueRR.LedLaps = 0;
    uniqueRR.Ballast = itemR.BallastKG;
    uniqueRR.Restrictor = itemR.Restrictor;
    uniqueRR.Split = 1;

    // Obtener posición de salida
    if (itemR.GridPosition !== 0) {
      uniqueRR.GridPosition = itemR.GridPosition;
    } else {
      uniqueRR.GridPosition = -1;
    }

    // Obtener posición final (uniqueRR.Pos)
    if (pos === 1) {
      uniqueRR.Pos = pos;
      vueltasLider = uniqueRR.Laps;
    } else {
      if (itemR.Disqualified === true) {
        uniqueRR.Pos = -2;
      } else {
        const timerace = (uniqueRR.TotalTime) + (uniqueRR.Penalties);
        const timeCondition = (Math.trunc((timerace / 3600) % 60) + Math.trunc(timerace / 60));
        if (timeCondition >= raceTime) {
          uniqueRR.Pos = pos;
          // } else if (uniqueRR.Laps <= Math.trunc(vueltasLider * 0.9)){
          //   uniqueRR.Pos = -1;
        } else {
          uniqueRR.Pos = -1;
        }
      }
    }

    //Obtener tiempo medio
    let avg = 0;
    let lapsWithoutCuts = 0;
    for (let itemL of dlaps) {
      if (itemL.CarId === uniqueRR.CarId) {
        if (itemL.Cuts < 1) {
          const currentLap = itemL.LapTime;
          lapsWithoutCuts++;
          avg += currentLap;
        }
      }
    }
    uniqueRR.AvgLap = (avg / lapsWithoutCuts) / 1000;

    // Obtener colisiones (uniqueRR.Collisions)
    uniqueRR.Collisions = 0;
    for (let item4 of devents) {
      if (item4.CarId === uniqueRR.CarId) {
        uniqueRR.Collisions += 1;
      }
    }
    rr.push(uniqueRR);
  }

  for (let itemdC of dcars) {
    const carID = itemdC.CarId;
    const driverFound = rr.some(result => result.CarId === carID);
    if (!driverFound) {
      if (itemdC.Driver.Name !== "") { //Si el piloto no tiene nombre, no se le añade a la lista
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

        //Diferenciar entre personal del staff y pilotos no presentados
        if (itemdC.Driver.Team === "ESP Racing Staff" || itemdC.Driver.Team === "Safety Car" || itemdC.Driver.Team === "STREAMING" || itemdC.Driver.Name === "STREAMING") {
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
  }

  return rr;
}

function createRaceResultsMultipleSplits(dcarsS1: CarJSON[], deventsS1: EventJSON[], dlapsS1: LapJSON[], dresultS1: ResultJSON[], raceTimeS1: number, dcarsS2: CarJSON[], deventsS2: EventJSON[], dlapsS2: LapJSON[], dresultS2: ResultJSON[], raceTimeS2: number): RaceResult[] {
  let rr: RaceResult[] = [];
  let rrS1: RaceResult[] = [];
  let rrS2: RaceResult[] = [];
  let pos: number = 0; // Posición en la carrera:
  //-1 = no clasificado
  //-2 = descalificado
  //-3 = no presentado
  //-4 = SC o Staff ESP
  //0 = no clasificado
  //1 = primero
  //2 = segundo, etc.
  let vueltasLider = 0;

  for (let itemR of dresultS1) {
    pos++;
    let uniqueRR: RaceResult = {} as RaceResult;

    uniqueRR.SteamID = itemR.DriverGuid;
    uniqueRR.CarId = itemR.CarId;
    uniqueRR.DriverName = itemR.DriverName;
    uniqueRR.Team = dcarsS1[itemR.CarId].Driver.Team;
    uniqueRR.CarFileName = itemR.CarModel;
    uniqueRR.TotalTime = (itemR.TotalTime / 1000);
    uniqueRR.Penalties = (itemR.PenaltyTime / 1000000000);
    uniqueRR.Laps = itemR.NumLaps;
    uniqueRR.BestLap = (itemR.BestLap / 1000);
    uniqueRR.LedLaps = 0;
    uniqueRR.Ballast = itemR.BallastKG;
    uniqueRR.Restrictor = itemR.Restrictor;
    uniqueRR.Split = 1;

    // Obtener posición de salida
    if (itemR.GridPosition !== 0) {
      uniqueRR.GridPosition = itemR.GridPosition;
    } else {
      uniqueRR.GridPosition = -1;
    }

    // Obtener posición final (uniqueRR.Pos)
    if (pos === 1) {
      uniqueRR.Pos = pos;
      vueltasLider = uniqueRR.Laps;
    } else {
      if (itemR.Disqualified === true) {
        uniqueRR.Pos = -2;
      } else {
        const timerace = (uniqueRR.TotalTime) + (uniqueRR.Penalties);
        const timeCondition = (Math.trunc((timerace / 3600) % 60) + Math.trunc(timerace / 60));
        if (timeCondition >= raceTimeS1) {
          uniqueRR.Pos = pos;
          // } else if (uniqueRR.Laps <= Math.trunc(vueltasLider * 0.9)){
          //   uniqueRR.Pos = -1;
        } else {
          uniqueRR.Pos = -1;
        }
      }
    }

    //Obtener tiempo medio
    let avg = 0;
    let lapsWithoutCuts = 0;
    for (let itemL of dlapsS1) {
      if (itemL.CarId === uniqueRR.CarId) {
        if (itemL.Cuts < 1) {
          const currentLap = itemL.LapTime;
          lapsWithoutCuts++;
          avg += currentLap;
        }
      }
    }
    uniqueRR.AvgLap = (avg / lapsWithoutCuts) / 1000;

    // Obtener colisiones (uniqueRR.Collisions)
    uniqueRR.Collisions = 0;
    for (let item4 of deventsS1) {
      if (item4.CarId === uniqueRR.CarId) {
        uniqueRR.Collisions += 1;
      }
    }
    rrS1.push(uniqueRR);
  }

  for (let itemR of dresultS2) {
    pos++;
    let uniqueRR: RaceResult = {} as RaceResult;

    uniqueRR.SteamID = itemR.DriverGuid;
    uniqueRR.CarId = itemR.CarId;
    uniqueRR.DriverName = itemR.DriverName;
    uniqueRR.Team = dcarsS1[itemR.CarId].Driver.Team;
    uniqueRR.CarFileName = itemR.CarModel;
    uniqueRR.TotalTime = (itemR.TotalTime / 1000);
    uniqueRR.Penalties = (itemR.PenaltyTime / 1000000000);
    uniqueRR.Laps = itemR.NumLaps;
    uniqueRR.BestLap = (itemR.BestLap / 1000);
    uniqueRR.LedLaps = 0;
    uniqueRR.Ballast = itemR.BallastKG;
    uniqueRR.Restrictor = itemR.Restrictor;
    uniqueRR.Split = 2;

    // Obtener posición de salida
    if (itemR.GridPosition !== 0) {
      uniqueRR.GridPosition = itemR.GridPosition;
    } else {
      uniqueRR.GridPosition = -1;
    }

    // Obtener posición final (uniqueRR.Pos)
    if (pos === 1) {
      uniqueRR.Pos = pos;
      vueltasLider = uniqueRR.Laps;
    } else {
      if (itemR.Disqualified === true) {
        uniqueRR.Pos = -2;
      } else {
        const timerace = (uniqueRR.TotalTime) + (uniqueRR.Penalties);
        const timeCondition = (Math.trunc((timerace / 3600) % 60) + Math.trunc(timerace / 60));
        if (timeCondition >= raceTimeS2) {
          uniqueRR.Pos = pos;
          // } else if (uniqueRR.Laps <= Math.trunc(vueltasLider * 0.9)){
          //   uniqueRR.Pos = -1;
        } else {
          uniqueRR.Pos = -1;
        }
      }
    }

    //Obtener tiempo medio
    let avg = 0;
    let lapsWithoutCuts = 0;
    for (let itemL of dlapsS1) {
      if (itemL.CarId === uniqueRR.CarId) {
        if (itemL.Cuts < 1) {
          const currentLap = itemL.LapTime;
          lapsWithoutCuts++;
          avg += currentLap;
        }
      }
    }
    uniqueRR.AvgLap = (avg / lapsWithoutCuts) / 1000;

    // Obtener colisiones (uniqueRR.Collisions)
    uniqueRR.Collisions = 0;
    for (let item4 of deventsS1) {
      if (item4.CarId === uniqueRR.CarId) {
        uniqueRR.Collisions += 1;
      }
    }
    rrS2.push(uniqueRR);
  }

  for (let itemdC of dcarsS1) {
    const carID = itemdC.CarId;
    const driverFound = rrS1.some(result => result.CarId === carID);
    if (!driverFound) {
      if (itemdC.Driver.Name !== "") { //Si el piloto no tiene nombre, no se le añade a la lista
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

        //Diferenciar entre personal del staff y pilotos no presentados
        if (itemdC.Driver.Team === "ESP Racing Staff" || itemdC.Driver.Team === "Safety Car" || itemdC.Driver.Team === "STREAMING" || itemdC.Driver.Name === "STREAMING") {
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
        rrS1.push(uniqueRR);
      }
    }
  }

  for (let itemdC of dcarsS2) {
    const carID = itemdC.CarId;
    const driverFound = rrS2.some(result => result.CarId === carID);
    if (!driverFound) {
      if (itemdC.Driver.Name !== "") { //Si el piloto no tiene nombre, no se le añade a la lista
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

        //Diferenciar entre personal del staff y pilotos no presentados
        if (itemdC.Driver.Team === "ESP Racing Staff" || itemdC.Driver.Team === "Safety Car" || itemdC.Driver.Team === "STREAMING" || itemdC.Driver.Name === "STREAMING") {
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
        rrS2.push(uniqueRR);
      }
    }
  }
  rr = sortingPositionsMultipleSplits(rrS1, rrS2);
  return rr;
}

function sortingPositionsMultipleSplits(rrS1: RaceResult[], rrS2: RaceResult[]): RaceResult[] {
  let rr: RaceResult[] = [];

  // Posiciones Normales, pilotos con carrera completa
  const rrAux1 = rrS1.filter((item) => item.Pos > 0);
  const rrAux2 = rrS2.filter((item) => item.Pos > 0);
  if (rrAux1) rr.concat(rrAux1);
  if (rrAux2) rr.concat(rrAux2);

  // Pilotos que no han completado la carrera
  const rrAux3 = rrS1.filter((item) => item.Pos === -1);
  const rrAux4 = rrS2.filter((item) => item.Pos === -1);
  let rrAux5: RaceResult[] = [];
  if (rrAux3 && rrAux4) rrAux5 = rrAux3.concat(rrAux4).sort((a, b) => (a.TotalTime + a.Penalties) - (b.TotalTime + b.Penalties));
  else if (rrAux3 && !rrAux4) rrAux5.concat(rrAux3);
  else if (!rrAux3 && rrAux4) rrAux5.concat(rrAux4);
  if (rrAux5) rr.concat(rrAux5);

  // Pilotos descalificados
  const rrAux6 = rrS1.filter((item) => item.Pos === -2);
  const rrAux7 = rrS2.filter((item) => item.Pos === -2);
  let rrAux8: RaceResult[] = [];
  if (rrAux6 && rrAux7) rrAux8 = rrAux6.concat(rrAux7).sort((a, b) => (a.TotalTime + a.Penalties) - (b.TotalTime + b.Penalties));
  else if (rrAux6 && !rrAux7) rrAux8.concat(rrAux6);
  else if (!rrAux6 && rrAux7) rrAux8.concat(rrAux7);
  if (rrAux8) rr.concat(rrAux8);

  // Pilotos no presentados
  const rrAux9 = rrS1.filter((item) => item.Pos === -3);
  const rrAux10 = rrS2.filter((item) => item.Pos === -3);
  let rrAux11: RaceResult[] = [];
  if (rrAux9 && rrAux10) rrAux11 = rrAux9.concat(rrAux10);
  else if (rrAux9 && !rrAux10) rrAux11.concat(rrAux9);
  else if (!rrAux9 && rrAux10) rrAux11.concat(rrAux10);
  if (rrAux11) rr.concat(rrAux11);

  // Personal de Staff
  const rrAux12: RaceResult[] = rrS1.filter((item) => item.Pos === -4);
  const rrAux13: RaceResult[] = rrS2.filter((item) => item.Pos === -4);
  let rrAux14: RaceResult[] = [];
  if (rrAux12 && rrAux13) {
    const rrAux15 = rrAux13.filter(item => !rrAux12.some(item2 => item2.SteamID === item.SteamID));
    rrAux14 = rrAux12.concat(rrAux15);
  } else if (rrAux12 && !rrAux13) rrAux14.concat(rrAux12);
  else if (!rrAux12 && rrAux13) rrAux14.concat(rrAux13);
  if (rrAux14) rr.concat(rrAux14);

  return rr;
}

function createRaceLap(dlaps: LapJSON[], rr: RaceResult[]): RaceLap[] {
  let rl: RaceLap[] = [];
  let i = 0;
  for (let driver of rr) {
    i++;
    //console.log('Driver ',i,': ', driver);

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

function createRaceLapMultipleSplits(dlapsS1: LapJSON[], dlapsS2: LapJSON[], rr: RaceResult[]): RaceLap[] {
  let rl: RaceLap[] = [];
  let i = 0;
  for (let driver of rr) {
    i++;
    //console.log('Driver ',i,': ', driver);

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

function createLap(dlaps: LapJSON[], rr: RaceResult): Lap[] {
  let l: Lap[] = [];
  let numLaps = 0;
  for (let lapItem of dlaps) {
    if (rr.SteamID === lapItem.DriverGuid) {
      numLaps++;
      let uniqueL: Lap = {} as Lap;
      uniqueL.LapNumber = numLaps;
      uniqueL.Position = -1;
      uniqueL.CarFileName = lapItem.CarModel;
      uniqueL.LapTime = lapItem.LapTime / 1000;
      uniqueL.Sector = lapItem.Sectors;
      uniqueL.Tyre = lapItem.Tyre;
      uniqueL.Cut = lapItem.Cuts;
      uniqueL.Timestamp = lapItem.Timestamp;
      l.push(uniqueL);
    }
  }
  return l;
}

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

function getBestTheoricalTime(rl: Lap[]): number[] {
  let bestTheoricalTime: number[] = [];

  let bestLapTime = Number.MAX_VALUE;
  let bestSectorTimes: number[] = rl[0].Sector.map(() => Number.MAX_VALUE);

  for (let lap of rl) {
    if (lap.LapTime < bestLapTime) {
      bestLapTime = lap.LapTime;
    }
    lap.Sector.forEach((sectorTime, index) => {
      if (sectorTime < bestSectorTimes[index] && lap.Cut <= 0) {
        bestSectorTimes[index] = sectorTime;
      }
    });
  }

  bestTheoricalTime.push(bestLapTime, ...bestSectorTimes);
  switch (bestTheoricalTime.length) {
    case 2: bestTheoricalTime[0] = (bestTheoricalTime[1]) / 1000; break;
    case 3: bestTheoricalTime[0] = (bestTheoricalTime[1] + bestTheoricalTime[2]) / 1000; break;
    case 4: bestTheoricalTime[0] = (bestTheoricalTime[1] + bestTheoricalTime[2] + bestTheoricalTime[3]) / 1000; break;
    case 5: bestTheoricalTime[0] = (bestTheoricalTime[1] + bestTheoricalTime[2] + bestTheoricalTime[3] + bestTheoricalTime[4]) / 1000; break;
  }
  return bestTheoricalTime;
}

function getPositionInEveryLap(rlAux: RaceLap[]): RaceLap[] {
  let rl: RaceLap[] = rlAux;
  let rl1: RaceLap[] = rlAux.filter((item) => item.Split === 1);
  let rl2: RaceLap[] = rlAux.filter((item) => item.Split === 2);

  for (let i = 0; i < rl1[0].Laps.length; i++) {
    let driver: DriverLapData[] = [];
    for (let racelap of rl1) {
      if (racelap.Laps[i] !== undefined) {
        driver.push({ SteamID: racelap.SteamID, timestamp: racelap.Laps[i].Timestamp });
      }
    }

    driver.sort((a, b) => a.timestamp - b.timestamp);

    for (let j = 0; j < driver.length; j++) {
      let encontrado: boolean = false;
      let k: number = 0;

      while (!encontrado && k < rl1.length) {
        if (rl1[k].SteamID === driver[j].SteamID) {
          rl1[k].Laps[i].Position = j + 1;
          encontrado = true;
        }
        k++;
      }
    }
  }

  for (let item of rl1) {
    const foundIndex = rl.findIndex((item2) => item2.SteamID === item.SteamID);
    if (foundIndex !== -1) {
      rl[foundIndex].Laps = item.Laps;
    }
  }

  if (rl2.length > 0) {
    for (let i = 0; i < rl2[0].Laps.length; i++) {
      let driver: DriverLapData[] = [];
      for (let racelap of rl2) {
        if (racelap.Laps[i] !== undefined) {
          driver.push({ SteamID: racelap.SteamID, timestamp: racelap.Laps[i].Timestamp });
        }
      }

      driver.sort((a, b) => a.timestamp - b.timestamp);

      for (let j = 0; j < driver.length; j++) {
        let encontrado: boolean = false;
        let k: number = 0;

        while (!encontrado && k < rl2.length) {
          if (rl2[k].SteamID === driver[j].SteamID) {
            rl2[k].Laps[i].Position = j + 1;
            encontrado = true;
          }
          k++;
        }
      }
    }

    for (let item of rl2) {
      const foundIndex = rl.findIndex((item2) => item2.SteamID === item.SteamID);
      if (foundIndex !== -1) {
        rl[foundIndex].Laps = item.Laps;
      }
    }
  }

  return rl;
}

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
      } else {
        if (uniqueBL.BestLap < bl[bl.length - 1].BestLap) {
          bl.pop();
          bl.push(uniqueBL);
          bl.sort((a, b) => a.BestLap - b.BestLap);
        }
      }
    }
  }

  const bestLap = bl[0].BestLap;
  bl.forEach((item) => {
    item.Gap = item.BestLap - bestLap;
  });

  return bl;
}

function createConsistency(rr: RaceResult[], rl: RaceLap[]): Consistency[] {
  let c: Consistency[] = [];
  for (let driver of rl) {
    let uniqueC: Consistency = {} as Consistency;
    if (driver.Laps.length <= 1) { //Si el piloto ha dado 1 vuelta o menos
      let driverFound = false;
      let k = 0;
      while (!driverFound && k < rr.length) {
        if (rr[k].SteamID === driver.SteamID) {
          uniqueC.DriverName = rr[k].DriverName;
          uniqueC.SteamID = rr[k].SteamID;
          uniqueC.CarFileName = rr[k].CarFileName;
          uniqueC.Consistency = -1;
          driverFound = true;
        } else {
          k++;
        }
      }

    } else { //Si el piloto ha dado más de 1 vuelta
      let bestLap = 0;

      // Obtener la mejor vuelta del piloto
      let driverFound = false;
      let k = 0;
      while (!driverFound && k < rr.length) {
        if (rr[k].SteamID === driver.SteamID) {
          if (rr[k].BestLap === 999999.999) {
            bestLap = driver.Laps[1].LapTime;
          } else {
            bestLap = rr[k].BestLap;
          }
          uniqueC.DriverName = rr[k].DriverName;
          uniqueC.SteamID = rr[k].SteamID;
          uniqueC.CarFileName = rr[k].CarFileName;
          driverFound = true;
        } else {
          k++;
        }
      }

      //Obtener el resto de vueltas del piloto que no son la mejor
      let otherLapTimes: number[] = [];
      for (let lap of driver.Laps) {
        // Si es la mejor vuelta o una vuelta 21 segundos más lenta que la mejor o hubo algún Cut en la vuelta, no se tiene en cuenta
        if (lap.LapTime !== bestLap || lap.LapTime > (bestLap + 21000) || lap.Cut > 0) {
          otherLapTimes.push(lap.LapTime);
        }
      }

      const totalTimes = otherLapTimes.reduce((acc, time) => acc + time, 0);
      const averageTime = totalTimes / otherLapTimes.length;
      const consistency = parseFloat((averageTime - bestLap).toFixed(2));

      uniqueC.Consistency = 100 - consistency;
    }
    c.push(uniqueC);
    c.sort((a, b) => b.Consistency - a.Consistency);
  }
  return c;
}

function createBestSector(rl: RaceLap[]): BestSector[] {
  let bs: BestSector[] = [];

  // Numero de sectores por vuelta (en la vuelta 2 por si acaso el juego no detecta bien la primera vuelta de salida)
  const numSectors = rl[0].Laps[1].Sector.length;

  for (let s = 0; s < numSectors; s++) {
    for (let itemRL of rl) {
      if (itemRL.Laps.length > 0) {
        let uniqueSector: BestSector = {} as BestSector;
        uniqueSector.SectorNumber = s + 1;
        uniqueSector.BestSector = Number.MAX_VALUE;
        for (let itemL of itemRL.Laps) {
          if (itemL.Cut <= 0) { //Si la vuelta fue sin CUTS, es decir, vuelta limpia
            if (itemL.Sector[s] < uniqueSector.BestSector) {
              uniqueSector.DriverName = itemRL.DriverName;
              uniqueSector.SteamID = itemRL.SteamID;
              uniqueSector.CarFileName = itemL.CarFileName;
              uniqueSector.BestSector = itemL.Sector[s];
            }
          }
        }
        if (uniqueSector.DriverName !== undefined) {
          bs.push(uniqueSector);
        }
      }
    }
  }

  bs.sort((a, b) => {
    if (a.SectorNumber !== b.SectorNumber) {
      return a.SectorNumber - b.SectorNumber;
    }
    return a.BestSector - b.BestSector;
  });

  //console.table(bs);
  return bs;
}

function createIncident(devents: EventJSON[]): Incident[] {
  let i: Incident[] = [];

  for (let itemE of devents) {
    let uniqueI: Incident = {} as Incident;
    let timestamp = new Date(itemE.Timestamp);
    uniqueI.Date = timestamp.toString();
    let driverName = itemE.Driver.Name;
    let impactSpeed = itemE.ImpactSpeed.toFixed(3);

    switch (itemE.Type) {
      case "COLLISION_WITH_CAR":
        let otherDriverName = itemE.OtherDriver.Name;
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

function createIncidentMultipleSplits(deventsS1: EventJSON[], deventsS2: EventJSON[]): Incident[] {
  let i: Incident[] = [];

  for (let itemE of deventsS1) {
    let uniqueI: Incident = {} as Incident;
    let timestamp = new Date(itemE.Timestamp);
    uniqueI.Date = timestamp.toString();
    let driverName = itemE.Driver.Name;
    let impactSpeed = itemE.ImpactSpeed.toFixed(3);

    switch (itemE.Type) {
      case "COLLISION_WITH_CAR":
        let otherDriverName = itemE.OtherDriver.Name;
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

    switch (itemE.Type) {
      case "COLLISION_WITH_CAR":
        let otherDriverName = itemE.OtherDriver.Name;
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

function getLeadLaps(rrAux: RaceResult[], rl: RaceLap[]): RaceResult[] {
  let rr: RaceResult[] = rrAux;

  for (let itemRL of rl) {
    let lapsLed = 0;
    for (let itemL of itemRL.Laps) {
      if (itemL.Position === 1) {
        lapsLed++;
      }
    }

    for (let itemRR of rr) {
      if (itemRL.SteamID === itemRR.SteamID) {
        itemRR.LedLaps = lapsLed;
      }
    }
  }

  return rr;
}

function createRaceConfig(data: GeneralDataJSON, rr: RaceResult[], bestLap: BestLap): RaceConfig {
  let rc: RaceConfig = {} as RaceConfig;
  rc.RaceID = data.SessionFile;
  rc.Date = data.Date;
  rc.Session = data.Type;
  rc.Track = data.TrackName;
  rc.TrackLayout = data.TrackConfig;
  rc.Winner = rr[0].DriverName;

  //Piloto que más vueltas ha liderado
  let mostLedLaps = 0;
  let driverName = "";
  for (let item of rr) {
    if (item.LedLaps > mostLedLaps) {
      mostLedLaps = item.LedLaps;
      driverName = item.DriverName;
    }
  }
  rc.LedMostLaps = driverName;

  rc.BestLap = bestLap;
  rc.NumberOfLaps = rr[0].Laps;

  //Dependiendo de como esté configurada la sesión, se mostrará el tiempo o no
  if (data.SessionConfig.time > 0) {
    rc.RaceDurationTime = data.SessionConfig.time;
    rc.RaceDurationLaps = 0;
  } else {
    rc.RaceDurationTime = 0;
    rc.RaceDurationLaps = data.SessionConfig.laps;
  }

  rc.DisableP2P = data.SessionConfig.disable_push_to_pass;
  return rc;
}

function createRaceConfigMultipleSplits(dataS1: GeneralDataJSON, dataS2: GeneralDataJSON, rr: RaceResult[], bestLap: BestLap): RaceConfig {
  let rc: RaceConfig = {} as RaceConfig;
  rc.RaceID = dataS1.SessionFile+"#"+dataS2.SessionFile;
  rc.Date = dataS1.Date;
  rc.Session = dataS1.Type;
  rc.Track = dataS1.TrackName;
  rc.TrackLayout = dataS1.TrackConfig;
  rc.Winner = rr[0].DriverName;

  //Piloto que más vueltas ha liderado
  let mostLedLaps = 0;
  let driverName = "";
  for (let item of rr) {
    if (item.LedLaps > mostLedLaps) {
      mostLedLaps = item.LedLaps;
      driverName = item.DriverName;
    }
  }
  rc.LedMostLaps = driverName;

  rc.BestLap = bestLap;
  rc.NumberOfLaps = rr[0].Laps;

  //Dependiendo de como esté configurada la sesión, se mostrará el tiempo o no
  if (dataS1.SessionConfig.time > 0) {
    rc.RaceDurationTime = dataS1.SessionConfig.time;
    rc.RaceDurationLaps = 0;
  } else {
    rc.RaceDurationTime = 0;
    rc.RaceDurationLaps = dataS1.SessionConfig.laps;
  }

  rc.DisableP2P = dataS1.SessionConfig.disable_push_to_pass;
  return rc;
}

function calculateNumLaps(rr: RaceResult[], rl: RaceLap[]): RaceResult[] {
  let rrAdjusted: RaceResult[] = rr;

  for (let itemRR of rrAdjusted) {
    let numLaps = 0;
    for (let itemRL of rl) {
      if (itemRR.SteamID === itemRL.SteamID) {
        numLaps = itemRL.Laps.length;
      }
    }
    itemRR.Laps = numLaps;
  }
  return rrAdjusted;
}

function calculateGridPosition(rr: RaceResult[], rl: RaceLap[]): RaceResult[] {
  let rrAdjusted: RaceResult[] = rr;
  for (let itemRR of rrAdjusted) {
    let gridPosition = 0;
    for (let itemRL of rl) {
      if (itemRR.SteamID === itemRL.SteamID) {
        if (itemRL.Laps.length > 0) {
          gridPosition = itemRL.Laps[0].Position;
        }
      }
    }
    itemRR.GridPosition = gridPosition;
  }

  return rrAdjusted;
}

function getGapToFirst(rr: RaceResult[], rl: RaceLap[]): RaceLap[] {
  let gapToFirst: RaceLap[] = rl;
  const numberOfLaps = gapToFirst[0].Laps.length;

  for (let lapIndex = 0; lapIndex < numberOfLaps; lapIndex++) {
    let firstLapTime: number | null = null;

    // Encontrar el tiempo por vuelta del coche en primera posición para la vuelta actual
    for (let driverLap of gapToFirst) {
      if (driverLap.Laps[lapIndex] && driverLap.Laps[lapIndex].Position === 1) {
        firstLapTime = driverLap.Laps[lapIndex].LapTime;
        break;
      }
    }

    if (firstLapTime !== null) {
      // Calcular la diferencia para cada piloto con respecto al coche en primera posición
      for (let driverLap of gapToFirst) {
        if (driverLap.Laps[lapIndex]) {
          if (lapIndex > 0) {
            const lastLapGap = driverLap.Laps[lapIndex - 1].GaptoFirst;
            driverLap.Laps[lapIndex].GaptoFirst = parseFloat(((driverLap.Laps[lapIndex].LapTime - firstLapTime) + lastLapGap).toFixed(3)); // Convertir a segundos
            if (driverLap.Laps[lapIndex].GaptoFirst <= 0 || driverLap.Laps[lapIndex].Position === 1) {
              driverLap.Laps[lapIndex].GaptoFirst = 0;
            }
          } else {
            driverLap.Laps[lapIndex].GaptoFirst = parseFloat((driverLap.Laps[lapIndex].LapTime - firstLapTime).toFixed(3)); // Convertir a segundos
          }
        }
      }
    }
  }
  return gapToFirst;
}

function recalculatePositions(rr: RaceResult[], raceTime: number): RaceResult[] {
  let vueltasLider = 0;
  for (let item of rr)
    if (item.Pos === 1) {
      item.Pos = 1;
      vueltasLider = item.Laps;
    } else {
      if (item.Pos === -2) {
        item.Pos = -2;
      } else {
        const timerace = (item.TotalTime) + (item.Penalties);
        const timeCondition = (Math.trunc((timerace / 3600) % 60) + Math.trunc(timerace / 60));
        if (timeCondition >= raceTime) {
          item.Pos = item.Pos;
          // } else if (uniqueRR.Laps <= Math.trunc(vueltasLider * 0.9)){
          //   uniqueRR.Pos = -1;
        } else {
          item.Pos = -1;
        }
      }
    }
  return rr;
}

// FUNCIONES A EXPORTAR

export function createRaceData(dataFile: any): RaceData {
  let rd: RaceData = {} as RaceData;
  const dcars = dataFile.Cars as CarJSON[];
  const devents = dataFile.Events;
  const dlaps = dataFile.Laps;
  const dresult = dataFile.Result;
  //const dpenalties = datos.Penalties;

  rd.RaceResult = createRaceResults(dcars, devents, dlaps, dresult, dataFile.SessionConfig.time);
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

  rd.RaceLaps = getGapToFirst(rd.RaceResult, rd.RaceLaps);

  rd.RaceResult.map((itemRD) => {
    if (itemRD.Laps === 0) {
      itemRD.Laps = rd.RaceLaps
        .filter((item1) => item1.SteamID === itemRD.SteamID)
        .map((item2) => item2.Laps.length)
        .reduce((acc, laps) => acc + laps, 0);
    }
  });

  rd.RaceResult = recalculatePositions(rd.RaceResult, dataFile.SessionConfig.time);

  return rd;
}

export function createRaceDataMultipleSplits(dataFileS1: any, dataFileS2: any): RaceData {
  let rd: RaceData = {} as RaceData;
  const dcarsS1 = dataFileS1.Cars as CarJSON[];
  const deventsS1 = dataFileS1.Events;
  const dlapsS1 = dataFileS1.Laps;
  const dresultS1 = dataFileS1.Result;
  const dpenaltiesS1 = dataFileS1.Penalties;

  const dcarsS2 = dataFileS2.Cars as CarJSON[];
  const deventsS2 = dataFileS2.Events;
  const dlapsS2 = dataFileS2.Laps;
  const dresultS2 = dataFileS2.Result;
  const dpenaltiesS2 = dataFileS2.Penalties;

  rd.RaceResult = createRaceResultsMultipleSplits(dcarsS1, deventsS1, dlapsS1, dresultS1, dataFileS1.SessionConfig.time, dcarsS2, deventsS2, dlapsS2, dresultS2, dataFileS2.SessionConfig.time);
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

  //TODO: Revisar de aquí hacia abajo
  if (rd.RaceResult[0].GridPosition === -1) {
    rd.RaceResult = calculateGridPosition(rd.RaceResult, rd.RaceLaps);
  }

  rd.RaceLaps = getGapToFirst(rd.RaceResult, rd.RaceLaps);

  rd.RaceResult.map((itemRD) => {
    if (itemRD.Laps === 0) {
      itemRD.Laps = rd.RaceLaps
        .filter((item1) => item1.SteamID === itemRD.SteamID)
        .map((item2) => item2.Laps.length)
        .reduce((acc, laps) => acc + laps, 0);
    }
  });

  rd.RaceResult = recalculatePositions(rd.RaceResult, dataFileS1.SessionConfig.time);

  return rd;
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

export function getColorClass(carClass: string): string {
  let result: string = "class='";
  switch (carClass) {
    case "GT3":
      result += "bg-[#00df1b] text-[#f9f9f9]";
      break;
    case "GT4":
      result += "bg-[#ff8f00] text-[#f9f9f9]";
      break;
    case "DTM":
      result += "bg-[#02315b] text-[#e0ff80]";
      break;
    case "JTC Div.III":
      result += "text-[#ff0000] bg-[#f9f9f9]";
      result
      break;
    case "Formula 4":
      result += "bg-[#c5c5c5] text-[#0f0f0f]";
      break;
    case "LMDh":
      result += "bg-[#ff0000] text-[#f9f9f9]";
      break;
    case "LMH":
      result += "bg-[#ff0000] text-[#f9f9f9]";
      break;
    case "Twingo Cup":
      result += "bg-[#ffe000] text-[#0f0f0f]";
      break;
    case "A110 Cup":
      result += "bg-[#006fba] text-[#f9f9f9]";
      break;
    case "Nascar Le Mans":
      result += "bg-[#0f0f0f] text-[#f9f9f9]";
      break;
    case "DPi":
      result += "bg-[#0f0f0f] text-[#f9f9f9]";
      break;
    case "F1":
      result += "bg-[#ff0000] text-[#f9f9f9]";
      break;
    case "F2":
      result += "bg-[#0055ff] text-[#f9f9f9]";
      break;
    case "Clio Cup":
      result += "bg-[#ffe000] text-[#0f0f0f]";
      break;
    case "M2 CS Cup":
      result += "bg-[#0055ff] text-[#f9f9f9]";
      break;
    case "BTCC":
      result += "bg-[#0f00ff] text-[#f9f9f9]";
      break;
    case "Prototype >5000":
      result += "bg-[#f9f9f9] text-[#0f0f0f]";
      break;
    case "GT2":
      result += "bg-[#f9f9f9] text-[#ff0000]";
      break;
    case "Light Prototype":
      result += "bg-[#00fbff] text-[#0f0f0f]";
      break;
    case "TNC3":
      result += "bg-[#f9f9f9] text-[#0f0f0f]";
      break;
    case "Trophy Truck":
      result += "bg-[#0f0f0f] text-[#f9f9f9]";
      break;
    case "Supercar":
      result += "bg-[#ff9300] text-[#0f0f0f]";
      break;
    case "Classic":
      result += "bg-[#f9f9f9] text-[#0f0f0f]";
      break;
  }
  result += " rounded text-xs font-bold px-1 py-0.5 ml-1'";
  return result;
}

export function getClassShortName(carClass: string): string {
  let result: string = "";
  switch (carClass) {
    case "GT3":
      result += "GT3";
      break;
    case "GT4":
      result += "GT4";
      break;
    case "DTM":
      result += "DTM";
      break;
    case "JTC Div.III":
      result += "JTC Div.3";
      break;
    case "Formula 4":
      result += "F4";
      break;
    case "LMDh":
      result += "LMDh";
      break;
    case "LMH":
      result += "LMH";
      break;
    case "Twingo Cup":
      result += "CUP";
      break;
    case "A110 Cup":
      result += "CUP";
      break;
    case "Nascar Le Mans":
      result += "Nascar";
      break;
    case "DPi":
      result += "DPi";
      break;
    case "F1":
      result += "F1";
      break;
    case "F2":
      result += "F2";
      break;
    case "Clio Cup":
      result += "CUP";
      break;
    case "M2 CS Cup":
      result += "CUP";
      break;
    case "BTCC":
      result += "BTCC";
      break;
    case "Prototype >5000":
      result += ">5.0L";
      break;
    case "GT2":
      result += "GT2";
      break;
    case "Light Prototype":
      result += "Proto";
      break;
    case "TNC3":
      result += "TNC3";
      break;
    case "Trophy Truck":
      result += "TT";
      break;
    case "Supercar":
      result += "SC";
      break;
    case "Classic":
      result += "Classic";
      break;
  }
  return result;
}
