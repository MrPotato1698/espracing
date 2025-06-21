import React, { useEffect, useState } from "react";
import { Edit2, Trash2, Search, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showToast } from "@/lib/utils";

interface CarClass {
  class_id: number;
  class_name: string;
  class_shortname: string;
  class_design: string;
  model_count: number;
};

interface CarClassFormData {
  name: string;
  short_name: string;
  backgroundColor: string;
  textColor: string;
};

function extractColorsFromDesign(class_design: string) {
  const match = class_design.match(/bg-\[(#[0-9a-fA-F]{6})\] text-\[(#[0-9a-fA-F]{6})\]/);
  return {
    background: match ? match[1] : '#006fba',
    color: match ? match[2] : '#f9f9f9',
  };
};

export default function CarClassManager() {
  const [classes, setClasses] = useState<CarClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<CarClassFormData>({
    name: '',
    short_name: '',
    backgroundColor: '#006fba',
    textColor: '#f9f9f9',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClasses, setFilteredClasses] = useState<CarClass[]>([]);
  const totalPages = Math.ceil(filteredClasses.length / pageSize);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [classToDelete, setClassToDelete] = useState<CarClass | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/carclass?action=list', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Error al obtener las clases');
        const data = await response.json();
        setClasses(data ?? []);
        setFilteredClasses(data ?? []);
      } catch (err) {
        setError('Error al cargar las clases');
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClasses(classes);
    } else {
      const filtered = classes.filter(cl =>
        cl.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cl.class_shortname.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClasses(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, classes]);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/carclass?action=list', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Error al obtener las clases');
      const data = await response.json();
      setClasses(data ?? []);
      setFilteredClasses(data ?? []);
    } catch (err) {
      console.error('Error loading classes:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las clases');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.short_name.trim()) {
      setError("El nombre y el shortname son obligatorios");
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/admin/carclass?action=nextid');
      const { nextId } = await res.json();
      const class_design = `bg-[${formData.backgroundColor}] text-[${formData.textColor}]`;
      const response = await fetch('/api/admin/carclass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: nextId,
          name: formData.name,
          short_name: formData.short_name,
          class_design,
        })
      });
      if (!response.ok) throw new Error('Error al crear la clase');
      setSuccess('Clase creada correctamente');
      setFormData({ name: '', short_name: '', backgroundColor: '#006fba', textColor: '#f9f9f9' });
      await loadClasses();
    } catch (err) {
      console.error('Error creating car class:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la clase');
    }
  };

  const handleDelete = (classObj: CarClass) => {
    if (classObj.model_count > 0) {
      showToast(`No se puede eliminar "${classObj.class_name}" porque tiene ${classObj.model_count} modelo${classObj.model_count > 1 ? 's' : ''} asociado${classObj.model_count > 1 ? 's' : ''}. Elimina primero los modelos de esta clase.`, 'error');
      return;
    }
    setClassToDelete(classObj);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!classToDelete) return;
    try {
      const response = await fetch('/api/admin/carclass', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: classToDelete.class_id })
      });
      if (!response.ok) throw new Error('Error al eliminar la clase');
      showToast('Clase eliminada correctamente', 'success');
      setSuccess('Clase eliminada correctamente');
      await loadClasses();
    } catch (err) {
      console.error('Error deleting class:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar la clase');
      showToast('Error al eliminar la clase', 'error');
    } finally {
      setShowDeleteDialog(false);
      setClassToDelete(null);
    }
  };

  if (loading) return <div className="text-center">Cargando clases...</div>;

  return (
    <div className="w-full">
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Lista de Clases</TabsTrigger>
          <TabsTrigger value="form">Nueva Clase</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="space-y-4">
          <div className="flex gap-4 my-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-lightSecond" />
              <Input
                type="text"
                placeholder="Buscar por nombre o shortname..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 bg-darkPrimary border-lightSecond text-white"
              />
            </div>
          </div>
          <div className="py-4">
            <Card className="p-6 border-2 border-primary">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary">
                    <TableHead className="text-white">Nombre</TableHead>
                    <TableHead className="text-white">Diseño</TableHead>
                    <TableHead className="text-white">Modelos</TableHead>
                    <TableHead className="text-white text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((cl) => (
                    <TableRow key={cl.class_id} className={filteredClasses.indexOf(cl) % 2 === 0 ? "bg-darkPrimary" : "bg-darkSecond"}>
                      <TableCell className="text-white">{cl.class_name}</TableCell>
                      <TableCell className="text-white">
                        {(() => {
                          const { background, color } = extractColorsFromDesign(cl.class_design);
                          return (
                            <span
                              style={{ background, color, padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontWeight: 'bold', display: 'inline-block' }}
                            >
                              {cl.class_shortname}
                            </span>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="text-white">{cl.model_count}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { window.location.href = `/admin/carclass/${cl.class_id}`; }}
                            className="text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(cl)}
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
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          className={currentPage === 1 ? "opacity-50 pointer-events-none" : ""}
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
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          className={currentPage === totalPages ? "opacity-50 pointer-events-none" : ""}
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
                  <label className="block text-lightPrimary text-lg font-semibold mb-2">Nombre de la Clase *</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Gran Turismos X"
                    className="w-full p-3 border border-lightSecond rounded-md bg-darkPrimary text-white hover:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-lightPrimary text-lg font-semibold mb-2">Shortname *</label>
                  <Input
                    type="text"
                    value={formData.short_name}
                    onChange={e => setFormData({ ...formData, short_name: e.target.value })}
                    placeholder="GTX"
                    className="w-full p-3 border border-lightSecond rounded-md bg-darkPrimary text-white hover:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-lightPrimary text-lg font-semibold mb-2">Color de fondo</label>
                  <Input
                    type="color"
                    value={formData.backgroundColor}
                    onChange={e => setFormData({ ...formData, backgroundColor: e.target.value })}
                    className="w-16 h-10 p-0 border-none bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-lightPrimary text-lg font-semibold mb-2">Color de texto</label>
                  <Input
                    type="color"
                    value={formData.textColor}
                    onChange={e => setFormData({ ...formData, textColor: e.target.value })}
                    className="w-16 h-10 p-0 border-none bg-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <div className="mb-2 p-4 rounded-md text-center font-bold w-2/4 mx-auto" style={{ background: formData.backgroundColor, color: formData.textColor }}>
                    {formData.short_name || 'GTX'}
                  </div>
                </div>
              </div>
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
                  type="submit"
                  className="bg-darkPrimary text-white border-[#29dd38] border-2 rounded-md font-medium hover:bg-[#29dd38] hover:text-darkPrimary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Clase
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar clase?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar la clase "{classToDelete?.class_name}"? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setShowDeleteDialog(false); setClassToDelete(null); }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
