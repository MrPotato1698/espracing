"use client";

import { useEffect, useState } from "react";
import { supabase }  from "@/db/supabase";
import ChampionshipProgressionChart from "@/components/championship-progression-chart";
import { showToast } from "@/lib/utils";

interface DriverDataChamp {
  name: string;
  guid: string;
  car: string;
  team: string;
  totalPoints: number;
}

interface TeamDataChamp {
  name: string;
  guidDriver1: string;
  guidDriver2: string;
  points: number;
}

interface ChampChartProps {
  readonly champId: string;
}

export default function ChampCharts(props: ChampChartProps) {
  const [champId, setChampId] = useState(props.champId);
  const [championshipData, setChampionshipData] = useState<any[]>([]);
  const [driversData, setDriversData] = useState<
    { name: string; data: number[] }[]
  >([]);
  const [teamsData, setTeamsData] = useState<
    { name: string; data: number[] }[]
  >([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false); // Inicialmente no está cargando
  const [dataRequested, setDataRequested] = useState(false); // Indicador si se han solicitado datos
  const [error, setError] = useState<string | null>(null);

  // Actualizar champId cuando cambie en las props
  useEffect(() => {
    if (props.champId !== champId) {
      setChampId(props.champId);
    }
  }, [props.champId]);
  // Escuchar eventos para actualizar el ID del campeonato
  useEffect(() => {
    const handleChampIdChanged = (e: Event) => {
      const event = e as CustomEvent;
      if (event.detail?.champId) {
        setChampId(event.detail.champId);
      }
    };

    // Revisar también el atributo data-champid en el contenedor
    const checkContainerAttr = () => {
      const container = document.getElementById("champChartsContainer");
      if (container) {
        const dataChampId = container.getAttribute("data-champid");
        if (dataChampId && dataChampId !== champId && dataChampId !== "") {
          setChampId(dataChampId);
        }
      }
    };

    document.addEventListener("champ-id-changed", handleChampIdChanged);

    // Verificar periódicamente el atributo
    const intervalId = setInterval(checkContainerAttr, 1000);

    // Verificar una vez al inicio
    checkContainerAttr();

    return () => {
      document.removeEventListener("champ-id-changed", handleChampIdChanged);
      clearInterval(intervalId);
    };
  }, [champId]);

  // Valores para configurar los gráficos
  const [driverYAxisStep, setDriverYAxisStep] = useState(20);
  const [driverYAxisMax, setDriverYAxisMax] = useState(0);
  const [teamYAxisStep, setTeamYAxisStep] = useState(20);
  const [teamYAxisMax, setTeamYAxisMax] = useState(0);
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setDataRequested(true);
        setError(null);

        if (!champId) {
          setLoading(false);
          return;
        }

        const response = await fetch(
          `/api/champresults/getChampResults?champ=${champId}`
        );
        if (!response.ok) {
          throw new Error(
            `Error en la respuesta del servidor: ${response.statusText}`
          );
        }

        const dataRAW = await response.json();
        const champRacesData = dataRAW.champRacesData;

        if (!champRacesData || champRacesData.length === 0) {
          throw new Error("No se encontraron datos del campeonato");
        }

        setChampionshipData(champRacesData);

        // Procesar datos de carreras
        const numRaces = champRacesData.length;
        let numRaceProcessed = 0;
        let flagRace2 = false;
        let RacesChamp: any[] = [];

        for (let i = 0; i < numRaces; i++) {
          numRaceProcessed++;
          if (champRacesData[i].raceData2) {
            if (!flagRace2) {
              flagRace2 = true;
            }

            const auxRacesChamps = {
              raceNumber: numRaceProcessed,
              name:
                champRacesData[i].raceData1?.RaceConfig.Track +
                  "@" +
                  champRacesData[i].raceData1?.RaceConfig.TrackLayout || "",
              results: champRacesData[i].raceData1?.RaceResult ?? [],
              pointSystem: champRacesData[i].points,
              driverFastestLapGuid:
                champRacesData[i].raceData1?.BestLap[0].SteamID ?? "",
            };
            RacesChamp.push(auxRacesChamps);

            numRaceProcessed++;
            const auxRacesChamps2 = {
              raceNumber: numRaceProcessed,
              name:
                champRacesData[i].raceData2?.RaceConfig.Track +
                  "@" +
                  champRacesData[i].raceData2?.RaceConfig.TrackLayout || "",
              results: champRacesData[i].raceData2?.RaceResult ?? [],
              pointSystem: champRacesData[i].points,
              driverFastestLapGuid:
                champRacesData[i].raceData2?.BestLap[0].SteamID ?? "",
            };
            RacesChamp.push(auxRacesChamps2);
          } else {
            const auxRacesChamps = {
              raceNumber: numRaceProcessed,
              name:
                champRacesData[i].raceData1?.RaceConfig.Track +
                  "@" +
                  champRacesData[i].raceData1?.RaceConfig.TrackLayout || "",
              results: champRacesData[i].raceData1?.RaceResult ?? [],
              pointSystem: champRacesData[i].points,
              driverFastestLapGuid:
                champRacesData[i].raceData1?.BestLap[0].SteamID ?? "",
            };
            RacesChamp.push(auxRacesChamps);
          }
        }

        // Cargar datos de circuitos para las categorías
        const raceCategories = await Promise.all(
          RacesChamp.map(async (raceData, index) => {
            const { data: trackData } = await supabase
              .from("circuit")
              .select("*")
              .eq("filename", raceData.name.split("@")[0])
              .single();

            if (flagRace2) {
              if (!trackData) {
                return `${raceData.name.split("@")[0]} R${(index % 2) + 1}`;
              }
              return `${trackData?.shortname} R${(index % 2) + 1}`;
            } else {
              if (!trackData) {
                return `${raceData.name.split("@")[0]}`;
              }
              return `${trackData?.shortname}`;
            }
          })
        );

        setCategories(raceCategories);

        // Procesar datos de pilotos
        let DriversChamp: DriverDataChamp[] = getDriverDataChamp(RacesChamp);
        // Filtrar pilotos que no tienen puntos o no participaron
        DriversChamp = DriversChamp.filter((driver) => {
          return (
            driver.totalPoints > 0 &&
            !RacesChamp.every((race) => {
              const result = race.results.find(
                (r: any) => r.SteamID === driver.guid
              );
              return !result || result.Pos === -3;
            })
          );
        });

        // Procesar datos de equipos
        const TeamsChamp: TeamDataChamp[] = getTeamsDataChamp(DriversChamp);

        // Crear datos para los gráficos
        const driversChartData = DriversChamp.map((driver) => {
          const driverPoints = RacesChamp.map((raceData) => {
            const driverData = raceData.results.find(
              (result: any) => result.SteamID === driver.guid
            );
            if (!driverData || driverData.Pos <= 0) {
              return 0;
            }
            const fastestLap =
              raceData.driverFastestLapGuid === driver.guid
                ? raceData.pointSystem.FastestLap
                : 0;
            return (
              raceData.pointSystem.Puntuation[driverData.Pos - 1] + fastestLap
            );
          });

          const cumulativePoints = driverPoints.reduce(
            (acc: number[], points, index) => {
              if (index === 0) {
                acc.push(points);
              } else {
                acc.push(points + acc[index - 1]);
              }
              return acc;
            },
            [] as number[]
          );

          return {
            name: driver.name,
            data: cumulativePoints,
          };
        });

        // Datos de equipos para el gráfico
        const teamsChartData = TeamsChamp.map((team) => {
          const teamPoints = RacesChamp.map((raceData) => {
            const driver1Data = raceData.results.find(
              (result: any) => result.SteamID === team.guidDriver1
            );
            const driver2Data = raceData.results.find(
              (result: any) => result.SteamID === team.guidDriver2
            );

            const fastestLapDriver1 =
              raceData.driverFastestLapGuid === team.guidDriver1
                ? raceData.pointSystem.FastestLap
                : 0;
            const fastestLapDriver2 =
              raceData.driverFastestLapGuid === team.guidDriver2
                ? raceData.pointSystem.FastestLap
                : 0;

            let driver1Points = 0;
            let driver2Points = 0;

            let posDriver1 = driver1Data?.Pos ?? 0;
            let posDriver2 = driver2Data?.Pos ?? 0;

            if (driver1Data && posDriver1 > 0) {
              driver1Points =
                raceData.pointSystem.Puntuation[posDriver1 - 1] +
                fastestLapDriver1;
            }
            if (driver2Data && posDriver2 > 0) {
              driver2Points = driver2Data
                ? raceData.pointSystem.Puntuation[posDriver2 - 1] +
                  fastestLapDriver2
                : 0;
            }

            return driver1Points + driver2Points;
          });

          const cumulativePoints = teamPoints.reduce(
            (acc: number[], points, index) => {
              if (index === 0) {
                acc.push(points);
              } else {
                acc.push(points + acc[index - 1]);
              }
              return acc;
            },
            [] as number[]
          );

          return {
            name: team.name,
            data: cumulativePoints,
          };
        });

        // Calcular configuración para los gráficos
        calculateChartConfig(driversChartData, teamsChartData);

        setDriversData(driversChartData);
        setTeamsData(teamsChartData);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar los datos del campeonato:", error);
        setError(error instanceof Error ? error.message : String(error));
        showToast(
          "Error al cargar los datos del campeonato: " + error,
          "error"
        );
        setLoading(false);
      }
    }

    if (champId) {
      fetchData();
    }
  }, [champId]);

  // Función para calcular la configuración óptima de los ejes Y
  function calculateChartConfig(driversData: any[], teamsData: any[]) {
    if (driversData.length > 0) {
      const pointsFirst = driversData[0].data[driversData[0].data.length - 1];
      const stepMaxPairs = [
        { step: 10, max: 10, threshold: 75 },
        { step: 25, max: 15, threshold: 100 },
        { step: 50, max: 20, threshold: 150 },
        { step: 70, max: 25, threshold: 225 },
        { step: 85, max: 25, threshold: 300 },
        { step: 100, max: 25, threshold: 500 },
        { step: 125, max: 25, threshold: 700 },
        { step: 150, max: 25, threshold: Infinity },
      ];

      for (const { step, max, threshold } of stepMaxPairs) {
        if (pointsFirst <= threshold) {
          setDriverYAxisStep(step);
          setDriverYAxisMax(pointsFirst + max);
          break;
        }
      }
    }

    if (teamsData.length > 0) {
      const pointsFirstTeam = teamsData[0].data[teamsData[0].data.length - 1];
      const stepMaxTeamsPairs = [
        { step: 10, max: 10, threshold: 75 },
        { step: 25, max: 15, threshold: 100 },
        { step: 50, max: 20, threshold: 150 },
        { step: 70, max: 25, threshold: 225 },
        { step: 85, max: 25, threshold: 300 },
        { step: 100, max: 25, threshold: 500 },
        { step: 125, max: 25, threshold: 700 },
        { step: 150, max: 25, threshold: Infinity },
      ];

      for (const { step, max, threshold } of stepMaxTeamsPairs) {
        if (pointsFirstTeam <= threshold) {
          setTeamYAxisStep(step);
          setTeamYAxisMax(pointsFirstTeam + max);
          break;
        }
      }
    }
  }
  if (loading) {
    return (
      <div className="w-full text-center p-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-lg">Cargando gráficas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center p-8 bg-red-900/20 rounded-lg border border-red-500">
        <p className="text-lg text-red-500">Error: {error}</p>
        <p className="mt-2">
          Por favor, intenta recargar la página o contacta al administrador.
        </p>
      </div>
    );
  }

  if (!champId || champId === "") {
    return (
      <div className="w-full text-center p-8 bg-blue-900/20 rounded-lg border border-blue-500">
        <p className="text-lg text-blue-500">
          Presiona el botón "Cargar Datos" para visualizar las gráficas del
          campeonato.
        </p>
      </div>
    );
  }

  if (driversData.length === 0 || teamsData.length === 0) {
    return (
      <div className="w-full text-center p-8 bg-yellow-900/20 rounded-lg border border-yellow-500">
        <p className="text-lg text-yellow-500">
          No hay datos disponibles para mostrar en los gráficos.
        </p>
      </div>
    );
  }
  return (
    <div className="w-full space-y-16 py-4">
      <div>
        <ChampionshipProgressionChart
          data={driversData}
          categories={categories}
          title="Progresión de Puntos en el Campeonato Individual"
          yAxisStep={driverYAxisStep}
          yAxisMax={driverYAxisMax}
        />
      </div>

      <div>
        <ChampionshipProgressionChart
          data={teamsData}
          categories={categories}
          title="Progresión de Puntos en el Campeonato por Equipos"
          yAxisStep={teamYAxisStep}
          yAxisMax={teamYAxisMax}
        />
      </div>
    </div>
  );
}

