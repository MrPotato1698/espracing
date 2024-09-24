import { cars } from "@/consts/cars";
import { circuits } from "@/consts/circuits";
import { circuitlayouts } from "@/consts/circuitlayouts";
import { createRaceData, formatTwoIntegersPlusThreeDecimals, formatTwoIntegers } from "@/lib/results/resultConverter";

import type { RaceData, RaceResult, RaceLap, Lap, BestLap, Consistency, BestSector, Incident, RaceConfig } from "@/types/Results";

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

            let dcars = datos.Cars;
            let devents = datos.Events;
            let dlaps = datos.Laps;
            let dresult = datos.Result;
            let dpenalties = datos.Penalties;

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
            const sessiontime: number = datos.SessionConfig.time;
            const sessionlaps: number = datos.SessionConfig.laps;
            for (let item of dresult) {
                pos = pos + 1;
                //console.log('Item ',pos, '. Nombre: ',item.DriverName);
                let posicionFinal = pos.toString();
                let gridPositionClass;
                if ((item.GridPosition - pos) > 0) {
                    gridPositionClass = '<svg viewBox="0 0 24 24" fill="#00f000" class="w-6 float mx-auto"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.375 6.22l-5 4a1 1 0 0 0 -.375 .78v6l.006 .112a1 1 0 0 0 1.619 .669l4.375 -3.501l4.375 3.5a1 1 0 0 0 1.625 -.78v-6a1 1 0 0 0 -.375 -.78l-5 -4a1 1 0 0 0 -1.25 0z" /></svg>';
                } else if ((item.GridPosition - pos) < 0) {
                    gridPositionClass = '<svg viewBox="0 0 24 24" fill="#ff0000" class="w-6 float mx-auto rotate-180"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.375 6.22l-5 4a1 1 0 0 0 -.375 .78v6l.006 .112a1 1 0 0 0 1.619 .669l4.375 -3.501l4.375 3.5a1 1 0 0 0 1.625 -.78v-6a1 1 0 0 0 -.375 -.78l-5 -4a1 1 0 0 0 -1.25 0z" /></svg>';
                } else if ((item.GridPosition - pos) === 0) {
                    gridPositionClass = '<svg viewBox="0 0 24 24" fill="#ffc800" class="w-6 float mx-auto rotate-90"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.375 6.22l-5 4a1 1 0 0 0 -.375 .78v6l.006 .112a1 1 0 0 0 1.619 .669l4.375 -3.501l4.375 3.5a1 1 0 0 0 1.625 -.78v-6a1 1 0 0 0 -.375 -.78l-5 -4a1 1 0 0 0 -1.25 0z" /></svg>';
                }

                // Obtener nombre de equipo + Ping Min-Max
                let carID = item.CarId;
                let equipo = "";
                for (let item2 of dcars) {
                    if (item2.CarId === carID) {
                        equipo = item2.Driver.Team;
                        break;
                    }
                }

                // Obtener el nombre real del coche
                const isCarExists = cars.find((car) => car.filename === item.CarModel);
                let carName: string;
                let carBrand: string;
                let carClass: string;
                let carColorClass: string;
                if (isCarExists) {
                    carName = isCarExists.brand + " " + isCarExists.model;
                    carBrand = isCarExists.imgbrand;
                    carClass = getClassShortName(isCarExists.subclass);
                    carColorClass = getColorClass(isCarExists.subclass);
                } else {
                    carName = item.CarModel;
                    carBrand = "";
                    carClass = "";
                    carColorClass = "";
                }

                // Obtener tiempo total de carrera
                let timeadjust;
                if (item.Disqualified === false) {
                    timeadjust = (item.TotalTime / 1000) + (item.PenaltyTime / 1000000000);
                    const seconds = formatTwoIntegersPlusThreeDecimals(timeadjust % 60);
                    const minutes = formatTwoIntegers(Math.trunc((timeadjust / 60) % 60));
                    const hours = formatTwoIntegers(Math.trunc(timeadjust / 3600));
                    //console.log("Pos: "+pos+" ->"+hours+":"+minutes+":"+seconds);

                    if (Number(hours) > 0) {
                        if (parseInt(item.PenaltyTime) !== 0) {
                            timeadjust = hours + ":" + minutes + ":" + seconds + " <span class='rounded bg-[#da392b] text-xs px-1 py-0.5 ml-1'> + " + (item.PenaltyTime / 1000000000) + "s</span>";
                        } else {
                            timeadjust = hours + ":" + minutes + ":" + seconds;
                        }
                    } else {
                        if (parseInt(item.PenaltyTime) !== 0) {
                            timeadjust = minutes + ":" + seconds + " <span class='rounded bg-[#da392b] text-xs px-1 py-0.5 ml-1'> + " + (item.PenaltyTime / 1000000000) + "s";
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
                    if (item3.CarId === carID) {
                        vueltastotales++;
                        if (item3.Cuts < 1) {
                            const currentLap = parseInt(item3.LapTime);
                            mediavueltas = mediavueltas + currentLap;
                            if (bestlap === 0 || bestlap > currentLap) {
                                bestlap = currentLap;
                                tyre = item3.Tyre;
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
                    } else {
                        const timerace = (item.TotalTime / 1000) + (item.PenaltyTime / 1000000000);
                        if (vueltastotales < vueltasLider * 0.9 && ((Math.trunc((timerace / 60) % 60) + Math.trunc(timerace / 60)) < datos.SessionConfig.time)) {
                            posicionFinal = 'DNF';
                        }
                    }
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
                    if (item4.CarId === carID) {
                        collisions += 1;
                    }
                }
                if (pos % 2 === 0) {
                    resultado.innerHTML += `
                            <tr class="bg-[#0f0f0f] text-center">
                                <td class = "font-medium">${posicionFinal.toString()}</td>                     <!-- Posicion -->
                                <td>${item.DriverName}</td>         <!-- Nombre -->
                                <td>${equipo}</td>                  <!-- Equipo -->
                                <td><span ${carColorClass}>${carClass}</span></td>  <!-- Clase del Coche -->
                                <td><img class='w-4 justify-end' src='${carBrand}' alt=''></img></td>           <!-- Logo Coche -->
                                <td>${carName}</td>           <!-- Coche -->
                                <td>${gridPositionClass}</td>     <!-- Gan/Per (Flechas)-->
                                <td class = "text-start">${Math.abs(item.GridPosition - pos)}</td> <!-- Gan/Per (Número)-->
                                <td>${timeadjust}</td>              <!-- Tiempo Total -->
                                <td>${vueltastotales}</td>          <!-- Nº Vueltas -->
                                <td>${bestlapToString + " (" + tyre + ")"}</td> <!-- Vuelta Rapida  + Neumaticos-->
                                <td>${mediavueltasToString}</td>            <!-- Media VRapida -->
                                <td>${collisions}</td>              <!-- Colisiones -->
                                <td>${item.BallastKG + " Kg / " + item.Restrictor + "%"}</td>  <!-- Ballast/Restrictor -->
                            </tr>
                    `;
                } else {
                    resultado.innerHTML += `
                            <tr class="bg-[#19191c] text-center">
                                <td class = "font-medium">${posicionFinal.toString()}</td>                     <!-- Posicion -->
                                <td>${item.DriverName}</td>         <!-- Nombre -->
                                <td>${equipo}</td>                  <!-- Equipo -->
                                <td><span ${carColorClass}>${carClass}</span></td>  <!-- Clase del Coche -->
                                <td><img class='w-4 justify-end' src='${carBrand}' alt=''></img></td>           <!-- Logo Coche -->
                                <td>${carName}</td>           <!-- Coche -->
                                <td>${gridPositionClass}</td>     <!-- Gan/Per (Flechas)-->
                                <td class = "text-start">${Math.abs(item.GridPosition - pos)}</td> <!-- Gan/Per (Número)-->
                                <td>${timeadjust}</td>              <!-- Tiempo Total -->
                                <td>${vueltastotales}</td>          <!-- Nº Vueltas -->
                                <td>${bestlapToString + " (" + tyre + ")"}</td> <!-- Vuelta Rapida  + Neumaticos-->
                                <td>${mediavueltasToString}</td>            <!-- Media VRapida -->
                                <td>${collisions}</td>              <!-- Colisiones -->
                                <td>${item.BallastKG + " Kg / " + item.Restrictor + "%"}</td>  <!-- Ballast/Restrictor -->
                            </tr>
                    `;
                }
            }

            // Pista y datos de la carrera

            const isCircuitExists = circuits.find((circuit) => circuit.filename === datos.TrackName);
            if (isCircuitExists) {
                const circuitName = isCircuitExists.name;
                const circuitLocation = isCircuitExists.location;
                if (datos.TrackConfig === null || datos.TrackConfig === undefined || datos.TrackConfig === "") {
                    datos.TrackConfig = "";
                }
                const layout = circuitlayouts.find((layout) => (layout.filename === datos.TrackConfig) && (layout.circuit === isCircuitExists.id));
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

function getColorClass(carClass: string): string {
    let result: string = "class='";
    switch (carClass) {
        case "GT3":
            result += "bg-[#00df1b] text-[#f9f9f9]";
            break;
        case "GT4":
            result += "bg-[#ff8f00] text-[#f9f9f9]";
            break;
        case "DTM":
            result += "bg-[#02315b] text-[#e0ff80]";
            break;
        case "JTC Div.III":
            result += "text-[#ff0000] bg-[#f9f9f9]";
            result
            break;
        case "Formula 4":
            result += "bg-[#c5c5c5] text-[#0f0f0f]";
            break;
        case "LMDh":
            result += "bg-[#ff0000] text-[#f9f9f9]";
            break;
        case "LMH":
            result += "bg-[#ff0000] text-[#f9f9f9]";
            break;
        case "Twingo Cup":
            result += "bg-[#ffe000] text-[#0f0f0f]";
            break;
        case "A110 Cup":
            result += "bg-[#006fba] text-[#f9f9f9]";
            break;
        case "Nascar Le Mans":
            result += "bg-[#0f0f0f] text-[#f9f9f9]";
            break;
        case "DPi":
            result += "bg-[#0f0f0f] text-[#f9f9f9]";
            break;
        case "F1":
            result += "bg-[#ff0000] text-[#f9f9f9]";
            break;
        case "F2":
            result += "bg-[#0055ff] text-[#f9f9f9]";
            break;
        case "Clio Cup":
            result += "bg-[#ffe000] text-[#0f0f0f]";
            break;
        case "M2 CS Cup":
            result += "bg-[#0055ff] text-[#f9f9f9]";
            break;
        case "BTCC":
            result += "bg-[#0f00ff] text-[#f9f9f9]";
            break;
        case "Prototype >5000":
            result += "bg-[#f9f9f9] text-[#0f0f0f]";
            break;
        case "GT2":
            result += "bg-[#f9f9f9] text-[#ff0000]";
            break;
        case "Light Prototype":
            result += "bg-[#00fbff] text-[#0f0f0f]";
            break;
        case "TNC3":
            result += "bg-[#f9f9f9] text-[#0f0f0f]";
            break;
        case "Trophy Truck":
            result += "bg-[#0f0f0f] text-[#f9f9f9]";
            break;
        case "Supercar":
            result += "bg-[#ff9300] text-[#0f0f0f]";
            break;
    }
    result += " rounded text-xs font-bold px-1 py-0.5 ml-1'";
    return result;
}

function getClassShortName(carClass: string): string {
    let result: string = "";
    switch (carClass) {
        case "GT3":
            result += "GT3";
            break;
        case "GT4":
            result += "GT4";
            break;
        case "DTM":
            result += "DTM";
            break;
        case "JTC Div.III":
            result += "JTC Div.3";
            break;
        case "Formula 4":
            result += "F4";
            break;
        case "LMDh":
            result += "LMDh";
            break;
        case "LMH":
            result += "LMH";
            break;
        case "Twingo Cup":
            result += "CUP";
            break;
        case "A110 Cup":
            result += "CUP";
            break;
        case "Nascar Le Mans":
            result += "Nascar";
            break;
        case "DPi":
            result += "DPi";
            break;
        case "F1":
            result += "F1";
            break;
        case "F2":
            result += "F2";
            break;
        case "Clio Cup":
            result += "CUP";
            break;
        case "M2 CS Cup":
            result += "CUP";
            break;
        case "BTCC":
            result += "BTCC";
            break;
        case "Prototype >5000":
            result += ">5.0L";
            break;
        case "GT2":
            result += "GT2";
            break;
        case "Light Prototype":
            result += "Proto";
            break;
        case "TNC3":
            result += "TNC3";
            break;
        case "Trophy Truck":
            result += "TT";
            break;
        case "Supercar":
            result += "SC";
            break;
    }
    return result;
}

