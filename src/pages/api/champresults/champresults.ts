import ApexCharts from 'apexcharts';

import { cars } from "@/consts/cars";
import { circuits } from "@/consts/circuits";
import { circuitlayouts } from "@/consts/circuitlayouts";
import { points } from "@/consts/pointsystem";

import { createRaceData, formatTwoIntegersPlusThreeDecimals, formatTwoIntegers} from "@/lib/results/resultConverter";

import type { RaceData, RaceResult, RaceLap, Lap, BestLap, Consistency, BestSector, Incident, RaceConfig } from "@/types/Results";
import type { Points } from "@/types/Points";

/* *************************** */
interface DriverDataChamp {
  name: string;
  guid: string;
  car: string;
  team: string;
  totalsPoints: number;
}

interface DriverPointsPerRace {
  name: string;
  guid: string;
  racenumber: number;
  points: number;
}

interface RaceDataChamp {
  raceNumber: number;
  name: string;
  results: RaceResult[];
  pointSystem: string;
  driverFastestLapGuid: string;
}

interface TeamDataChamp {
  name: string;
  guidDriver1: string;
  guidDriver2: string;
  points: number;
}

/* *************************** */

function initializeScript() {
  const loadButton = document.getElementById('loadButtonChamp');

  const opcionesChamps = document.getElementById('select-champs') as HTMLSelectElement;

  const tablaIndyChamps = document.getElementById('resultsIndyChampsTable');
  const tablaTeamsChamps = document.getElementById('resultsTeamsChampsTable');
  const chartProgressionIndyChamp = document.getElementById('chartProgressiónIndyChamp');
  const chartProgressionTeamsChamp = document.getElementById('chartProgressiónTeamsChamp');
  const tablaOtrosPremios = document.getElementById('resultTableOtherPrizes');

  async function loadData() {
    const seleccion = opcionesChamps.value;
    try {
      const response = await fetch(`/api/champresults/getChampResults?champ=${seleccion}`);

      if (!response.ok) {
        console.error('Error al obtener los datos del campeonato: ' + response.statusText);
        return;
      }

      let dataRAW = await response.text();
      //console.log('Datos crudos de la API: ' + dataRAW);

      dataRAW = dataRAW.replace('{"raceData":', '');
      dataRAW = dataRAW.slice(0, -1);

      const arrayRaceData = JSON.parse(dataRAW) as RaceData[];

      const numRaces = arrayRaceData.length;

      const RacesChamp: RaceDataChamp[] = arrayRaceData.map((raceData, index) => {
        const racePointsSystems = seleccion.split('@');
        let pointSystem = 'Simple';
        if (racePointsSystems.length > 1) {
          const raceDuration = raceData.RaceConfig.RaceDurationTime;

          if (racePointsSystems[0] === "16") {
            switch (raceDuration) {
              case 120:
                pointSystem = racePointsSystems[2];
                break;
              case 90:
                pointSystem = racePointsSystems[1];
                break;
              case 60:
                pointSystem = racePointsSystems[3];
                break;
            }
          }
        } else {
          pointSystem = racePointsSystems[1];
        }
        return {
          raceNumber: index + 1,
          name: arrayRaceData[index].RaceConfig.Track,
          results: raceData.RaceResult,
          pointSystem: pointSystem,
          driverFastestLapGuid: raceData.BestLap[0].SteamID

        };
      });

      const DriversChamp: DriverDataChamp[] = getDriverDataChamp(RacesChamp, arrayRaceData);
      const DriversPointsPerRace: DriverPointsPerRace[] = getDriverPointsPerRace(RacesChamp, DriversChamp);
      const TeamsChamp: TeamDataChamp[] = getTeamsDataChamp(DriversChamp);

      // *** Tabla de resultados de pilotos ***
      let tablaIndyChampsHTML = `
      <p class="text-3xl font-bold border-b-2 border-primary w-fit mx-auto mt-4 mb-2">Clasificación Campeonato Individual</p>
      <table class="table table-striped table-hover table-sm w-full border border-light-primary">
        <thead class="font-medium bg-primary">
          <tr class="tabletitle">
            <th colspan="2">#</th>
            <th>Piloto</th>
            <th colspan="3">Coche</th>
            <th>Equipo</th>
            <th>Total</th>
          `;
      RacesChamp.map((raceData) => {
        const trackName = circuits.find((circuit) => circuit.filename === raceData.name);
        if (!trackName) {
          tablaIndyChampsHTML += `<th>${raceData.name}</th>`;
        } else {
          tablaIndyChampsHTML += `<th>${trackName?.shortname}</th>`;
        }
      });
      tablaIndyChampsHTML += `</tr></thead><tbody>`;

      let posDriver = 0;
      let vueltasLider: number = 0;
      for (let itemDriver of DriversChamp) {
        posDriver++;

        const DriverName = itemDriver.name;
        const DriverGUID = itemDriver.guid;
        const isCarExists = cars.find((car) => car.filename === itemDriver.car);
        let carName: string;
        let carBrand: string;
        let carClass: string;
        let carColorClass: string;
        if (isCarExists) {
          carName = isCarExists.brand + " " + isCarExists.model;
          carBrand = isCarExists.imgbrand;
          // carClass = getClassShortName(isCarExists.subclass);
          // carColorClass = getColorClass(isCarExists.subclass);
          carClass = "";
          carColorClass = "";
        } else {
          carName = itemDriver.car;
          carBrand = "";
          carClass = "";
          carColorClass = "";
        }
        const teamName = itemDriver.team;
        const totalPoints = itemDriver.totalsPoints;

        if (posDriver % 2 === 0) {
          tablaIndyChampsHTML += `<tr class="bg-dark-primary">`;
        } else {
          tablaIndyChampsHTML += `<tr class="bg-dark-second">`;
        }
        tablaIndyChampsHTML += `
          <td class = "text-center font-bold">${posDriver}</td>
          <td></td>
          <td class = "text-start font-normal">${DriverName}</td>
          <td class = "text-center"><span ${carColorClass}>${carClass}</span></td>
          <td class = "text-center"><img class='w-4 justify-end' src='${carBrand}' alt=''></img></td>
          <td class = "text-start font-medium">${carName}</td>
          <td class = "text-center font-medium">${teamName}</td>
          <td class = "text-center font-medium">${totalPoints}</td>`;

        for (let raceData of RacesChamp) {
          const pointArray = points.find((point) => point.Name === raceData.pointSystem);
          const driverPosition = raceData.results.find((driver) => driver.SteamID === DriverGUID);
          const fastestLap = pointArray && raceData.driverFastestLapGuid === DriverGUID ? pointArray.FastestLap : 0;
          const fastestLapClass = fastestLap !== 0 ? ` class = "bg-[#c100ff] text-white font-bold rounded-full w-content px-5"` : ``;
          let driverPoints = driverPosition && pointArray ? pointArray.Puntuation[driverPosition.Pos - 1] + fastestLap : 0;

          let posicionFinal = 'NP';

          // Obtener numero de vueltas totales / vuelta rapida / neumatico
          let vueltastotales = raceData.results.find((driver) => driver.SteamID === DriverGUID)?.Laps;
          if (vueltastotales === undefined) {
            vueltastotales = 0;
          }

          if (driverPosition) {
            if (driverPosition.Pos === 1) {
              vueltasLider = vueltastotales;
              posicionFinal = '(1º)';
            } else {
              switch (driverPosition.Pos) {
                case -1:
                  posicionFinal = 'DNF';
                  driverPoints = 0; break;
                case -2:
                  posicionFinal = 'DQ';
                  driverPoints = 0; break;
                case -3:
                  posicionFinal = 'DNS';
                  driverPoints = 0; break;
                case -4:
                  switch (driverPosition.Team) {
                    case "STREAMING":
                      posicionFinal = 'TV';
                      driverPoints = 0;
                      break;
                    case "ESP Racing Staff":
                      posicionFinal = 'STAFF';
                      driverPoints = 0;
                      break;
                    case "Safety Car":
                      posicionFinal = 'SC';
                      driverPoints = 0;
                      break;
                    default:
                      posicionFinal = 'DNS';
                      driverPoints = 0;
                      break;
                  }
                  break;
                default:
                  posicionFinal = "("+driverPosition.Pos.toString()+"º)";
              }
              if (driverPosition.Pos === -4 && raceData.name === "STREAMING") {
                posicionFinal = 'TV';
                driverPoints = 0;
              }
            }
          }
          tablaIndyChampsHTML += `
          <td class = "text-center"><span ${fastestLapClass}>${driverPoints}</span> - ${posicionFinal}</td>`;
        }
        tablaIndyChampsHTML += `</tr>`;

      }

      // *** Cambios de posiciones en campeonato individual ***
      const seriesDataIndyChamp = DriversChamp.map((driver) => {
        const driverPoints = RacesChamp.map((raceData) => {
          const driverData = raceData.results.find((result) => result.SteamID === driver.guid);
          if (!driverData || driverData.Pos <= 0) {
            return 0;
          }
          const pointArray = points.find((point) => point.Name === raceData.pointSystem);
          const fastestLap = pointArray && raceData.driverFastestLapGuid === driver.guid ? pointArray.FastestLap : 0;
          return pointArray ? pointArray.Puntuation[driverData.Pos - 1] + fastestLap : 0;
        });

        const cumulativePoints = driverPoints.reduce((acc: number[], points, index) => {
          if (index === 0) {
            acc.push(points);
          } else {
            acc.push(points + acc[index - 1]);
          }
          return acc;
        }, [] as number[]);

        return {
          name: driver.name,
          data: cumulativePoints,
        };
      });

      const categoriesChart = RacesChamp.map((raceData) => {
        const trackName = circuits.find((circuit) => circuit.filename === raceData.name);
        return trackName ? trackName.shortname : raceData.name;
      });

      let stepChartIndy: number = 20;
      let MaxStepChartIndy: number = 0;
      const pointsFirst = DriversChamp[0].totalsPoints;
      const stepMaxPairs = [
        { step: 10, max: 10, threshold: 75 },
        { step: 25, max: 15, threshold: 100 },
        { step: 50, max: 20, threshold: 150 },
        { step: 70, max: 25, threshold: 225 },
        { step: 85, max: 25, threshold: 300 },
        { step: 100, max: 25, threshold: 500 },
        { step: 125, max: 25, threshold: 700 },
        { step: 150, max: 25, threshold: Infinity }
      ];

      for (const { step, max, threshold } of stepMaxPairs) {
        if (pointsFirst <= threshold) {
          stepChartIndy = step;
          MaxStepChartIndy = pointsFirst + max;
          break;
        }
      }


      var optionsIndyChamp = {
        title: {
          text: 'Progresión de Puntos en el Campeonato Individual',
          align: 'center',
          style: {
            color: '#f9f9f9',
            fontSize: '24px',
            fontWeight: 'bold',
          },
        },

        series: seriesDataIndyChamp,
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
          categories: categoriesChart,
          labels: {
            style: {
              colors: '#f9f9f9',
            },
          },
        },

        yaxis: {
          stepSize: stepChartIndy,
          min: 1,
          max: MaxStepChartIndy,
          position: 'top',
          title: {
            text: 'Puntos',
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
          onDatasetHover: {
            highlightDataSeries: true,
          },
        },

        legend: {
          labels: {
            colors: '#f9f9f9',
          }
        },
      };

      var chartChangePosition = new ApexCharts(chartProgressionIndyChamp, optionsIndyChamp);
      chartChangePosition.resetSeries();
      chartChangePosition.render();

      // *** Tabla de resultados de equipos ***
      let tablaTeamChampsHTML = `
      <p class="text-3xl font-bold border-b-2 border-primary w-fit mx-auto mt-4 mb-2">Clasificación Campeonato Por Equipos</p>
      <table class="table table-striped table-hover table-sm w-full border border-light-primary">
        <thead class="font-medium bg-primary">
          <tr class="tabletitle">
            <th colspan="2">#</th>
            <th>Equipo</th>
            <th>Total</th>
          `;
      RacesChamp.map((raceData) => {
        const trackName = circuits.find((circuit) => circuit.filename === raceData.name);
        if (!trackName) {
          tablaTeamChampsHTML += `<th>${raceData.name}</th>`;
        } else {
          tablaTeamChampsHTML += `<th>${trackName?.shortname}</th>`;
        }
      });
      tablaIndyChampsHTML += `</tr></thead><tbody>`;

      let posTeam = 0;
      let vueltasLiderTeam: number = 0;
      for (let itemTeam of TeamsChamp) {
        posTeam++;

        const TeamName = itemTeam.name;
        const Driver1GUID = itemTeam.guidDriver1;
        const Driver2GUID = itemTeam.guidDriver2;
        const totalPoints = itemTeam.points;

        //console.log('Equipo: ' + TeamName + ' - Piloto 1: ' + Driver1GUID + ' - Piloto 2: ' + Driver2GUID);

        if (posTeam % 2 === 0) {
          tablaTeamChampsHTML += `<tr class="bg-dark-primary">`;
        } else {
          tablaTeamChampsHTML += `<tr class="bg-dark-second">`;
        }
        tablaTeamChampsHTML += `
          <td class = "text-center font-bold">${posTeam}</td>
          <td></td>
          <td class = "text-start font-normal">${TeamName}</td>
          <td class = "text-center font-medium">${totalPoints}</td>`;


        for (let raceData of RacesChamp) {
          const pointArray = points.find((point) => point.Name === raceData.pointSystem);

          const driverPosition1 = raceData.results.find((driver) => driver.SteamID === Driver1GUID);
          const driverPosition2 = raceData.results.find((driver) => driver.SteamID === Driver2GUID);

          const fastestLapDriver1 = pointArray && raceData.driverFastestLapGuid === Driver1GUID ? pointArray.FastestLap : 0;
          const fastestLapDriver2 = pointArray && raceData.driverFastestLapGuid === Driver2GUID ? pointArray.FastestLap : 0;

          const fastestLapDriver1Class = fastestLapDriver1 !== 0 ? ` class = "bg-[#c100ff] text-white font-bold rounded-full w-content px-5"` : ``;
          const fastestLapDriver2Class = fastestLapDriver2 !== 0 ? ` class = "bg-[#c100ff] text-white font-bold rounded-full w-content px-5"` : ``;

          let driver1Points = driverPosition1 && pointArray ? pointArray.Puntuation[driverPosition1.Pos - 1] + fastestLapDriver1 : 0;
          let driver2Points = driverPosition2 && pointArray ? pointArray.Puntuation[driverPosition2.Pos - 1] + fastestLapDriver2 : 0;

          let posicionFinalDriver1 = 'NP';
          let posicionFinalDriver2 = 'NP';
          let vueltastotalesDriver1 = 0;
          let vueltastotalesDriver2 = 0;

          if (driverPosition1) {
            vueltastotalesDriver1 = driverPosition1.Laps;
            if (driverPosition1.Pos === 1) {
              vueltasLiderTeam = vueltastotalesDriver1;
              posicionFinalDriver1 = '1º';
            } else {
              switch (driverPosition1.Pos) {
                case -1:
                  posicionFinalDriver1 = 'DNF';
                  driver1Points = 0; break;
                case -2:
                  posicionFinalDriver1 = 'DQ';
                  driver1Points = 0; break;
                case -3:
                  posicionFinalDriver1 = 'DNS';
                  driver1Points = 0; break;
                case -4:
                  switch (driverPosition1.Team) {
                    case "STREAMING":
                      posicionFinalDriver1 = 'TV';
                      driver1Points = 0;
                      break;
                    case "ESP Racing Staff":
                      posicionFinalDriver1 = 'STAFF';
                      driver1Points = 0;
                      break;
                    case "Safety Car":
                      posicionFinalDriver1 = 'SC';
                      driver1Points = 0;
                      break;
                    default:
                      posicionFinalDriver1 = 'DNS';
                      driver1Points = 0;
                      break;
                  }
                  break;
                default:
                  posicionFinalDriver1 = driverPosition1.Pos.toString() + 'º';
              }
              if (driverPosition1.Pos === -4 && raceData.name === "STREAMING") {
                posicionFinalDriver1 = 'TV';
              }
            }
          }

          if (driverPosition2) {
            vueltastotalesDriver2 = driverPosition2.Laps;
            if (driverPosition2.Pos === 1) {
              vueltasLiderTeam = vueltastotalesDriver2;
              posicionFinalDriver2 = '1º';
            } else {
              switch (driverPosition2.Pos) {
                case -1:
                  posicionFinalDriver2 = 'DNF';
                  driver2Points = 0; break;
                case -2:
                  posicionFinalDriver2 = 'DQ';
                  driver2Points = 0; break;
                case -3:
                  posicionFinalDriver2 = 'DNS';
                  driver2Points = 0; break;
                case -4:
                  switch (driverPosition2.Team) {
                    case "STREAMING":
                      posicionFinalDriver2 = 'TV';
                      driver2Points = 0;
                      break;
                    case "ESP Racing Staff":
                      posicionFinalDriver2 = 'STAFF';
                      driver2Points = 0;
                      break;
                    case "Safety Car":
                      posicionFinalDriver2 = 'SC';
                      driver2Points = 0;
                      break;
                    default:
                      posicionFinalDriver2 = 'DNS';
                      driver2Points = 0;
                      break;
                  }
                  break;
                default:
                  posicionFinalDriver2 = driverPosition2.Pos.toString() + 'º';
              }
              if (driverPosition2.Pos === -4 && raceData.name === "STREAMING") {
                posicionFinalDriver2 = 'TV';
              }
            }
          }

          if (driver1Points > driver2Points || posicionFinalDriver1 === 'DNF') {
            tablaTeamChampsHTML += `
              <td class = "text-center">
                <span ${fastestLapDriver1Class}>${driver1Points}</span> + <span ${fastestLapDriver2Class}>${driver2Points}</span> ( ${posicionFinalDriver1} / ${posicionFinalDriver2} )
              </td>`;
          } else {
            tablaTeamChampsHTML += `
              <td class = "text-center">
                <span ${fastestLapDriver2Class}>${driver2Points}</span> + <span ${fastestLapDriver1Class}>${driver1Points}</span> ( ${posicionFinalDriver2} / ${posicionFinalDriver1} )
              </td>`;
          }

        }
        tablaTeamChampsHTML += `</tr>`;

      }

      // *** Cambios de posiciones de equipos ***
      const seriesDataTeamChamp = TeamsChamp.map((team) => {
        const teamPoints = RacesChamp.map((raceData) => {
          const driver1Data = raceData.results.find((result) => result.SteamID === team.guidDriver1);
          const driver2Data = raceData.results.find((result) => result.SteamID === team.guidDriver2);

          const pointArray = points.find((point) => point.Name === raceData.pointSystem);
          const fastestLapDriver1 = pointArray && raceData.driverFastestLapGuid === team.guidDriver1 ? pointArray.FastestLap : 0;
          const fastestLapDriver2 = pointArray && raceData.driverFastestLapGuid === team.guidDriver2 ? pointArray.FastestLap : 0;

          let driver1Points = 0;
          let driver2Points = 0;

          let posDriver1 = driver1Data?.Pos || 0;
          let posDriver2 = driver2Data?.Pos || 0;

          let vueltasLiderTeam = 0;
          let vueltastotalesDriver1 = driver1Data?.Laps || 0;
          let vueltastotalesDriver2 = driver2Data?.Laps || 0;

          if (posDriver1 === 1) {
            vueltasLiderTeam = vueltastotalesDriver1;
          } 
          // else {
          //   switch (posDriver1) {
          //     case -1:
          //       if (driver1Data?.Team === "ESP Racing Staff") {
          //         posDriver1 = -4;
          //       } else {
          //         posDriver1 = -1;
          //       }
          //       break;
          //     case -2:
          //       posDriver1 = -2;
          //       break;
          //     case -3:
          //       posDriver1 = -3;
          //       break;
          //     case -4:
          //       switch (driver1Data?.Team) {
          //         case "STREAMING":
          //           posDriver1 = -4;
          //           break;
          //         case "ESP Racing Staff":
          //           posDriver1 = -4;
          //           break;
          //         case "Safety Car":
          //           posDriver1 = -4;
          //           break;
          //         default:
          //           posDriver1 = -3;
          //           break;
          //       }
          //       break;
          //     default:
          //       const timerace = (driver1Data?.TotalTime || 0) + (driver1Data?.Penalties || 0);
          //       const condicion1 = (Math.trunc((timerace / 3600) % 60) + Math.trunc(timerace / 60));
          //       const dconfig = arrayRaceData[raceData.raceNumber - 1].RaceConfig;

          //       if (vueltastotalesDriver1 < vueltasLider * 0.9 && ((condicion1 < dconfig.RaceDurationTime) || (vueltasLiderTeam < dconfig.RaceDurationLaps * 0.9))) {
          //         posDriver1 = -1;
          //       }
          //       break;
          //   }

          //   if (driver1Data?.Pos === -4 && driver1Data?.DriverName === "STREAMING") {
          //     posDriver1 = -4;
          //   }
          // }

          if (posDriver2 === 1) {
            vueltasLiderTeam = vueltastotalesDriver2;

          }
          // else {
          //   switch (posDriver2) {
          //     case -1:
          //       if (driver2Data?.Team === "ESP Racing Staff") {
          //         posDriver2 = -4;
          //       } else {
          //         posDriver2 = -1;
          //       }
          //       break;
          //     case -2:
          //       posDriver2 = -2;
          //       break;
          //     case -3:
          //       posDriver2 = -3;
          //       break;
          //     case -4:
          //       switch (driver2Data?.Team) {
          //         case "STREAMING":
          //           posDriver2 = -4;
          //           break;
          //         case "ESP Racing Staff":
          //           posDriver2 = -4;
          //           break;
          //         case "Safety Car":
          //           posDriver2 = -4;
          //           break;
          //         default:
          //           posDriver2 = -3;
          //           break;
          //       }
          //       break;
          //     default:
          //       const timerace = (driver2Data?.TotalTime || 0) + (driver2Data?.Penalties || 0);
          //       const condicion2 = (Math.trunc((timerace / 3600) % 60) + Math.trunc(timerace / 60));
          //       const dconfig = arrayRaceData[raceData.raceNumber - 1].RaceConfig;

          //       if (vueltastotalesDriver2 < vueltasLider * 0.9 && ((condicion2 < dconfig.RaceDurationTime) || (vueltasLiderTeam < dconfig.RaceDurationLaps * 0.9))) {
          //         posDriver2 = -1;
          //       }
          //       break;
          //   }
          //   if (driver2Data?.Pos === -4 && driver2Data?.DriverName === "STREAMING") {
          //     posDriver2 = -4;
          //   }
          // }

          if (driver1Data && posDriver1 > 0) {
            driver1Points = pointArray ? pointArray.Puntuation[posDriver1 - 1] + fastestLapDriver1 : 0;
          }
          if (driver2Data && posDriver2 > 0) {
            driver2Points = driver2Data && pointArray ? pointArray.Puntuation[posDriver2 - 1] + fastestLapDriver2 : 0;
          }

          return driver1Points + driver2Points;
        });

        const cumulativePoints = teamPoints.reduce((acc: number[], points, index) => {
          if (index === 0) {
            acc.push(points);
          } else {
            acc.push(points + acc[index - 1]);
          }
          return acc;
        }, [] as number[]);

        return {
          name: team.name,
          data: cumulativePoints,
        };
      });

      //console.log(seriesDataTeamChamp);

      let stepChartTeam: number = 20;
      let MaxStepChartTeam: number = 0;
      const pointsFirstTeam = TeamsChamp[0].points;
      const stepMaxTeamsPairs = [
        { step: 10, max: 10, threshold: 75 },
        { step: 25, max: 15, threshold: 100 },
        { step: 50, max: 20, threshold: 150 },
        { step: 70, max: 25, threshold: 225 },
        { step: 85, max: 25, threshold: 300 },
        { step: 100, max: 25, threshold: 500 },
        { step: 125, max: 25, threshold: 700 },
        { step: 150, max: 25, threshold: Infinity }
      ];

      for (const { step, max, threshold } of stepMaxTeamsPairs) {
        if (pointsFirstTeam <= threshold) {
          stepChartTeam = step;
          MaxStepChartTeam = pointsFirstTeam + max;
          break;
        }
      }


      var optionsTeamChamp = {
        title: {
          text: 'Progresión de Puntos en el Campeonato por Equipos',
          align: 'center',
          style: {
            color: '#f9f9f9',
            fontSize: '24px',
            fontWeight: 'bold',
          },
        },

        series: seriesDataTeamChamp,
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
          categories: categoriesChart,
          labels: {
            style: {
              colors: '#f9f9f9',
            },
          },
        },

        yaxis: {
          stepSize: stepChartTeam,
          min: 1,
          max: MaxStepChartTeam,
          position: 'top',
          title: {
            text: 'Puntos',
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
          onDatasetHover: {
            highlightDataSeries: true,
          },
        },

        legend: {
          labels: {
            colors: '#f9f9f9',
          }
        },
      };

      var chartTeamChamps = new ApexCharts(chartProgressionTeamsChamp, optionsTeamChamp);
      chartTeamChamps.resetSeries();
      chartTeamChamps.render();


      if (tablaIndyChamps) {
        tablaIndyChamps.innerHTML = tablaIndyChampsHTML;
      }
      if (tablaTeamsChamps) {
        tablaTeamsChamps.innerHTML = tablaTeamChampsHTML;
      }

    } catch (error) {
      console.error('Error al cargar los datos del campeonato: ' + error);
    }

  }

  if (loadButton) {
    loadButton.addEventListener('click', loadData);
  } else {
    console.error('Elemento con id "loadButton" no encontrado.');
  }
}


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeScript);
} else {
  initializeScript();
}

