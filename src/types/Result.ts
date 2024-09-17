export interface Welcome {
  Version:        number;
  Cars:           Car[];
  Events:         Event[];
  Laps:           Lap[];
  Result:         Result[];
  Penalties:      null;
  TrackConfig:    string;
  TrackName:      string;
  Type:           string;
  Date:           Date;
  SessionFile:    string;
  SessionConfig:  SessionConfig;
  ChampionshipID: string;
  RaceWeekendID:  string;
}

export interface Car {
  BallastKG:  number;
  CarId:      number;
  Driver:     Driver;
  Model:      string;
  Restrictor: number;
  Skin:       string;
  ClassID:    string;
  MinPing:    number;
  MaxPing:    number;
}

export interface Driver {
  Guid:      string;
  GuidsList: string[] | null;
  Name:      string;
  Nation:    string;
  Team:      string;
  ClassID:   string;
}

export interface Event {
  CarId:           number;
  Driver:          Driver;
  ImpactSpeed:     number;
  OtherCarId:      number;
  OtherDriver:     Driver;
  RelPosition:     Position;
  Type:            string;
  WorldPosition:   Position;
  Timestamp:       number;
  AfterSessionEnd: boolean;
}

export interface Position {
  X: number;
  Y: number;
  Z: number;
}

export interface Lap {
  BallastKG:               number;
  CarId:                   number;
  CarModel:                string;
  Cuts:                    number;
  DriverGuid:              string;
  DriverName:              string;
  LapTime:                 number;
  Restrictor:              number;
  Sectors:                 number[];
  Timestamp:               number;
  Tyre:                    string;
  ClassID:                 string;
  ContributedToFastestLap: boolean;
  SpeedTrapHits:           any[] | null;
  Conditions:              Conditions;
}

export interface Conditions {
  Ambient:       number;
  Road:          number;
  Grip:          number;
  WindSpeed:     number;
  WindDirection: number;
  RainIntensity: number;
  RainWetness:   number;
  RainWater:     number;
}

export interface Result {
  BallastKG:    number;
  BestLap:      number;
  CarId:        number;
  CarModel:     string;
  DriverGuid:   string;
  DriverName:   string;
  Restrictor:   number;
  TotalTime:    number;
  NumLaps:      number;
  HasPenalty:   boolean;
  PenaltyTime:  number;
  LapPenalty:   number;
  Disqualified: boolean;
  ClassID:      string;
  GridPosition: number;
}

export interface SessionConfig {
  session_type:                         number;
  name:                                 string;
  time:                                 number;
  laps:                                 number;
  is_open:                              number;
  wait_time:                            number;
  visibility_mode:                      number;
  qualifying_type:                      number;
  qualifying_number_of_laps_to_average: number;
  count_out_lap:                        boolean;
  disable_push_to_pass:                 boolean;
}