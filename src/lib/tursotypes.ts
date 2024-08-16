export interface Car {
  id?: number;
  filename: string;
  brand?: string;
  imgbrand?: string;
  model?: string;
  year?: number;
  class?: string;
  power?: number;
  torque?: number;
  weight?: number;
  description?: string;
}

export interface Championship {
  id: number;
  name: string;
  key_search: string;
}

export interface Circuit {
  id?: number;
  name?: string;
  filename: string,
  location?: string;
}


export interface CircuitLayout {
  id?: number;
  name?: string;
  filename?: string;
  circuit?: number;
  length?: number;
  capacity?: number;
};


export interface Inscription {
  id?: number;
  race?: string;
  user: string;
  valid_laps?: number;
  position?: number;
};


export interface Message {
  id?: number;
  name_emissor: string,
  name_receiver: number;
  discord?: string;
  region?: string;
  description?: string;
  readed: number;
};


export interface Race {
  id?: number;
  name?: string;
  filename?: string;
  championship?: number;
};


export interface Role {
  id?: number;
  name: string;
};


export interface Team {
  id?: number;
  name: string;
  image?: string;
  description?: string;
};


export interface User {
  id?: number;
  email: string;
  password: string;
  name?: string;
  steam_id?: string;
  image: string;
  races: number;
  poles: number;
  wins: number;
  flaps: number;
  podiums: number;
  top5: number;
  top10: number;
  dnf: number;
  role: number;
  team?: number;
  is_team_manager: number;
};