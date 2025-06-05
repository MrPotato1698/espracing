"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { supabase } from "@/db/supabase"
import { Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface DriverAvatarUploadProps {
  driverId: string
  currentAvatarUrl: string
  onUploadComplete: (imageUrl: string) => void
}

export default function DriverAvatarUpload({
  driverId,
  currentAvatarUrl,
  onUploadComplete,
}: Readonly<DriverAvatarUploadProps>) {
  const defaultAvatarUrl = "https://tavjuyhbdqnkgsosdymq.supabase.co/storage/v1/object/public/avatars//default.webp";
  const [isDefaultAvatar, setIsDefaultAvatar] = useState(() => 
    currentAvatarUrl === defaultAvatarUrl || !currentAvatarUrl
  );
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);  const [success, setSuccess] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    setIsDefaultAvatar(currentAvatarUrl === defaultAvatarUrl || !currentAvatarUrl);
    setPreview(currentAvatarUrl);
  }, [currentAvatarUrl, defaultAvatarUrl]);
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
      const newPreview = e.target?.result as string;
      setPreview(newPreview);
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
      // Leer el archivo como data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          resolve(result);
        };
        reader.onerror = () => reject(new Error("Error al leer el archivo"));
        reader.readAsDataURL(file);
      });

      // Cargar la imagen y procesarla
      const img = await loadImage(dataUrl);
      const { width, height } = calculateDimensions(img.width, img.height, 800);
      const compressedBlob = await createCanvasBlob(img, width, height);

      return compressedBlob;
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
      setProgress(30);      // Crear el fichero con el ID del piloto + timestamp para evitar conflictos
      const timestamp = new Date().getTime();
      const fileName = `avatar_${driverId}_${timestamp}.webp`;     // PASO 1: Eliminar completamente las imágenes anteriores (tanto patrón antiguo como nuevo)
      if (!isDefaultAvatar) {
        // Eliminar archivo con patrón antiguo
        const oldFileName = `avatar_${driverId}.webp`;
        try {
          await supabase.storage.from("avatars").remove([oldFileName]);
        } catch (e) {
          console.error("No se encontró archivo con patrón antiguo", e);
        }

        // Eliminar archivos con patrón nuevo (con timestamp)
        try {
          const { data: files } = await supabase.storage
            .from("avatars")
            .list("", { search: `avatar_${driverId}_` });

          if (files && files.length > 0) {
            const filesToDelete = files.map(file => file.name);
            await supabase.storage.from("avatars").remove(filesToDelete);
          }
        } catch (e) {
          console.error("No se encontraron archivos anteriores con timestamp", e);
        }
      }
      setProgress(60);      // PASO 2: Subir la nueva imagen (sin upsert, upload fresh)

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, compressedImage, {
          cacheControl: "3600",
          upsert: false, // No usar upsert, hacer upload fresco después del delete
          contentType: "image/webp",
        });

      if (uploadError) {
        console.error("Error en upload:", uploadError);
        throw uploadError;
      }
      setProgress(80);      // Obtener la URL pública de la imagen
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        throw new Error("Error al obtener la URL pública");
      }

      setProgress(90);

      // Actualizar el registro del piloto con la URL pública
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar: urlData.publicUrl })
        .eq("id", driverId);

      if (updateError) throw updateError;

      // Llamar a la función de callback con la nueva URL (con timestamp para evitar caché)
      const urlWithTimestamp = `${urlData.publicUrl}?t=${new Date().getTime()}`;
      if (typeof onUploadComplete === "function") onUploadComplete(urlData.publicUrl);      // Actualizar estado local con el timestamp para forzar actualización visual
      setIsDefaultAvatar(false);
      setPreview(urlWithTimestamp);
      setFile(null); // Limpiar el archivo seleccionado

      // Reset del input file para evitar problemas de caché
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setSuccess("Avatar actualizado correctamente");
      setProgress(100);
    } catch (error) {
      console.error("Error al subir el avatar:", error);
      setError("Error al subir el avatar: " + (error as Error).message);
    } finally {
      setUploading(false);
    }
  } 
  const deleteImage = async () => {
    if (isDefaultAvatar) return;

    try {
      setUploading(true);

      // Eliminar todas las imágenes del piloto (tanto el patrón antiguo como el nuevo)
      const oldFileName = `avatar_${driverId}.webp`;

      // Primero intentar eliminar archivos con el patrón antiguo
      try {
        await supabase.storage.from("avatars").remove([oldFileName]);
      } catch (e) {
        console.error("No se encontró archivo con patrón antiguo:", e);
      }

      // Luego listar y eliminar archivos con el patrón nuevo (con timestamp)
      try {
        const { data: files } = await supabase.storage
          .from("avatars")
          .list("", { search: `avatar_${driverId}_` });

        if (files && files.length > 0) {
          const filesToDelete = files.map(file => file.name);
          await supabase.storage.from("avatars").remove(filesToDelete);
        }
      } catch (e) {
        console.error("No se encontraron archivos con timestamp:", e);
      }

      // Actualizar el registro del piloto para usar el avatar por defecto
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar: defaultAvatarUrl })
        .eq("id", driverId);

      if (updateError) throw updateError;      // Llamar a la función de callback
      if (typeof onUploadComplete === "function") onUploadComplete(defaultAvatarUrl);

      // Actualizar estado local
      setIsDefaultAvatar(true);
      setPreview(defaultAvatarUrl);

      setFile(null);
      setSuccess("Avatar eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar el avatar:", error);
      setError("Error al eliminar el avatar: " + (error as Error).message);
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
        <label htmlFor="avatarUpload" className="block text-lightPrimary text-lg font-semibold mb-3">
          Avatar del Piloto
        </label>
        <div className="relative" onDragOver={handleDragOver} onDrop={handleFile}>
          <button
            type="button"
            className="absolute inset-0 w-full h-full opacity-0 z-10"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload avatar image by clicking or dragging and dropping"
            disabled={uploading}
          />
          <input
            type="file"
            id="avatarUpload"
            name="avatarUpload"
            accept="image/*"
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            onChange={handleFile}
            ref={fileInputRef}
            disabled={uploading}
          />
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary rounded-lg bg-darkSecond text-lightPrimary cursor-pointer min-h-[150px] transition-colors hover:border-primary-dark">
            {mounted && preview && !isDefaultAvatar ? (
              <div className="flex flex-col items-center">
                <img
                  src={preview || "/placeholder.svg"}
                  alt="Vista previa del avatar"
                  className="w-24 h-24 rounded-full object-cover mb-3"
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/placeholder.svg";
                  }}
                />
                <span className="text-sm font-medium">Haz clic o arrastra para cambiar el avatar</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-12 h-12 mb-3 text-primary" />
                <span className="text-sm font-medium">{mounted && isDefaultAvatar ? "No tiene imagen asignada" : "Arrastra y suelta tu imagen aquí"}</span>
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
          {mounted && !isDefaultAvatar ? "Actualizar Avatar" : "Subir Avatar"}
        </Button>

        {mounted && !isDefaultAvatar && (
          <Button
            type="button"
            variant="destructive"
            onClick={deleteImage}
            disabled={uploading}
            className="bg-darkPrimary text-white border-red-500 border-2 rounded-md font-medium hover:bg-red-500 hover:text-darkPrimary"
          >
            <X className="mr-2 h-4 w-4" />
            Eliminar Avatar
          </Button>
        )}
      </div>
    </Card>
  )
}