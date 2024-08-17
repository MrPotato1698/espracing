import { cars } from "@/consts/cars";
import { circuits } from "@/consts/circuits";
import { circuitlayouts } from "@/consts/circuitlayouts";

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
        //console.log(data);
        let datos = JSON.parse(data);
        console.log(datos);

        let dcars = datos.Cars;
        let devents = datos.Events;
        let dlaps = datos.Laps;
        let dresult = datos.Result;

        const resultado = document.querySelector('#resultado');
        if (resultado) {
            resultado.innerHTML = '';
        } else {
            throw new Error('Element with id "resultado" not found.');
        }

        const resultadoPista = document.querySelector('#resultado2');
        if (resultadoPista) {
            resultadoPista.innerHTML = '';
        } else {
            throw new Error('Element with id "resultado2" not found.');
        }

        let pos = 0;
        for (let item of dresult) {
            //console.log(item.DriverName);
            pos = pos + 1;
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
            let equipo;
            for (let item2 of dcars) {
                if (item2.CarId === carID) {
                    equipo = item2.Driver.Team;
                    break;
                }
            }

            // Obtener el nombre real del coche
            const isCarExists = cars.find((car) => car.filename === item.CarModel);
            let carName: string;
            if(isCarExists){
                carName = isCarExists.brand + " " + isCarExists.model;
            } else{
                carName = item.CarModel;
            }

            // Obtener tiempo total de carrera
            let timeadjust;
            if (item.Disqualified === false) {
                timeadjust = (item.TotalTime / 1000) + (item.PenaltyTime / 1000000000);
                let seconds = formatTwoIntegersPlusThreeDecimals(timeadjust % 60);
                let minutes = formatTwoIntegers(Math.trunc((timeadjust / 60)%60));
                let hours = formatTwoIntegers(Math.trunc(timeadjust / 3600));
                //console.log("Pos: "+pos+" ->"+hours+":"+minutes+":"+seconds);

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

            // Obtener numero de vueltas totales / vuelta rapida / neumatico
            let vueltastotales = 0;
            let bestlap = 0;
            let bestlapToString: string;
            let tyre;
            let mediavueltas = 0;
            let mediavueltasToString: string;
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

            bestlap = (bestlap / 1000);
            let secondsbl = formatTwoIntegersPlusThreeDecimals(bestlap % 60);
            let minutesbl = formatTwoIntegers(Math.trunc((bestlap / 60)%60));

            bestlapToString = minutesbl.toString() + ":" + secondsbl.toString();
            //bestlap = minutesbl.toString + ":" + secondsbl.toString;
            mediavueltas = mediavueltas / (vueltastotales - cuts);
            mediavueltas = (mediavueltas / 1000);
            let secondsmv = formatTwoIntegersPlusThreeDecimals(mediavueltas % 60);
            let minutesmv = formatTwoIntegers(Math.trunc((mediavueltas / 60)%60));
            mediavueltasToString = minutesmv + ":" + secondsmv;
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
                        <td class = "font-medium">${pos.toString()}</td>                     <!-- Posicion -->
                        <td>${item.DriverName}</td>         <!-- Nombre -->
                        <td>${equipo}</td>                  <!-- Equipo -->
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
                        <td>${pos}</td>                     <!-- Posicion -->
                        <td>${item.DriverName}</td>         <!-- Nombre -->
                        <td>${equipo}</td>                  <!-- Equipo -->
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
        if(isCircuitExists){
            const circuitName = isCircuitExists.name;
            const circuitLocation = isCircuitExists.location;
            if(datos.TrackConfig === null || datos.TrackConfig === undefined || datos.TrackConfig === ""){
                datos.TrackConfig = "noname_trackconfig";
            }
            const layout = circuitlayouts.find((layout) => (layout.filename === datos.TrackConfig)&&(layout.circuit === isCircuitExists.id));
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



    }).catch((error) => {
        console.error(error);
    });
}


function formatTwoIntegersPlusThreeDecimals(num: number){
    const integerPart = Math.floor(Math.abs(num)).toString().padStart(2, '0');
    const decimalPart = Math.abs(num % 1).toFixed(3).slice(2);
    const sign = num < 0 ? '-' : '';
    return `${sign}${integerPart}.${decimalPart}`;
}

function formatTwoIntegers(num: number): string {
    return Math.abs(num).toString().padStart(2, '0').slice(-2);
}

