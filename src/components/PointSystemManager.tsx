"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Plus, Save, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PointSystem {
  id: number;
  name: string;
  points: string;
  fastestlap: number;
}

interface PointSystemManagerProps {
  readonly initialData: PointSystem[];
}

export default function PointSystemManager({ initialData }: PointSystemManagerProps) {
  const [pointSystems, setPointSystems] = useState<PointSystem[]>(initialData);
  const [selectedSystem, setSelectedSystem] = useState<PointSystem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSystem, setEditingSystem] = useState<PointSystem | null>(null);
  const [editingPoints, setEditingPoints] = useState<number[]>([]);
  const [editingFastestLap, setEditingFastestLap] = useState(0);
  const [editingName, setEditingName] = useState("");
  const [editingPositions, setEditingPositions] = useState(10);

  // New system state
  const [newSystemName, setNewSystemName] = useState("");
  const [newSystemPositions, setNewSystemPositions] = useState(10);
  const [newSystemPoints, setNewSystemPoints] = useState<(number | "")[]>(Array(10).fill(""));
  const [newSystemFastestLap, setNewSystemFastestLap] = useState<number | "">(0);

  // Estado para el número de columnas (movido al nivel superior)
  const [columnsPerRow, setColumnsPerRow] = useState(6);

  // Función para determinar el número de columnas basado en el ancho de la ventana
  const getColumnsPerRow = useCallback(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1536) return 10; // 2xl
      if (window.innerWidth >= 1280) return 8; // xl
      if (window.innerWidth >= 1024) return 6; // lg
      if (window.innerWidth >= 768) return 4; // md
      return 2; // sm y menores
    }
    return 6; // default para SSR
  }, []);

  // Efecto para actualizar columnas al cambiar el tamaño de la ventana
  useEffect(() => {
    const updateColumns = () => setColumnsPerRow(getColumnsPerRow());
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, [getColumnsPerRow]);

  useEffect(() => {
    if (pointSystems.length > 0 && !selectedSystem) {
      setSelectedSystem(pointSystems[0]);
    }
  }, [pointSystems, selectedSystem]);

  const parsePoints = (pointsString: string): number[] => {
    return pointsString.split(",").map((p) => Number.parseInt(p.trim()) || 0);
  };

  const formatPoints = (points: (number | "")[]): string => {
    return points.map((p) => (p === "" ? "0" : p.toString())).join(", ");
  };

  const handleEditStart = (system: PointSystem) => {
    setEditingSystem(system);
    setEditingName(system.name);
    setEditingFastestLap(system.fastestlap);
    const points = parsePoints(system.points);
    setEditingPoints(points);
    setEditingPositions(points.length);
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditingSystem(null);
    setEditingPoints([]);
    setEditingFastestLap(0);
    setEditingName("");
    setEditingPositions(10);
  };

  const handleEditingPositionsChange = (newPositions: number) => {
    const currentPoints = [...editingPoints];
    if (newPositions > currentPoints.length) {
      // Add new positions with 0 points
      while (currentPoints.length < newPositions) {
        currentPoints.push(0);
      }
    } else if (newPositions < currentPoints.length) {
      // Remove positions
      currentPoints.splice(newPositions);
    }
    setEditingPoints(currentPoints);
    setEditingPositions(newPositions);
  };

  const handleNewSystemPositionsChange = (newPositions: number) => {
    const currentPoints = [...newSystemPoints];
    if (newPositions > currentPoints.length) {
      while (currentPoints.length < newPositions) {
        currentPoints.push(0);
      }
    } else if (newPositions < currentPoints.length) {
      currentPoints.splice(newPositions);
    }
    setNewSystemPoints(currentPoints);
    setNewSystemPositions(newPositions);
  };

  // Función para validar el orden descendente de puntos
  const validatePointsOrder = (points: (number | "")[]): string | null => {
    for (let i = 0; i < points.length - 1; i++) {
      const currentPoints = points[i] === "" ? 0 : Number(points[i]);
      const nextPoints = points[i + 1] === "" ? 0 : Number(points[i + 1]);

      if (currentPoints < nextPoints) {
        return `La posición ${i + 1}º (${currentPoints} pts) no puede tener menos puntos que la posición ${i + 2}º (${nextPoints} pts)`;
      }
    }
    return null;
  };

  const validatePoints = (points: (number | "")[], fastestLap: number | "", isEditing = true): string | null => {
    // Check if any position points are <= 0
    for (let i = 0; i < points.length; i++) {
      const pointValue = points[i] === "" ? 0 : Number(points[i]);
      if (pointValue <= 0) {
        return `La puntuación de la posición ${i + 1} debe ser mayor a 0`;
      }
    }

    // Validate descending order
    const orderValidation = validatePointsOrder(points);
      if (orderValidation) {
      return orderValidation;
    }

    // Fastest lap can be 0 but not negative
    const fastestLapValue = fastestLap === "" ? 0 : Number(fastestLap);
    if (fastestLapValue < 0) {
      return "Los puntos de vuelta rápida no pueden ser negativos";
    }

    return null;
  };

  // Función para obtener el máximo valor permitido para una posición
  const getMaxAllowedValue = (position: number, points: (number | "")[]): number => {
    if (position === 0) return 999; // Primera posición no tiene límite superior

    const previousValue = points[position - 1];
    return previousValue === "" ? 999 : Number(previousValue);
  };

  // Función para verificar si un input tiene error de orden
  const hasOrderError = (position: number, points: (number | "")[]): boolean => {
    const currentValue = points[position] === "" ? 0 : Number(points[position]);

    // Verificar con la posición anterior (debe ser menor o igual)
    if (position > 0) {
      const previousValue = points[position - 1] === "" ? 0 : Number(points[position - 1]);
      if (currentValue > previousValue) return true;
    }

    // Verificar con la posición siguiente (debe ser mayor o igual)
    if (position < points.length - 1) {
      const nextValue = points[position + 1] === "" ? 0 : Number(points[position + 1]);
      if (currentValue < nextValue) return true;
    }

    return false;
  };

  const handleSaveEdit = async () => {
    if (!editingSystem) return;

    const validation = validatePoints(editingPoints, editingFastestLap);
    if (validation) {
      alert(validation);
      return;
    }

    if (!editingName.trim()) {
      alert("El nombre no puede estar vacío");
      return;
    }

    try {
      const response = await fetch("/api/admin/pointsystem", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingSystem.id,
          name: editingName,
          points: editingPoints.join(", "),
          fastestlap: editingFastestLap,
          isSpecial: editingSystem.id === 0,
        }),
      });

      if (response.ok) {
        const updatedSystem = {
          ...editingSystem,
          name: editingName,
          points: editingPoints.join(", "),
          fastestlap: editingFastestLap,
        };

        setPointSystems((prev) => prev.map((ps) => (ps.id === editingSystem.id ? updatedSystem : ps)));
        if (selectedSystem?.id === editingSystem.id) {
          setSelectedSystem(updatedSystem);
        }
        handleEditCancel();
        alert("Sistema de puntuación actualizado correctamente");
      } else {
        alert("Error al actualizar el sistema de puntuación");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al actualizar el sistema de puntuación");
    }
  };

  const handleDelete = async (system: PointSystem) => {
    if (system.id === 0) {
      alert("No se puede eliminar el sistema de puntuación especial");
      return;
    }

    try {
      const response = await fetch("/api/admin/pointsystem", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: system.id }),
      });

      if (response.ok) {
        setPointSystems((prev) => prev.filter((ps) => ps.id !== system.id));
        if (selectedSystem?.id === system.id) {
          setSelectedSystem(pointSystems.find((ps) => ps.id !== system.id) || null);
        }
        alert("Sistema de puntuación eliminado correctamente");
      } else {
        alert("Error al eliminar el sistema de puntuación");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar el sistema de puntuación");
    }
  };

  const handleCreateNew = async () => {
    const validation = validatePoints(newSystemPoints, newSystemFastestLap, false);
    if (validation) {
      alert(validation);
      return;
    }

    if (!newSystemName.trim()) {
      alert("El nombre no puede estar vacío");
      return;
    }

    try {
      const response = await fetch("/api/admin/pointsystem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newSystemName,
          points: formatPoints(newSystemPoints),
          fastestlap: newSystemFastestLap === "" ? 0 : newSystemFastestLap,
        }),
      });

      if (response.ok) {
        const newSystem = await response.json();
        setPointSystems((prev) => [...prev, newSystem]);

        // Reset form
        setNewSystemName("");
        setNewSystemPositions(10);
        setNewSystemPoints(Array(10).fill(""));
        setNewSystemFastestLap("");

        alert("Sistema de puntuación creado correctamente");
      } else {
        alert("Error al crear el sistema de puntuación");
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear el sistema de puntuación");
    }
  };

  // Función para dividir las posiciones en grupos para mostrar en tabla
  const chunkArray = (array: number[], chunkSize: number) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  };

    // Función para obtener el estilo del podio
  const getPodiumStyle = (position: number) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold px-2 py-1 rounded-md shadow-md";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-400 text-black font-bold px-2 py-1 rounded-md shadow-md";
      case 3:
        return "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold px-2 py-1 rounded-md shadow-md";
      default:
        return "";
    }
  };

  // Función para renderizar la tabla de puntos con múltiples columnas
  const renderPointsTable = (points: number[]) => {
    const chunks = chunkArray(points, columnsPerRow);

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columnsPerRow }, (_, i) => (
                <TableHead key={i} className="text-center min-w-[100px]">
                  Posición - Puntos
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {chunks.map((chunk, rowIndex) => (
                <TableRow
                  key={`positions-${rowIndex * columnsPerRow + 1}-to-${Math.min((rowIndex + 1) * columnsPerRow, points.length)}`}
                  className={rowIndex % 2 === 0 ? "bg-[var(--color-darkPrimary)]" : "bg-[var(--color-darkSecond)]"}
                >
                  {chunk.map((points, colIndex) => {
                    const position = rowIndex * columnsPerRow + colIndex + 1;
                    const isPodium = position <= 3;
                    const podiumStyle = getPodiumStyle(position);

                    return (
                      <TableCell key={`position-${position}`} className="text-center">
                        {isPodium ? (
                          <div className="flex justify-center">
                            <span className={podiumStyle}>
                              {position}º - {points}
                            </span>
                          </div>
                        ) : (
                          <>
                            <span className="font-medium">{position}º</span> - <span>{points}</span>
                          </>
                        )}
                      </TableCell>
                    );
                  })}
                  {/* Rellenar celdas vacías si la fila no está completa */}
                  {chunk.length < columnsPerRow &&
                    Array.from({ length: columnsPerRow - chunk.length }, (_, i) => <TableCell key={`empty-${i}`} />)}
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  // Función para renderizar el grid de edición de puntos
  const renderEditPointsGrid = (points: number[], setPoints: (points: number[]) => void, isNewSystem = false) => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
        {points.map((pointValue, index) => {
          const position = index + 1;
          const isPodium = position <= 3;
          const podiumStyle = getPodiumStyle(position);
          const hasError = hasOrderError(index, points);
          const maxValue = getMaxAllowedValue(index, points);

          return (
          <div key={`position-${position}`} className="space-y-1">
            <div className="flex justify-center min-h-[28px] items-center">
                <Label className="text-sm font-medium">
                {isPodium ? <span className={podiumStyle}>{position}º</span> : `${position}º`}
              </Label>
            </div>
            <div className="relative">
            <Input
              type="number"
              min="1"
              max={maxValue}
              value={pointValue === 0 ? "" : pointValue}
                placeholder={isNewSystem ? "0" : undefined}
                onFocus={(e) => {
                  if (isNewSystem && pointValue === 0) {
                    // No hacer nada, ya está vacío
                  } else if (isNewSystem) {
                    e.target.select();
                  }
                }}
              onChange={(e) => {
                const newPoints = [...points];
                const value = e.target.value;
                  const numValue = value === "" ? "" : Number.parseInt(value) || "";

                    // Validar que no exceda el máximo permitido
                    if (numValue !== "" && Number(numValue) > maxValue) {
                      return; // No actualizar si excede el máximo
                    }

                    newPoints[index] = numValue === "" ? 0 : numValue;
                setPoints(newPoints);
              }}
              className={cn("text-center", hasError && "border-red-500 bg-red-50 dark:bg-red-950/20")}
                />
                {hasError && (
                  <div className="absolute -top-1 -right-1">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                )}
              </div>
              {hasError && <p className="text-xs text-red-500 text-center">Orden incorrecto</p>}
          </div>
        );
        })}
      </div>
    );
  };

    // Función específica para el grid de nuevo sistema
  const renderNewSystemPointsGrid = () => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
        {newSystemPoints.map((pointValue, index) => {
          const position = index + 1;
          const isPodium = position <= 3;
          const podiumStyle = getPodiumStyle(position);
          const hasError = hasOrderError(index, newSystemPoints);
          const maxValue = getMaxAllowedValue(index, newSystemPoints);

          return (
            <div key={`new-position-${position}`} className="space-y-1">
              <div className="flex justify-center min-h-[28px] items-center">
                <Label className="text-sm font-medium">
                  {isPodium ? <span className={podiumStyle}>{position}º</span> : `${position}º`}
                </Label>
              </div>
              <div className="relative">
              <Input
                type="number"
                min="1"
                value={pointValue === "" ? "" : pointValue}
                placeholder="0"
                onFocus={(e) => {
                  if (pointValue !== "") {
                    e.target.select();
                  }
                }}
                onChange={(e) => {
                  const newPoints = [...newSystemPoints];
                  const value = e.target.value;
                  const numValue = value === "" ? "" : Number.parseInt(value) || "";

                    // Validar que no exceda el máximo permitido
                    if (numValue !== "" && Number(numValue) > maxValue) {
                      return; // No actualizar si excede el máximo
                    }

                    newPoints[index] = numValue;
                  setNewSystemPoints(newPoints);
                }}
                className={cn("text-center", hasError && "border-red-500 bg-red-50 dark:bg-red-950/20")}
                />
                {hasError && (
                  <div className="absolute -top-1 -right-1">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                )}
              </div>
              {hasError && <p className="text-xs text-red-500 text-center">Orden incorrecto</p>}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">Puntuaciones Actuales</TabsTrigger>
          <TabsTrigger value="new">Añadir Sistema Nuevo</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle>Sistemas de Puntuación Actuales</CardTitle>
              <CardDescription>Selecciona un sistema para ver, editar o eliminar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Select para seleccionar sistema */}
              <div className="space-y-2">
                <Label>Seleccionar Sistema de Puntuación</Label>
                <Select
                  value={selectedSystem?.id?.toString() ?? ""}
                  onValueChange={(value) => {
                    const system = pointSystems.find(ps => ps.id.toString() === value);
                    if (system) {
                      setSelectedSystem(system);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar sistema..." />
                  </SelectTrigger>
                  <SelectContent>
                    {pointSystems.map((system) => (
                      <SelectItem key={system.id} value={system.id.toString()}>
                        {system.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedSystem && (
                <div className="space-y-4">
                  {!isEditing ? (
                    <>
                      {/* Vista de solo lectura */}
                      <div className="space-y-2">
                        <Label>Nombre del Sistema</Label>
                        <div className="p-2 border rounded-md bg-muted">{selectedSystem.name}</div>
                      </div>

                      <div className="space-y-2">
                        <Label>Puntos por Posición</Label>
                        {renderPointsTable(parsePoints(selectedSystem.points))}
                      </div>

                      <div className="space-y-2">
                        <Label>Puntos Vuelta Rápida</Label>
                        <div className="p-2 border rounded-md bg-muted">{selectedSystem.fastestlap}</div>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => handleEditStart(selectedSystem)} className = "text-darkPrimary bg-second hover:bg-second/90">
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                        {selectedSystem.id !== 0 && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente el sistema de
                                  puntuación "{selectedSystem.name}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(selectedSystem)}>
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Vista de edición */}
                      <div className="space-y-2">
                        <Label>Nombre del Sistema</Label>
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          placeholder="Nombre del sistema"
                        />
                      </div>

                      {editingSystem?.id !== 0 && (
                        <>
                          <div className="space-y-2">
                            <Label>Número de Posiciones que Puntúan</Label>
                            <Select
                              value={editingPositions.toString()}
                              onValueChange={(value) => handleEditingPositionsChange(Number.parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-60">
                                {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => (
                                  <SelectItem key={num} value={num.toString()}>
                                    {num} posiciones
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Puntos por Posición</Label>
                            <div className="max-h-96 overflow-y-auto p-2 border rounded-md">
                              {renderEditPointsGrid(editingPoints, setEditingPoints)}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Puntos Vuelta Rápida</Label>
                            <Input
                              type="number"
                              min="0"
                              value={editingFastestLap}
                              onChange={(e) => setEditingFastestLap(Number.parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </>
                      )}

                      <div className="flex gap-2">
                        <Button onClick={handleSaveEdit}>
                          <Save className="mr-2 h-4 w-4" />
                          Guardar
                        </Button>
                        <Button variant="outline" onClick={handleEditCancel}>
                          <X className="mr-2 h-4 w-4" />
                          Cancelar
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle>Crear Nuevo Sistema de Puntuación</CardTitle>
              <CardDescription>Define un nuevo sistema de puntuación para los campeonatos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre del Sistema</Label>
                <Input
                  value={newSystemName}
                  onChange={(e) => setNewSystemName(e.target.value)}
                  placeholder="Ej: Fórmula 1 2024"
                />
              </div>

              <div className="space-y-2">
                <Label>Número de Posiciones que Puntúan</Label>
                <Select
                  value={newSystemPositions.toString()}
                  onValueChange={(value) => handleNewSystemPositionsChange(Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} posiciones
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Puntos por Posición</Label>
                <div className="bg-second border border-lightPrimary/90 rounded-md p-3 mb-3">
                  <div className="flex items-center gap-2 text-sm text-darkPrimary">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Los puntos deben estar en orden descendente: 1º ≥ 2º ≥ 3º ≥ ... ≥ último</span>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto p-2 border rounded-md">{renderNewSystemPointsGrid()}</div>
              </div>

              <div className="space-y-2">
                <Label>Puntos Vuelta Rápida</Label>
                <Input
                  type="number"
                  min="0"
                  value={newSystemFastestLap === "" ? "" : newSystemFastestLap}
                  placeholder="0"
                  onFocus={(e) => {
                    if (newSystemFastestLap !== "") {
                      e.target.select();
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewSystemFastestLap(value === "" ? "" : Number.parseInt(value) || "");
                  }}
                />
              </div>

              <Button onClick={handleCreateNew} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Crear Sistema de Puntuación
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
