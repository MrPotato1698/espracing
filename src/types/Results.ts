export interface RaceData{
  RaceResult: RaceResult[];
  RaceLaps: RaceLap [];
  BestLap: BestLap [];
  Consistency: Consistency [];
  BestSector: BestSector [];
  Incident: Incident [];
  RaceConfig: RaceConfig;
}

export interface RaceResult {
  SteamID: string;
  CarId: number;
  Pos: number;
  DriverName: string;
  Team: string;
  CarFileName: string;
  //GridPositionClass: string;
  GridPosition: number;
  TotalTime: number;
  Penalties: number;
  Laps: number;
  BestLap: number;
  AvgLap: number;
  Collisions: number;
  LedLaps: number;
  Ballast: number;
  Restrictor: number;
  Split: number;
}

export interface RaceLap{
  DriverName: string;
  SteamID: string;
  Split: number;
  Laps: Lap [];
  Average: number[];
  Best: number[];
  Optimal: number[];
}

export interface Lap {
  LapNumber: number;
  Position: number;
  CarFileName: string;
  LapTime: number;
  Sector: number[];
  Tyre: string;
  Cut: number;
  Timestamp: number;
  GaptoFirst: number;
}

export interface BestLap{
  DriverName: string;
  SteamID: string;
  CarFileName: string;
  BestLap: number;
  Gap: number;
  Tyre: string;
}

export interface Consistency{
  DriverName: string;
  SteamID: string;
  CarFileName: string;
  Consistency: number;
}

export interface BestSector{
  SectorNumber: number;
  DriverName: string;
  SteamID: string;
  CarFileName: string;
  BestSector: number;
}

export interface Incident{
  Date: string;
  Incident: string;
  AfterSession: boolean;
}

export interface RaceConfig{
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
  NumberofSplits: number;
}

export interface RaceDriversResume{
  DriverName: string;
  SteamID: string;
  Position: number;
  BestLap: Boolean;
}

export interface RaceCarResume{
  CarFileName: string;
  CarClassID: number;
  numberOfCars: number;
}