// function cleanupEventListeners() {
//   const loadButton = document.getElementById('loadButtonChamp');
//   if (loadButton) {
//     loadButton.removeEventListener('click', loadData);
//   }
// }

// Maneja las transiciones de página de Astro
document.addEventListener('astro:page-load', initializeScript);

// Limpiar event listeners antes de descargar la página
// document.addEventListener('astro:page-unload', cleanupEventListeners);


// Obtener los datos globales de los pilotos
function getDriverDataChamp(result: RaceDataChamp[], rd: RaceData[]): DriverDataChamp[] {
  let respuesta: DriverDataChamp[] = [];
  result.map((raceData) => {
    const pointArray = points.find((point) => point.Name === raceData.pointSystem);
    if (pointArray !== undefined) {
      let vueltasLider: number = 0;
      for (let item of raceData.results) {
        let vueltasTotales = item.Laps;
        let pos = item.Pos;
        const driverIndex = respuesta.findIndex((driver) => driver.guid === item.SteamID);


        if (pos === 1) {
          vueltasLider = vueltasTotales;

        } 
        // else {
        //   switch (pos) {
        //     case -1:
        //       if (item.Team === "ESP Racing Staff") {
        //         pos = -4;
        //       } else {
        //         pos = -1;
        //       }
        //       break;
        //     case -2:
        //       pos = -2;
        //       break;
        //     case -3:
        //       pos = -3;
        //       break;
        //     case -4:
        //       switch (item.Team) {
        //         case "STREAMING":
        //           pos = -4;
        //           break;
        //         case "ESP Racing Staff":
        //           pos = -4;
        //           break;
        //         case "Safety Car":
        //           pos = -4;
        //           break;
        //         default:
        //           pos = -3;
        //           break;
        //       }
        //       break;
        //     default:
        //       const timerace = (item.TotalTime) + (item.Penalties);
        //       const condicion1 = (Math.trunc((timerace / 3600) % 60) + Math.trunc(timerace / 60));
        //       const dconfig = rd[raceData.raceNumber - 1].RaceConfig;

        //       if (vueltasTotales < vueltasLider * 0.9 && ((condicion1 < dconfig.RaceDurationTime) || (vueltasTotales < dconfig.RaceDurationLaps * 0.9))) {
        //         pos = -1;
        //       }
        //       break;
        //   }
        //   if (item.Pos === -4 && item.DriverName === "STREAMING") {
        //     pos = -4;
        //   }
        // }
        if (driverIndex === -1) {
          if (pos > 0) {

            if (item.SteamID === raceData.driverFastestLapGuid) {
              respuesta.push({
                name: item.DriverName,
                guid: item.SteamID,
                car: item.CarFileName,
                team: item.Team,
                totalsPoints: pointArray.Puntuation[item.Pos - 1] + pointArray.FastestLap
              });

            } else {
              respuesta.push({
                name: item.DriverName,
                guid: item.SteamID,
                car: item.CarFileName,
                team: item.Team,
                totalsPoints: pointArray.Puntuation[item.Pos - 1]
              });
            }

          } else if (pos !== -4) {
            respuesta.push({
              name: item.DriverName,
              guid: item.SteamID,
              car: item.CarFileName,
              team: item.Team,
              totalsPoints: 0
            });
          }

        } else {
          if (pos > 0) {
            if (item.SteamID === raceData.driverFastestLapGuid) {
              respuesta[driverIndex].totalsPoints += pointArray.FastestLap;
            }
            respuesta[driverIndex].totalsPoints += pointArray.Puntuation[pos - 1];
          }
        }
      }
    }
  });

  // Ordenar por puntos, victorias, podios, mejor posición, vueltas rápidas y mejor posición antes, si hay empate
  return respuesta.sort((a, b) => {
    if (b.totalsPoints !== a.totalsPoints) {
      return b.totalsPoints - a.totalsPoints;
    }

    const getPositionCounts = (driver: DriverDataChamp) => {
      const positionCounts = new Array(100).fill(0);
      result.forEach(raceData => {
        const driverResult = raceData.results.find(res => res.SteamID === driver.guid);
        if (driverResult && driverResult.Pos > 0) {
          positionCounts[driverResult.Pos - 1]++;
        }
      });
      return positionCounts;
    };

    const aPositionCounts = getPositionCounts(a);
    const bPositionCounts = getPositionCounts(b);

    for (let i = 0; i < aPositionCounts.length; i++) {
      if (bPositionCounts[i] !== aPositionCounts[i]) {
        return bPositionCounts[i] - aPositionCounts[i];
      }
    }

    const aFastestLaps = result.reduce((count, raceData) => count + (raceData.driverFastestLapGuid === a.guid ? 1 : 0), 0);
    const bFastestLaps = result.reduce((count, raceData) => count + (raceData.driverFastestLapGuid === b.guid ? 1 : 0), 0);

    if (bFastestLaps !== aFastestLaps) {
      return bFastestLaps - aFastestLaps;
    }

    const getFirstBestPositionRaceNumber = (driver: DriverDataChamp) => {
      for (let raceData of result) {
        const driverResult = raceData.results.find(res => res.SteamID === driver.guid);
        if (driverResult && driverResult.Pos > 0) {
          return raceData.raceNumber;
        }
      }
      return Infinity;
    };

    return getFirstBestPositionRaceNumber(a) - getFirstBestPositionRaceNumber(b);
  });
}

