export class AcdReader {
  private buffer: Uint8Array
  private offset = 0
  private parentFolderName: string
  public files: AcdFile[] = []

  /**
   * Crea un nuevo lector ACD
   * @param buffer Datos del archivo .acd como Uint8Array
   * @param parentFolderName Nombre de la carpeta padre (importante para el descifrado)
   */
  constructor(buffer: Uint8Array, parentFolderName: string) {
    this.buffer = buffer
    this.parentFolderName = parentFolderName
    this.init()
  }

  /**
   * Inicializa el lector, procesando todos los archivos en el archivo .acd
   */
  private init(): void {
    const key = this.cipherKey(this.parentFolderName)
    console.log(`Clave generada para '${this.parentFolderName}': ${key}`)

    while (this.offset < this.buffer.length) {
      const file = this.nextFileInfo()
      if (!file) break

      file.decipherKey = key
      this.files.push(file)
    }
  }

  /**
   * Lee la información del siguiente archivo en el archivo .acd
   */
  private nextFileInfo(): AcdFile | null {
    if (this.offset + 4 > this.buffer.length) return null

    // Leer la longitud del nombre
    let strlen = this.readInt32LE(this.offset)
    this.offset += 4

    // Manejar el número mágico -1111
    if (strlen === -1111) {
      if (this.offset + 4 > this.buffer.length) return null
      this.offset += 4
      if (this.offset + 4 > this.buffer.length) return null
      strlen = this.readInt32LE(this.offset)
      this.offset += 4
    }

    // Leer el nombre del archivo
    if (this.offset + strlen > this.buffer.length) return null
    const nameBuffer = this.buffer.slice(this.offset, this.offset + strlen)
    const name = new TextDecoder().decode(nameBuffer)
    this.offset += strlen

    // Leer la longitud de los datos (en palabras de 32 bits)
    if (this.offset + 4 > this.buffer.length) return null
    const lengthWords = this.readInt32LE(this.offset)
    this.offset += 4

    // Guardar la posición de inicio de los datos
    const start = this.offset

    // Avanzar el offset para el siguiente archivo
    this.offset += lengthWords * 4

    return new AcdFile(lengthWords * 4, start, this.buffer, name)
  }

  private readInt32LE(offset: number): number {
    return (
      this.buffer[offset] |
      (this.buffer[offset + 1] << 8) |
      (this.buffer[offset + 2] << 16) |
      (this.buffer[offset + 3] << 24)
    )
  }

  /**
   * Genera una clave de cifrado a partir del nombre de la carpeta
   * @param filename Nombre de la carpeta padre
   */
  private cipherKey(filename: string): string {
    let part1 = 0

    for (let i = 0; i < filename.length; i++) {
      part1 += filename.charCodeAt(i)
    }

    let part2 = 0
    let i = 0

    while (i < filename.length - 1) {
      part2 *= filename.charCodeAt(i)
      i++
      if (i < filename.length) {
        part2 -= filename.charCodeAt(i)
        i++
      }
    }

    let part3 = 0
    i = 1

    while (i < filename.length - 3) {
      part3 *= filename.charCodeAt(i)
      i++
      if (i < filename.length) {
        const divisor = filename.charCodeAt(i) + 0x1b
        if (divisor !== 0) {
          part3 /= divisor
        }
        i -= 2
        if (i < filename.length) {
          part3 += -0x1b - filename.charCodeAt(i)
          i += 5
        }
      }
    }

    let part4 = 0x1683

    for (i = 1; i < filename.length; i++) {
      part4 -= filename.charCodeAt(i)
    }

    let part5 = 0x42
    i = 1

    while (i < filename.length - 4) {
      const n = (filename.charCodeAt(i) + 0xf) * part5
      i--
      if (i < filename.length) {
        let x = filename.charCodeAt(i)
        i++
        x += 0xf
        x *= n
        x += 0x16
        part5 = x
        i += 4
      }
    }

    let part6 = 0x65

    for (i = 0; i < filename.length - 2; i += 2) {
      part6 -= filename.charCodeAt(i)
    }

    let part7 = 0xab

    for (i = 0; i < filename.length - 2; i += 2) {
      if (filename.charCodeAt(i) !== 0) {
        // Evitar división por cero
        part7 %= filename.charCodeAt(i)
      }
    }

    let part8 = 0xab
    i = 0

    while (i < filename.length - 1) {
      const tmp = filename.charCodeAt(i)
      if (tmp !== 0) {
        // Evitar división por cero
        part8 /= tmp
      }
      i++
      if (i < filename.length) {
        const tmp2 = filename.charCodeAt(i)
        part8 += tmp2
        i++
      }
    }

    // Reducir a 8 bits
    part1 &= 0xff
    part2 &= 0xff
    part3 &= 0xff
    part4 &= 0xff
    part5 &= 0xff
    part6 &= 0xff
    part7 &= 0xff
    part8 &= 0xff

    return `${part1}-${part2}-${part3}-${part4}-${part5}-${part6}-${part7}-${part8}`
  }

