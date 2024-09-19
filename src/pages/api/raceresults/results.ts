import { cars } from "@/consts/cars";
import { circuits } from "@/consts/circuits";
import { circuitlayouts } from "@/consts/circuitlayouts";
import type { RaceResult, RaceLap, Lap, BestLap, Consistency, BestSector, Incident, RaceData } from "@/types/Results";
/* *************************** */

function initializeScript() {
    const loadButton = document.getElementById('loadButton');
    const opcionesTabla = document.getElementById('select-champs') as HTMLSelectElement;

    const resultado = document.getElementById('resultado');
    const resultadoPista = document.getElementById('resultado2');

    async function loadTable() {
        const seleccion = opcionesTabla.value;
        if (!seleccion) {
            alert('Por favor, selecciona una opción');
            return;
        }

        try {
            const response = await fetch(`/api/raceresults/getRaceResults?race=${seleccion}`);
            const datos = await response.json();
            //console.log('Datos a usar: ', datos);

            let dcars = datos.Cars.arrayValue.values;
            let devents = datos.Events.arrayValue.values;
            let dlaps = datos.Laps.arrayValue.values;
            let dresult = datos.Result.arrayValue.values;
            let dpenalties = datos.Penalties.arrayValue.values;

            if (resultado) {
                resultado.innerHTML = '';
            } else {
                throw new Error('Elemento con id "resultado" no encontrado.');
            }

            if (resultadoPista) {
                resultadoPista.innerHTML = '';
            } else {
                throw new Error('Elemento con id "resultado2" no encontrado.');
            }

            let pos: number = 0;
            let vueltasLider: number = 0;
            for (let item of dresult) {
                pos = pos + 1;
                item = item.mapValue.fields;
                //console.log('Item ',pos, '. Nombre: ',item.DriverName.stringValue);
                let posicionFinal = pos.toString();
                let gridPositionClass;
                if ((item.GridPosition.integerValue - pos) > 0) {
                    gridPositionClass = '<svg viewBox="0 0 24 24" fill="#00f000" class="w-6 float mx-auto"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.375 6.22l-5 4a1 1 0 0 0 -.375 .78v6l.006 .112a1 1 0 0 0 1.619 .669l4.375 -3.501l4.375 3.5a1 1 0 0 0 1.625 -.78v-6a1 1 0 0 0 -.375 -.78l-5 -4a1 1 0 0 0 -1.25 0z" /></svg>';
                } else if ((item.GridPosition.integerValue - pos) < 0) {
                    gridPositionClass = '<svg viewBox="0 0 24 24" fill="#ff0000" class="w-6 float mx-auto rotate-180"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.375 6.22l-5 4a1 1 0 0 0 -.375 .78v6l.006 .112a1 1 0 0 0 1.619 .669l4.375 -3.501l4.375 3.5a1 1 0 0 0 1.625 -.78v-6a1 1 0 0 0 -.375 -.78l-5 -4a1 1 0 0 0 -1.25 0z" /></svg>';
                } else if ((item.GridPosition.integerValue - pos) === 0) {
                    gridPositionClass = '<svg viewBox="0 0 24 24" fill="#ffc800" class="w-6 float mx-auto rotate-90"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.375 6.22l-5 4a1 1 0 0 0 -.375 .78v6l.006 .112a1 1 0 0 0 1.619 .669l4.375 -3.501l4.375 3.5a1 1 0 0 0 1.625 -.78v-6a1 1 0 0 0 -.375 -.78l-5 -4a1 1 0 0 0 -1.25 0z" /></svg>';
                }

                // Obtener nombre de equipo + Ping Min-Max
                let carID = item.CarId.integerValue;
                let equipo = "";
                for (let item2 of dcars) {
                    item2 = item2.mapValue.fields;
                    if (item2.CarId.integerValue === carID) {
                        equipo = item2.Driver.mapValue.fields.Team.stringValue;
                        break;
                    }
                }

                // Obtener el nombre real del coche
                const isCarExists = cars.find((car) => car.filename === item.CarModel.stringValue);
                let carName: string;
                let carBrand: string;
                if (isCarExists) {
                    carName = isCarExists.brand + " " + isCarExists.model;
                    carBrand = isCarExists.imgbrand;
                } else {
                    carName = item.CarModel;
                    carBrand = "";
                }

                // Obtener tiempo total de carrera
                let timeadjust;
                if (item.Disqualified.booleanValue === false) {
                    timeadjust = (item.TotalTime.integerValue / 1000) + (item.PenaltyTime.integerValue / 1000000000);
                    let seconds = formatTwoIntegersPlusThreeDecimals(timeadjust % 60);
                    let minutes = formatTwoIntegers(Math.trunc((timeadjust / 60) % 60));
                    let hours = formatTwoIntegers(Math.trunc(timeadjust / 3600));
                    //console.log("Pos: "+pos+" ->"+hours+":"+minutes+":"+seconds);

                    if (Number(hours) > 0) {
                        if (parseInt(item.PenaltyTime.integerValue) !== 0) {
                            timeadjust = hours + ":" + minutes + ":" + seconds + " <span class='rounded bg-[#da392b] text-xs px-1 py-0.5 ml-1'> + " + (item.PenaltyTime.integerValue / 1000000000) + "s</span>";
                        } else {
                            timeadjust = hours + ":" + minutes + ":" + seconds;
                        }
                    } else {
                        if (parseInt(item.PenaltyTime.integerValue) !== 0) {
                            timeadjust = minutes + ":" + seconds + " <span class='rounded bg-[#da392b] text-xs px-1 py-0.5 ml-1'> + " + (item.PenaltyTime.integerValue / 1000000000) + "s";
                        } else {
                            timeadjust = minutes + ":" + seconds;
                        }
                    }
                } else {
                    timeadjust = "DQ";
                }

                // Obtener numero de vueltas totales / vuelta rapida / neumatico
                let vueltastotales = 0;
                let bestlap = 0;
                let bestlapToString: string;
                let tyre;
                let mediavueltas: number = 0;
                let mediavueltasToString: string;
                let cuts = 0;
                for (let item3 of dlaps) {
                    item3 = item3.mapValue.fields;
                    if (item3.CarId.integerValue === carID) {
                        vueltastotales++;
                        if (item3.Cuts.integerValue < 1) {
                            const currentLap = parseInt(item3.LapTime.integerValue);
                            mediavueltas = mediavueltas + currentLap;
                            if (bestlap === 0 || bestlap > currentLap) {
                                bestlap = currentLap;
                                tyre = item3.Tyre.stringValue;
                            }
                        } else {
                            cuts += 1;
                        }
                    }
                }
                if (tyre === undefined || tyre === null || tyre === "") {
                    tyre = "ND";
                }

                if (pos === 1) {
                    vueltasLider = vueltastotales;
                } else {
                    if (timeadjust === 'DQ') {
                        posicionFinal = 'DQ';
                    } else if (vueltastotales < vueltasLider * 0.9)
                        posicionFinal = 'DNF';
                }

                bestlap = (bestlap / 1000);
                let secondsbl = formatTwoIntegersPlusThreeDecimals(bestlap % 60);
                let minutesbl = formatTwoIntegers(Math.trunc((bestlap / 60) % 60));

                //console.log("Mejor vuelta Usuario ", pos, ": " + bestlap);

                bestlapToString = minutesbl.toString() + ":" + secondsbl.toString();
                //bestlap = minutesbl.toString + ":" + secondsbl.toString;
                mediavueltas = mediavueltas / (vueltastotales - cuts);
                mediavueltas = (mediavueltas / 1000);
                // console.log("Media vueltas Usuario ", pos, ": " + mediavueltas);
                let secondsmv = formatTwoIntegersPlusThreeDecimals(mediavueltas % 60);
                let minutesmv = formatTwoIntegers(Math.trunc((mediavueltas / 60) % 60));

                if (mediavueltas === 0 || isNaN(mediavueltas)) {
                    mediavueltasToString = "ND";
                } else {
                    mediavueltasToString = minutesmv + ":" + secondsmv;
                }
                //console.log(mediavueltas+"/"+vueltastotales+"/"+cuts);
                //console.log(item.DriverName + ": " + vueltastotales);

                let collisions = 0;
                for (let item4 of devents) {
                    item4 = item4.mapValue.fields;
                    if (item4.CarId.integerValue === carID) {
                        collisions += 1;
                    }
                }
                if (pos % 2 === 0) {
                    resultado.innerHTML += `
                    <tr class="bg-[#0f0f0f] text-center">
                        <td class = "font-medium">${posicionFinal.toString()}</td>                     <!-- Posicion -->
                        <td>${item.DriverName.stringValue}</td>         <!-- Nombre -->
                        <td>${equipo}</td>                  <!-- Equipo -->
                        <td><img class='w-4 justify-end' src='${carBrand}' alt=''></img></td>           <!-- Logo Coche -->
                        <td>${carName}</td>           <!-- Coche -->
                        <td>${gridPositionClass}</td>     <!-- Gan/Per (Flechas)-->
                        <td class = "text-start">${Math.abs(item.GridPosition.integerValue - pos)}</td> <!-- Gan/Per (Número)-->
                        <td>${timeadjust}</td>              <!-- Tiempo Total -->
                        <td>${vueltastotales}</td>          <!-- Nº Vueltas -->
                        <td>${bestlapToString + " (" + tyre + ")"}</td> <!-- Vuelta Rapida  + Neumaticos-->
                        <td>${mediavueltasToString}</td>            <!-- Media VRapida -->
                        <td>${collisions}</td>              <!-- Colisiones -->
                        <td>${item.BallastKG.integerValue + " Kg / " + item.Restrictor.integerValue + "%"}</td>  <!-- Ballast/Restrictor -->
                    </tr>
            `;
                } else {
                    resultado.innerHTML += `
                    <tr class="bg-[#19191c] text-center">
                        <td class = "font-medium">${posicionFinal.toString()}</td>                     <!-- Posicion -->
                        <td>${item.DriverName.stringValue}</td>         <!-- Nombre -->
                        <td>${equipo}</td>                  <!-- Equipo -->
                        <td><img class='w-4 justify-end' src='${carBrand}' alt=''></img></td>           <!-- Logo Coche -->
                        <td>${carName}</td>           <!-- Coche -->
                        <td>${gridPositionClass}</td>     <!-- Gan/Per (Flechas)-->
                        <td class = "text-start">${Math.abs(item.GridPosition.integerValue - pos)}</td> <!-- Gan/Per (Número)-->
                        <td>${timeadjust}</td>              <!-- Tiempo Total -->
                        <td>${vueltastotales}</td>          <!-- Nº Vueltas -->
                        <td>${bestlapToString + " (" + tyre + ")"}</td> <!-- Vuelta Rapida  + Neumaticos-->
                        <td>${mediavueltasToString}</td>            <!-- Media VRapida -->
                        <td>${collisions}</td>              <!-- Colisiones -->
                        <td>${item.BallastKG.integerValue + " Kg / " + item.Restrictor.integerValue + "%"}</td>  <!-- Ballast/Restrictor -->
                    </tr>
            `;
                }
            }

            // Pista y datos de la carrera

            const isCircuitExists = circuits.find((circuit) => circuit.filename === datos.TrackName.stringValue);
            if (isCircuitExists) {
                const circuitName = isCircuitExists.name;
                const circuitLocation = isCircuitExists.location;
                if (datos.TrackConfig.stringValue === null || datos.TrackConfig.stringValue === undefined || datos.TrackConfig.stringValue === "") {
                    datos.TrackConfig.stringValue = "noname_trackconfig";
                }
                const layout = circuitlayouts.find((layout) => (layout.filename === datos.TrackConfig.stringValue) && (layout.circuit === isCircuitExists.id));
                const layoutName = layout?.name;
                const layoutLength = layout?.length;
                const layoutCapacity = layout?.capacity;

                resultadoPista.innerHTML += `
                <div class="text-center bg-[#19191c] rounded-lg py-5" style = "width=99%">
                <p class = "text-3xl font-bold border-b border-[#da392b] w-fit mx-auto mb-2">Datos del circuito</p>
                    <div class = "grid grid-cols-1">
                        <p class="text-2xl font-semibold">Circuito: ${circuitName} (Variante ${layoutName})</p>
                        <p class="text-xl">Localización: ${circuitLocation}</p>
                    </div>
                    <div class = "grid grid-cols-2 text-lg mt-2">
                        <p>Longitud: ${layoutLength} m</p>
                        <p>Capacidad: ${layoutCapacity} pilotos</p>
                    </div>
                </div>
                <p class="text-3xl font-bold border-b border-[#da392b] w-fit mx-auto mt-4 mb-2">Resultado de carrera</p>
            `;
            }

        } catch (error) {
            console.error(error);
        }
    }
    if (loadButton) {
        loadButton.addEventListener('click', loadTable);
    } else {
        console.error('Elemento con id "loadButton" no encontrado.');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScript);
} else {
    initializeScript();
}

// Maneja las transiciones de página de Astro
document.addEventListener('astro:page-load', initializeScript);


function formatTwoIntegersPlusThreeDecimals(num: number) {
    const integerPart = Math.floor(Math.abs(num)).toString().padStart(2, '0');
    const decimalPart = Math.abs(num % 1).toFixed(3).slice(2);
    const sign = num < 0 ? '-' : '';
    return `${sign}${integerPart}.${decimalPart}`;
}

function formatTwoIntegers(num: number): string {
    return Math.abs(num).toString().padStart(2, '0').slice(-2);
}

function createRaceResults(dcars: string[], devents: string[], dlaps: string[], dresult: string[]): RaceResult[] {
    let rr: RaceResult[] = [];
    return rr;
}

function createRaceLap(dcars: string[], devents: string[], dlaps: string[], dresult: string[], rr: RaceResult[]): RaceLap[] {
    let rl: RaceLap[] = [];
    return rl;
}

function createBestLap(dlaps: string[], dresult: string[]): BestLap[] {
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

function createIncident(devents: string[], dpenalties: string[]): Incident[] {
    let i: Incident[] = [];
    return i;
}

function createRaceData(datos: any): RaceData {
    let rd: RaceData = {} as RaceData;
    return rd;
}

