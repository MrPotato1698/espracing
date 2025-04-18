import { AcdReader } from "./acdReader"

/**
 * Extrae y parsea archivos de un archivo data.acd
 * @param data Datos del archivo data.acd
 * @param folderName Nombre de la carpeta padre (importante para el descifrado)
 * @returns Lista de archivos extraídos
 */
export function parseAcd(data: Uint8Array, folderName: string): { name: string; content: Uint8Array }[] {
  //console.log(`Iniciando parseAcd para carpeta: ${folderName}`)
  //console.log(`Tamaño del archivo ACD: ${data.length} bytes`)

  // Crear el lector ACD directamente desde el buffer
  const reader = new AcdReader(data, folderName)
  //console.log(`Archivos encontrados: ${reader.files.length}`)

  // Extraer todos los archivos
  const files: { name: string; content: Uint8Array }[] = []

  for (const file of reader.files) {
    //console.log(`Procesando archivo: ${file.name} (longitud: ${file.length})`)
    try {
      const content = file.bytes()
      files.push({ name: file.name, content })

      // Intentar mostrar una vista previa del contenido
      if (file.name.endsWith(".ini") || file.name.endsWith(".txt") || file.name.endsWith(".json")) {
        try {
          const text = new TextDecoder().decode(content)
          const preview = text.length > 200 ? text.substring(0, 200) + "..." : text
          //console.log(`Vista previa de ${file.name}:\n${preview}`)
        } catch (e) {
          console.error(`No se pudo mostrar vista previa de ${file.name}: ${e}`)
        }
      } else {
        //console.log(`Archivo binario: ${file.name} (${content.length} bytes)`)
      }
    } catch (error) {
      console.error(`Error al procesar ${file.name}: ${error}`)
    }
  }

  return files
}

/**
 * Busca un archivo específico en la lista de archivos extraídos
 * @param files Lista de archivos extraídos
 * @param fileName Nombre del archivo a buscar
 */
export function findFileInAcd(
  files: { name: string; content: Uint8Array }[],
  fileName: string,
): { name: string; content: Uint8Array } | undefined {
  return files.find((file) => file.name.toLowerCase() === fileName.toLowerCase())
}

/**
 * Parsea el contenido de un archivo INI
 * @param content Contenido del archivo INI
 */
export function parseIniContent(content: Uint8Array): { [section: string]: { [key: string]: string } } {
  const text = new TextDecoder().decode(content)
  //console.log(`Parseando contenido INI (${content.length} bytes):\n${text.substring(0, 500)}...`)

  const lines = text.split(/\r?\n/)
  const result: { [section: string]: { [key: string]: string } } = {}
  let currentSection = ""

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith(";")) continue

    if (trimmedLine.startsWith("[") && trimmedLine.endsWith("]")) {
      currentSection = trimmedLine.slice(1, -1)
      result[currentSection] = {}
    } else if (currentSection && trimmedLine.includes("=")) {
      const [key, ...valueParts] = trimmedLine.split("=")
      const value = valueParts.join("=").trim()
      result[currentSection][key.trim()] = value
    }
  }

  return result
}

/**
 * Exporta todos los archivos a JSON para inspección
 * @param files Lista de archivos extraídos
 */
export function exportFilesToJson(files: { name: string; content: Uint8Array }[]): string {
  const result: { [filename: string]: string } = {}

  for (const file of files) {
    try {
      // Intentar convertir a texto
      const text = new TextDecoder().decode(file.content)
      result[file.name] = text
    } catch (e) {
      // Si falla, indicar que es contenido binario
      result[file.name] = `[Contenido binario - ${file.content.length} bytes]`
    }
  }

  return JSON.stringify(result, null, 2)
}
