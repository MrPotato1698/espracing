import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { MultiSelect } from './multi-select';

export function DataTable({
  data,
  columns,
  onEdit,
  onDelete,
  pageSize = 10,
  filterOptions = [],
  filterAccessor = null,
  customActions = null,
  customRowClass = null,
  customCellRenderer = null,
  initialSortConfig = { key: null, direction: 'asc' }
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState([...filterOptions]);
  const [sortConfig, setSortConfig] = useState(initialSortConfig);
  const [filteredData, setFilteredData] = useState([...data]);

  // Efecto para actualizar activeFilters cuando cambian las opciones
  useEffect(() => {
    if (filterOptions.length > 0 && activeFilters.length === 0) {
      setActiveFilters([...filterOptions]);
    }
  }, [filterOptions]);

  // Efecto para resetear la página cuando cambian los datos o filtros
  useEffect(() => {
    setCurrentPage(1);
    applyFiltersAndSort();
  }, [data, activeFilters, sortConfig]);

  // Función para aplicar filtros y ordenamiento
  const applyFiltersAndSort = () => {
    let processedData = [...data];

    // Aplicar filtros solo si hay filtros activos y no son todos
    if (filterAccessor && activeFilters.length > 0 && activeFilters.length !== filterOptions.length) {
      processedData = processedData.filter(row => {
        const filterValue = getNestedValue(row, filterAccessor);
        return filterValue && activeFilters.includes(filterValue);
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

    setFilteredData(processedData);
  };

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
  };

  // Calcular paginación
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Función para cambiar de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Opcional: Scroll al inicio de la tabla
    const tableElement = document.querySelector('.data-table-container');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Función para generar los elementos de paginación
  const generatePaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5; // Número máximo de páginas a mostrar (sin contar elipsis)

    // Siempre mostrar la primera página
    items.push(
      <PaginationItem key="page-1">
        <PaginationLink
          isActive={currentPage === 1}
          onClick={(e) => {
            e.preventDefault()
            handlePageChange(1)
          }}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Calcular el rango de páginas a mostrar
    let startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 2);

    // Ajustar el rango si estamos cerca del final
    if (endPage - startPage < maxPagesToShow - 2) {
      startPage = Math.max(2, endPage - (maxPagesToShow - 2));
    }

    // Mostrar elipsis al principio si es necesario
    if (startPage > 2) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Mostrar páginas intermedias
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={`page-${i}`}>
          <PaginationLink
            isActive={currentPage === i}
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(i)}
            }
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Mostrar elipsis al final si es necesario
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    // Siempre mostrar la última página si hay más de una página
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={`page-${totalPages}`}>
          <PaginationLink
            isActive={currentPage === totalPages}
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(totalPages)
            }}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  // Determinar la clase de fila (alternando colores o personalizada)
  const getRowClass = (row, index) => {
    if (customRowClass) {
      return customRowClass(row, index);
    }
    return index % 2 === 0 ? "bg-darkPrimary" : "bg-darkSecond";
  };

  // Renderizar celda con posible renderizador personalizado
  const renderCell = (row, column, colIndex) => {
    if (customCellRenderer && customCellRenderer[column.accessor]) {
      return customCellRenderer[column.accessor](row);
    }
    return getNestedValue(row, column.accessor);
  };

  // Escuchar eventos de actualización de paginación
  useEffect(() => {
    const handlePaginationUpdate = () => {
      setCurrentPage(1);
    };

    document.addEventListener('pagination-update', handlePaginationUpdate);

    return () => {
      document.removeEventListener('pagination-update', handlePaginationUpdate);
    };
  }, []);

  return (
    <div className="w-full data-table-container">
      {/* Filtro si hay opciones de filtro */}
      {filterOptions.length > 0 && filterAccessor && (
        <div className="mb-4">
          <MultiSelect
            options={filterOptions}
            selectedValues={activeFilters}
            onChange={handleFilterChange}
            placeholder="Filtrar"
            className="md:w-64"
            selectAllByDefault={true}
            label={`Filtrar por ${filterAccessor}`}
          />
        </div>
      )}

      <Table>
        <TableHeader className="font-medium bg-primary">
          <TableRow>
            <TableHead className="text-white justify-center">Nº</TableHead>
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className="text-white cursor-pointer justify-center"
                onClick={() => requestSort(column.accessor)}
              >
                <div className="flex w-auto items-center justify-center">
                  {column.header}
                  {sortConfig.key === column.accessor && (
                    sortConfig.direction === 'asc' ?
                      <ChevronUp className="inline-block ml-1 w-4 h-4" /> :
                      <ChevronDown className="inline-block ml-1 w-4 h-4" />
                  )}
                </div>
              </TableHead>
            ))}
            {customActions && <TableHead className="text-white">Acciones</TableHead>}
            {onEdit && <TableHead className="text-white justify-center">Editar</TableHead>}
            {onDelete && <TableHead className="text-white justify-center">Eliminar</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                className={getRowClass(row, rowIndex)}
                data-class-id={row.classId} // Para filtrado de clases
                data-decade={row.decade} // Para filtrado de décadas
              >
                <TableCell>{(currentPage - 1) * pageSize + rowIndex + 1}</TableCell>
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex}>
                    {renderCell(row, column, colIndex)}
                  </TableCell>
                ))}

                {customActions && (
                  <TableCell>
                    {customActions(row)}
                  </TableCell>
                )}

                {onEdit && (
                  <TableCell>
                    <a href={`/admin/${onEdit.path}/${row.id}`} className="flex justify-center">
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
                      className="align-middle delete-item flex justify-center w-full"
                      data-id={row.id}
                      onClick={() => onDelete.handler(row.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 text-center mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

      {/* Paginación mejorada con shadcn/ui */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={(e) => {
                    e.preventDefault()
                    handlePageChange(Math.max(1, currentPage - 1))
                  }}
                  className={currentPage === 1 ? "opacity-50 pointer-events-none" : ""}
                />
              </PaginationItem>

              {generatePaginationItems()}

              <PaginationItem>
                <PaginationNext
                  onClick={(e) => {
                    e.preventDefault()
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }}
                  className={currentPage === totalPages ? "opacity-50 pointer-events-none" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}