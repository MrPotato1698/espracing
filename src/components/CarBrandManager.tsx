"use client"

import type React from "react";
import { useState, useRef, useCallback, useEffect } from "react";

import { Upload, ImageIcon, Edit2, Trash2, Search } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { showToast } from "@/lib/utils";

/* ------------------------------------------------------------ */

interface CarBrand {
  brand_id: number
  brand_name: string
  brand_location: string
  brand_foundation: number
  brand_imgbrand: string
  models_count: number
};

interface CarBrandFormData {
  name: string
  location: string
  foundation: number
  image?: File
};


export default function CarBrandManager() {
  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<CarBrandFormData>({
    name: '',
    location: '',
    foundation: new Date().getFullYear()
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBrands, setFilteredBrands] = useState<CarBrand[]>([]);
  const totalPages = Math.ceil(filteredBrands.length / pageSize);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<CarBrand | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadBrands(); }, []);

  // Filtrar marcas según el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBrands(brands);
    } else {
      const filtered = brands.filter(brand =>
        brand.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.brand_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.brand_foundation.toString().includes(searchTerm)
      );
      setFilteredBrands(filtered);
    }
    setCurrentPage(1); // Reset to first page when searching
  }, [searchTerm, brands]);

  const loadBrands = async () => {
    try {
      const response = await fetch('/api/admin/carbrand?action=list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error('Error al obtener las marcas');
      }
      const data = await response.json();
      // Mapear los datos para que coincidan con la interfaz CarBrand
      const mappedData = (data ?? []).map((item: any) => ({
        brand_id: Number(item.brand_id), // Convertir bigint a number
        brand_name: item.brand_name,
        brand_location: item.brand_location ?? '',
        brand_foundation: Number(item.brand_foundation ?? 0), // Convertir smallint a number
        brand_imgbrand: item.brand_img ?? '',
        models_count: item.model_count
      }));

      setBrands(mappedData);
      setFilteredBrands(mappedData);
    } catch (err) {
      console.error('Error loading brands:', err);
      setError('Error al cargar las marcas');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    setError(null);
    setSuccess(null);

    let selectedFile: File | null = null;

    if ("dataTransfer" in e) {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        selectedFile = e.dataTransfer.files[0];
      }
    } else if (e.target.files && e.target.files.length > 0) {
      selectedFile = e.target.files[0];
    }
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Por favor, selecciona un archivo de imagen válido");
      return;
    }

    setImageFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("El nombre de la marca es obligatorio");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setProgress(20);

      // Crear FormData para enviar archivos
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('foundation', formData.foundation.toString());

      if (imageFile) {
        formDataToSend.append('imageFile', imageFile);
      }

      // Llamar a la API para crear la marca
      const response = await fetch('/api/admin/carbrand', {
        method: 'POST',
        body: formDataToSend, // Sin Content-Type header para FormData
      });

      setProgress(90);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? 'Error al crear la marca');
      }

      setSuccess("Marca creada correctamente");

      setProgress(100);
      resetForm();
      await loadBrands();
    } catch (error) {
      console.error("Error al guardar marca:", error);
      setError("Error al guardar la marca: " + (error as Error).message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDelete = async (brandId: number) => {
    const brand = brands.find(b => b.brand_id === brandId);
    if (!brand) return;

    // Verificar inmediatamente si tiene modelos asociados
    if (brand.models_count > 0) {
      showToast(`No se puede eliminar "${brand.brand_name}" porque tiene ${brand.models_count} modelo${brand.models_count > 1 ? 's' : ''} asociado${brand.models_count > 1 ? 's' : ''}. Elimina primero los modelos de esta marca.`, 'error');
      return;
    }

    // Si no tiene modelos, abrir diálogo de confirmación
    setBrandToDelete(brand);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!brandToDelete) return;

    try {
      const response = await fetch("/api/admin/carbrand", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: brandToDelete.brand_id }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Si es un error 400 (Bad Request), es porque tiene modelos asociados
        if (response.status === 400) {
          showToast(errorData.error ?? `No se puede eliminar "${brandToDelete.brand_name}" porque tiene modelos asociados.`, 'error');

          // También mostrar en el estado local para debugging
          setError(errorData.error ?? "No se puede eliminar la marca porque tiene modelos asociados");
        } else {
          showToast("Error del servidor al eliminar la marca", 'error');
          setError("Error del servidor al eliminar la marca");
        }

        console.error("Error del servidor:", errorData);
        return;
      }

      showToast("Marca eliminada correctamente", 'success');
      setSuccess("Marca eliminada correctamente");
      await loadBrands();
    } catch (error) {
      console.error("Error al eliminar marca:", error);
      const errorMessage = `Error de conexión al eliminar "${brandToDelete.brand_name}"`;
      showToast(errorMessage, 'error');
      setError(errorMessage);
    } finally {
      setShowDeleteDialog(false);
      setBrandToDelete(null);
    }
  };
  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      foundation: new Date().getFullYear()
    });
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  if (loading) {
    return <div className="text-center">Cargando marcas...</div>;
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Lista de Marcas</TabsTrigger>
          <TabsTrigger value="form">Nueva Marca</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="space-y-4">
          <div className="flex gap-4 my-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-lightSecond" />
              <Input
                type="text"
                placeholder="Buscar por nombre, país o año..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-darkPrimary border-lightSecond text-white"
              />
            </div>
          </div>
          <div className="py-4">
            <Card className="p-6 border-2 border-primary">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary">
                    <TableHead className="text-white">Logo</TableHead>
                    <TableHead className="text-white">Nombre</TableHead>
                    <TableHead className="text-white">País</TableHead>
                    <TableHead className="text-white">Fundación</TableHead>
                    <TableHead className="text-white">Modelos</TableHead>
                    <TableHead className="text-white text-center">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBrands.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((brand, index) => (
                      <TableRow
                        key={brand.brand_id}
                        className={
                          index % 2 === 0 ? "bg-darkPrimary" : "bg-darkSecond"
                        }
                      >
                        <TableCell className="text-white">
                          {brand.brand_imgbrand ? (
                            <img
                              src={brand.brand_imgbrand}
                              alt={`Logo de ${brand.brand_name}`}
                              className="w-12 h-12 object-contain rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-300 rounded flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-500" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-white">
                          {brand.brand_name}
                        </TableCell>
                        <TableCell className="text-white">
                          {brand.brand_location}
                        </TableCell>
                        <TableCell className="text-white">
                          {brand.brand_foundation}
                        </TableCell>
                        <TableCell className="text-white">
                          {brand.models_count}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                window.location.href = `/admin/carbrand/${brand.brand_id}`;
                              }}
                              className="text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                handleDelete(brand.brand_id);
                              }}
                              className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          className={
                            currentPage === 1
                              ? "opacity-50 pointer-events-none"
                              : ""
                          }
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            isActive={currentPage === i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          className={
                            currentPage === totalPages
                              ? "opacity-50 pointer-events-none"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="form" className="space-y-4">
          <Card className="p-6 border-2 border-primary rounded-lg bg-darkSecond">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-lightPrimary text-lg font-semibold mb-2">
                    Nombre de la Marca
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ferrari"
                    className="w-full p-3 border border-lightSecond rounded-md bg-darkPrimary text-white hover:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-lightPrimary text-lg font-semibold mb-2">
                    País de Origen
                  </label>
                  <Input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="Italia"
                    className="w-full p-3 border border-lightSecond rounded-md bg-darkPrimary text-white hover:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-lightPrimary text-lg font-semibold mb-2">
                    Año de Fundación
                  </label>
                  <Input
                    type="number"
                    value={formData.foundation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        foundation:
                          parseInt(e.target.value) || new Date().getFullYear(),
                      })
                    }
                    placeholder="1947"
                    min="1800"
                    max={new Date().getFullYear()}
                    className="w-full p-3 border border-lightSecond rounded-md bg-darkPrimary text-white hover:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-lightPrimary text-lg font-semibold mb-3">
                  Logo de la Marca
                </label>
                <div
                  className="relative"
                  onDragOver={handleDragOver}
                  onDrop={handleImageSelect}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={uploading}
                  />
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary rounded-lg bg-darkSecond text-lightPrimary cursor-pointer min-h-[150px] transition-colors hover:border-primary-dark">
                    {imagePreview ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={imagePreview}
                          alt="Vista previa del logo"
                          className="w-24 h-24 object-contain mb-3 rounded-lg"
                        />
                        <span className="text-sm font-medium">
                          Haz clic o arrastra para cambiar el logo
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-12 h-12 mb-3 text-primary" />
                        <span className="text-sm font-medium">
                          Arrastra y suelta el logo aquí
                        </span>
                        <span className="text-xs text-lightSecond mt-1">
                          o haz clic para seleccionar
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {imageFile && (
                <div className="mb-4">
                  <p className="text-sm text-lightPrimary bg-darkPrimary p-3 rounded-lg border border-primary">
                    Archivo seleccionado:{" "}
                    <span className="font-medium">{imageFile.name}</span> (
                    {(imageFile.size / 1024).toFixed(2)} KB)
                  </p>
                </div>
              )}

              {uploading && (
                <div className="mb-4">
                  <Progress value={progress} className="h-2 mb-2" />
                  <p className="text-xs text-lightSecond">Procesando...</p>
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
                {" "}
                <Button
                  type="submit"
                  disabled={uploading || !formData.name.trim()}
                  className="bg-darkPrimary text-white border-[#29dd38] border-2 rounded-md font-medium hover:bg-[#29dd38] hover:text-darkPrimary"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Crear Marca
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AlertDialog para confirmar eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar marca?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar la marca "
              {brandToDelete?.brand_name}"? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false);
                setBrandToDelete(null);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}