function getDriverPointsPerRace(result: RaceDataChamp[], orderChamp: DriverDataChamp[]): DriverPointsPerRace[] {
  let respuesta: DriverPointsPerRace[] = [];

  for (let raceData of result) {
    const nRace = raceData.raceNumber;
    const pointArray = points.find((point) => point.Name === raceData.pointSystem);
    let pointSystem: number[] = [];
    let pointSystemFastestLap: number = 0;
    if (pointArray !== undefined) {
      pointSystem = pointArray.Puntuation;
      pointSystemFastestLap = pointArray.FastestLap;
    } else {
      pointSystem = points[0].Puntuation;
      pointSystemFastestLap = points[0].FastestLap;
    }

    for (let itemR of raceData.results) {
      const name = itemR.DriverName;
      const guid = itemR.SteamID;
      let points: number = 0;
      if (itemR.Pos > 0) {
        if (guid === raceData.driverFastestLapGuid) {
          points = pointSystem[itemR.Pos - 1] + pointSystemFastestLap;
        } else {
          points = pointSystem[itemR.Pos - 1];
        }
      }
      respuesta.push({ name: name, guid: guid, racenumber: nRace, points: points });
    }
  }

  return respuesta.sort((a, b) => {
    const indexA = orderChamp.findIndex(driver => driver.guid === a.guid);
    const indexB = orderChamp.findIndex(driver => driver.guid === b.guid);
    return indexA - indexB;
  });
}