// Funciones auxiliares
function getDriverDataChamp(result: any[]): DriverDataChamp[] {
  let respuesta: DriverDataChamp[] = [];
  result.forEach((raceData) => {
    const pointArray = raceData.pointSystem.Puntuation;
    const pointFL = raceData.pointSystem.FastestLap;
    if (pointArray !== undefined) {
      raceData.results.forEach((item: any) => {
        processDriverResult(item, raceData, pointArray, pointFL, respuesta);
      });
    }
  });

  return respuesta.sort((a, b) => driverChampSort(a, b, result));
}

function processDriverResult(
  item: any,
  raceData: any,
  pointArray: number[],
  pointFL: number,
  respuesta: DriverDataChamp[]
) {
  const pos = item.Pos;
  const driverIndex = respuesta.findIndex(
    (driver) => driver.guid === item.SteamID
  );

  if (driverIndex === -1) {
    let fastestLapPoints = item.SteamID === raceData.driverFastestLapGuid ? pointFL : 0;
    const points =
      pos > 0
        ? pointArray[pos - 1] + fastestLapPoints
        : 0;
    if (pos > 0 || pos !== -4) {
      respuesta.push({
        name: item.DriverName,
        guid: item.SteamID,
        car: item.CarFileName,
        team: item.Team,
        totalPoints: points,
      });
    }
  } else if (pos > 0) {
    let fastestLapPoints = item.SteamID === raceData.driverFastestLapGuid ? pointFL : 0;
    respuesta[driverIndex].totalPoints += pointArray[item.Pos - 1] + fastestLapPoints;
  }
}

