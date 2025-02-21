import ApexCharts from 'apexcharts';
import { supabase } from "@/db/supabase";
import { showToast } from "@/lib/utils";

import type { Points } from "@/types/Points";
import type { RaceResult,RaceCarResume } from "@/types/Results";
import type { CarData, ChampRacesData } from "@/types/Utils";

/* *************************** */
interface DriverDataChamp {
  name: string;
  guid: string;
  car: string;
  team: string;
  totalPoints: number;
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
  pointSystem: Points;
  driverFastestLapGuid: string;
}

interface TeamDataChamp {
  name: string;
  guidDriver1: string;
  guidDriver2: string;
  points: number;
}

/* *************************** */

async function initializeScript() {
  const isResultsPage = document.getElementById('resultsIndyChampsTable') !== null;

	if (!isResultsPage) {
	  return; // Salir si no estamos en la página de resultados
	}
  const loadButton = document.getElementById('loadButtonChamp');

  const opcionesChamps = document.getElementById('select-champ') as HTMLSelectElement;

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

      const dataRAW = await response.json();
      const championshipData: ChampRacesData[] = dataRAW.champRacesData;
      //console.log('Championship Data:', championshipData);


      const numRaces = championshipData.length;
      let numRaceProccesed = 0;
      let flagRace2 = false;

      let RacesChamp: RaceDataChamp[] = [];

      for(let i = 0; i < numRaces; i++){
        numRaceProccesed++;
        if(championshipData[i].raceData2){
          !flagRace2 ? flagRace2 = true : null;

          const auxRacesChamps ={
            raceNumber: 0,
            name: championshipData[i].raceData1?.RaceConfig.Track+'@'+championshipData[i].raceData1?.RaceConfig.TrackLayout || '',
            results: championshipData[i].raceData1?.RaceResult || [],
            pointSystem: championshipData[i].points,
            driverFastestLapGuid: championshipData[i].raceData1?.BestLap[0].SteamID || ''
          } as RaceDataChamp;
          RacesChamp.push(auxRacesChamps);

          numRaceProccesed++;
          const auxRacesChamps2 ={
            raceNumber: 0,
            name: championshipData[i].raceData2?.RaceConfig.Track+'@'+championshipData[i].raceData2?.RaceConfig.TrackLayout || '',
            results: championshipData[i].raceData2?.RaceResult || [],
            pointSystem: championshipData[i].points,
            driverFastestLapGuid: championshipData[i].raceData1?.BestLap[0].SteamID || ''} as RaceDataChamp;
            RacesChamp.push(auxRacesChamps2);
        }else{
          const auxRacesChamps ={
            raceNumber: 0,
            name: championshipData[i].raceData1?.RaceConfig.Track+'@'+championshipData[i].raceData1?.RaceConfig.TrackLayout || '',
            results: championshipData[i].raceData1?.RaceResult || [],
            pointSystem: championshipData[i].points,
            driverFastestLapGuid: championshipData[i].raceData1?.BestLap[0].SteamID || ''
          } as RaceDataChamp;
          RacesChamp.push(auxRacesChamps);
        }
      }

      let DriversChamp: DriverDataChamp[] = getDriverDataChamp(RacesChamp);
      const DriversPointsPerRace: DriverPointsPerRace[] = getDriverPointsPerRace(RacesChamp, DriversChamp);
      const TeamsChamp: TeamDataChamp[] = getTeamsDataChamp(DriversChamp);
      const CarsData = await getCarsInChampionship(championshipData.flatMap((raceData) => raceData.raceData1?.RaceCarResume || []));

      DriversChamp = DriversChamp.filter(driver => {
        return driver.totalPoints > 0 && !RacesChamp.every(race => {
          const result = race.results.find(r => r.SteamID === driver.guid);
          return !result || result.Pos === -3;
        });
      });

      // *** Tabla de resultados de pilotos ***
      let tablaIndyChampsHTML = `
      <p class="text-3xl font-bold border-b-2 border-primary w-fit mx-auto mt-4 mb-2">Clasificación Campeonato Individual</p>
      <table class="table table-striped table-hover table-sm w-full border border-lightPrimary">
        <thead class="font-medium bg-primary">
          <tr class="tabletitle">
            <th colspan="2">#</th>
            <th>Piloto</th>
            <th colspan="3">Coche</th>
            <th>Equipo</th>
            <th>Total</th>
          `;

      for (let i = 0; i<RacesChamp.length; i++){
        const raceData = RacesChamp[i];
        const {data: trackData } = await supabase
        .from('circuit')
        .select('*')
        .eq('filename', raceData.name.split('@')[0])
        .single();

        if(flagRace2){
          if (!trackData) {
            tablaIndyChampsHTML += `<th>${raceData.name} R${((i%2) + 1)}</th>`;
          } else {
            tablaIndyChampsHTML += `<th>${trackData?.shortname} R${((i%2) + 1)}</th>`;
          }
        }else{
          if (!trackData) {
            tablaIndyChampsHTML += `<th>${raceData.name}</th>`;
          } else {
            tablaIndyChampsHTML += `<th>${trackData?.shortname}</th>`;
          }
        }
      }
      tablaIndyChampsHTML += `</tr></thead><tbody>`;

      let posDriver = 0;
      let vueltasLider: number = 0;
      for (let itemDriver of DriversChamp) {
        posDriver++;

        const DriverName = itemDriver.name;
        const DriverGUID = itemDriver.guid;
        const isCarExists = CarsData.find((car) => car.filename === itemDriver.car);
        let carName: string;
        let carBrand: string;
        let carClass: string;
        let carColorClass: string;
        if (isCarExists) {
          carName = isCarExists.brand + " " + isCarExists.model;
          carBrand = isCarExists.imgbrand;
          carClass = "";
          carColorClass = "";
        } else {
          carName = itemDriver.car;
          carBrand = "";
          carClass = "";
          carColorClass = "";
        }
        const teamName = itemDriver.team;
        const totalPoints = itemDriver.totalPoints;

        if (posDriver % 2 === 0) {
          tablaIndyChampsHTML += `<tr class="bg-darkPrimary">`;
        } else {
          tablaIndyChampsHTML += `<tr class="bg-darkSecond">`;
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
          const driverPosition = raceData.results.find((driver) => driver.SteamID === DriverGUID);
          const fastestLap = raceData.driverFastestLapGuid === DriverGUID ? raceData.pointSystem.FastestLap : 0;
          const fastestLapClass = fastestLap !== 0 ? ` class = "bg-[#c100ff] text-white font-bold rounded-full w-content px-3"` : ``;
          let driverPoints = driverPosition ? raceData.pointSystem.Puntuation[driverPosition.Pos - 1] + fastestLap : 0;

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
          const fastestLap = raceData.driverFastestLapGuid === driver.guid ? raceData.pointSystem.FastestLap : 0;
          return raceData.pointSystem.Puntuation[driverData.Pos - 1] + fastestLap;
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

      let categoriesChart: string[] = [];
      for (let i = 0; i<RacesChamp.length; i++){
        const raceData = RacesChamp[i];
        const {data: trackData } = await supabase
        .from('circuit')
        .select('*')
        .eq('filename', raceData.name.split('@')[0])
        .single();

        if(flagRace2){
          if (!trackData) {
            categoriesChart.push(`${raceData.name} R${((i%2) + 1)}`);
          } else {
            categoriesChart.push(`${trackData?.shortname} R${((i%2) + 1)}`);
          }
        }else{
          if (!trackData) {
            categoriesChart.push(`${raceData.name}`);
          } else {
            categoriesChart.push(`${trackData?.shortname}`);
          }
        }
      }

      let stepChartIndy: number = 20;
      let MaxStepChartIndy: number = 0;
      const pointsFirst = DriversChamp[0].totalPoints;
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
          shared: false,
          intersect: true,
          onDatasetHover: {
            highlightDataSeries: false,
          },
          x:{
            show: true,
          },
          y:{
            formatter: function(value: number) {
              return value.toFixed(1);
            }
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
      <table class="table table-striped table-hover table-sm w-full border border-lightPrimary">
        <thead class="font-medium bg-primary">
          <tr class="tabletitle">
            <th colspan="2">#</th>
            <th>Equipo</th>
            <th>Total</th>
          `;

      for (let i = 0; i<RacesChamp.length; i++){
        const raceData = RacesChamp[i];
        const {data: trackData } = await supabase
        .from('circuit')
        .select('*')
        .eq('filename', raceData.name.split('@')[0])
        .single();

        if(flagRace2){
          if (!trackData) {
            tablaTeamChampsHTML += `<th>${raceData.name} R${((i%2) + 1)}</th>`;
          } else {
            tablaTeamChampsHTML += `<th>${trackData?.shortname} R${((i%2) + 1)}</th>`;
          }
        }else{
          if (!trackData) {
            tablaTeamChampsHTML += `<th>${raceData.name}</th>`;
          } else {
            tablaTeamChampsHTML += `<th>${trackData?.shortname}</th>`;
          }
        }
      }

      tablaIndyChampsHTML += `</tr></thead><tbody>`;

      let posTeam = 0;
      let vueltasLiderTeam: number = 0;
      for (let itemTeam of TeamsChamp) {
        posTeam++;

        const TeamName = itemTeam.name;
        const Driver1GUID = itemTeam.guidDriver1;
        const Driver2GUID = itemTeam.guidDriver2;
        const totalPoints = itemTeam.points;

        if (posTeam % 2 === 0) {
          tablaTeamChampsHTML += `<tr class="bg-darkPrimary">`;
        } else {
          tablaTeamChampsHTML += `<tr class="bg-darkSecond">`;
        }
        tablaTeamChampsHTML += `
          <td class = "text-center font-bold">${posTeam}</td>
          <td></td>
          <td class = "text-start font-normal">${TeamName}</td>
          <td class = "text-center font-medium">${totalPoints}</td>`;


        for (let raceData of RacesChamp) {
          const driverPosition1 = raceData.results.find((driver) => driver.SteamID === Driver1GUID);
          const driverPosition2 = raceData.results.find((driver) => driver.SteamID === Driver2GUID);

          const fastestLapDriver1 = raceData.driverFastestLapGuid === Driver1GUID ? raceData.pointSystem.FastestLap : 0;
          const fastestLapDriver2 = raceData.driverFastestLapGuid === Driver2GUID ? raceData.pointSystem.FastestLap : 0;

          const fastestLapDriver1Class = fastestLapDriver1 !== 0 ? ` class = "bg-[#c100ff] text-white font-bold rounded-full w-content px-3"` : ``;
          const fastestLapDriver2Class = fastestLapDriver2 !== 0 ? ` class = "bg-[#c100ff] text-white font-bold rounded-full w-content px-3"` : ``;

          let driver1Points = driverPosition1  ? raceData.pointSystem.Puntuation[driverPosition1.Pos - 1] + fastestLapDriver1 : 0;
          let driver2Points = driverPosition2  ? raceData.pointSystem.Puntuation[driverPosition2.Pos - 1] + fastestLapDriver2 : 0;

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

          const fastestLapDriver1 = raceData.driverFastestLapGuid === team.guidDriver1 ? raceData.pointSystem.FastestLap : 0;
          const fastestLapDriver2 = raceData.driverFastestLapGuid === team.guidDriver2 ? raceData.pointSystem.FastestLap : 0;

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

          if (posDriver2 === 1) {
            vueltasLiderTeam = vueltastotalesDriver2;

          }

          if (driver1Data && posDriver1 > 0) {
            driver1Points =  raceData.pointSystem.Puntuation[posDriver1 - 1] + fastestLapDriver1;
          }
          if (driver2Data && posDriver2 > 0) {
            driver2Points = driver2Data ? raceData.pointSystem.Puntuation[posDriver2 - 1] + fastestLapDriver2 : 0;
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
          shared: false,
          intersect: true,
          onDatasetHover: {
            highlightDataSeries: false,
          },
          x:{
            show: true,
          },
          y:{
            formatter: function(value: number) {
              return value.toFixed(1);
            }
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
      showToast('Error al cargar los datos del campeonato.' + error, 'error');
      console.error('Error al cargar los datos del campeonato: ' + error);
    }

  }

  if (loadButton) {
    loadButton.addEventListener('click', loadData);
  } else {
    showToast('Elemento con id "loadButton" no encontrado.', 'error');
    console.error('Elemento con id "loadButton" no encontrado.');
  }
}


if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeScript);
else initializeScript();

// Maneja las transiciones de página de Astro
document.addEventListener('astro:page-load', initializeScript);



// Obtener los datos globales de los pilotos
function getDriverDataChamp(result: RaceDataChamp[]): DriverDataChamp[] {
  let respuesta: DriverDataChamp[] = [];
  result.map((raceData) => {
    const pointArray = raceData.pointSystem.Puntuation;
    const pointFL = raceData.pointSystem.FastestLap;

    if (pointArray !== undefined) {
      for (let item of raceData.results) {
        const pos = item.Pos;
        const driverIndex = respuesta.findIndex((driver) => driver.guid === item.SteamID);

        if (driverIndex === -1) { // Piloto no encontrado
          const points = pos > 0 ? pointArray[pos - 1] + (item.SteamID === raceData.driverFastestLapGuid ? pointFL : 0) : 0;
          if (pos > 0 || pos !== -4) {
            respuesta.push({
              name: item.DriverName,
              guid: item.SteamID,
              car: item.CarFileName,
              team: item.Team,
              totalPoints: points
            });
          }
        } else {
            pos > 0 ? respuesta[driverIndex].totalPoints += pointArray[item.Pos - 1] + (item.SteamID === raceData.driverFastestLapGuid ? pointFL : 0): 0;
        }
      }
    }
  });

  // Ordenar por puntos, victorias, podios, mejor posición, vueltas rápidas y mejor posición antes, si hay empate
  return respuesta.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
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
    const pointSystem = raceData.pointSystem.Puntuation;
    const pointSystemFastestLap = raceData.pointSystem.FastestLap;

    for (let itemR of raceData.results) {
      respuesta.push({
        name: itemR.DriverName,
        guid: itemR.SteamID,
        racenumber: nRace,
        points: (itemR.Pos > 0 ? pointSystem[itemR.Pos - 1] + (itemR.SteamID === raceData.driverFastestLapGuid ? pointSystemFastestLap : 0) : 0) });
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
          points: raceData.totalPoints
        });
      }
    } else {
      if (respuesta[teamIndex].guidDriver2 === '') {
        respuesta[teamIndex].guidDriver2 = raceData.guid;
      }
      respuesta[teamIndex].points += raceData.totalPoints;
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
            positionCounts[driverResult.totalPoints - 1]++;
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
          return driver.totalPoints;
        }
      }
      return Infinity;
    };

    return getFirstBestPositionRaceNumber(a) - getFirstBestPositionRaceNumber(b);
  });
}

// Obtener los datos de todos los coches que han participado en el campeonato
async function getCarsInChampionship(carResume: RaceCarResume[]): Promise<CarData[]> {
  const result: CarData[] = [];
  const filenameCars = [...new Set(carResume.map((car) => car.CarFileName))];
  for (let filename of filenameCars) {
    const { data: carDB } = await supabase
      .from("car")
      .select( "filename, carbrand!inner(name, imgbrand), model, carclass!inner(short_name, class_design)")
      .eq("filename", filename)
      .single();

    if (carDB) {
      result.push({
        filename: carDB.filename,
        brand: carDB.carbrand?.name ?? "",
        model: carDB.model ?? "",
        classShortName: carDB.carclass.short_name ?? "",
        classColor: carDB.carclass.class_design ?? "",
        imgbrand: carDB.carbrand?.imgbrand ?? "",
      });
    }
  }

  return result;
}