  /**
   * Encuentra un archivo por su nombre
   * @param name Nombre del archivo a buscar
   */
  public findFile(name: string): AcdFile | undefined {
    return this.files.find((file) => file.name === name)
  }
}

/**
 * Representa un archivo dentro del archivo .acd
 */
export class AcdFile {
  public length: number
  public start: number
  private buffer: Uint8Array
  public name: string
  public decipherKey = ""

  constructor(length: number, start: number, buffer: Uint8Array, name: string) {
    this.length = length
    this.start = start
    this.buffer = buffer
    this.name = name
  }

  /**
   * Obtiene los datos del archivo, descifrados y convertidos de UTF-32LE a UTF-8
   */
  public bytes(): Uint8Array {
    // Extraer los datos del archivo
    const data = this.buffer.slice(this.start, this.start + this.length)

    // Crear una copia para no modificar el buffer original
    const dataCopy = new Uint8Array(data)

    // Descifrar los datos
    this.decipher(dataCopy)

    // Intentar determinar si es un archivo binario o texto
    const isText = this.isLikelyText(dataCopy)

    if (isText) {
      // Si parece texto, convertir de UTF-32LE a UTF-8
      return this.utf32LeToUtf8(dataCopy)
    } else {
      // Si parece binario, devolver los datos descifrados sin conversión
      return dataCopy
    }
  }

  /**
   * Intenta determinar si el contenido es probablemente texto
   */
  private isLikelyText(data: Uint8Array): boolean {
    // Verificar si los datos parecen estar en formato UTF-32LE
    // En UTF-32LE, cada carácter ocupa 4 bytes, con los bytes superiores generalmente en 0
    // para caracteres ASCII comunes
    let textLikeCount = 0
    let totalCount = 0

    for (let i = 0; i + 3 < data.length; i += 4) {
      totalCount++
      // Si los bytes superiores son 0 y el byte inferior está en el rango ASCII imprimible
      if (data[i + 1] === 0 && data[i + 2] === 0 && data[i + 3] === 0 && data[i] >= 32 && data[i] <= 126) {
        textLikeCount++
      }
    }

    // Si más del 50% de los caracteres parecen texto, asumimos que es texto
    return totalCount > 0 && textLikeCount / totalCount > 0.5
  }

  /**
   * Descifra los datos usando la clave proporcionada
   * @param data Datos a descifrar (modificados in-place)
   */
  private decipher(data: Uint8Array): void {
    let x = 0

    for (let b = 0; b < data.length; b++) {
      if (data[b] === 0) continue

      data[b] -= this.decipherKey.charCodeAt(x % this.decipherKey.length)
      x++
    }
  }

  /**
   * Convierte datos de UTF-32LE a UTF-8
   * @param utf32Le Datos en formato UTF-32LE
   */
  private utf32LeToUtf8(utf32Le: Uint8Array): Uint8Array {
    const result: number[] = []

    for (let i = 0; i + 3 < utf32Le.length; i += 4) {
      const cp = utf32Le[i] | (utf32Le[i + 1] << 8) | (utf32Le[i + 2] << 16) | (utf32Le[i + 3] << 24)
      if (cp === 0) continue // Saltar puntos de código nulos

      try {
        if (cp <= 0x7f) {
          result.push(cp)
        } else if (cp <= 0x7ff) {
          result.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f))
        } else if (cp <= 0xffff) {
          result.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f))
        } else if (cp <= 0x1fffff) {
          result.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f))
        }
      } catch (e) {
        console.warn(`Error al convertir punto de código ${cp}: ${e}`)
      }
    }

    return new Uint8Array(result)
  }

  /**
   * Obtiene el contenido como texto, si es posible
   */
  public getText(): string {
    const bytes = this.bytes()
    try {
      return new TextDecoder().decode(bytes)
    } catch (e) {
      console.warn(`Error al decodificar ${this.name}: ${e}`)
      return `[Contenido binario - ${bytes.length} bytes]`
    }
  }
}