function driverChampSort(a: DriverDataChamp, b: DriverDataChamp, result: any[]): number {
  if (b.totalPoints !== a.totalPoints) {
    return b.totalPoints - a.totalPoints;
  }

  const aPositionCounts = getPositionCounts(a, result);
  const bPositionCounts = getPositionCounts(b, result);

  for (let i = 0; i < aPositionCounts.length; i++) {
    if (bPositionCounts[i] !== aPositionCounts[i]) {
      return bPositionCounts[i] - aPositionCounts[i];
    }
  }

  const aFastestLaps = countFastestLaps(a, result);
  const bFastestLaps = countFastestLaps(b, result);

  if (bFastestLaps !== aFastestLaps) {
    return bFastestLaps - aFastestLaps;
  }

  return getFirstBestPositionRaceNumber(a, result) - getFirstBestPositionRaceNumber(b, result);
}

function getPositionCounts(driver: DriverDataChamp, result: any[]): number[] {
  const positionCounts = new Array(100).fill(0);
  result.forEach((raceData) => {
    const driverResult = raceData.results.find(
      (res: any) => res.SteamID === driver.guid
    );
    if (driverResult && driverResult.Pos > 0) {
      positionCounts[driverResult.Pos - 1]++;
    }
  });
  return positionCounts;
}

