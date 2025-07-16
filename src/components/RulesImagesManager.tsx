"use client"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Trash2, ImagePlus, Loader2 } from "lucide-react"

interface RacerulesImg {
  id: number
  name: string
  img_url: string
}

interface ChampionshipImg {
  id: number;
  name: string;
  champ_img: string;
  img_url: string;
}

export default function RulesImagesManager() {
  const [activeTab, setActiveTab] = useState("list")
  const [images, setImages] = useState<RacerulesImg[]>([])
  const [championshipImages, setChampionshipImages] = useState<ChampionshipImg[]>([]);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [newName, setNewName] = useState("")
  const [newFile, setNewFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Drag & drop para la subida de imagen
  const [isDragActive, setIsDragActive] = useState(false);
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setNewFile(e.dataTransfer.files[0]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  // --- Utilidades para comprimir y convertir a webp ---
  const calculateDimensions = (width: number, height: number, maxDimension: number): { width: number; height: number } => {
    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }
    return { width, height };
  };

  const createCanvasBlob = (img: HTMLImageElement, width: number, height: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error("Error al comprimir la imagen"))
        },
        "image/webp",
        0.8
      );
    });
  };

  const loadImage = (dataUrl: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Error al cargar la imagen"));
      img.src = dataUrl;
    });
  };

  const compressImage = async (file: File): Promise<Blob> => {
    // Leer archivo como data URL
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Error al leer el archivo"));
      reader.readAsDataURL(file);
    });
    // Cargar imagen y procesar
    const img = await loadImage(dataUrl);
    const { width, height } = calculateDimensions(img.width, img.height, 1200);
    return await createCanvasBlob(img, width, height);
  };

  // Cargar imágenes
  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/admin/rulesimages");
        const result = await response.json();
        setImages(result.images || []);
        setChampionshipImages(result.championshipImages || []);
      } catch (e: any) {
        setError("Error al cargar imágenes: " + (e.message || e));
      }
      setLoading(false)
    }
    fetchImages()
  }, [])

  // Copiar URL al portapapeles
  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setSuccess("URL copiada al portapapeles")
      setTimeout(() => setSuccess(null), 2000)
    } catch {
      setError("No se pudo copiar la URL")
    }
  }

  // Eliminar imagen
  const handleDelete = async (img: RacerulesImg) => {
    setError(null)
    setSuccess(null)
    setUploading(true)
    try {
      const response = await fetch("/api/admin/rulesimages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: img.id, img_url: img.img_url }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Error al eliminar");
      setImages((prev) => prev.filter((i) => i.id !== img.id))
      setSuccess("Imagen eliminada correctamente")
      setTimeout(() => setSuccess(null), 2000)
    } catch (e: any) {
      setError("Error al eliminar: " + (e.message || e))
    } finally {
      setUploading(false)
    }
  }

  // Subir nueva imagen
  const handleUpload = async () => {
    setError(null)
    setSuccess(null)
    if (!newName.trim() || !newFile) {
      setError("Debes poner un nombre y seleccionar una imagen")
      return
    }
    setUploading(true)
    try {
      // Comprimir y convertir a webp
      const compressedImage = await compressImage(newFile);
      const formData = new FormData();
      formData.append("name", newName);
      formData.append("file", new File([compressedImage], `rulesimg_${Date.now()}.webp`, { type: "image/webp" }));
      const response = await fetch("/api/admin/rulesimages", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok || !result.image) throw new Error(result.error || "Error al subir");
      setImages((prev) => [...prev, result.image])
      setSuccess("Imagen subida correctamente")
      setNewName("")
      setNewFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      setTimeout(() => setSuccess(null), 2000)
    } catch (e: any) {
      setError("Error al subir: " + (e.message || e))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-darkSecond rounded-lg border p-6 mb-6">
      <h3 className="text-lg font-medium mb-4">Gestión de Imágenes para Normativa</h3>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mb-4 bg-green-100 text-green-800 border-green-200">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex justify-center w-full">
          <div className="mx-auto flex gap-2">
            <TabsTrigger value="list">Imágenes disponibles</TabsTrigger>
            <TabsTrigger value="add">Añadir imagen</TabsTrigger>
          </div>
        </TabsList>
        <TabsContent value="list">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
            {/* Campeonatos activos */}
            {championshipImages.length > 0 && (
              <div className="mb-6">
                <div className="font-semibold mb-2 text-primary">Imágenes de campeonatos activos</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {championshipImages.map((champ) => (
                    <div key={champ.id} className="bg-darkPrimary rounded-lg p-4 border flex flex-col items-center opacity-90">
                      {champ.img_url ? (
                        <img src={champ.img_url} alt={champ.name} className="h-32 w-auto object-contain mb-2 rounded border border-primary/40" />
                      ) : (
                        <div className="h-32 flex items-center justify-center text-xs text-lightSecond">Sin imagen</div>
                      )}
                      <div className="text-sm font-medium mb-2 text-center break-all">{champ.name}</div>
                      <div className="text-xs text-lightSecond mb-2">(Campeonato activo)</div>
                      <Button size="sm" variant="outline" onClick={() => handleCopy(champ.img_url)} disabled={uploading}>
                        <Copy className="h-4 w-4 mr-1" /> Copiar URL
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Imágenes de normativa */}
            <div className="font-semibold mb-2 text-primary">Imágenes de normativa</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((img) => (
                <div key={img.id} className="bg-darkPrimary rounded-lg p-4 border flex flex-col items-center">
                  <img src={img.img_url} alt={img.name} className="h-32 w-auto object-contain mb-2 rounded" />
                  <div className="text-sm font-medium mb-2 text-center break-all">{img.name}</div>
                  <div className="flex gap-2 flex-col 2xl:flex-row 2xl:items-center w-full 2xl:w-auto mt-2 2xl:mt-0">
                    <Button size="sm" variant="outline" onClick={() => handleCopy(img.img_url)} disabled={uploading} className="w-full 2xl:w-auto flex items-center justify-center">
                      <Copy className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Copiar URL</span>
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(img)} disabled={uploading} className="w-full 2xl:w-auto flex items-center justify-center">
                      <Trash2 className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Eliminar</span>
                    </Button>
                  </div>
                </div>
              ))}
              {images.length === 0 && <div className="col-span-full text-center text-lightSecond">No hay imágenes subidas.</div>}
            </div>
            </>
          )}
        </TabsContent>
        <TabsContent value="add">
          <div className="max-w-md mx-auto flex flex-col gap-4">
            <Input
              type="text"
              placeholder="Nombre de la imagen"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              disabled={uploading}
            />
            <div
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer ${isDragActive ? 'border-primary bg-primary/10' : 'border-primary/40 bg-darkPrimary/40'}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              style={{ minHeight: 120 }}
            >
              {newFile ? (
                <>
                  <img src={URL.createObjectURL(newFile)} alt="preview" className="h-24 object-contain mb-2 rounded" />
                  <span className="text-xs text-lightSecond mb-1">{newFile.name}</span>
                  <span className="text-xs text-lightSecond">Haz clic o arrastra para cambiar la imagen</span>
                </>
              ) : (
                <>
                  <span className="text-lg text-primary mb-2">Arrastra y suelta una imagen aquí</span>
                  <span className="text-xs text-lightSecond">o haz clic para seleccionar</span>
                </>
              )}
              <Input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={e => setNewFile(e.target.files?.[0] || null)}
                disabled={uploading}
                className="hidden"
              />
            </div>
            <Button onClick={handleUpload} disabled={uploading} className="flex items-center gap-2">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              {uploading ? "Subiendo..." : "Subir imagen"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
