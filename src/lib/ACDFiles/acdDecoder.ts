export class AcdDecoder {
  private data: Uint8Array
  private position = 0

  constructor(
    private readonly rawData: Uint8Array,
    private readonly folderName: string,
  ) {
    this.data = rawData
  }

  private readUInt32(): number {
    if (this.position + 4 > this.data.length) {
      throw new Error("Intento de leer más allá del final del archivo")
    }
    const value = new DataView(this.data.buffer).getUint32(this.position, true)
    this.position += 4
    return value
  }

  private readString(): string {
    let result = ""
    while (this.position < this.data.length) {
      const byte = this.data[this.position++]
      if (byte === 0) break
      result += String.fromCharCode(byte)
    }
    return result
  }

  private calculateKey(): number {
    let key = 0x33
    for (let i = 0; i < this.folderName.length; i++) {
      key = ((key + this.folderName.charCodeAt(i)) * 0x13) & 0xff
    }
    return key
  }

  private decryptBlock(data: Uint8Array): Uint8Array {
    const result = new Uint8Array(data.length)
    let key = this.calculateKey()

    for (let i = 0; i < data.length; i++) {
      result[i] = data[i] ^ key
      key = ((key + 0x13) * 7) & 0xff
    }

    return result
  }

  public decode(): Map<string, Uint8Array> {
    const result = new Map<string, Uint8Array>()
    this.position = 0

    try {
      const numFiles = this.readUInt32()
      console.log(`Número de archivos: ${numFiles}`)

      for (let i = 0; i < numFiles; i++) {
        const startPos = this.position
        const fileName = this.readString()
        const fileSize = this.readUInt32()
        const fileOffset = this.readUInt32()
        const unknown1 = this.readUInt32()
        const unknown2 = this.readUInt32()

        console.log(`Archivo ${i + 1}/${numFiles}:`)
        console.log(`  Nombre: ${fileName}`)
        console.log(`  Tamaño: ${fileSize}`)
        console.log(`  Offset: ${fileOffset}`)
        console.log(`  Unknown1: ${unknown1}`)
        console.log(`  Unknown2: ${unknown2}`)
        console.log(`  Posición actual: ${this.position}`)

        if (fileSize > 0 && fileSize < this.data.length && fileOffset < this.data.length) {
          const encryptedContent = this.data.slice(fileOffset, fileOffset + fileSize)
          const decryptedContent = this.decryptBlock(encryptedContent)
          result.set(fileName, decryptedContent)

          // Mostrar una vista previa del contenido desencriptado
          const preview = new TextDecoder().decode(decryptedContent.slice(0, Math.min(100, decryptedContent.length)))
          console.log(`  Vista previa: ${preview.replace(/\n/g, "\\n").replace(/\r/g, "\\r")}`)
        } else {
          console.warn(`Tamaño o offset de archivo inválido para ${fileName}: Tamaño=${fileSize}, Offset=${fileOffset}`)
        }
      }
    } catch (error) {
      console.error("Error durante la decodificación:", error)
      console.log("Estado actual:")
      console.log(`  Posición: ${this.position}`)
      console.log(`  Bytes restantes: ${this.data.length - this.position}`)
    }

    return result
  }

  public dumpFileStructure(): void {
    const originalPosition = this.position
    this.position = 0

    try {
      const numFiles = this.readUInt32()
      console.log("=== Estructura del archivo ACD ===")
      console.log(`Número total de archivos: ${numFiles}`)
      console.log("Pos\tTam\tOffset\tNombre")
      console.log("-".repeat(60))

      for (let i = 0; i < numFiles && this.position < this.data.length; i++) {
        const startPos = this.position
        const fileName = this.readString()
        const fileSize = this.readUInt32()
        const fileOffset = this.readUInt32()
        const unknown1 = this.readUInt32()
        const unknown2 = this.readUInt32()

        console.log(`${startPos}\t${fileSize}\t${fileOffset}\t${fileName}`)
        console.log(`  Unknown1: ${unknown1}, Unknown2: ${unknown2}`)

        // Mostrar los primeros bytes del contenido para debugging
        if (fileOffset < this.data.length && fileSize > 0) {
          const contentPreview = Array.from(this.data.slice(fileOffset, fileOffset + Math.min(16, fileSize)))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join(" ")
          console.log(`  Contenido: ${contentPreview}`)
        } else {
          console.log(`  Contenido: No disponible (offset o tamaño inválido)`)
        }
      }
    } catch (error) {
      console.error("Error al analizar la estructura:", error)
    } finally {
      this.position = originalPosition
    }
  }
}