function countFastestLaps(driver: DriverDataChamp, result: any[]): number {
  return result.reduce(
    (count, raceData) =>
      count + (raceData.driverFastestLapGuid === driver.guid ? 1 : 0),
    0
  );
}

function getFirstBestPositionRaceNumber(driver: DriverDataChamp, result: any[]): number {
  for (let raceData of result) {
    const driverResult = raceData.results.find(
      (res: any) => res.SteamID === driver.guid
    );
    if (driverResult && driverResult.Pos > 0) {
      return raceData.raceNumber;
    }
  }
  return Infinity;
}

function getTeamsDataChamp(result: DriverDataChamp[]): TeamDataChamp[] {
  let respuesta: TeamDataChamp[] = [];
  result.forEach((raceData) => {
    const teamIndex = respuesta.findIndex(
      (team) => team.name.toLowerCase() === raceData.team.toLowerCase()
    );
    if (teamIndex === -1) {
      if (raceData.team !== "No Team" && raceData.team !== "") {
        respuesta.push({
          name: raceData.team,
          guidDriver1: raceData.guid,
          guidDriver2: "",
          points: raceData.totalPoints,
        });
      }
    } else {
      if (respuesta[teamIndex].guidDriver2 === "") {
        respuesta[teamIndex].guidDriver2 = raceData.guid;
      }
      respuesta[teamIndex].points += raceData.totalPoints;
    }
  });

  // Ordenar por puntos totales
  return respuesta.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    return 0;
  });
}
