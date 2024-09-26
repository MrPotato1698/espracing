import type { RaceData, RaceResult, RaceLap, Lap, BestLap, Consistency, BestSector, Incident, RaceConfig } from "@/types/Results";
import type { GeneralDataJSON, CarJSON, EventJSON, LapJSON, ResultJSON } from "@/types/ResultsJSON";

interface DriverLapData {
  SteamID: string;
  timestamp: number;
}

function createRaceResults(dcars: CarJSON[], devents: EventJSON[], dlaps: LapJSON[], dresult: ResultJSON[], raceTime: number): RaceResult[] {
  let rr: RaceResult[] = [];
  let pos: number = 0; // Posición en la carrera: -1 = no clasificado, -2 = descalificado, -3 = no presentado, -4 = SC o Staff ESP, 0 = no clasificado, 1 = primero, 2 = segundo, etc.
  let vueltasLider = 0;

  for (let itemR of dresult) {
    pos++;
    let uniqueRR: RaceResult = {} as RaceResult;

    uniqueRR.SteamID = itemR.DriverGuid;
    uniqueRR.CarId = itemR.CarId;
    uniqueRR.DriverName = itemR.DriverName;
    uniqueRR.Team = dcars[itemR.CarId].Driver.Team;
    uniqueRR.CarFileName = itemR.CarModel;
    uniqueRR.GridPosition = itemR.GridPosition;
    uniqueRR.TotalTime = (itemR.TotalTime / 1000);
    uniqueRR.Penalties = (itemR.PenaltyTime / 1000000000);
    uniqueRR.Laps = itemR.NumLaps;
    uniqueRR.BestLap = (itemR.BestLap / 1000);
    uniqueRR.LedLaps = 0;
    uniqueRR.Ballast = itemR.BallastKG;
    uniqueRR.Restrictor = itemR.Restrictor;

    // Obtener posición final (uniqueRR.Pos)
    if (pos === 1) {
      uniqueRR.Pos = pos;
      vueltasLider = uniqueRR.Laps;
    } else {
      if (itemR.Disqualified === true) {
        uniqueRR.Pos = -2;
      } else {
        const timerace = (uniqueRR.TotalTime) + (uniqueRR.Penalties);
        if (uniqueRR.Laps < vueltasLider * 0.9 || ((Math.trunc((timerace / 60) % 60) + Math.trunc(timerace / 60)) < raceTime)) {
          uniqueRR.Pos = -1;
        } else {
          uniqueRR.Pos = pos;
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
        if (itemdC.Driver.Team === "ESP Racing Staff" || itemdC.Driver.Team === "Safety Car" || itemdC.Driver.Team === "STREAMING") {
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
      uniqueRL.Laps = [];
      uniqueRL.Average = [];
      uniqueRL.Best = [];
    } else {
      uniqueRL.DriverName = driver.DriverName;
      uniqueRL.SteamID = driver.SteamID;
      uniqueRL.Laps = createLap(dlaps, driver);
      uniqueRL.Average = getAvgLapTimes(uniqueRL.Laps);
      uniqueRL.Best = getBestTheoricalTime(uniqueRL.Laps);
    }
    rl.push(uniqueRL);
  }

  // Obtener el valor de la posición de cada piloto en cada vuelta
  const rlAdjust = getPositionInEveryLap(rl);

  return rlAdjust;
}

function createLap(dlaps: LapJSON[], rr: RaceResult): Lap[] {
  let l: Lap[] = [];
  for (let lapItem of dlaps) {
    if (rr.SteamID === lapItem.DriverGuid) {
      let uniqueL: Lap = {} as Lap;
      uniqueL.LapNumber = lapItem.Sectors.length;
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

function getBestTheoricalTime(rl: Lap[]): number[] {
  let bestTheoricalTime: number[] = [];

  let bestLapTime = Number.MAX_VALUE;
  let bestSectorTimes: number[] = rl[0].Sector.map(() => Number.MAX_VALUE);

  for (let lap of rl) {
    if (lap.LapTime < bestLapTime) {
      bestLapTime = lap.LapTime;
    }
    lap.Sector.forEach((sectorTime, index) => {
      if (sectorTime < bestSectorTimes[index]) {
        bestSectorTimes[index] = sectorTime;
      }
    });
  }

  bestTheoricalTime.push(bestLapTime, ...bestSectorTimes);

  return bestTheoricalTime;
}

function getPositionInEveryLap(attRL: RaceLap[]): RaceLap[] {
  let rl: RaceLap[] = attRL;

  for (let i = 0; i < rl[0].Laps.length; i++) {
    let driver: DriverLapData[] = [];
    for (let racelap of rl) {
      if (racelap.Laps[i] !== undefined) {
        driver.push({ SteamID: racelap.SteamID, timestamp: racelap.Laps[i].Timestamp });
      }
    }

    driver.sort((a, b) => a.timestamp - b.timestamp);

    for (let j = 0; j < driver.length; j++) {
      let encontrado: boolean = false;
      let k: number = 0;

      while (!encontrado && k < rl.length) {
        if (rl[k].SteamID === driver[j].SteamID) {
          rl[k].Laps[i].Position = j + 1;
          encontrado = true;
        }
        k++;
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
          bestLap = rr[k].BestLap;
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

      uniqueC.Consistency = consistency;
    }
    c.push(uniqueC);
    c.sort((a, b) => b.Consistency - a.Consistency);
  }
  return c;
}
//FIXME: Siempre escoge al mismo piloto
function createBestSector(rl: RaceLap[]): BestSector[] {
  let bs: BestSector[] = [];

  // Numero de sectores por vuelta (en la vuelta 2 por si acaso el juego no detecta bien la primera vuelta de salida)
  const numSectors = rl[0].Laps[1].Sector.length;
  for (let s = 0; s < numSectors; s++) {
    let uniqueSector: BestSector = {} as BestSector;
    uniqueSector.SectorNumber = s + 1;
    for (let itemRL of rl) {
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
      bs.push(uniqueSector);
    }
  }
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

function getLeadLaps(attrr: RaceResult[], rl: RaceLap[]): RaceResult[] {
  let rr: RaceResult[] = attrr;

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

function createRaceConfig(datos: GeneralDataJSON, rr: RaceResult[], bestLap: BestLap): RaceConfig {
  let rc: RaceConfig = {} as RaceConfig;
  rc.RaceID = datos.SessionFile;
  rc.Date = datos.Date;
  rc.Session = datos.Type;
  rc.Track = datos.TrackName;
  rc.TrackLayout = datos.TrackConfig;
  rc.Winner = datos.Result[0].DriverName;

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
  rc.NumberOfLaps = datos.Result[0].NumLaps;

  //Dependiendo de como esté configurada la sesión, se mostrará el tiempo o no
  if (datos.SessionConfig.time > 0) {
    rc.RaceDurationTime = datos.SessionConfig.time;
    rc.RaceDurationLaps = 0;
  } else {
    rc.RaceDurationTime = 0;
    rc.RaceDurationLaps = datos.Result[0].NumLaps;
  }

  rc.DisableP2P = datos.SessionConfig.disable_push_to_pass;
  return rc;
}

// FUNCIONES A EXPORTAR

export function createRaceData(datos: any): RaceData {
  let rd: RaceData = {} as RaceData;
  const dcars = datos.Cars as CarJSON[];
  const devents = datos.Events;
  const dlaps = datos.Laps;
  const dresult = datos.Result;
  //const dpenalties = datos.Penalties;

  rd.RaceResult = createRaceResults(dcars, devents, dlaps, dresult, datos.SessionConfig.time);
  rd.RaceLaps = createRaceLap(dlaps, rd.RaceResult);
  rd.BestLap = createBestLap(rd.RaceLaps);
  rd.Consistency = createConsistency(rd.RaceResult, rd.RaceLaps);
  rd.BestSector = createBestSector(rd.RaceLaps);
  rd.Incident = createIncident(devents);

  rd.RaceResult = getLeadLaps(rd.RaceResult, rd.RaceLaps);

  rd.RaceConfig = createRaceConfig(datos, rd.RaceResult, rd.BestLap[0]);
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
