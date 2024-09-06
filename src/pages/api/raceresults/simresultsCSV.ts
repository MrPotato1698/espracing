import type { APIRoute } from 'astro';
import axios from 'axios';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';

import { cars } from "@/consts/cars";
import { circuits } from "@/consts/circuits";
import { circuitlayouts } from "@/consts/circuitlayouts";


// const btnCargaTabla = document.getElementById('btnCargarTabla');
// if (btnCargaTabla) {
//     console.log('Cargando script...');
//     btnCargaTabla.addEventListener('click', cargarJSON);
//}
export const get: APIRoute = async () => {

    console.log('Cargando JSON...');
    try {
        const opciones = document.getElementById('select-champs');
        ///var ruta = 'https://simresults.net/remote/csv?result=https://es2.assettohosting.com:10018/results/download/' + (opciones as HTMLSelectElement)?.value + '.json';
        var ruta = 'https://simresults.net/remote/csv?result=https://es2.assettohosting.com:10018/results/download/2024_9_1_18_50_RACE.json';
        //var ruta = 'Hola que tal';
        console.log(ruta);

        // Descargar el CSV
        const response = await axios.get(ruta);
        const csvData = response.data;

        //Parsear el CSV a un array de objetos
        const records = parse(csvData, {
            columns: true,
            skip_empty_lines: true,
            relax_column_count: true,
        });

        // Convertir el array de objetos a JSON
        const jsonData = JSON.stringify(records, null, 2);

        // Guardar el JSON en un archivo
        //fs.writeFileSync('src/pages/api/raceresults/simresults.json', jsonData);

        console.log(jsonData);

        return new Response(JSON.stringify(jsonData), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.log('Error al descargar o convertir el CSV: ', error);
        return new Response(JSON.stringify({ error: 'Error al procesar el CSV' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}


function formatTwoIntegersPlusThreeDecimals(num: number) {
    const integerPart = Math.floor(Math.abs(num)).toString().padStart(2, '0');
    const decimalPart = Math.abs(num % 1).toFixed(3).slice(2);
    const sign = num < 0 ? '-' : '';
    return `${sign}${integerPart}.${decimalPart}`;
}

function formatTwoIntegers(num: number): string {
    return Math.abs(num).toString().padStart(2, '0').slice(-2);
}

