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
    uniqueRR.TotalTime = (itemR.TotalTime / 1000);
    uniqueRR.Penalties = (itemR.PenaltyTime / 1000000000);
    uniqueRR.Laps = itemR.NumLaps;
    uniqueRR.BestLap = (itemR.BestLap / 1000);
    uniqueRR.LedLaps = 0;
    uniqueRR.Ballast = itemR.BallastKG;
    uniqueRR.Restrictor = itemR.Restrictor;

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

  if (datos.Version < 6) {
    rd.RaceResult = calculateNumLaps(rd.RaceResult, rd.RaceLaps);
  }

  rd.BestLap = createBestLap(rd.RaceLaps);
  rd.Consistency = createConsistency(rd.RaceResult, rd.RaceLaps);
  rd.BestSector = createBestSector(rd.RaceLaps);
  rd.Incident = createIncident(devents);

  rd.RaceResult = getLeadLaps(rd.RaceResult, rd.RaceLaps);

  rd.RaceConfig = createRaceConfig(datos, rd.RaceResult, rd.BestLap[0]);

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
