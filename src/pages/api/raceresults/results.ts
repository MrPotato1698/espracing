import { cars } from "@/consts/cars";
import { circuits } from "@/consts/circuits";
import { circuitlayouts } from "@/consts/circuitlayouts";
import { createRaceData, formatTwoIntegersPlusThreeDecimals, formatTwoIntegers } from "@/lib/results/resultConverter";
import ApexCharts from 'apexcharts';

import type { RaceData, RaceResult, RaceLap, Lap, BestLap, Consistency, BestSector, Incident, RaceConfig } from "@/types/Results";

/* *************************** */

function initializeScript() {
    const loadButton = document.getElementById('loadButton');
    const opcionesTabla = document.getElementById('select-champs') as HTMLSelectElement;

    const tablaResultados = document.getElementById('tablaResultados');
    const datosCircuito = document.getElementById('datosCircuito');

    const chartCambiosPosiciones = document.getElementById('chartCambiosPosiciones');

    async function loadTable() {
        const seleccion = opcionesTabla.value;
        if (!seleccion) {
            alert('Por favor, selecciona una opción');
            return;
        }

        try {
            // const response = await fetch(`/api/raceresults/getRaceResults?race=${seleccion}`);
            const response = await fetch(`/testRace5.json`); //Pruebas para no leer constantemente de la BD

            const datosRAW = await response.json();
            //console.log('DatosRAW a usar: ', datosRAW);

            const datos: RaceData = createRaceData(datosRAW);
            console.log('Datos a usar: ', datos);

            const dresult: RaceResult[] = datos.RaceResult;
            const dlaps: RaceLap[] = datos.RaceLaps;
            const dbestlaps: BestLap[] = datos.BestLap;
            const dconsistency: Consistency[] = datos.Consistency;
            const dbestsectors: BestSector[] = datos.BestSector;
            const devents: Incident[] = datos.Incident;
            const dconfig: RaceConfig = datos.RaceConfig;

            if (tablaResultados) {
                tablaResultados.innerHTML = '';
            } else {
                throw new Error('Elemento con id "resultado" no encontrado.');
            }

            if (datosCircuito) {
                datosCircuito.innerHTML = '';
            } else {
                throw new Error('Elemento con id "resultado2" no encontrado.');
            }

            let pos: number = 0;
            let postabla: number = 0;
            let vueltasLider: number = 0;
            const sessiontime: number = dconfig.RaceDurationTime;
            const sessionlaps: number = dconfig.RaceDurationLaps;
            for (let itemResult of dresult) {
                postabla++;
                pos = itemResult.Pos;
                //console.log('Item ',pos, '. Nombre: ',item.DriverName);
                let gridPositionClass;
                let gains = itemResult.GridPosition - postabla
                let gainsAbs: number = Math.abs(gains);
                if ((gains > 0) && (pos > -2)) {
                    gridPositionClass = '<svg viewBox="0 0 24 24" fill="#00f000" class="w-6 float mx-auto"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.375 6.22l-5 4a1 1 0 0 0 -.375 .78v6l.006 .112a1 1 0 0 0 1.619 .669l4.375 -3.501l4.375 3.5a1 1 0 0 0 1.625 -.78v-6a1 1 0 0 0 -.375 -.78l-5 -4a1 1 0 0 0 -1.25 0z" /></svg>';
                } else if ((gains < 0) && (pos > -2)) {
                    gridPositionClass = '<svg viewBox="0 0 24 24" fill="#ff0000" class="w-6 float mx-auto rotate-180"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.375 6.22l-5 4a1 1 0 0 0 -.375 .78v6l.006 .112a1 1 0 0 0 1.619 .669l4.375 -3.501l4.375 3.5a1 1 0 0 0 1.625 -.78v-6a1 1 0 0 0 -.375 -.78l-5 -4a1 1 0 0 0 -1.25 0z" /></svg>';
                } else if (gains === 0 || pos <= -2) {
                    gridPositionClass = '<svg viewBox="0 0 24 24" fill="#ffc800" class="w-6 float mx-auto rotate-90"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.375 6.22l-5 4a1 1 0 0 0 -.375 .78v6l.006 .112a1 1 0 0 0 1.619 .669l4.375 -3.501l4.375 3.5a1 1 0 0 0 1.625 -.78v-6a1 1 0 0 0 -.375 -.78l-5 -4a1 1 0 0 0 -1.25 0z" /></svg>';
                    gainsAbs = 0;
                }

                // Obtener nombre de equipo + Ping Min-Max
                let carID = itemResult.CarId;
                let equipo = itemResult.Team;


                // Obtener el nombre real del coche
                const isCarExists = cars.find((car) => car.filename === itemResult.CarFileName);
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
                    carName = itemResult.CarFileName;
                    carBrand = "";
                    carClass = "";
                    carColorClass = "";
                }

                // Obtener tiempo total de carrera
                let timeadjust;
                if (itemResult.Pos !== -2) {
                    if (itemResult.TotalTime >= 0) {
                        timeadjust = itemResult.TotalTime;
                        const seconds = formatTwoIntegersPlusThreeDecimals(timeadjust % 60);
                        const minutes = formatTwoIntegers(Math.trunc((timeadjust / 60) % 60));
                        const hours = formatTwoIntegers(Math.trunc(timeadjust / 3600));
                        //console.log("Pos: "+pos+" ->"+hours+":"+minutes+":"+seconds);

                        if (Number(hours) > 0) {
                            if (itemResult.Penalties !== 0) {
                                timeadjust = hours + ":" + minutes + ":" + seconds + " <span class='rounded bg-[#da392b] text-xs px-1 py-0.5 ml-1'> + " + (itemResult.Penalties) + "s</span>";
                            } else {
                                timeadjust = hours + ":" + minutes + ":" + seconds;
                            }
                        } else {
                            if (itemResult.Penalties !== 0) {
                                timeadjust = minutes + ":" + seconds + " <span class='rounded bg-[#da392b] text-xs px-1 py-0.5 ml-1'> + " + (itemResult.Penalties) + "s";
                            } else {
                                timeadjust = minutes + ":" + seconds;
                            }
                        }
                    } else {
                        timeadjust = "No Time";
                    }
                } else {
                    timeadjust = "DQ";
                }

                // Obtener numero de vueltas totales / vuelta rapida / neumatico
                let vueltastotales = itemResult.Laps;
                let tyre;
                let cuts = 0;

                for (let itemLap of dlaps) {
                    if (itemLap.SteamID === itemResult.SteamID) {
                        for (let itemLap2 of itemLap.Laps) {
                            if (itemLap2.LapTime === itemResult.BestLap) {
                                tyre = itemLap2.Tyre;
                            }
                        }
                    }
                }

                for (let itemLap of dlaps) {
                    if (itemLap.SteamID === itemResult.SteamID) {
                        cuts += itemLap.Laps.filter((lap) => lap.Cut > 0).length;
                    }
                }

                if (tyre === undefined || tyre === null || tyre === "") {
                    tyre = "ND";
                }

                let posicionFinal: string = "";

                if (pos === 1) {
                    vueltasLider = vueltastotales;
                    posicionFinal = '1';
                } else {
                    switch (itemResult.Pos) {
                        case -1:
                            posicionFinal = 'DNF';
                            break;
                        case -2:
                            posicionFinal = 'DQ';
                            break;
                        case -3:
                            posicionFinal = 'DNS';
                            break;
                        case -4:
                            switch (itemResult.Team) {
                                case "STREAMING":
                                    posicionFinal = 'TV';
                                    break;
                                case "ESP Racing Staff":
                                    posicionFinal = 'STAFF';
                                    break;
                                case "Safety Car":
                                    posicionFinal = 'SC';
                                    break;
                                default:
                                    posicionFinal = 'DNS';
                                    break;
                            }
                            break;
                        default:
                            const timerace = (itemResult.TotalTime) + (itemResult.Penalties);
                            const condicion1 = (Math.trunc((timerace / 60) % 60) + Math.trunc(timerace / 60));

                            if (vueltastotales < vueltasLider * 0.9 && ((condicion1 < dconfig.RaceDurationTime) || (vueltastotales < dconfig.RaceDurationLaps * 0.9))) {
                                posicionFinal = 'DNF';
                            } else {
                                posicionFinal = pos.toString();
                            }
                    }
                }

                let bestlap = itemResult.BestLap;
                let secondsbl = formatTwoIntegersPlusThreeDecimals(bestlap % 60);
                let minutesbl = formatTwoIntegers(Math.trunc((bestlap / 60) % 60));

                //console.log("Mejor vuelta Usuario ", pos, ": " + bestlap);

                let bestlapToString = minutesbl.toString() + ":" + secondsbl.toString();
                //bestlap = minutesbl.toString + ":" + secondsbl.toString;

                let mediavueltas: number = itemResult.AvgLap;

                let secondsmv = formatTwoIntegersPlusThreeDecimals(mediavueltas % 60);
                let minutesmv = formatTwoIntegers(Math.trunc((mediavueltas / 60) % 60));

                let mediavueltasToString: string;

                if (mediavueltas === 0 || isNaN(mediavueltas)) {
                    mediavueltasToString = "ND";
                } else {
                    mediavueltasToString = minutesmv + ":" + secondsmv;
                }
                //console.log(mediavueltas+"/"+vueltastotales+"/"+cuts);
                //console.log(item.DriverName + ": " + vueltastotales);

                let collisions = itemResult.Collisions;

                if (postabla % 2 === 0) {
                    tablaResultados.innerHTML += `
                            <tr class="bg-[#0f0f0f] text-center">
                                <td class = "font-medium">${posicionFinal}</td>                     <!-- Posicion -->
                                <td>${itemResult.DriverName}</td>         <!-- Nombre -->
                                <td>${equipo}</td>                  <!-- Equipo -->
                                <td><span ${carColorClass}>${carClass}</span></td>  <!-- Clase del Coche -->
                                <td><img class='w-4 justify-end' src='${carBrand}' alt=''></img></td>           <!-- Logo Coche -->
                                <td>${carName}</td>           <!-- Coche -->
                                <td>${gridPositionClass}</td>     <!-- Gan/Per (Flechas)-->
                                <td class = "text-start">${gainsAbs}</td> <!-- Gan/Per (Número)-->
                                <td>${timeadjust}</td>              <!-- Tiempo Total -->
                                <td>${vueltastotales}</td>          <!-- Nº Vueltas -->
                                <td>${bestlapToString + " (" + tyre + ")"}</td> <!-- Vuelta Rapida  + Neumaticos-->
                                <td>${mediavueltasToString}</td>            <!-- Media VRapida -->
                                <td>${collisions}</td>              <!-- Colisiones -->
                                <td>${itemResult.Ballast + " Kg / " + itemResult.Restrictor + "%"}</td>  <!-- Ballast/Restrictor -->
                            </tr>
                    `;
                } else {
                    tablaResultados.innerHTML += `
                            <tr class="bg-[#19191c] text-center">
                                <td class = "font-medium">${posicionFinal}</td>                     <!-- Posicion -->
                                <td>${itemResult.DriverName}</td>         <!-- Nombre -->
                                <td>${equipo}</td>                  <!-- Equipo -->
                                <td><span ${carColorClass}>${carClass}</span></td>  <!-- Clase del Coche -->
                                <td><img class='w-4 justify-end' src='${carBrand}' alt=''></img></td>           <!-- Logo Coche -->
                                <td>${carName}</td>           <!-- Coche -->
                                <td>${gridPositionClass}</td>     <!-- Gan/Per (Flechas)-->
                                <td class = "text-start">${gainsAbs}</td> <!-- Gan/Per (Número)-->
                                <td>${timeadjust}</td>              <!-- Tiempo Total -->
                                <td>${vueltastotales}</td>          <!-- Nº Vueltas -->
                                <td>${bestlapToString + " (" + tyre + ")"}</td> <!-- Vuelta Rapida  + Neumaticos-->
                                <td>${mediavueltasToString}</td>            <!-- Media VRapida -->
                                <td>${collisions}</td>              <!-- Colisiones -->
                                <td>${itemResult.Ballast + " Kg / " + itemResult.Restrictor + "%"}</td>  <!-- Ballast/Restrictor -->
                            </tr>
                    `;
                }
            }

            // *** Pista y datos de la carrera ***

            const isCircuitExists = circuits.find((circuit) => circuit.filename === dconfig.Track);
            if (isCircuitExists) {
                const circuitName = isCircuitExists.name;
                const circuitLocation = isCircuitExists.location;
                if (dconfig.TrackLayout === null || dconfig.TrackLayout === undefined || dconfig.TrackLayout === "") {
                    dconfig.TrackLayout = "";
                }
                const layout = circuitlayouts.find((layout) => (layout.filename === dconfig.TrackLayout) && (layout.circuit === isCircuitExists.id));
                const layoutName = layout?.name;
                const layoutLength = layout?.length;
                const layoutCapacity = layout?.capacity;

                datosCircuito.innerHTML += `
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

            // *** Cambios de posiciones ***

            const seriesData = dlaps
                .filter((lapData) => lapData.Laps.length > 0)
                .map((lapData) => ({
                    name: lapData.DriverName,
                    data: lapData.Laps.map((lap) => lap.Position),
                }));

            const numlaps: number[] = Array.from({ length: dlaps[0].Laps.length }, (_, i) => i + 1);

            var optionsChangePositions = {
                title: {
                    text: 'Cambios de posiciones',
                    align: 'center',
                    style: {
                        color: '#f9f9f9',
                        fontSize: '24px',
                        fontWeight: 'bold',
                    },
                },
                series: seriesData,
                chart: {
                    type: 'line',
                    zoom: {
                        enable: false,
                        type: 'x',
                        autoScaleYaxis: true,
                    },
                    locales: [{
                        name: 'es',
                        options: {
                            months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembere', 'Diciembre'],
                            shortMonths: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dec'],
                            days: ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
                            shortDays: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
                            toolbar: {
                                download: 'Descargar SVG',
                                selection: 'Seleccionar',
                                selectionZoom: 'Seleccionar Zoom',
                                zoomIn: 'Zoom In',
                                zoomOut: 'Zoom Out',
                                pan: 'Mover',
                                reset: 'Reiniciar Zoom',
                            }
                        }
                    }],
                    defaultLocale: 'es',
                    toolbar: {
                        show: false,
                    },
                    animation: {
                        enabled: true,
                        easing: 'linear',
                        speed: 850,
                        animateGradually: {
                            enabled: false,
                        },
                    },
                },
                xaxis: {
                    categories: numlaps,
                    labels: {
                        style: {
                            colors: '#f9f9f9',
                        },
                    },
                    title: {
                        text: 'Vueltas',
                        style: {
                            color: '#f9f9f9',
                            fontSize: '16px',
                        },
                    },
                },

                yaxis: {
                    stepSize: 1,
                    min: 1,
                    position: 'top',
                    reversed: true,
                    title: {
                        text: 'Posiciones',
                        style: {
                            color: '#f9f9f9',
                            fontSize: '16px',
                        },
                    },
                    labels: {
                        style: {
                            colors: '#f9f9f9',
                        },
                    },
                },
                stroke: {
                    curve: 'smooth',
                },
                markers: {
                    size: 1,
                },
                tooltip: {
                    theme: 'dark',
                },
                legend: {
                    labels: {
                        colors: '#f9f9f9',
                    }
                },
            };

            var chartChangePosition = new ApexCharts(chartCambiosPosiciones, optionsChangePositions);
            chartChangePosition.resetSeries();
            chartChangePosition.render();

            // *** Sectores ***
            const sectors = Array.from({ length: Math.max(...dbestsectors.map(sector => sector.SectorNumber)) }, (_, i) => i + 1)
                .map(sectorNumber => dbestsectors.filter(sector => sector.SectorNumber === sectorNumber));

            sectors.forEach((sector, index) => {
                const sectorTable = document.getElementById(`tablaS${index + 1}`);
                if (sectorTable) {
                    let sectorHTML = `<p>Mejor Sector ${index + 1}</p>
                                    <table class="w-full border-collapse border border-[#f9f9f9]">
                                    <thead class="font-medium bg-[#da392b]">
                                        <tr class="tabletitle">
                                        <th>Pos</th>
                                        <th>Nombre</th>
                                        <th>Vehiculo</th>
                                        <th>Tiempo</th>
                                        <th>Gap</th>
                                        </tr>
                                    </thead>
                                    <tbody class="font-normal">`;
                    let pos = 0;
                    for (let i of sector) {
                        pos++;
                        if (pos % 2 === 0) {
                            sectorHTML += `
                            <tr class="bg-[#0f0f0f] text-center">
                                <td>${pos}</td>
                                <td>${i.DriverName}</td>
                                <td>${i.CarFileName}</td>
                                <td>${i.BestSector}</td>
                                <td>${i.Gap}</td>
                            </tr>`;
                        }else{
                            sectorHTML += `
                            <tr class="bg-[#19191c] text-center">
                                <td>${pos}</td>
                                <td>${i.DriverName}</td>
                                <td>${i.CarFileName}</td>
                                <td>${i.BestSector}</td>
                                <td>${i.Gap}</td>
                            </tr>`;
                        }
                    }
                    sectorHTML += `</tbody></table>`;
                    sectorTable.innerHTML = sectorHTML;
                } else {
                    console.warn(`Elemento con id "tablaS${index + 1}" no encontrado.`);
                }
            });

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
        case "Classic":
            result += "bg-[#f9f9f9] text-[#0f0f0f]";
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
        case "Classic":
            result += "Classic";
            break;
    }
    return result;
}

