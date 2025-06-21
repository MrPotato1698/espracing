"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface ChampionshipPosterUploadProps {
  championshipId: number
  currentPosterUrl: string | null
  onUploadComplete: (imageName: string) => void
}

export default function ChampionshipPosterUpload({
  championshipId,
  currentPosterUrl,
  onUploadComplete,
}: Readonly<ChampionshipPosterUploadProps>) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentPosterUrl);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    setError(null);
    setSuccess(null);

    let selectedFile: File | null = null;

    if ("dataTransfer" in e) {
      // Manejar drag and drop
      e.preventDefault()
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        selectedFile = e.dataTransfer.files[0];
      }
    } else if (e.target.files && e.target.files.length > 0) {
      // Manejar cambios en el input de archivo
      selectedFile = e.target.files[0];
    }

    if (!selectedFile) return;

    // Comprobar que el archivo es una imagen
    if (!selectedFile.type.startsWith("image/")) {
      setError("Por favor, selecciona un archivo de imagen válido");
      return;
    }

    setFile(selectedFile);

    // Crear preview de la imagen
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    }
    reader.readAsDataURL(selectedFile);
  }, []);

  // Calcular dimensiones manteniendo la relación de aspecto
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
  }

  // Crear canvas y convertir a blob
  const createCanvasBlob = (img: HTMLImageElement, width: number, height: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);

      // Convertir a webp con 0.8 de calidad
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error("Error al comprimir la imagen"))
        },"image/webp",0.8
      );
    });
  }

  // Cargar imagen desde data URL
  const loadImage = (dataUrl: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Error al cargar la imagen"));
      img.src = dataUrl;
    });
  }

  // Función para comprimir la imagen
  const compressImage = async (file: File): Promise<Blob> => {
    try {
      // Read file as data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error("Error al leer el archivo"));
        reader.readAsDataURL(file);
      });

      // Cargar la imagen y procesarla
      const img = await loadImage(dataUrl);
      const { width, height } = calculateDimensions(img.width, img.height, 1200);
      return await createCanvasBlob(img, width, height);
    } catch (error) {
      console.error("Error comprimiendo imagen:", error);
      throw error;
    }
  }

  const uploadImage = async () => {
    if (!file) return;
    try {
      setUploading(true);
      setProgress(10);
      // Comprimir la imagen
      const compressedImage = await compressImage(file);
      setProgress(40);
      // Subir la imagen comprimida a la API
      const formData = new FormData();
      formData.append("championshipId", championshipId.toString());
      formData.append("file", compressedImage, `poster_${championshipId}.webp`);
      const res = await fetch("/api/admin/championshipposter", {
        method: "POST",
        body: formData
      });
      setProgress(90);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error desconocido");
      if (typeof onUploadComplete === "function") onUploadComplete(data.fileName);
      setSuccess("Imagen subida correctamente");
      setProgress(100);
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      setError("Error al subir la imagen: " + (error as Error).message);
    } finally {
      setUploading(false);
    }
  }

  const deleteImage = async () => {
    if (!currentPosterUrl && !preview) return;
    try {
      setUploading(true);
      const res = await fetch("/api/admin/championshipposter", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ championshipId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error desconocido");
      if (typeof onUploadComplete === "function") onUploadComplete("");
      setFile(null);
      setPreview(null);
      setSuccess("Imagen eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar la imagen:", error);
      setError("Error al eliminar la imagen: " + (error as Error).message);
    } finally {
      setUploading(false);
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }

  return (
    <Card className="mb-6 p-6 border-2 border-primary rounded-lg bg-darkSecond">
      <div className="mb-4">
        <label htmlFor="posterUpload" className="block text-lightPrimary text-lg font-semibold mb-3">
          Poster del Campeonato
        </label>
        <div className="relative" onDragOver={handleDragOver} onDrop={handleFile} >
          <button
            type="button"
            className="absolute inset-0 w-full h-full opacity-0 z-10"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload poster image"
          />
          <input
            type="file"
            id="posterUpload"
            name="posterUpload"
            accept="image/*"
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            onChange={handleFile}
            ref={fileInputRef}
            disabled={uploading}
          />
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary rounded-lg bg-darkSecond text-lightPrimary cursor-pointer min-h-[150px] transition-colors hover:border-primary-dark">
            {preview ? (
              <div className="flex flex-col items-center">
                <img
                  src={preview || "/placeholder.svg"}
                  alt="Vista previa del poster"
                  className="max-h-[200px] max-w-full object-contain mb-3"
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/placeholder.svg";
                  }}
                />
                <span className="text-sm font-medium">Haz clic o arrastra para cambiar la imagen</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-12 h-12 mb-3 text-primary" />
                <span className="text-sm font-medium">Arrastra y suelta tu imagen aquí</span>
                <span className="text-xs text-lightSecond mt-1">o haz clic para seleccionar</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {file && preview && !preview.startsWith("http") && (
        <div className="mb-4">
          <p className="text-sm text-lightPrimary bg-darkPrimary p-3 rounded-lg border border-primary">
            Archivo seleccionado: <span className="font-medium">{file.name}</span> ({(file.size / 1024).toFixed(2)} KB)
          </p>
        </div>
      )}

      {uploading && (
        <div className="mb-4">
          <Progress value={progress} className="h-2 mb-2" />
          <p className="text-xs text-lightSecond">Procesando imagen...</p>
        </div>
      )}

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

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={uploadImage}
          disabled={!file || uploading}
          className="bg-darkPrimary text-white border-[#29dd38] border-2 rounded-md font-medium hover:bg-[#29dd38] hover:text-darkPrimary"
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          {preview?.startsWith("http") ? "Actualizar Poster" : "Subir Poster"}
        </Button>

        {(preview || currentPosterUrl) && (
          <Button
            type="button"
            variant="destructive"
            onClick={deleteImage}
            disabled={uploading}
            className="bg-darkPrimary text-white border-red-500 border-2 rounded-md font-medium hover:bg-red-500 hover:text-darkPrimary"
          >
            <X className="mr-2 h-4 w-4" />
            Eliminar Poster
          </Button>
        )}
      </div>
    </Card>
  )
}
