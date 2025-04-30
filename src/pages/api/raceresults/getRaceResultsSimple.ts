import { supabase } from '@/db/supabase';
import { getResultTableData, getResultFastestLap, showToast } from '@/lib/utils';

import type { Points } from "@/types/Points";
import type { RaceConfig } from "@/types/Results";
import type { CarData } from "@/types/Utils";

/* *************************** */

function initializeScript() {
	const isResultsPage = document.getElementById('loadButtonSimpleResults') !== null;

	if (!isResultsPage) {
	  return; // Salir si no estamos en la página de resultados
	}

	const loadButton = document.getElementById('loadButtonSimpleResults');
	const opcionesTabla = document.getElementById('select-race') as HTMLSelectElement;
	const tablaResultados = document.getElementById('tablaResultados');
	const tablaSanciones = document.getElementById('tablaSanciones');
	const tablaNotas = document.getElementById('tablaNotas');

	async function loadData() {
		const seleccion = opcionesTabla.value;

		if (!seleccion) {
			return showToast('Por favor, selecciona una opción', 'info');
		}

		try {
			const resultSetData = await fetchRaceData(seleccion);
			const datos = await fetchRaceJSONs(resultSetData);
			const points = getPoints(resultSetData);
			const raceNotes = await fetchRaceNotes(resultSetData.id);
			const carData = await fetchCarData(datos[0].RaceCarResume);

			if (!tablaResultados) throw new Error ('Elemento con id "resultado" no encontrado.');
			tablaResultados.innerHTML = '';

			const dconfig: RaceConfig = datos[0].RaceConfig;
			const { tablaResultadosString, layoutLength } = await buildCircuitSection(dconfig);

			const tablaResultadosFinal = await buildResultsSection(datos, points, carData, layoutLength, tablaResultadosString);

			tablaResultados.innerHTML = tablaResultadosFinal;

			if (!tablaSanciones) throw new Error ('Elemento con id "sanciones" no encontrado.');
			tablaSanciones.innerHTML = '';

			if (!tablaNotas) throw new Error ('Elemento con id "notas" no encontrado.');
			tablaNotas.innerHTML = '';

			const { tablaSancionesString, tablaNotasString } = buildNotesSection(raceNotes ?? []);

			tablaSanciones.innerHTML = tablaSancionesString;
			tablaNotas.innerHTML = tablaNotasString;

		} catch (error) {
			console.error('Error al cargar los resultados de carrera: ' + error);
			showToast('Error al cargar los resultados de carrera: ' + error, 'error');
		}
	}

	async function fetchRaceData(seleccion: string) {
		const { data: resultSetData, error } = await supabase
			.from('race')
			.select('id, pointsystem!inner(name, points, fastestlap), race_data_1, race_data_2')
			.eq('filename', seleccion)
			.single();

		if (error || !resultSetData) {
			throw new Error ('No se ha encontrado la carrera seleccionada');
		}
		return resultSetData;
	}

	async function fetchRaceJSONs(resultSetData: any) {
		const {data: raceDataJSONR1, error: errorRaceDataJSON} = await supabase
			.storage
			.from('results')
			.download(resultSetData.race_data_1);

		let datosR2 = null;
		if(resultSetData.race_data_2 !== null && resultSetData.race_data_2 !== "") {
			const {data: raceDataJSONR2, error: errorRaceDataJSON2} = await supabase
				.storage
				.from('results')
				.download(resultSetData.race_data_2);

			if (!errorRaceDataJSON2 || raceDataJSONR2)
				datosR2 = JSON.parse(await raceDataJSONR2.text());
		}

		if (errorRaceDataJSON || !raceDataJSONR1) throw new Error ('Error al cargar los datos de la carrera 1');
		const datosR1 = JSON.parse(await raceDataJSONR1.text());

		let datos = [];
		datos.push(datosR1);
		if(datosR2 !== null) {
			datos.push(datosR2);
		}
		return datos;
	}

	function getPoints(resultSetData: any): Points {
		return {
			Name: resultSetData.pointsystem.name,
			Puntuation: resultSetData.pointsystem.points.split(',').map((point: string) => parseInt(point)),
			FastestLap: resultSetData.pointsystem.fastestlap
		};
	}

	async function fetchRaceNotes(raceId: number) {
		const { data: raceNotes } = await supabase
			.from('racenotes')
			.select('race!inner(name), code!inner(id, name), description, penalty')
			.eq('race', raceId);
		return raceNotes;
	}

	async function fetchCarData(carResumes: any[]): Promise<CarData[]> {
		let carData: CarData[] = [];
		for (let carResume of carResumes) {
			const { data: carDataSupabase } = await supabase
				.from('car')
				.select('filename, carbrand!inner(name, imgbrand), model, carclass!inner(short_name, class_design)')
				.eq('filename', carResume.CarFileName)
				.single();

			if (carDataSupabase) {
				carData.push({
					filename: carDataSupabase.filename,
					brand: carDataSupabase.carbrand?.name ?? "",
					model: carDataSupabase.model ?? "",
					classShortName: carDataSupabase.carclass.short_name ?? "",
					classColor: carDataSupabase.carclass.class_design ?? "",
					imgbrand: carDataSupabase.carbrand?.imgbrand ?? ""
				});
			}
		}
		return carData;
	}

	async function buildCircuitSection(dconfig: RaceConfig) {
		let tablaResultadosString: string = "";
		let layoutLength: number | null = 1;
		const { data: isCircuitExists } = await supabase
			.from('circuit')
			.select('id, name, shortname, filename, location')
			.eq('filename', dconfig.Track)
			.single();

		if (isCircuitExists) {
			const circuitName = isCircuitExists.name;
			const circuitLocation = isCircuitExists.location;
			if (dconfig.TrackLayout === null || dconfig.TrackLayout === undefined || dconfig.TrackLayout === "") {
				dconfig.TrackLayout = "";
			}
			const { data: layout } = await supabase
				.from('circuitLayout')
				.select('name, length, capacity')
				.eq('filename', dconfig.TrackLayout)
				.eq('circuit', isCircuitExists.id)
				.single();
			const layoutName = layout?.name;
			layoutLength = layout?.length ?? null;
			const layoutCapacity = layout?.capacity;

			tablaResultadosString += `
				<div class="text-center bg-darkSecond rounded-lg py-5" style = "width=99%">
				<p class = "text-3xl font-bold border-b border-primary w-fit mx-auto mb-2">Datos del circuito</p>
					<div class = "grid grid-cols-1">
						<p class="text-2xl font-semibold">Circuito: ${circuitName} (Variante ${layoutName})</p>
						<p class="text-xl">Localización: ${circuitLocation}</p>
					</div>
					<div class = "grid grid-cols-2 text-lg mt-2">
						<p>Longitud: ${layoutLength} m</p>
						<p>Capacidad: ${layoutCapacity} pilotos</p>
					</div>
				</div>`;
		}
		return { tablaResultadosString, layoutLength };
	}

	async function buildResultsSection(datos: any[], points: Points, carData: CarData[], layoutLength: number | null, tablaResultadosString: string) {
		let tablaResultadosFinal = tablaResultadosString;
		for (let i = 0; i < datos.length; i++) {
			tablaResultadosFinal += buildRaceResultTable(datos[i], points, carData, layoutLength, i+1, datos.length > 1 && i < (datos.length-1));
		}
		return tablaResultadosFinal;
	}

	function buildRaceResultTable(dato: any, points: Points, carData: CarData[], layoutLength: number | null, raceNumber: number, addDivider: boolean) {
		const resultTable = getResultTableData(dato, points.Name, points, carData);
		const resultTableClasified = resultTable.filter((result) => Number(result.posicionFinal) > 0);
		const resultTableDNF = resultTable.filter((result) => result.posicionFinal === 'DNF');
		const resultTableDQ = resultTable.filter((result) => result.posicionFinal === 'DQ');
		const resultFastestLap = getResultFastestLap(dato, points, carData, layoutLength);

		const createResultRow = (result: any, index: number) => `
			<tr class="bg-${index % 2 === 0 ? 'darkPrimary' : 'darkSecond'}">
				<td class="text-center">${result.gridPositionClass}</td>
				<td class="text-center">${result.gainsAbs}</td>
				<td class="font-medium text-center">${result.posicionFinal}</td>
				<td class="text-start">${result.driverName}</td>
				<td class="text-center"><span ${result.carColorClass}>${result.carClass}</span></td>
				<td class="text-center"><img class='w-4 justify-end' src='${result.carBrand}' alt=''></img></td>
				<td class="text-start">${result.carName}</td>
				<td class="text-start">${result.team}</td>
				<td class="text-center">${result.totalLaps}</td>
				<td class="text-center">${result.timeadjust}</td>
				<td class="text-center">${result.gap}</td>
				<td class="text-center">${result.interval}</td>
				<td class="text-center"><span class="${result.flapClass}">${result.bestlapToString} ${result.tyre}</span></td>
				<td class="text-center">${result.points}</td>
			</tr>`;

		const createHeaderResultRow = (numRace: number) => `
		<p class="text-3xl font-bold border-b border-primary w-fit mx-auto mt-4 mb-2">Resultado de carrera ${numRace}</p>
			<table class="w-full border-collapse border border-lightPrimary">
					<thead class="font-medium bg-primary">
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

		let secondSplitInit = false;
		let tablaResultadosString = createHeaderResultRow(raceNumber);
		resultTableClasified.forEach((result, index) => {
			if (result.splitNumber === 2 && !secondSplitInit) {
				tablaResultadosString += `
					<tr class="bg-primary text-center font-bold">
							<td colspan="14">Segundo Split</td>
					</tr>`;
				result.interval = "";
				secondSplitInit = true;
			}
			tablaResultadosString += createResultRow(result, index);
		});

		tablaResultadosString += '</tbody></table>';

		// DNFs
		if(resultTableDNF.length > 0) {
			tablaResultadosString += `
			<p class="text-3xl font-bold border-b border-primary w-fit mx-auto mt-4 mb-2">No Clasificados</p>

			<table class="w-full border-collapse border border-lightPrimary">
					<thead class="font-medium bg-primary">
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

			resultTableDNF.forEach((result, index) => {
				tablaResultadosString += createResultRow(result, index);
			});
			// DQs
			if(resultTableDQ.length > 0) {
				resultTableDQ.forEach((result, index) => {
					tablaResultadosString += createResultRow(result, index);
				});
			}
			tablaResultadosString += '</tbody></table>';
		}

		// Fastest Lap
		tablaResultadosString += `
		<p class="text-3xl font-bold border-b border-primary w-fit mx-auto mt-4 mb-2">Vuelta Rápida</p>

		<table class="w-full border-collapse border border-lightPrimary">
				<thead class="font-medium bg-primary">
					<tr class="tabletitle">
						<th>Nombre</th>
						<th>Clase</th>
						<th colspan="2">Coche</th>
						<th>Equipo</th>
						<th colspan="2">Vuelta rápida</th>
						<th>Velocidad</th>
						<th>Ptos</th>
					</tr>
				</thead>
				<tbody class="font-normal">
					<tr class="bg-darkPrimary">
						<td class="text-center">${resultFastestLap.driverName}</td>
						<td class="text-center"><span ${resultFastestLap.carColorClass}>${resultFastestLap.carClass}</span></td>
						<td class="text-end"><img class='w-4' src='${resultFastestLap.carBrand}' alt=''></img></td>
						<td class="text-start">${resultFastestLap.carName}</td>
						<td class="text-center">${resultFastestLap.team}</td>
						<td class="text-end">${resultFastestLap.time} (${resultFastestLap.tyre}) </td>
						<td class="text-start"> en la vuelta ${resultFastestLap.lap}</td>
						<td class="text-center">${resultFastestLap.avgspeed}</td>
						<td class="text-center">${resultFastestLap.points}</td>
					</tr>
				</tbody>
			</table>`;

		if(addDivider) {
			tablaResultadosString += `<div class="mt-6"><p class='border-t-4 border-t-primary text-darkPrimary'></p></div>`;
		}
		return tablaResultadosString;
	}

	function buildNotesSection(raceNotes: any[]) {
		let tablaSancionesString: string = "";
		let tablaNotasString: string = "";

		if(raceNotes){
			const raceNotesPenalties = raceNotes.filter((note) => note.code.id > 1);
			const raceNotesExtra = raceNotes.filter((note) => note.code.id == 0);

			const createPenaltyRow = (note: any, index: number) => `
				<tr class="bg-${index % 2 === 0 ? 'darkPrimary' : 'darkSecond'}">
					<td class="text-center">${note.code.name}</td>
					<td class="text-justify py-2">${note.description}</td>
					<td class="font-medium text-center">${note.penalty}</td>
				</tr>`;

			const createNoteRow = (note: any, index: number) => `
				<tr class="bg-${index % 2 === 0 ? 'darkPrimary' : 'darkSecond'}">
					<td class="text-justify py-2 px-4">${note.description}</td>
				</tr>`;

			const createHeaderPenaltyRow = () => `
				<p class="text-3xl font-bold border-b border-primary w-fit mx-auto mt-4 mb-2">Sanciones</p>
				<table class="w-full border-collapse border border-lightPrimary">
						<thead class="font-medium bg-primary">
							<tr class="tabletitle">
								<th>Tipo Sanción</th>
								<th>Descripción Sanción</th>
								<th class = "pr-1">Resultado</th>
							</tr>
							</thead>
						<tbody class="font-normal">`;

			const createHeaderNoteRow = () => `
				<p class="text-3xl font-bold border-b border-primary w-fit mx-auto mt-4 mb-2">Notas de Carrera</p>
				<table class="w-full border-collapse border border-lightPrimary">
						<thead class="font-medium bg-primary">
							<tr class="tabletitle">
								<th>Descripción</th>
							</tr>
							</thead>
						<tbody class="font-normal">`;

			if (raceNotesPenalties.length > 0) {
				tablaSancionesString += createHeaderPenaltyRow();
				raceNotesPenalties.forEach((note, index) => {
					tablaSancionesString += createPenaltyRow(note, index);
				});
				tablaSancionesString += '</tbody></table>';
			}
			if (raceNotesExtra.length > 0) {
				tablaNotasString += createHeaderNoteRow();
				raceNotesExtra.forEach((note, index) => {
					tablaNotasString += createNoteRow(note, index);
				});
				tablaNotasString += '</tbody></table>';
			}
		}
		return { tablaSancionesString, tablaNotasString };
	}
	if (loadButton) {
		loadButton.addEventListener('click', loadData);
	} else {
		console.error('Elemento con id "loadButton" no encontrado.');
		showToast('Elemento con id "loadButton" no encontrado.', 'error');
	}
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initializeScript);
} else {
	initializeScript();
}

// Maneja las transiciones de página de Astro
document.addEventListener('astro:page-load', initializeScript);