// Obtener los datos globales de los equipos
function getTeamsDataChamp(result: DriverDataChamp[]): TeamDataChamp[] {
  let respuesta: TeamDataChamp[] = [];
  result.map((raceData) => {
    const teamIndex = respuesta.findIndex((team) => team.name.toLowerCase() === raceData.team.toLowerCase());
    if (teamIndex === -1) {
      if (raceData.team !== 'No Team' && raceData.team !== '') {
        respuesta.push({
          name: raceData.team,
          guidDriver1: raceData.guid,
          guidDriver2: '',
          points: raceData.totalsPoints
        });
      }
    } else {
      if (respuesta[teamIndex].guidDriver2 === '') {
        respuesta[teamIndex].guidDriver2 = raceData.guid;
      }
      respuesta[teamIndex].points += raceData.totalsPoints;
      //console.log('Equipo: ' + respuesta[teamIndex].name + ' - Piloto 1: ' + respuesta[teamIndex].guidDriver1 + ' - Piloto 2: ' + respuesta[teamIndex].guidDriver2);
    }
  });


  // Ordenar por puntos, victorias, podios, mejor posición, vueltas rápidas y mejor posición antes, si hay empate para un equipo
  return respuesta.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }

    const getPositionCounts = (team: TeamDataChamp) => {
      const positionCounts = new Array(100).fill(0);
      result.forEach(driver => {
        if (driver.team === team.name) {
          const driverResult = result.find(res => res.guid === driver.guid);
          if (driverResult) {
            positionCounts[driverResult.totalsPoints - 1]++;
          }
        }
      });
      return positionCounts;
    };

    const aPositionCounts = getPositionCounts(a);
    const bPositionCounts = getPositionCounts(b);

    for (let i = 0; i < aPositionCounts.length; i++) {
      if (bPositionCounts[i] !== aPositionCounts[i]) {
        return bPositionCounts[i] - aPositionCounts[i];
      }
    }

    const aFastestLaps = result.reduce((count, driver) => count + (driver.team === a.name && (driver.guid === a.guidDriver1 || driver.guid === a.guidDriver2) ? 1 : 0), 0);
    const bFastestLaps = result.reduce((count, driver) => count + (driver.team === b.name && (driver.guid === b.guidDriver1 || driver.guid === b.guidDriver2) ? 1 : 0), 0);

    if (bFastestLaps !== aFastestLaps) {
      return bFastestLaps - aFastestLaps;
    }

    const getFirstBestPositionRaceNumber = (team: TeamDataChamp) => {
      for (let driver of result) {
        if (driver.team === team.name) {
          return driver.totalsPoints;
        }
      }
      return Infinity;
    };

    return getFirstBestPositionRaceNumber(a) - getFirstBestPositionRaceNumber(b);
  });
}
