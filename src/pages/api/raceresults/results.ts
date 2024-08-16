const btnCargaTabla = document.querySelector('#btnCargarTabla');
if (btnCargaTabla) {
    btnCargaTabla.addEventListener('click', cargarJSON);
}
function cargarJSON() {
    //console.log('Dentro de funcion cargarJSON');
    const xhttp = new XMLHttpRequest();
    const opciones = document.querySelector('#select-champs');

    //console.log((opciones as HTMLSelectElement)?.value);
    var ruta = 'http://es2.assettohosting.com:10018/results/download/' + (opciones as HTMLSelectElement)?.value + '.json';
    //var ruta = 'G:/Universidad/TFG/db/2024_3_17_19_38_RACE.json';
    xhttp.open('GET', ruta, true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            //console.log(this.responseText);
            let datos = JSON.parse(this.responseText);
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

                resultado.innerHTML += `
            <tr>
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
    };
}
