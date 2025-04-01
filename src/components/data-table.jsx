// src/components/data-table.jsx
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from './ui/sheet';

// Tipos de notas/penalizaciones
const INCIDENT_TYPES = {
  1: "Lance de carrera",
  2: "Sanción Leve",
  3: "Sanción Media",
  4: "Sanción Grave",
  5: "Sanción Muy Grave",
  6: "Sanción Antideportiva",
  7: "Descalificación por Real Penalty",
  8: "Notas"
};

export function DataTable({
  data,
  columns,
  caption,
  onEdit,
  onDelete,
  notesData = [],
  onAddNote,
  pageSize = 10,
  filterOptions = []
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState(null);
  const [newNote, setNewNote] = useState({
    type: 1,
    description: ""
  });
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredData = activeFilter === 'all'
    ? data
    : data.filter(row => row.championship.name === activeFilter);

  // Calcular paginación con datos filtrados
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAddNote = () => {
    if (selectedRow && newNote.description.trim()) {
      onAddNote(selectedRow.id, newNote.type, newNote.description);
      setNewNote({ type: 1, description: "" });
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page on filter change
  }

  const getRowNotes = (rowId) => {
    return notesData.filter(note => note.race_id === rowId);
  };

  // Función para renderizar el contenido de la celda
  const renderCellContent = (row, column, rowIndex) => {
    // Si hay un accessor, usamos ese valor directamente
    if (column.accessor) {
      // Manejar propiedades anidadas como "championship.name"
      if (column.accessor.includes('.')) {
        const parts = column.accessor.split('.');
        let value = row;
        for (const part of parts) {
          value = value?.[part];
        }
        return value;
      }
      return row[column.accessor];
    }
    
    // Si hay una función cell, la llamamos con la fila y el índice
    if (typeof column.cell === 'function') {
      return column.cell(row, rowIndex);
    }
    
    // Si no hay accessor ni cell, mostramos el índice + 1 (para la columna Nº)
    if (column.header === 'Nº') {
      return rowIndex + 1;
    }
    
    // Valor por defecto
    return '';
  };

  return (
    <div className="w-full">
      {/* Filtros */}
      {filterOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className={`px-3 py-1 rounded ${
              activeFilter === 'all'
                ? 'bg-primary text-white'
                : 'bg-darkSecond text-lightPrimary'
            }`}
            onClick={() => handleFilterChange('all')}
          >
            Todos
          </button>

          {filterOptions.map((option) => (
            <button
              key={option}
              className={`px-3 py-1 rounded ${
                activeFilter === option
                  ? 'bg-primary text-white'
                  : 'bg-darkSecond text-lightPrimary'
              }`}
              onClick={() => handleFilterChange(option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      <Table>
        {caption && <caption className="text-lg font-bold mb-2">{caption}</caption>}
        <TableHeader className="font-medium bg-primary">
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index} className="text-white">{column.header}</TableHead>
            ))}
            {onEdit && <TableHead className="text-white">Editar</TableHead>}
            {onDelete && <TableHead className="text-white">Eliminar</TableHead>}
            <TableHead className="text-white">Notas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((row, rowIndex) => (
            <TableRow key={rowIndex} className={rowIndex % 2 === 0 ? "bg-[#0f0f0f]" : "bg-[#19191c]"}>
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex}>
                  {renderCellContent(row, column, rowIndex)}
                </TableCell>
              ))}

              {onEdit && (
                <TableCell>
                  <a href={`/admin/race/${row.id}`} className="flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 text-center mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                      <path d="m15 5 4 4"/>
                    </svg>
                  </a>
                </TableCell>
              )}

              {onDelete && (
                <TableCell>
                  <button
                    className="align-middle delete-race flex justify-center w-full" 
                    data-id={row.id}
                    onClick={() => onDelete(row.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 text-center mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"/>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                  </button>
                </TableCell>
              )}

              <TableCell>
                <Sheet>
                  <SheetTrigger asChild>
                    <button
                      className="flex justify-center w-full"
                      onClick={() => setSelectedRow(row)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 text-center mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <path d="M14 2v6h6"/>
                        <path d="M16 13H8"/>
                        <path d="M16 17H8"/>
                        <path d="M10 9H8"/>
                      </svg>
                    </button>
                  </SheetTrigger>
                  <SheetContent className="bg-darkPrimary text-lightPrimary border-primary">
                    <SheetHeader>
                      <SheetTitle className="text-lightPrimary">Notas de Carrera: {row.name}</SheetTitle>
                      <SheetDescription className="text-lightSecond">
                        Añade o visualiza notas y penalizaciones para esta carrera.
                      </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-lightPrimary border-b border-primary pb-2">Notas Existentes</h3>
                        {getRowNotes(row.id).length > 0 ? (
                          <div className="space-y-3">
                            {getRowNotes(row.id).map((note, index) => (
                              <div key={index} className="p-3 bg-darkSecond rounded-md border border-primary">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium text-primary">
                                    {INCIDENT_TYPES[note.type] || "Tipo desconocido"}
                                  </span>
                                  <span className="text-xs text-lightSecond">
                                    {new Date(note.created_at).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-lightPrimary">{note.description}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-lightSecond italic">No hay notas para esta carrera.</p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-lightPrimary border-b border-primary pb-2">Añadir Nueva Nota</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-lightPrimary text-sm font-medium" htmlFor="noteType">
                              Tipo de Incidente
                            </label>
                            <select
                              id="noteType"
                              className="w-full p-3 border border-solid border-lightSecond rounded-md mt-2 mb-4 resize-y text-white bg-darkSecond hover:border-primary"
                              value={newNote.type}
                              onChange={(e) => setNewNote({...newNote, type: parseInt(e.target.value)})}
                            >
                              {Object.entries(INCIDENT_TYPES).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-lightPrimary text-sm font-medium" htmlFor="noteDescription">
                              Descripción
                            </label>
                            <textarea
                              id="noteDescription"
                              className="w-full p-3 border border-solid border-lightSecond rounded-md mt-2 mb-4 resize-y text-white bg-darkSecond hover:border-primary"
                              rows={4}
                              value={newNote.description}
                              onChange={(e) => setNewNote({...newNote, description: e.target.value})}
                              placeholder="Describe el incidente o añade notas relevantes..."
                            />
                          </div>

                          <button
                            className="bg-primary text-white font-bold py-2 px-4 border-solid border-primary border-2 rounded-md hover:bg-darkSecond hover:text-lightPrimary w-full"
                            onClick={handleAddNote}
                          >
                            Guardar Nota
                          </button>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Controles de paginación */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            className="bg-primary text-white px-3 py-1 rounded disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            Anterior
          </button>

          <span className="text-lightPrimary">
            Página {currentPage} de {totalPages}
          </span>

          <button
            className="bg-primary text-white px-3 py-1 rounded disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}