export interface RaceResult {
  SteamID: string;
  CarId: number;
  Pos: number;
  DriverName: string;
  Team: string;
  CarFileName: string;
  GridPositionClass: string;
  GridPosition: number;
  TotalTime: number;
  Penalties: number;
  Laps: number;
  BestLap: number;
  AvgLap: number;
  Collisions: number;
  Ballast: number;
  Restrictor: string;
}

export interface RaceLap{
  DriverName: string;
  SteamID: string;
  Laps: Lap [];
  Average: number[];
  Best: number[];
}

export interface Lap {
  LapNumber: number;
  Position: number;
  CarFileName: string;
  LapTime: number;
  Sector: number[];
  Tyre: string;
}

export interface BestLap{
  DriverName: string;
  CarFileName: string;
  BestLap: number;
  Gap: number;
  Tyre: string;
}

export interface Consistency{
  DriverName: string;
  CarFileName: string;
  Consistency: number;
}

export interface BestSector{
  DriverName: string;
  CarFileName: string;
  BestSector: number;
  Gap: number;
}

export interface Incident{
  Date: string;
  Incident: string;
  Penalty: string;
}

export interface RaceData{
  RaceID: string;
  Date: string;
  Session: string;
  Track: string;
  TrackLayout: string;
  Winner: string;
  LedMostLaps: string;
  BestLap: BestLap;
  NumberOfLaps: number;
  RaceDurationTime: number;
  RaceDurationLaps: number;
  DisableP2P: boolean;
}