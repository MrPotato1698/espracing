import type { APIRoute } from "astro";
import { QuickBMSExtractor } from "@/lib/admin/cars/quickBMS";
import { parseIniContent } from "@/lib/ACDFiles/acdParser";
import path from "path";

const quickBMSConfig = {
  executablePath: path.resolve(process.cwd(), process.env.QUICKBMS_PATH || "tools/quickbms/quickbms.exe"),
  scriptPath: path.resolve(process.cwd(), process.env.QUICKBMS_SCRIPT || "tools/quickbms/assetto_corsa_acd.bms"),
}

export const post: APIRoute = async ({ request }) => {
  console.log("Solicitud POST recibida en /api/process-data-acd")
  try {
    const formData = await request.formData()
    console.log("FormData recibido")

    const file = formData.get("file") as File
    if (!file) {
      console.error("No se proporcionó ningún archivo")
      return new Response(JSON.stringify({ error: "No se proporcionó ningún archivo" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
    console.log("Archivo recibido:", file.name, "Tamaño:", file.size, "bytes")

    const arrayBuffer = await file.arrayBuffer()
    const data = new Uint8Array(arrayBuffer)
    console.log("Archivo convertido a Uint8Array. Longitud:", data.length)

    console.log("Iniciando extracción con QuickBMS")
    const extractor = new QuickBMSExtractor(quickBMSConfig)
    const carIniContent = await extractor.extractFile(data, "car.ini")
    console.log("Extracción completada. Tamaño de car.ini:", carIniContent.length)

    console.log("Parseando contenido de car.ini")
    const iniContent = parseIniContent(carIniContent)
    console.log("Secciones encontradas en car.ini:", Object.keys(iniContent))

    const carData = {
      tyreTimeChange: Number.parseFloat(iniContent["PIT_STOP"]?.["TYRE_CHANGE_TIME_SEC"] || "0"),
      fuelLiterTime: Number.parseFloat(iniContent["PIT_STOP"]?.["FUEL_LITER_TIME_SEC"] || "0"),
      maxLiter: Number.parseFloat(iniContent["FUEL"]?.["MAX_FUEL"] || "0"),
    }
    console.log("Datos extraídos:", JSON.stringify(carData, null, 2))

    return new Response(JSON.stringify(carData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error detallado al procesar el archivo:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace available")
    return new Response(JSON.stringify({ error: "Error al procesar el archivo", details: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}