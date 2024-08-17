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
    Type:            Type;
    WorldPosition:   Position;
    Timestamp:       number;
    AfterSessionEnd: boolean;
}

export interface Position {
    X: number;
    Y: number;
    Z: number;
}

export enum Type {
    CollisionWithCar = "COLLISION_WITH_CAR",
    CollisionWithEnv = "COLLISION_WITH_ENV",
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


const btnCargaTabla = document.querySelector('#btnCargarTabla');
if (btnCargaTabla) {
    btnCargaTabla.addEventListener('click', cargarJSON);
}
async function cargarJSON() {
    //console.log('Dentro de funcion cargarJSON');
    const xhttp = new XMLHttpRequest();
    const opciones = document.querySelector('#select-champs');

    //console.log((opciones as HTMLSelectElement)?.value);
    //var ruta = 'http://es2.assettohosting.com:10018/results/download/' + (opciones as HTMLSelectElement)?.value + '.json';
    var ruta = '../../testRace.json';
    console.log(ruta);
    await fetch(ruta, {
        method: "GET",
    }).then(async (response) => {
        let data = await response.text();
        console.log(data);
        //console.log(this.responseText);
        let datos = JSON.parse(data);
        //console.log(datos);

        let dcars = datos.Cars;
        let devents = datos.Events;
        let dlaps = datos.Laps;
        let dresult = datos.Result;
        let dpenalties = datos.Penalties;
        const resultado = document.querySelector('#resultado');
        if (resultado) {
            resultado.innerHTML = '';
        }
        let pos = 0;
        for (let item of dresult) {
            //console.log(item.DriverName);
            pos = pos + 1;
            let gridPositionClass;
            if ((item.GridPosition - pos) > 0) {
                gridPositionClass = "<i class='fa-solid fa-caret-up' style='color: #00ff04;'>";
            } else if ((item.GridPosition - pos) < 0) {
                gridPositionClass = "<i class='fa-solid fa-caret-down' style='color: #ff0000;'>";
            } else if ((item.GridPosition - pos) === 0) {
                gridPositionClass = "<i class='fa-solid fa-caret-right' style='color: #ffc800;'>";
            }

            // Obtener nombre de equipo + Ping Min-Max
            let carID = item.CarId;
            let equipo;
            for (let item2 of dcars) {
                if (item2.CarId === carID) {
                    equipo = item2.Driver.Team;
                    //console.log(item2.Driver.Team);
                    break;
                }
            }

            // Obtener tiempo total de carrera
            let timeadjust;
            if (item.Disqualified === false) {
                timeadjust = (item.TotalTime / 1000) + (item.PenaltyTime / 1000000000);
                let seconds = Number(Math.round(parseFloat(timeadjust % 60 + 'e' + 3)) + 'e-' + 3).toFixed(3).padStart(2, '0').slice(-2);
                let minutes = Math.trunc(timeadjust / 60).toString().padStart(2, '0').slice(-2);
                let hours = Math.trunc(timeadjust / 3600).toString().padStart(2, '0').slice(-2);
                // if (Number(seconds) < 10) {
                //     seconds.toLocaleString('es-ES', { minimumIntegerDigits: 2, useGrouping: false });
                // }
                // if (minutes < 10) {
                //     minutes.toLocaleString('es-ES', { minimumIntegerDigits: 2, useGrouping: false });
                // }
                // if (hours < 10 && hours !== 0) {
                //     hours.toLocaleString('es-ES', { minimumIntegerDigits: 2, useGrouping: false });
                // }

                if (Number(hours) > 0) {
                    if (item.PenaltyTime !== 0) {
                        timeadjust = hours + ":" + minutes + ":" + seconds + " (+ " + (item.PenaltyTime / 1000000000) + "s)";
                    } else {
                        timeadjust = hours + ":" + minutes + ":" + seconds;
                    }
                } else {
                    if (item.PenaltyTime !== 0) {
                        timeadjust = minutes + ":" + seconds + " (+ " + (item.PenaltyTime / 1000000000) + "s)";
                    } else {
                        timeadjust = minutes + ":" + seconds;
                    }
                }
            } else {
                timeadjust = "DQ";
            }
            //console.log("--" + pos + "--");
            //console.log(item.DriverName + ": " + timeadjust);

            // Obtener numero de vueltas totales / vuelta rapida / neumatico
            let vueltastotales = 0;
            let bestlap = 0;
            let tyre;
            let mediavueltas = 0;
            let cuts = 0;
            for (let item3 of dlaps) {
                if (item3.CarId === carID) {
                    vueltastotales++;
                    if (item3.Cuts < 1) {
                        mediavueltas += item3.LapTime;
                        if (bestlap === 0 || bestlap > item3.LapTime) {
                            bestlap = item3.LapTime;
                            tyre = item3.Tyre;
                        }
                    } else {
                        cuts += 1;
                    }
                }
            }

            // bestlap = (bestlap / 1000);
            // let secondsbl = Number(Math.round(parseFloat(bestlap % 60 + 'e' + 3)) + 'e-' + 3).toFixed(3);
            // let minutesbl = Math.trunc(bestlap / 60);
            // if (secondsbl < 10) {
            //     secondsbl = "0" + secondsbl;
            // }
            // if (minutesbl < 10) {
            //     minutesbl = "0" + minutesbl;
            // }

            // bestlap = minutesbl + ":" + secondsbl;
            // mediavueltas = mediavueltas / (vueltastotales - cuts);
            // mediavueltas = (mediavueltas / 1000);
            // let secondsmv = Number(Math.round(parseFloat(mediavueltas % 60 + 'e' + 3)) + 'e-' + 3).toFixed(3);
            // let minutesmv = Math.trunc(mediavueltas / 60);
            // if (secondsmv < 10) {
            //     secondsmv = "0" + secondsmv;
            // }
            // if (minutesmv < 10) {
            //     minutesmv = "0" + minutesmv;
            // }
            // mediavueltas = minutesmv + ":" + secondsmv;
            // //console.log(mediavueltas+"/"+vueltastotales+"/"+cuts);
            // //console.log(item.DriverName + ": " + vueltastotales);

            let collisions = 0;
            for (let item4 of devents) {
                if (item4.CarId === carID) {
                    collisions += 1;
                }
            }
            if (pos % 2 === 0) {
                resultado.innerHTML += `
                    <tr class="bg-[#0f0f0f]">
                        <td>${pos}</td>                     <!-- Posicion -->
                        <td>${item.DriverName}</td>         <!-- Nombre -->
                        <td>${equipo}</td>                  <!-- Equipo -->
                        <td>${item.CarModel}</td>           <!-- Coche -->
                        <td>${item.GridPosition - pos} ${gridPositionClass}</i></td> <!-- Gan/Per -->
                        <td>${timeadjust}</td>              <!-- Tiempo Total -->
                        <td>${vueltastotales}</td>          <!-- Nº Vueltas -->
                        <td>${bestlap + " (" + tyre + ")"}</td> <!-- Vuelta Rapida  + Neumaticos-->
                        <td>${mediavueltas}</td>            <!-- Media VRapida -->
                        <td>${collisions}</td>              <!-- Colisiones -->
                        <td>${item.BallastKG + " Kg / " + item.Restrictor + "%"}</td>  <!-- Ballast/Restrictor -->
                    </tr>
            `;
            } else {
                resultado.innerHTML += `
                    <tr class="bg-[#19191c]">
                        <td>${pos}</td>                     <!-- Posicion -->
                        <td>${item.DriverName}</td>         <!-- Nombre -->
                        <td>${equipo}</td>                  <!-- Equipo -->
                        <td>${item.CarModel}</td>           <!-- Coche -->
                        <td>${item.GridPosition - pos} ${gridPositionClass}</i></td> <!-- Gan/Per -->
                        <td>${timeadjust}</td>              <!-- Tiempo Total -->
                        <td>${vueltastotales}</td>          <!-- Nº Vueltas -->
                        <td>${bestlap + " (" + tyre + ")"}</td> <!-- Vuelta Rapida  + Neumaticos-->
                        <td>${mediavueltas}</td>            <!-- Media VRapida -->
                        <td>${collisions}</td>              <!-- Colisiones -->
                        <td>${item.BallastKG + " Kg / " + item.Restrictor + "%"}</td>  <!-- Ballast/Restrictor -->
                    </tr>
            `;
            }
        }
    }).catch((error) => {
        console.error(error);
    });
}


