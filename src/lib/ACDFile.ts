import JSZip from 'jszip';

import type { CarData } from "@/types/Utils";

const intToByte = (value: number): number => {
  return ((value % 256) + 256) % 256;
};

// 3. Cálculo de octetos (key generation)
const calculateOctets = (folderName: string): number[] => {
  const folderLower = folderName.toLowerCase();
  const chars = Array.from(folderLower).map(c => c.charCodeAt(0));
  const len = chars.length;

  // Octeto 1: Suma de todos los caracteres
  let octet1 = chars.reduce((sum, c) => sum + c, 0);
  octet1 = intToByte(octet1);

  // Octeto 2: Cálculo con pares de caracteres
  let num = 0;
  for (let i = 0; i < len - 1; i += 2) {
    num = (num * chars[i]) - chars[i + 1];
  }
  const octet2 = intToByte(num);

  // Octeto 3: Cálculo con tripletes (¡atención a división entera!)
  let num2 = 0;
  for (let j = 1; j < len - 3; j += 3) {
    const denominator = chars[j + 1] + 27;
    num2 = Math.floor((num2 * chars[j]) / (denominator || 1)) - 27 - chars[j - 1];
  }
  const octet3 = intToByte(num2);

  // Octeto 4: Resta desde el carácter 1
  let num3 = 5763;
  for (let k = 1; k < len; k++) {
    num3 -= chars[k];
  }
  const octet4 = intToByte(num3);

  // Octeto 5: Cálculo con saltos de 4
  let num4 = 66;
  for (let l = 1; l < len - 4; l += 4) {
    num4 = (chars[l] + 15) * num4 * (chars[l - 1] + 15) + 22;
  }
  const octet5 = intToByte(num4);

  // Octeto 6: Resta de caracteres pares
  let num5 = 101;
  for (let m = 0; m < len - 2; m += 2) {
    num5 -= chars[m];
  }
  const octet6 = intToByte(num5);

  // Octeto 7: Módulo con caracteres
  let num6 = 171;
  for (let n = 0; n < len - 2; n += 2) {
    num6 %= chars[n] || 1; // Evitar módulo 0
  }
  const octet7 = intToByte(num6);

  // Octeto 8: División entera y suma
  let num7 = 171;
  for (let num8 = 0; num8 < len - 1; num8++) {
    const divisor = chars[num8] || 1; // Evitar división por 0
    num7 = Math.floor(num7 / divisor) + chars[num8 + 1];
  }
  const octet8 = intToByte(num7);

  return [octet1, octet2, octet3, octet4, octet5, octet6, octet7, octet8];
};

// 4. Generación de la clave de encriptación
const getEncryptionKey = (folderName: string): Uint8Array => {
  const octets = calculateOctets(folderName);
  const keyString = octets.join('-');
  const keyBuffer = new TextEncoder().encode(keyString);
  return new Uint8Array(keyBuffer.map(byte => byte ^ 0xA3));
};

// 5. Desencriptación del archivo
const decryptACD = (buffer: ArrayBuffer, folderName: string): Uint8Array => {
  const encryptedData = new Uint8Array(buffer);
  const decryptedData = new Uint8Array(encryptedData.length);
  const key = getEncryptionKey(folderName);

  for (let i = 0; i < encryptedData.length; i++) {
      decryptedData[i] = encryptedData[i] ^ key[i % key.length];
  }

  return decryptedData;
};

// 6. Parser del INI
const parseCarIni = (content: string): Partial<CarData> => {
  const result: Partial<CarData> = {};
  let currentSection = '';

  content.split('\n').forEach(line => {
      const trimmed = line.trim();

      // Detectar sección
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          currentSection = trimmed.slice(1, -1);
          return;
      }

      // Extraer clave-valor
      const [key, value] = trimmed.split('=').map(p => p.trim());
      if (!key || !value) return;

      // Asignar valores
      switch(currentSection) {
          case 'FUEL':
              if (key === 'MAX_FUEL') result.maxLiter = parseFloat(value);
              break;
          case 'PIT_STOP':
              if (key === 'TYRE_CHANGE_TIME_SEC') result.tyreTimeChange = parseFloat(value);
              if (key === 'FUEL_LITER_TIME_SEC') result.fuelLiterTime = parseFloat(value);
              break;
      }
  });

  return result;
};

// 7. Función principal (exportada)
export const getDataACD = async (file: any, rootEntry: string): Promise<Partial<CarData>> => {
  try {
      // Validación inicial
      if (!rootEntry) throw new Error('Se requiere el nombre de la carpeta del coche (rootEntry)');

      // 1. Leer archivo
      const data = getACDFile(file);

      // Just validate that it's a data.acd file
      if (!file.name.endsWith('data.acd')) {
          throw new Error("El archivo debe ser un data.acd");
      }
      if (!(file instanceof File)) {
        throw new Error("Parámetro file no es un archivo válido");
      }
      const buffer = await readFileAsArrayBuffer(file);

      // 2. Desencriptar
      const decryptedData = decryptACD(buffer, rootEntry);
      // 3. Validar ZIP
      if (decryptedData[0] !== 0x50 || decryptedData[1] !== 0x4B) {
          throw new Error('Error en desencriptación: Verifica el nombre de la carpeta');
      }

      // 4. Extraer car.ini
      const zip = await JSZip.loadAsync(decryptedData);
      const carIni = zip.file('car.ini');
      if (!carIni) throw new Error('Archivo car.ini no encontrado');

      // 5. Parsear contenido
      const content = await carIni.async('text');
      const parsedData = parseCarIni(content);

      // 6. Validar datos requeridos
      const requiredKeys = ['maxLiter', 'tyreTimeChange', 'fuelLiterTime'];
      requiredKeys.forEach(key => {
          if (parsedData[key as keyof Partial<CarData>] === undefined) {
              throw new Error(`Valor requerido ${key} no encontrado`);
          }
      });

      return parsedData;

  } catch (error) {
      console.error('[getDataACD Error]', error);
      throw error; // Propagar error para manejo externo
  }
};

const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
  });
};

const getACDFile = (dir: any) => {
  return new Promise((resolve, reject) => {
    dir.getFile('data.acd', { create: false }, (fileEntry: any) => {
      fileEntry.file((file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
          const json = JSON.parse(reader.result as string);
          if (typeof json === 'object' && json !== null) {
            resolve (json);
          } else {
            reject(new Error('Invalid JSON format'));
          }
        };
        reader.onerror = reject;
        reader.readAsText(file);
      }, reject);
    }, reject);
  });
};

