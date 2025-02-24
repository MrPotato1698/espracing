import { exec } from "child_process"
import { promises as fs } from "fs"
import path from "path"

interface QuickBMSConfig {
  executablePath: string
  scriptPath: string
}

export class QuickBMSExtractor {
  private config: QuickBMSConfig

  constructor(config: QuickBMSConfig) {
    this.config = config
    console.log("QuickBMSExtractor inicializado con config:", JSON.stringify(config, null, 2))
  }

  async extractFile(data: Uint8Array, targetFile: string): Promise<Uint8Array> {
    console.log(`Iniciando extracción de archivo: ${targetFile}`)
    const tempDir = await fs.mkdtemp(path.join(process.cwd(), "tmp-"))
    console.log("Directorio temporal creado:", tempDir)
    const tempInputFile = path.join(tempDir, "input.acd")
    const tempOutputFile = path.join(tempDir, targetFile)

    try {
      console.log("Escribiendo archivo de entrada temporal:", tempInputFile)
      await fs.writeFile(tempInputFile, Buffer.from(data))
      console.log("Archivo de entrada escrito. Tamaño:", data.length, "bytes")

      console.log("Ejecutando QuickBMS")
      await new Promise<void>((resolve, reject) => {
        const command = `"${this.config.executablePath}" "${this.config.scriptPath}" "${tempInputFile}" "${tempDir}"`
        console.log("Comando a ejecutar:", command)
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error("Error ejecutando QuickBMS:", error)
            reject(error)
            return
          }
          if (stderr) {
            console.warn("QuickBMS stderr:", stderr)
          }
          console.log("QuickBMS stdout:", stdout)
          resolve()
        })
      })

      console.log("Leyendo archivo extraído:", tempOutputFile)
      const extractedFile = await fs.readFile(tempOutputFile)
      console.log("Archivo extraído leído. Tamaño:", extractedFile.length, "bytes")
      return new Uint8Array(extractedFile)
    } finally {
      console.log("Limpiando directorio temporal:", tempDir)
      await fs.rm(tempDir, { recursive: true, force: true })
      console.log("Limpieza completada")
    }
  }
}