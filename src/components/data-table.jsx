import React, { useState, useMemo } from 'react';
import Edit from "@/icons/Edit.astro";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './ui/table';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { MultiSelect } from './multi-select';

export function DataTable({
  data,
  columns,
  caption,
  onEdit,
  onDelete,
  pageSize = 10,
  filterOptions = []
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  // Función para manejar el ordenamiento
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Función para obtener el valor de una propiedad anidada
  const getNestedValue = (obj, path) => {
    if (!path) return obj;
    const parts = path.split('.');
    let value = obj;
    for (const part of parts) {
      if (value === null || value === undefined) return '';
      value = value[part];
    }
    return value;
  };

  // Función para manejar los filtros
  const handleFilterChange = (selectedOptions) => {
    setActiveFilters(selectedOptions);
    setCurrentPage(1);
  };

  // Aplicar filtros y ordenamiento
  const filteredAndSortedData = useMemo(() => {
    let processedData = [...data];

    // Aplicar filtros
    if (activeFilters.length > 0) {
      processedData = processedData.filter(row => {
        const championshipName = getNestedValue(row, 'championship.name');
        return championshipName && activeFilters.includes(championshipName);
      });
    }

    // Aplicar ordenamiento
    if (sortConfig.key) {
      processedData.sort((a, b) => {
        const aValue = getNestedValue(a, sortConfig.key) || '';
        const bValue = getNestedValue(b, sortConfig.key) || '';

        // Comparar valores
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return processedData;
  }, [data, activeFilters, sortConfig]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="w-full">
      {/* Filtro de campeonatos mejorado con MultiSelect */}
      {filterOptions.length > 0 && (
        <div className="mb-4">
          <MultiSelect
            options={filterOptions}
            selectedValues={activeFilters}
            onChange={handleFilterChange}
            placeholder="Filtrar"
            className="md:w-64"
            selectAllByDefault={true} // Seleccionar todos por defecto
          />
        </div>
      )}

      <Table className="w-full border-2 border-lightPrimary">
        {caption && <caption className="text-lg font-bold mb-2">{caption}</caption>}
        <TableHeader className="font-bold bg-primary cursor-default">
          <TableRow>
            <TableHead className="font-bold text-lightPrimary font-bold text-center">Nº</TableHead>
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className="font-bold text-lightPrimary cursor-pointer text-center"
                onClick={() => requestSort(column.accessor)}
              >
                <div className="text-center">
                  {column.header}
                  {sortConfig.key === column.accessor && (
                    sortConfig.direction === 'asc' ?
                      <ChevronUp className="inline-block ml-1 w-4 h-4" /> :
                      <ChevronDown className="inline-block ml-1 w-4 h-4" />
                  )}
                </div>
              </TableHead>
            ))}
            {onEdit && <TableHead className="font-bold text-lightPrimary text-center">Editar</TableHead>}
            {onDelete && <TableHead className="font-bold text-lightPrimary text-center">Eliminar</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody className="cursor-default">
          {paginatedData.length > 0 ? (
            paginatedData.map((row, rowIndex) => (
              <TableRow key={rowIndex} className={rowIndex % 2 === 0 ? "bg-darkPrimary" : "bg-darkSecond"}>
                <TableCell>{(currentPage - 1) * pageSize + rowIndex + 1}</TableCell>
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex}>
                    {getNestedValue(row, column.accessor)}
                  </TableCell>
                ))}

                {onEdit && (
                  <TableCell>
                    <a href={`/admin/race/${row.id}`} className="flex justify-center">
                      <svg
                        className="w-6 text-center mx-auto"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round">
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
                      <svg
                        className="w-6 text-center mx-auto"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </button>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + 3} className="text-center py-4 text-lightSecond">
                No hay datos disponibles
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Controles de paginación */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            className="bg-primary text-lightPrimary px-3 py-1 rounded disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            Anterior
          </button>

          <span className="text-lightPrimary">
            Página {currentPage} de {totalPages}
          </span>

          <button
            className="bg-primary text-lightPrimary px-3 py-1 rounded disabled:opacity-50"
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