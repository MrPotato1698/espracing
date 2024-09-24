export interface GeneralDataJSON {
  Version:        number;
  Cars:           CarJSON[];
  Events:         EventJSON[];
  Laps:           LapJSON[];
  Result:         ResultJSON[];
  Penalties:      null;
  TrackConfig:    string;
  TrackName:      string;
  Type:           string;
  Date:           string;
  SessionFile:    string;
  SessionConfig:  SessionConfigJSON;
  ChampionshipID: string;
  RaceWeekendID:  string;
}

export interface CarJSON {
  BallastKG:  number;
  CarId:      number;
  Driver:     DriverJSON;
  Model:      string;
  Restrictor: number;
  Skin:       string;
  ClassID:    string;
  MinPing:    number;
  MaxPing:    number;
}

export interface DriverJSON {
  Guid:      string;
  GuidsList: string[] | null;
  Name:      string;
  Nation:    string;
  Team:      string;
  ClassID:   string;
}

export interface EventJSON {
  CarId:           number;
  Driver:          DriverJSON;
  ImpactSpeed:     number;
  OtherCarId:      number;
  OtherDriver:     DriverJSON;
  RelPosition:     PositionJSON;
  Type:            string;
  WorldPosition:   PositionJSON;
  Timestamp:       number;
  AfterSessionEnd: boolean;
}

export interface PositionJSON {
  X: number;
  Y: number;
  Z: number;
}

export interface LapJSON {
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
  Conditions:              ConditionsJSON;
}

export interface ConditionsJSON {
  Ambient:       number;
  Road:          number;
  Grip:          number;
  WindSpeed:     number;
  WindDirection: number;
  RainIntensity: number;
  RainWetness:   number;
  RainWater:     number;
}

export interface ResultJSON {
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

export interface PenaltiesJSON {
  DriverName:          string;
  DriverGuid:          string;
  CaraId:              number;
  GivenOnLap:          number;
  GivenAtTime:         number;
  InfractionType:      number;
  PenaltyType:         number;
  BoPAmount:           number;
  BoPClearedInNumLaps: number;
  DriveThroughNumLaps: number;
  TimePenaltyDuration: number;
}

export interface SessionConfigJSON {
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
