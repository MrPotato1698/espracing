import type { RaceData } from '@/types/Results';
import type { Points } from '@/types/Points';
export interface ResultTableData {
    gridPositionClass: string;
    gainsAbs: string;
    posicionFinal: string;
    driverName: string;
    carColorClass: string;
    carClass: string;
    carBrand: string;
    carName: string;
    team: string;
    totalLaps: string;
    timeadjust: string;
    gap: string;
    interval: string;
    flapClass: string;
    bestlapToString: string;
    tyre: string;
    points: string;
    splitNumber: number;
}

export interface CarData{
  id: number
  filename: string
  model: string
  year: number
  location: string
  power: number
  torque: number
  weight: number
  description: string
  tyreTimeChange: number
  fuelLiterTime: number
  maxLiter: number
  brandID: number
  brandName: string
  classID: number
  className: string
}

export interface CircuitData{
  name: string;
  layout: string;
  location: string;
  length: number;
  capacity: number;
}

export interface RaceFastestLap{
  driverName: string;
  carColorClass: string;
  carClass: string;
  carBrand: string;
  carName: string;
  team: string;
  time: string;
  tyre: string;
  lap:string;
  avgspeed: string;
  points: string;
}

export interface ChampResults{
  champID: number;
  champName: string;
  races: ChampRacesData[];
}

export interface ChampRacesData{
  points: Points;
  raceData1: RaceData | null
  raceData2: RaceData | null;
}
