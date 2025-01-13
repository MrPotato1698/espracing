import { supabase } from '@/db/supabase';
import { getResultTableData } from '@/lib/utils';

import type { Points } from "@/types/Points";
import type { RaceConfig } from "@/types/Results";
import type { ResultTableData, CarData } from "@/types/Utils";

/* *************************** */

function initializeScript() {
	const loadButton = document.getElementById('loadButtonSimpleResults');
	const opcionesTabla = document.getElementById('select-race') as HTMLSelectElement;
	const tablaResultados = document.getElementById('tablaResultados');

	async function loadData() {
		const seleccion = opcionesTabla.value;

		if (!seleccion) {
			alert('Por favor, selecciona una opción');
			return;
		}

		try {
			const { data: resultSetData, error } = await supabase
				.from('race')
				.select('pointsystem!inner(name, points, fastestlap), race_data_1')
				.eq('filename', seleccion)
				.single();

			if (error || !resultSetData) {
				return alert('No se ha encontrado la carrera seleccionada');
			}

			const datos = JSON.parse(resultSetData?.race_data_1 as string);
			const points: Points = {
				Name: resultSetData.pointsystem.name,
				Puntuation: resultSetData.pointsystem.points.split(',').map((point) => parseInt(point)),
				FastestLap: resultSetData.pointsystem.fastestlap
			};

			console.log('Datos a usar: ', datos);

			let carData: CarData[] = [];
			for (let carResume of datos.RaceCarResume) {
				const { data: carDataSupabase, error: errorCarData } = await supabase
					.from('car')
					.select('filename, carbrand!inner(name, imgbrand), model, carclass!inner(short_name, class_design)')
					.eq('filename', carResume.CarFileName)
					.single();

				if (carDataSupabase) {
					carData.push({
						filename: carDataSupabase.filename,
						brand: carDataSupabase.carbrand.name ?? "",
						model: carDataSupabase.model ?? "",
						classShortName: carDataSupabase.carclass.short_name ?? "",
						classColor: carDataSupabase.carclass.class_design ?? "",
						imgbrand: carDataSupabase.carbrand.imgbrand ?? ""
					});
				}
			}

			if (tablaResultados) {
				tablaResultados.innerHTML = '';
			} else {
				throw new Error('Elemento con id "resultado" no encontrado.');
			}

			const resultTable = getResultTableData(datos, points.Name, points, carData);

			// *** Pista y datos de la carrera ***
			const dconfig: RaceConfig = datos.RaceConfig;
			const { data: isCircuitExists, error: errorCircuitExists } = await supabase
				.from('circuit')
				.select('id, name, shortname, filename, location')
				.eq('filename', dconfig.Track)
				.single();
			let tablaResultadosString: string = "";
			if (isCircuitExists) {
				const circuitName = isCircuitExists.name;
				const circuitLocation = isCircuitExists.location;
				if (dconfig.TrackLayout === null || dconfig.TrackLayout === undefined || dconfig.TrackLayout === "") {
					dconfig.TrackLayout = "";
				}
				const { data: layout, error: errorLayout } = await supabase
					.from('circuitLayout')
					.select('name, length, capacity')
					.eq('filename', dconfig.TrackLayout)
					.eq('circuit', isCircuitExists.id)
					.single();
				const layoutName = layout?.name;
				const layoutLength = layout?.length;
				const layoutCapacity = layout?.capacity;

				tablaResultadosString += `
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

			// *** Clasificacion de Carrera
			tablaResultadosString += `
				<table class="w-full border-collapse border border-[#f9f9f9]">
						<thead class="font-medium bg-[#da392b]">
						<tr class="tabletitle">
						<th colspan="2"></th>
						<th>Pos</th>
						<th>Nombre</th>
						<th>Clase</th>
						<th colspan="2">Coche</th>
						<th>Equipo</th>
						<th>Vueltas</th>
						<th>Tiempo Total</th>
						<th>Gap to 1st</th>
						<th>Intervalo</th>
						<th>Vuelta Rápida</th>
						<th>Ptos</th>
						</tr>
						</thead>
						<tbody class="font-normal">`;

			const createResultRow = (result: any, index: number) => `
				<tr class="bg-[${index % 2 === 0 ? '#0f0f0f' : '#19191c'}]">
					<td class="text-center">${result.gridPositionClass}</td>                                                        <!-- Gan/Per (Flechas)-->
					<td class="text-center">${result.gainsAbs}</td>                                                                 <!-- Gan/Per (Número)-->
					<td class="font-medium text-center">${result.posicionFinal}</td>                                                <!-- Posicion -->
					<td class="text-start">${result.driverName}</td>                                                                <!-- Nombre -->
					<td class="text-center"><span ${result.carColorClass}>${result.carClass}</span></td>                            <!-- Clase del Coche -->
					<td class="text-center"><img class='w-4 justify-end' src='${result.carBrand}' alt=''></img></td>                <!-- Logo Coche -->
					<td class="text-start">${result.carName}</td>                                                                   <!-- Coche -->
					<td class="text-start">${result.team}</td>                                                                      <!-- Equipo -->
					<td class="text-center">${result.totalLaps}</td>                                                                <!-- Nº Vueltas -->
					<td class="text-center">${result.timeadjust}</td>                                                               <!-- Tiempo Total -->
					<td class="text-center">${result.gap}</td>                                                                      <!-- Gap con primero -->
					<td class="text-center">${result.interval}</td>                                                                 <!-- Intervalo -->
					<td class="text-center"><span class="${result.flapClass}">${result.bestlapToString} ${result.tyre}</span></td>  <!-- Vuelta Rapida  + Neumaticos-->
					<td class="text-center">${result.points}</td>                                                                   <!-- Puntos -->
				</tr>`;

			let secondSplitInit = false;
			resultTable.forEach((result, index) => {
				if (result.splitNumber === 2 && !secondSplitInit) {
					tablaResultadosString += `
						<tr class="bg-[#da392b] text-center font-bold">
								<td colspan="14">Segundo Split</td>
						</tr>`;
					result.interval = "";
					secondSplitInit = true;
				}
				tablaResultadosString += createResultRow(result, index);
			});

			tablaResultadosString += '</tbody></table>';
			tablaResultados.innerHTML = tablaResultadosString;

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

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initializeScript);
} else {
	initializeScript();
}

// Maneja las transiciones de página de Astro
document.addEventListener('astro:page-load', initializeScript);