import ApexCharts from 'apexcharts';

import { cars } from "@/consts/cars";
import { circuits } from "@/consts/circuits";
import { circuitlayouts } from "@/consts/circuitlayouts";
import { points } from "@/consts/pointsystem";
import { createRaceData, createRaceDataMultipleSplits, formatTwoIntegersPlusThreeDecimals, formatTwoIntegers, getClassShortName, getColorClass } from "@/lib/results/resultConverter";

import type { RaceData, RaceResult, RaceLap, Lap, BestLap, Consistency, BestSector, Incident, RaceConfig } from "@/types/Results";
import type { Points } from "@/types/Points";
import ResultsTable from '@/sections/ResultsTable.astro';

/* *************************** */

interface ResultTableData {
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

function initializeScript() {
    const loadButton = document.getElementById('loadButtonRace');
    const opcionesTabla = document.getElementById('select-champs') as HTMLSelectElement;

    const tablaResultados = document.getElementById('tablaResultados');
    const datosCircuito = document.getElementById('datosCircuito');

    const chartCambiosPosiciones = document.getElementById('chartCambiosPosiciones');
    const chartGaps = document.getElementById('chartGaps');

    const tablaIndividuales = document.getElementById('tableIndividualLaps');

    async function loadData() {

        const arraySeleccion = opcionesTabla.value.split("@");

        const seleccion = arraySeleccion[0];

        let pointsystemName: string | undefined = undefined;
        let pointArray: Points | undefined = undefined;
        if (arraySeleccion[1] === null || arraySeleccion[1] === undefined || arraySeleccion[1] === "") {
            pointsystemName = "NoPoints";
        }
        else {
            pointsystemName = arraySeleccion[1];
            pointArray = points.find((point) => point.Name === arraySeleccion[1]);
        }

        if (!seleccion) {
            alert('Por favor, selecciona una opción');
            return;
        }

        try {
            console.log('Cargando datos de la carrera: ' + seleccion);
            //const response = await fetch(`/api/raceresults/getRaceResults?race=${seleccion}`);
            const response1 = await fetch(`/testRace8S1.json`); //Pruebas para no leer constantemente de la BD
            const response2 = await fetch(`/testRace8S2.json`); //Pruebas para no leer constantemente de la BD

            const datosRAW1 = await response1.json();
            const datosRAW2 = await response2.json();
            //console.log('DatosRAW a usar: ', datosRAW);
            //const datos: RaceData = createRaceData(datosRAW1);
            const datos: RaceData = createRaceDataMultipleSplits(datosRAW1, datosRAW2);
            pointsystemName = 'Proto';
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

            if (tablaIndividuales) {
                tablaIndividuales.innerHTML = '';
            } else {
                throw new Error('Elemento con id "tablaIndividuales" no encontrado.');
            }

            let pos: number = 0;
            let postabla: number = 0;
            let vueltasLider: number = 0;
            const sessiontime: number = dconfig.RaceDurationTime;
            const sessionlaps: number = dconfig.RaceDurationLaps;

            // *** Mejor vuelta de carrera ***
            const bestlapDriverID = dbestlaps[0].SteamID;

            const resultTable = getResultTableData(datos, pointsystemName, pointArray ?? { Name: "NoPoints", Puntuation: [], FastestLap: 0 });

            // *** Clasificacion de Carrera
            let secondSplitInit: boolean = false;
            for (let i = 0; i < resultTable.length; i++) {
                if (resultTable[i].splitNumber === 2 && !secondSplitInit) {
                    tablaResultados.innerHTML += `
                            <tr class="bg-[#da392b] text-center font-bold">
                                <td colspan="14">Segundo Split</td>
                            </tr>
                    `;
                    secondSplitInit = true;
                }
                if (i % 2 === 0) {
                    tablaResultados.innerHTML += `
                            <tr class="bg-[#0f0f0f]">
                                <td class = "text-center">${resultTable[i].gridPositionClass}</td>                                                  <!-- Gan/Per (Flechas)-->
                                <td class = "text-center">${resultTable[i].gainsAbs}</td>                                                           <!-- Gan/Per (Número)-->
                                <td class = "font-medium text-center">${resultTable[i].posicionFinal}</td>                                          <!-- Posicion -->
                                <td class = "text-start">${resultTable[i].driverName}</td>                                                          <!-- Nombre -->
                                <td class = "text-center"><span ${resultTable[i].carColorClass}>${resultTable[i].carClass}</span></td>              <!-- Clase del Coche -->
                                <td class = "text-center"><img class='w-4 justify-end' src='${resultTable[i].carBrand}' alt=''></img></td>          <!-- Logo Coche -->
                                <td class = "text-start">${resultTable[i].carName}</td>                                                             <!-- Coche -->
                                <td class = "text-start">${resultTable[i].team}</td>                                                                <!-- Equipo -->
                                <td class = "text-center">${resultTable[i].totalLaps}</td>                                                          <!-- Nº Vueltas -->
                                <td class = "text-center">${resultTable[i].timeadjust}</td>                                                         <!-- Tiempo Total -->
                                <td class = "text-center">${resultTable[i].gap}</td>                                                                <!-- Gap con primero -->
                                <td class = "text-center">${resultTable[i].interval}</td>                                                           <!-- Intervalo -->
                                <td class = "text-center"><span class = "${resultTable[i].flapClass}">${resultTable[i].bestlapToString + " " + resultTable[i].tyre}</span></td>  <!-- Vuelta Rapida  + Neumaticos-->
                                <td class = "text-center">${resultTable[i].points}</td>                                                             <!-- Ballast/Restrictor -->
                            </tr>
                    `;
                } else {
                    tablaResultados.innerHTML += `
                            <tr class="bg-[#19191c]">
                                <td class = "text-center">${resultTable[i].gridPositionClass}</td>                                                  <!-- Gan/Per (Flechas)-->
                                <td class = "text-center">${resultTable[i].gainsAbs}</td>                                                           <!-- Gan/Per (Número)-->
                                <td class = "font-medium text-center">${resultTable[i].posicionFinal}</td>                                          <!-- Posicion -->
                                <td class = "text-start">${resultTable[i].driverName}</td>                                                          <!-- Nombre -->
                                <td class = "text-center"><span ${resultTable[i].carColorClass}>${resultTable[i].carClass}</span></td>              <!-- Clase del Coche -->
                                <td class = "text-center"><img class='w-4 justify-end' src='${resultTable[i].carBrand}' alt=''></img></td>          <!-- Logo Coche -->
                                <td class = "text-start">${resultTable[i].carName}</td>                                                             <!-- Coche -->
                                <td class = "text-start">${resultTable[i].team}</td>                                                                <!-- Equipo -->
                                <td class = "text-center">${resultTable[i].totalLaps}</td>                                                          <!-- Nº Vueltas -->
                                <td class = "text-center">${resultTable[i].timeadjust}</td>                                                         <!-- Tiempo Total -->
                                <td class = "text-center">${resultTable[i].gap}</td>                                                                <!-- Gap con primero -->
                                <td class = "text-center">${resultTable[i].interval}</td>                                                           <!-- Intervalo -->
                                <td class = "text-center"><span class = "${resultTable[i].flapClass}">${resultTable[i].bestlapToString + " " + resultTable[i].tyre}</span></td>  <!-- Vuelta Rapida  + Neumaticos-->
                                <td class = "text-center">${resultTable[i].points}</td>                                                             <!-- Ballast/Restrictor -->
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
            // Crea un array para almacenar los datos de la serie para cada split
            let seriesDataPositions: { name: string, data: number[] }[][] = [];

            // Obtiene todos los splits de los resultados, sin duplicados
            const splitsPositionChange = [...new Set(dresult.map(result => result.Split))];

            // Inicializa un array para cada split
            splitsPositionChange.forEach(() => seriesDataPositions.push([]));

            // Mapea los datos para cada split
            dlaps
                .filter((lapData) => lapData.Laps.length > 0)
                .forEach((lapData) => {
                    const driverResult = dresult.find(result => result.SteamID === lapData.SteamID);
                    if (driverResult) {
                        const splitIndex = driverResult.Split - 1;
                        const gridPosition = driverResult.GridPosition;

                        seriesDataPositions[splitIndex].push({
                            name: lapData.DriverName,
                            data: [gridPosition, ...lapData.Laps.map((lap) => lap.Position)],
                        });
                    }
                });

            const numlaps: number[] = Array.from({ length: dlaps[0].Laps.length + 1 }, (_, i) => i);

            var optionsChangePositions = {
                title: {
                    text: 'Cambios de posiciones (Split 1)',
                    align: 'center',
                    style: {
                        color: '#f9f9f9',
                        fontSize: '24px',
                        fontWeight: 'bold',
                    },
                },

                series: seriesDataPositions[0],
                colors: ['#2E93fA', '#66DA26', '#E91E63', '#FF9800', '#fff700', '#00ffd4', '#0036ff', '#e91ec4', '#9e57ff', '#ff0000', '#00ffbd', '#546E7A'],

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
                        show: true,
                        tools: {
                            download: false,
                            selection: false,
                            zoom: true,
                            zoomin: true,
                            zoomout: true,
                            pan: true,
                            reset: true,
                        },
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

            // *** Gaps durante las vueltas ***
            let seriesDataGaps: { name: string, data: number[] }[][] = [];

            // Obtiene todos los splits de los resultados, sin duplicados
            const splitsGapVariation = [...new Set(dresult.map(result => result.Split))];

            // Inicializa un array para cada split
            splitsGapVariation.forEach(() => seriesDataGaps.push([]));

            // Mapea los datos para cada split
            dlaps
                .filter((lapData) => lapData.Laps.length > 0)
                .forEach((lapData) => {
                    const driverResult = dresult.find(result => result.SteamID === lapData.SteamID);
                    if (driverResult) {
                        const splitIndex = driverResult.Split - 1;
                        seriesDataGaps[splitIndex].push({
                            name: lapData.DriverName,
                            data: lapData.Laps.map((lap) => lap.GaptoFirst),
                        });
                    }
                });

            var optionsGaps = {
                title: {
                    text: 'Distancia al líder (Split 1)',
                    align: 'center',
                    style: {
                        color: '#f9f9f9',
                        fontSize: '24px',
                        fontWeight: 'bold',
                    },
                },

                series: seriesDataGaps[0],
                colors: ['#2E93fA', '#66DA26', '#546E7A', '#E91E63', '#FF9800', '#fff700', '#00ffd4', '#0036ff', '#e91ec4', '#9e57ff', '#ff0000', '#00ffbd'],

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
                        show: true,
                        tools: {
                            download: false,
                            selection: false,
                            zoom: true,
                            zoomin: true,
                            zoomout: true,
                            pan: true,
                            reset: true,
                        },
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
                    stepSize: 8,
                    min: 0,
                    position: 'top',
                    reversed: true,
                    title: {
                        text: 'Distancia al líder (segundos)',
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
                grid: {
                    borderColor: '#5a5a5a',
                },
            };

            var chartGapsProgression = new ApexCharts(chartGaps, optionsGaps);
            chartGapsProgression.resetSeries();
            chartGapsProgression.render();

            // Flag para indicar si hay más de un split
            const flagMoreSplits: Boolean = dresult.some((driver) => driver.Split > 1);

            // *** Sectores ***
            const sectorsList = Array.from({ length: Math.max(...dbestsectors.map(sector => sector.SectorNumber)) }, (_, i) => i + 1)
                .map(sectorNumber => dbestsectors.filter(sector => sector.SectorNumber === sectorNumber));

            sectorsList.forEach((sector, index) => {
                const sectorTable = document.getElementById(`tablaS${index + 1}`);
                if (sectorTable) {
                    let sectorHTML = `<p class="text-3xl font-bold border-b border-[#da392b] w-fit mx-auto mt-4 mb-2">Mejor Sector ${index + 1}</p>
                                    <table class="w-full border-collapse border border-[#f9f9f9]">
                                    <thead class="font-medium bg-[#da392b]">
                                        <tr class="tabletitle">
                                            <th>Pos</th>
                                            <th>Nombre</th>
                                            <th colspan="3">Vehiculo</th>
                                            <th>Tiempo</th>
                                            <th>Gap</th>
                                        </tr>
                                    </thead>
                                    <tbody class="font-normal">`;
                    let pos = 0;
                    for (let i of sector) {
                        pos++;
                        let gap: string = "";

                        if (pos === 1) {
                            gap = "0.000";
                        } else {
                            gap = "+" + formatTwoIntegersPlusThreeDecimals((i.BestSector - sector[0].BestSector) / 1000);
                        }

                        const sectorTimeString: string = formatTwoIntegersPlusThreeDecimals(i.BestSector / 1000);

                        // Obtener el nombre real del coche
                        const isCarExists = cars.find((car) => car.filename === i.CarFileName);
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
                            carName = i.CarFileName;
                            carBrand = "";
                            carClass = "";
                            carColorClass = "";
                        }

                        if (pos % 2 === 0) sectorHTML += `<tr class="bg-[#0f0f0f] text-center">`;
                        else sectorHTML += `<tr class="bg-[#19191c] text-center">`;
                        sectorHTML += `<td>${pos}</td>`;

                        if(flagMoreSplits) sectorHTML += `<td>${i.DriverName} (s${i.Split})</td>`;
                        else sectorHTML += `<td>${i.DriverName}</td>`;

                        sectorHTML += `
                                <td><span ${carColorClass}>${carClass}</span></td>
                                <td><img class='w-4 justify-end' src='${carBrand}' alt=''></img></td>
                                <td>${carName}</td>
                                <td>${sectorTimeString}</td>
                                <td>${gap}</td>
                            </tr>`;
                    }
                    sectorHTML += `</tbody></table>`;
                    sectorTable.innerHTML = sectorHTML;
                } else {
                    console.warn(`Elemento con id "tablaS${index + 1}" no encontrado.`);
                }
            });

            // *** Tabla de vueltas de carrera por piloto ***
            let tablaIndividualesHTML: string = `<p class="text-3xl font-bold border-b border-[#da392b] w-fit mx-auto mt-4 mb-2">Vuelta a vuelta de pilotos</p> `;
            const BestLapGeneral = dbestlaps[0].BestLap;
            for (let itemRL of dlaps) {
                const driverName = itemRL.DriverName;
                const driverID = itemRL.SteamID;
                const laps = itemRL.Laps;
                const totalLaps = laps.length;
                const bestLap = itemRL.Best;
                const optimalLap: number[] = itemRL.Optimal;
                const average = itemRL.Average;
                const consistency = dconsistency.find((consistency) => consistency.SteamID === driverID)?.Consistency;

                let pos = dresult.find((driver) => driver.SteamID === driverID)?.Pos;
                if (pos === undefined) {
                    pos = -3;
                }

                const BestLap = dresult.find((driver) => driver.SteamID === driverID)?.BestLap;
                let BestLapFound: boolean = false;

                const CarFileNameFromDriver = dresult.find((driver) => driver.SteamID === driverID)?.CarFileName;
                const isCarExists = cars.find((car) => car.filename === CarFileNameFromDriver);
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
                    carName = CarFileNameFromDriver || "Coche no encontrado";
                    carBrand = "";
                    carClass = "";
                    carColorClass = "";
                }

                const AvgSectors: number[] = average.slice(1);
                let secondsavg = formatTwoIntegersPlusThreeDecimals(average[0] % 60);
                let minutesavg = formatTwoIntegers(Math.trunc((average[0] / 60) % 60));
                let avglapToString: string = "";
                let avgSectorString: string = "";
                if (pos >= -2) {
                    avglapToString = `Vuelta Media: ` + minutesavg.toString() + `:` + secondsavg.toString();
                    avgSectorString += `(`;
                    AvgSectors.map((sector, index) => {
                        sector = sector / 1000;
                        if (sector > 60) {
                            const seconds = formatTwoIntegersPlusThreeDecimals(sector % 60);
                            const minutes = formatTwoIntegers(Math.trunc((sector / 60) % 60));
                            avgSectorString += `S${index + 1}: ${minutes}:${seconds} `;
                        } else {
                            avgSectorString += `S${index + 1}: ${formatTwoIntegersPlusThreeDecimals(sector)} `;
                        }
                        if (index < AvgSectors.length - 1) {
                            avgSectorString += " | ";
                        }
                    });
                    avgSectorString += `)`;

                }
                let optimallapToString: string = "";
                let optimalSectorsString: string = "";
                if (optimalLap !== undefined) {
                    const OptimalSectors: number[] = optimalLap.slice(1);
                    let secondsoptimal = formatTwoIntegersPlusThreeDecimals(optimalLap[0] % 60);
                    let minutesoptimal = formatTwoIntegers(Math.trunc((optimalLap[0] / 60) % 60));
                    if (pos >= -2) {
                        optimallapToString = `Vuelta Optima: ` + minutesoptimal.toString() + `:` + secondsoptimal.toString();
                        optimalSectorsString += `(`;
                        OptimalSectors.map((sector, index) => {
                            sector = sector / 1000;
                            if (sector > 60) {
                                const seconds = formatTwoIntegersPlusThreeDecimals(sector % 60);
                                const minutes = formatTwoIntegers(Math.trunc((sector / 60) % 60));
                                optimalSectorsString += `S${index + 1}: ${minutes}:${seconds} `;
                            } else {
                                optimalSectorsString += `S${index + 1}: ${formatTwoIntegersPlusThreeDecimals(sector)} `;
                            }
                            if (index < OptimalSectors.length - 1) {
                                optimalSectorsString += " | ";
                            }
                        });
                        optimalSectorsString += `)`;
                    }
                }

                const BestSectors: number[] = bestLap.slice(1);
                let bestSectorsString: string = "";
                let bestlapToString = ``;
                if (BestLap !== undefined) {
                    if (BestLap >= 999999.999) {
                        bestlapToString = "Vuelta Rápida: No Time";
                    } else {
                        let secondsbest = formatTwoIntegersPlusThreeDecimals(BestLap % 60);
                        let minutesbest = formatTwoIntegers(Math.trunc((BestLap / 60) % 60));
                        if (pos >= -2) {
                            bestlapToString = `Vuelta Rápida: ` + minutesbest.toString() + `:` + secondsbest.toString();

                            bestSectorsString += `(`;
                            BestSectors.map((sector, index) => {
                                sector = sector / 1000;
                                if (sector > 60) {
                                    const seconds = formatTwoIntegersPlusThreeDecimals(sector % 60);
                                    const minutes = formatTwoIntegers(Math.trunc((sector / 60) % 60));
                                    bestSectorsString += `S${index + 1}: ${minutes}:${seconds} `;
                                } else {
                                    bestSectorsString += `S${index + 1}: ${formatTwoIntegersPlusThreeDecimals(sector)} `;
                                }
                                if (index < BestSectors.length - 1) {
                                    bestSectorsString += " | ";
                                }
                            });
                            bestSectorsString += `)`;
                        }
                    }
                } else {
                    bestlapToString = "Vuelta Rápida: No Time";
                }

                let consistencyString: string = "";
                if (consistency !== undefined) {
                    const diffConsistency = (consistency - 100).toFixed(2);
                    consistencyString = ` | Consistencia: ${consistency}% ( ${diffConsistency} )`;
                }
                if (consistency === -1) {
                    consistencyString = "";
                }


                if (pos >= -3) {
                    tablaIndividualesHTML += `<div class = "mt-8">
                        <div class="text-center bg-[#19191c] rounded-lg py-5">`;
                        if(flagMoreSplits){
                        tablaIndividualesHTML += `
                            <p class = "text-3xl font-bold border-b border-[#da392b] w-fit mx-auto mb-2">${driverName} (Split ${itemRL.Split})</p>`;
                        } else{
                            tablaIndividualesHTML += `
                            <p class = "text-3xl font-bold border-b border-[#da392b] w-fit mx-auto mb-2">${driverName}</p>`;
                        }
                            tablaIndividualesHTML += `
                            <div class = "grid grid-cols-1">
                                <p class="text-2xl font-semibold align-middle">Coche: ${carName}</p>
                                <div class = "block">
                                <span ${carColorClass}>${carClass}</span>
                                </div>
                            </div>
                            <div class = "grid grid-cols-3 text-lg mt-2">
                                <p>${bestlapToString}</p>
                                <p>${avglapToString} ${consistencyString} </p>
                                <p>${optimallapToString} </p>
                            </div>
                            <div class = "grid grid-cols-3 text-lg mt-2">
                                <p>${bestSectorsString}</p>
                                <p>${avgSectorString}</p>
                                <p>${optimalSectorsString} </p>
                            </div>
                        </div>
                    `;
                    if (pos >= -2) {
                        tablaIndividualesHTML += `
                            <table class="w-full border-collapse border border-[#f9f9f9]">
                            <thead class="font-medium bg-[#da392b]">
                                <tr class="tabletitle">
                                <th>Nº</th>                     <!-- Nº Vuelta -->
                                <th>Tiempo</th>                 <!-- Lap Time -->
                                <th colspan="3">Sectores</th>   <!-- Sector 1, Sector 2, Sector 3 -->
                                <th>Rueda</th>                  <!-- Tyre -->
                                <th>Posición en Carrera</th>    <!-- Posición en carrera -->
                                <th>Cut</th>                    <!-- Cut -->
                                </tr>
                            </thead>
                            <tbody class="font-normal">`;

                        let bestGlobalSectors: number[] = [sectorsList[0][0].BestSector, sectorsList[1][0].BestSector, sectorsList[2][0].BestSector];

                        for (let itemL of laps) {
                            let bestlap = itemL.LapTime;
                            let BestLapClass: string = "";
                            let CutClass: string = "";

                            if (bestlap === BestLapGeneral && !BestLapFound) { // Mejor vuelta de carrera
                                BestLapFound = true;
                                BestLapClass = `"bg-[#c100ff] text-white font-bold rounded-full w-content px-5"`;
                            }

                            if (bestlap === BestLap && !BestLapFound) { // Mejor vuelta personal
                                BestLapFound = true;
                                BestLapClass = `"bg-[#00ee07] text-black font-bold rounded-full w-content px-5"`;
                            }

                            if (itemL.Cut > 0) {
                                CutClass = BestLapClass = `"bg-[#da392b] text-black font-semibold rounded-full w-content px-5"`;
                            }

                            let secondsbl = formatTwoIntegersPlusThreeDecimals(bestlap % 60);
                            let minutesbl = formatTwoIntegers(Math.trunc((bestlap / 60) % 60));

                            let bestlapToString = "";
                            if (pos >= -1) {
                                bestlapToString = minutesbl.toString() + ":" + secondsbl.toString();
                            }

                            let sectorTimeString: string[] = [];
                            const sectorTimeLength = itemL.Sector.length;
                            let sectorIndex: number = 0;
                            let sectorClass: string[] = [];
                            let bestSectorsDriverID = sectorsList.map(sector => sector.find(s => s.SteamID === driverID)?.BestSector);
                            bestSectorsDriverID.forEach((sector, index) => {
                                if (sector === itemL.Sector[index]) {
                                    if (sector === bestGlobalSectors[index]) {
                                        sectorClass[index] = `"bg-[#c100ff] text-white font-bold rounded-full w-content px-5"`;
                                    } else {
                                        sectorClass[index] = `"bg-[#00ee07] text-black font-bold rounded-full w-content px-5"`;
                                    }
                                } else {
                                    sectorClass[index] = `""`;
                                }
                            });

                            for (let s of itemL.Sector) {
                                s = s / 1000;
                                if (s >= 60) {
                                    let seconds = formatTwoIntegersPlusThreeDecimals(s % 60);
                                    let minutes = formatTwoIntegers(Math.trunc((s / 60) % 60));
                                    sectorTimeString.push(minutes + ":" + seconds);
                                } else {
                                    sectorTimeString.push(formatTwoIntegersPlusThreeDecimals(s));
                                }
                                sectorIndex++;
                            }
                            if (sectorTimeLength < 3) {
                                sectorTimeString.push("");
                            }

                            if (itemL.LapNumber % 2 === 0) {
                                tablaIndividualesHTML += `
                                    <tr class="bg-[#0f0f0f] text-center">`;
                            } else {
                                tablaIndividualesHTML += `
                                    <tr class="bg-[#19191c] text-center">`;
                            }
                            tablaIndividualesHTML +=
                                `<td>${itemL.LapNumber.toString()}</td>                             <!-- Nº Vuelta -->
                                        <td><span class =${BestLapClass}>${bestlapToString}</span></td>          <!-- Lap Time -->
                                        <td><span class =${sectorClass[0]}>${sectorTimeString[0]}</span></td>    <!-- Sector 1 -->
                                        <td><span class =${sectorClass[1]}>${sectorTimeString[1]}</span></td>    <!-- Sector 2 -->
                                        <td><span class =${sectorClass[2]}>${sectorTimeString[2]}</span></td>    <!-- Sector 3 -->
                                        <td>${itemL.Tyre}</td>                                      <!-- Tyre -->
                                        <td>${itemL.Position.toString()}</td>                       <!-- Posición en carrera -->
                                        <td><span class =${CutClass}>${itemL.Cut.toString()}</span></td>                            <!-- Cut -->
                                    </tr> `;
                        }
                        tablaIndividualesHTML += ` </tbody></table></div> `;
                    } else {
                        tablaIndividualesHTML += `<p class="w-fit mx-auto font-medium text-xl">Piloto sin vueltas: No empezó la prueba / no completó ninguna vuelta</p></div>`;
                    }
                }
            }
            tablaIndividuales.innerHTML = tablaIndividualesHTML;


        } catch (error) {
            console.error('Error al cargar los resultados de carrera: ' + error);
        }
    }
    if (loadButton) {
        loadButton.addEventListener('click', loadData);
    } else {
        console.error('Elemento con id "loadButton" no encontrado.');
    }
}

function getResultTableData(datos: RaceData, pointsystemName: String, pointArray: Points): ResultTableData[] {
    let resultTableData: ResultTableData[] = [];
    const dresult: RaceResult[] = datos.RaceResult;
    const dlaps: RaceLap[] = datos.RaceLaps;
    const dbestlaps: BestLap[] = datos.BestLap;

    let pos: number = 0;
    let postabla: number = 0;
    let vueltasLider: number = 0;

    // Obtener el número de pilotos por split, que hayan terminado la carrera
    const driversPerSplitQualified = dresult.reduce((acc: number[], driver) => {
        if (driver.Pos > 0) {
            const splitIndex = driver.Split - 1;
            if (!acc[splitIndex]) acc[splitIndex] = 0;
            acc[splitIndex]++;
        }
        return acc;
    }, []);

    // *** Mejor vuelta de carrera ***
    const bestlapDriverID = dbestlaps[0].SteamID;

    for (let itemResult of dresult) {
        let item: ResultTableData;
        postabla++;
        pos = itemResult.Pos;
        let gridPositionClass = "";

        // Obtener ganancias/perdidas de posición
        const positionsOtherSplits = driversPerSplitQualified.slice(0, itemResult.Split - 1).reduce((sum, current) => sum + current, 0);
        let gains = itemResult.GridPosition - postabla + positionsOtherSplits;
        let gainsAbs: string = Math.abs(gains).toString();
        if ((gains > 0) && (pos > -2)) {
            gridPositionClass = '<svg viewBox="0 0 24 24" fill="#00f000" class="w-6 float mx-auto"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.375 6.22l-5 4a1 1 0 0 0 -.375 .78v6l.006 .112a1 1 0 0 0 1.619 .669l4.375 -3.501l4.375 3.5a1 1 0 0 0 1.625 -.78v-6a1 1 0 0 0 -.375 -.78l-5 -4a1 1 0 0 0 -1.25 0z" /></svg>';
        } else if ((gains < 0) && (pos > -2)) {
            gridPositionClass = '<svg viewBox="0 0 24 24" fill="#ff0000" class="w-6 float mx-auto rotate-180"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.375 6.22l-5 4a1 1 0 0 0 -.375 .78v6l.006 .112a1 1 0 0 0 1.619 .669l4.375 -3.501l4.375 3.5a1 1 0 0 0 1.625 -.78v-6a1 1 0 0 0 -.375 -.78l-5 -4a1 1 0 0 0 -1.25 0z" /></svg>';
        } else if (gains === 0 || pos <= -2) {
            gridPositionClass = '<svg viewBox="0 0 24 24" fill="#ffc800" class="w-6 float mx-auto rotate-90"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.375 6.22l-5 4a1 1 0 0 0 -.375 .78v6l.006 .112a1 1 0 0 0 1.619 .669l4.375 -3.501l4.375 3.5a1 1 0 0 0 1.625 -.78v-6a1 1 0 0 0 -.375 -.78l-5 -4a1 1 0 0 0 -1.25 0z" /></svg>';
            gainsAbs = "0";
        }
        if (pos <= -3) {
            gridPositionClass = "";
            gainsAbs = "";
        }

        // Obtener nombre de equipo + Ping Min-Max
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
                timeadjust = itemResult.TotalTime + itemResult.Penalties;
                const seconds = formatTwoIntegersPlusThreeDecimals(timeadjust % 60);
                const minutes = formatTwoIntegers(Math.trunc((timeadjust / 60) % 60));
                const hours = formatTwoIntegers(Math.trunc(timeadjust / 3600));

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

        if (itemResult.Pos <= -3) {
            timeadjust = "";
        }

        // Obtener numero de vueltas totales / vuelta rapida / neumatico
        let vueltastotales = 0;
        if (itemResult.Laps === undefined || itemResult.Laps === null || itemResult.Laps === 0) {
            for (let itemLap of dlaps) {
                if (itemLap.SteamID === itemResult.SteamID) {
                    vueltastotales = itemLap.Laps.length;
                }
            }
        } else {
            vueltastotales = itemResult.Laps;
        }

        let tyre;
        let cuts = 0;

        for (let itemLap of dlaps) {
            if (itemLap.SteamID === itemResult.SteamID) {
                for (let itemLap2 of itemLap.Laps) {
                    if (itemLap2.LapTime === itemResult.BestLap) {
                        tyre = "(" + itemLap2.Tyre + ")";
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
            tyre = "(ND)";
        }

        let posicionFinal: string = "";

        if (pos === 1) {
            vueltasLider = vueltastotales;
            posicionFinal = '1';
        } else {
            switch (itemResult.Pos) {
                case -1: posicionFinal = 'DNF'; break;
                case -2: posicionFinal = 'DQ'; break;
                case -3: posicionFinal = 'DNS'; break;
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
                    posicionFinal = pos.toString();
            }
            if (itemResult.Pos === -4 && itemResult.DriverName === "STREAMING") {
                posicionFinal = 'TV';
            }
        }

        let bestlap = itemResult.BestLap;
        let secondsbl = formatTwoIntegersPlusThreeDecimals(bestlap % 60);
        let minutesbl = formatTwoIntegers(Math.trunc((bestlap / 60) % 60));

        let bestlapToString = "";
        if (pos >= -1) {
            bestlapToString = minutesbl.toString() + ":" + secondsbl.toString();
        } else {
            tyre = "";
        }

        if (itemResult.BestLap >= 999999.999) {
            bestlapToString = "No Time";
            tyre = "";
        }

        // *** Intervalo de tiempo con el lider ***
        let gap: string = "";
        if (pos <= -2) {
            gap = "";
        } else if (postabla > 1 && vueltasLider === vueltastotales) {
            const splitLeaderTime = dresult.find(driver => driver.Split === itemResult.Split)?.TotalTime ?? 0;
            const splitLeaderPenalties = dresult.find(driver => driver.Split === itemResult.Split)?.Penalties ?? 0;

            const gapTime = ((itemResult.TotalTime + itemResult.Penalties) - (splitLeaderTime + splitLeaderPenalties));
            let secondsgap = formatTwoIntegersPlusThreeDecimals(gapTime % 60);
            let minutesgap = formatTwoIntegers(Math.trunc((gapTime / 60) % 60));

            if (minutesgap === "00") {
                gap = "+ " + secondsgap;
            } else {
                gap = "+ " + minutesgap + ":" + secondsgap;
            }
            if (gapTime === 0) {
                gap = "";
            }
        } else if (postabla > 1 && vueltasLider !== vueltastotales) {
            gap = "+ " + (vueltasLider - vueltastotales) + "L";
        } else if (postabla === 1) {
            gap = "";
        }

        // *** Intervalo con el anterior piloto ***
        let interval: string = "";
        let vueltasPrevio: number = 0;
        if (postabla > 1) {
            for (let itemLap of dlaps) {
                if (itemLap.SteamID === dresult[postabla - 2].SteamID) {
                    vueltasPrevio = itemLap.Laps.length;
                }
            }
            if (pos <= -2) {
                interval = "";
            } else if (postabla > 1 && vueltasPrevio === vueltastotales) {
                const intervalTime = (itemResult.TotalTime + itemResult.Penalties) - (dresult[postabla - 2].TotalTime + dresult[postabla - 2].Penalties);
                let secondsInterval = formatTwoIntegersPlusThreeDecimals(intervalTime % 60);
                let minutesInterval = formatTwoIntegers(Math.trunc((intervalTime / 60) % 60));

                if (minutesInterval === "00") {
                    interval = "+ " + secondsInterval;
                } else {
                    interval = "+ " + minutesInterval + ":" + secondsInterval;
                }
            } else if (postabla > 1 && vueltasPrevio !== vueltastotales) {
                interval = "+ " + (vueltasPrevio - vueltastotales) + "L";
            }
        } else {
            interval = "";
        }

        // *** Añadir puntuaciones a la tabla ***
        let puntos: number = 0;
        let puntosString: string = "";
        if (pointsystemName !== "NoPoints") {
            if (pos > 0) {
                puntos = pointArray?.Puntuation[pos - 1] || 0;
                if (bestlapDriverID === itemResult.SteamID) {
                    puntos += pointArray?.FastestLap || 0;
                }
                puntosString = '+ ' + puntos.toString();
            } else if (pos === -1) {
                puntosString = "+ 0";
            }
        } else {
            puntosString = "";
        }

        let flapClass = "";
        if (bestlapDriverID === itemResult.SteamID) {
            if (pos >= -1) {
                flapClass = ' bg-[#c100ff] text-white font-bold rounded-full w-content px-5';
            } else {
                flapClass = '';
            }
        }

        let vueltasTotalesString: string = "";
        if (pos > -2) {
            vueltasTotalesString = vueltastotales.toString();
        } else {
            vueltasTotalesString = "";
        }
        item = {
            gridPositionClass: gridPositionClass,
            gainsAbs: gainsAbs,
            posicionFinal: posicionFinal,
            driverName: itemResult.DriverName,
            carColorClass: carColorClass,
            carClass: carClass,
            carBrand: carBrand,
            carName: carName,
            team: equipo,
            totalLaps: vueltasTotalesString,
            timeadjust: timeadjust,
            gap: gap,
            interval: interval,
            flapClass: flapClass,
            bestlapToString: bestlapToString,
            tyre: tyre,
            points: puntosString,
            splitNumber: itemResult.Split
        }
        resultTableData.push(item);
    }
    return resultTableData;
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScript);
} else {
    initializeScript();
}

// function cleanupEventListeners() {
//     const loadButton = document.getElementById('loadButtonRace');
//     if (loadButton) {
//       loadButton.removeEventListener('click', loadData);
//     }
//   }

// Maneja las transiciones de página de Astro
document.addEventListener('astro:page-load', initializeScript);

// Limpiar event listeners antes de descargar la página
//document.addEventListener('astro:page-unload', cleanupEventListeners);

