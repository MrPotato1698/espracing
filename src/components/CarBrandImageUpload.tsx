"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { supabase } from "@/db/supabase"
import { Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface CarBrandImageUploadProps {
  brandId: number
  currentImageUrl: string | null
  onUploadComplete: (imageUrl: string) => void
}

export default function CarBrandImageUpload({
  brandId,
  currentImageUrl,
  onUploadComplete,
}: Readonly<CarBrandImageUploadProps>) {
  const [hasImage, setHasImage] = useState(() => Boolean(currentImageUrl));

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImageUrl);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    setHasImage(Boolean(currentImageUrl));
    setPreview(currentImageUrl);
  }, [currentImageUrl]);

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
      const { width, height } = calculateDimensions(img.width, img.height, 800);
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

      // Crear el fichero con el ID de la marca + timestamp para evitar conflictos
      const timestamp = new Date().getTime();
      const fileName = `brand_${brandId}_${timestamp}.webp`;

      // Si existe una imagen anterior, eliminarla
      if (currentImageUrl && hasImage) {
        try {
          const { data: files } = await supabase.storage
            .from("carbrands")
            .list("", { search: `brand_${brandId}_` });

          if (files && files.length > 0) {
            const filesToDelete = files.map(file => file.name);
            await supabase.storage.from("carbrands").remove(filesToDelete);
          }
        } catch (e) {
          console.error("No se encontraron archivos anteriores", e);
        }
        setProgress(60);
      }

      // Subir la imagen comprimida a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("carbrands")
        .upload(fileName, compressedImage, {
          cacheControl: "3600",
          upsert: false,
          contentType: "image/webp",
        });

      if (uploadError) throw uploadError;
      setProgress(80);

      // Obtener la URL pública de la imagen
      const { data: urlData } = supabase.storage
        .from("carbrands")
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        throw new Error("Error al obtener la URL pública");
      }

      setProgress(90);

      // Actualizar el registro de la marca con la URL pública
      const { error: updateError } = await supabase
        .from("carbrand")
        .update({ imgbrand: urlData.publicUrl })
        .eq("id", brandId);

      if (updateError) throw updateError;

      // Llamar a la función de callback con la nueva URL
      if (typeof onUploadComplete === "function") onUploadComplete(urlData.publicUrl);

      // Actualizar estado local con timestamp para forzar actualización visual
      const urlWithTimestamp = `${urlData.publicUrl}?t=${new Date().getTime()}`;
      setHasImage(true);
      setPreview(urlWithTimestamp);
      setFile(null);

      setSuccess("Imagen de la marca actualizada correctamente");
      setProgress(100);
    } catch (error) {
      console.error("Error al subir la imagen de la marca:", error);
      setError("Error al subir la imagen de la marca: " + (error as Error).message);
    } finally {
      setUploading(false);
    }
  }

  const deleteImage = async () => {
    if (!hasImage) return;

    try {
      setUploading(true);

      // Eliminar la imagen de Supabase Storage
      try {
        const { data: files } = await supabase.storage
          .from("carbrands")
          .list("", { search: `brand_${brandId}_` });

        if (files && files.length > 0) {
          const filesToDelete = files.map(file => file.name);
          await supabase.storage.from("carbrands").remove(filesToDelete);
        }
      } catch (e) {
        console.error("No se encontraron archivos para eliminar", e);
      }

      // Actualizar el registro de la marca para limpiar la URL de imagen
      const { error: updateError } = await supabase
        .from("carbrand")
        .update({ imgbrand: null })
        .eq("id", brandId);

      if (updateError) throw updateError;

      // Llamar a la función de callback
      if (typeof onUploadComplete === "function") onUploadComplete("");

      // Actualizar estado local
      setHasImage(false);
      setPreview(null);
      setFile(null);
      setSuccess("Imagen de la marca eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar la imagen de la marca:", error);
      setError("Error al eliminar la imagen de la marca: " + (error as Error).message);
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
        <label
          htmlFor="brandImageUpload"
          className="block text-lightPrimary text-lg font-semibold mb-3"
        >
          Logo de la Marca
        </label>
        <div className="relative" onDragOver={handleDragOver} onDrop={handleFile}>
          <button
            type="button"
            className="absolute inset-0 w-full h-full opacity-0 z-10"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload brand logo"
          />
          <input
            type="file"
            id="brandImageUpload"
            name="brandImageUpload"
            accept="image/*"
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            onChange={handleFile}
            ref={fileInputRef}
            disabled={uploading}
          />
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary rounded-lg bg-darkSecond text-lightPrimary cursor-pointer min-h-[150px] transition-colors hover:border-primary-dark">
            {mounted && preview && hasImage ? (
              <div className="flex flex-col items-center">
                <img
                  src={preview || "/placeholder.svg"}
                  alt="Vista previa del logo de la marca"
                  className="max-h-[200px] max-w-full object-contain mb-3"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/placeholder.svg";
                  }}
                />
                <span className="text-sm font-medium">
                  Haz clic o arrastra para cambiar el logo
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-12 h-12 mb-3 text-primary" />
                <span className="text-sm font-medium">
                  {mounted && !hasImage
                    ? "No tiene logo asignado"
                    : "Arrastra y suelta tu logo aquí"}
                </span>
                <span className="text-xs text-lightSecond mt-1">
                  o haz clic para seleccionar
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {file && preview && !preview.startsWith("http") && (
        <div className="mb-4">
          <p className="text-sm text-lightPrimary bg-darkPrimary p-3 rounded-lg border border-primary">
            Archivo seleccionado:{""}
            <span className="font-medium">{file.name}</span> (
            {(file.size / 1024).toFixed(2)} KB)
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
          {mounted && hasImage ? "Actualizar Logo" : "Subir Logo"}
        </Button>

        {mounted && hasImage && (
          <Button
            type="button"
            variant="destructive"
            onClick={deleteImage}
            disabled={uploading}
            className="bg-darkPrimary text-white border-red-500 border-2 rounded-md font-medium hover:bg-red-500 hover:text-darkPrimary"
          >
            <X className="mr-2 h-4 w-4" />
            Eliminar Logo
          </Button>
        )}
      </div>
    </Card>
  );
}