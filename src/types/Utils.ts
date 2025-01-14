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
    filename: string;
    brand: string;
    model: string;
    classShortName: string;
    classColor: string;
    imgbrand: string;
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