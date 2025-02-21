import { AcdDecoder } from "./acdDecoder"

interface AcdFile {
  name: string
  content: Uint8Array
}

export function parseAcd(data: Uint8Array, folderName: string): AcdFile[] {
  console.log(`=== Iniciando parseAcd ===`)
  console.log(`Carpeta: ${folderName}`)
  console.log(`Tamaño del archivo: ${data.length} bytes`)
  console.log(
    `Primeros 32 bytes: ${Array.from(data.slice(0, 32))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(" ")}`,
  )

  const decoder = new AcdDecoder(data, folderName)

  // Primero mostramos la estructura para debugging
  decoder.dumpFileStructure()

  // Luego decodificamos los archivos
  const decodedFiles = decoder.decode()

  const files: AcdFile[] = []
  for (const [name, content] of decodedFiles.entries()) {
    console.log(`Procesado: ${name} (${content.length} bytes)`)

    // Mostrar una vista previa del contenido si es texto
    if (content.length > 0) {
      try {
        const preview = new TextDecoder().decode(content.slice(0, 100))
        console.log(`Vista previa: ${preview.replace(/\n/g, "\\n").replace(/\r/g, "\\r")}`)
      } catch (e) {
        console.log("El contenido no es texto válido")
      }
    }

    files.push({ name, content })
  }

  return files
}

export function findFileInAcd(files: AcdFile[], fileName: string): AcdFile | undefined {
  return files.find((file) => file.name.toLowerCase() === fileName.toLowerCase())
}

export function parseIniContent(content: Uint8Array): { [section: string]: { [key: string]: string } } {
  const text = new TextDecoder().decode(content)
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

