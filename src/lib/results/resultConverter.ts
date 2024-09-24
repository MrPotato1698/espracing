import type { RaceData, RaceResult, RaceLap, Lap, BestLap, Consistency, BestSector, Incident, RaceConfig } from "@/types/Results";
import type { GeneralDataJSON, CarJSON, DriverJSON, EventJSON, PositionJSON, LapJSON, ConditionsJSON, ResultJSON, PenaltiesJSON, SessionConfigJSON } from "@/types/ResultsJSON";

function createRaceResults(dcars: CarJSON[], devents: EventJSON[], dlaps: LapJSON[], dresult: ResultJSON[], raceTime: number): RaceResult[] {
  let rr: RaceResult[] = [];
  let pos: number = 0;
  let vueltasLider = 0;

  //TODO: Añadir las vueltas lideradas por cada piloto

  for (let item of dresult) {
    pos = pos + 1;

    let uniqueRR: RaceResult = {} as RaceResult;

    uniqueRR.SteamID = item.DriverGuid;
    uniqueRR.CarId = item.CarId;
    uniqueRR.DriverName = item.DriverName;

    // Obtener nombre de equipo (uniqueRR.Team)
    let carID = item.CarId;
    for (let item2 of dcars) {
      if (item2.CarId === carID) {
        uniqueRR.Team = item2.Driver.Team;
        break;
      }
    }

    uniqueRR.CarFileName = item.CarModel;
    uniqueRR.GridPosition = item.GridPosition;
    uniqueRR.TotalTime = item.TotalTime / 1000;
    uniqueRR.Penalties = item.PenaltyTime / 1000;
    uniqueRR.Laps = item.NumLaps;
    uniqueRR.BestLap = item.BestLap / 1000;

    // Obtener tiempo medio de carrera (uniqueRR.AvgLap)
    uniqueRR.AvgLap = 0;
    for (let item3 of dlaps) {
      if (item3.CarId === uniqueRR.CarId) {
        if (item3.Cuts < 1) {
          const currentLap = item3.LapTime;
          uniqueRR.AvgLap = uniqueRR.AvgLap + currentLap;
        }
      }
    }

    // Obtener posición final (uniqueRR.Pos)
    if (pos === 1) {
      vueltasLider = uniqueRR.Laps;
    } else {
      if (item.Disqualified === true) {
        uniqueRR.Pos = -2;
      } else {
        const timerace = (item.TotalTime / 1000) + (item.PenaltyTime / 1000000000);
        if (uniqueRR.Laps < vueltasLider * 0.9 && ((Math.trunc((timerace / 60) % 60) + Math.trunc(timerace / 60)) < raceTime)) {
          uniqueRR.Pos = -1;
        } else {
          uniqueRR.Pos = pos;
        }
      }
    }


    // Obtener colisiones (uniqueRR.Collisions)
    uniqueRR.Collisions = 0;
    for (let item4 of devents) {
      if (item4.CarId === uniqueRR.CarId) {
        uniqueRR.Collisions += 1;
      }
    }
    uniqueRR.Ballast = item.BallastKG;
    uniqueRR.Restrictor = item.Restrictor;
    rr.push(uniqueRR);
  }
  return rr;
}

function createRaceLap(dcars: CarJSON[], devents: EventJSON[], dlaps: LapJSON[], dresult: ResultJSON[], rr: RaceResult[]): RaceLap[] {
  let rl: RaceLap[] = [];
  return rl;
}

function createBestLap(dlaps: LapJSON[], dresult: ResultJSON[]): BestLap[] {
  let bl: BestLap[] = [];
  return bl;
}

function createConsistency(rl: RaceLap[]): Consistency[] {
  let c: Consistency[] = [];
  return c;
}

function createBestSector(rl: RaceLap[]): BestSector[] {
  let bs: BestSector[] = [];
  return bs;
}

function createIncident(devents: EventJSON[], dpenalties: PenaltiesJSON[]): Incident[] {
  let i: Incident[] = [];
  return i;
}

function createRaceConfig(datos: GeneralDataJSON): RaceConfig {
  let rc: RaceConfig = {} as RaceConfig;
  rc.RaceID = datos.SessionFile;
  rc.Date = datos.Date;
  rc.Session = datos.Type;
  rc.Track = datos.TrackName;
  rc.TrackLayout = datos.TrackConfig;
  rc.Winner = datos.Result[0].DriverName;
  //TODO: rc.LedMostLaps; Piloto que más vueltas ha liderado
  //TODO: rc.BestLap; Mejor vuelta de la carrera
  rc.NumberOfLaps = datos.Result[0].NumLaps;
  if (datos.SessionConfig.time > 0) {
    rc.RaceDurationTime = datos.SessionConfig.time;
  }
  if (datos.SessionConfig.laps > 0) {
    rc.NumberOfLaps = datos.SessionConfig.laps;
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
  const dpenalties = datos.Penalties;

  rd.RaceResult = createRaceResults(dcars, devents, dlaps, dresult, datos.SessionConfig.time);
  rd.RaceLaps = createRaceLap(dcars, devents, dlaps, dresult, rd.RaceResult);
  rd.BestLap = createBestLap(dlaps, dresult);
  rd.Consistency = createConsistency(rd.RaceLaps);
  rd.BestSector = createBestSector(rd.RaceLaps);
  rd.Incident = createIncident(devents, dpenalties);
  rd.RaceConfig = createRaceConfig(datos);
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
