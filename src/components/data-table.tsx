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
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { MultiSelect } from './multi-select';
import { Input } from './ui/input';

export interface DataTableColumn {
  header: string;
  accessor: string;
}

export interface DataTableProps {
  readonly data: readonly any[];
  readonly columns: readonly DataTableColumn[];
  readonly onEdit?: { readonly path: string } | false;
  readonly onDelete?: { readonly path: string } | false;
  readonly pageSize?: number;
  readonly filterOptions?: readonly string[];
  readonly filterAccessor?: string | null;
  readonly customActions?: ((row: any) => React.ReactNode) | null;
  readonly customRowClass?: ((row: any, index: number) => string) | null;
  readonly customCellRenderer?: { readonly [accessor: string]: (row: any) => React.ReactNode } | null;
  readonly initialSortConfig?: { readonly key: string | null; readonly direction: 'asc' | 'desc' };
  readonly searchable?: boolean;
  readonly searchPlaceholder?: string;
  readonly searchableColumns?: readonly { readonly accessor: string }[] | null;
}

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
  initialSortConfig = { key: null, direction: 'asc' },
  searchable = true,
  searchPlaceholder = 'Buscar en la tabla...',
  searchableColumns = null,
}: Readonly<DataTableProps>) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeFilters, setActiveFilters] = useState<string[]>([...filterOptions]);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>(initialSortConfig);
  const [filteredData, setFilteredData] = useState<any[]>([...data]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (filterOptions.length > 0 && activeFilters.length === 0) {
      setActiveFilters([...filterOptions]);
    }
  }, [filterOptions]);

  useEffect(() => {
    setCurrentPage(1);
    applyFiltersAndSort();
  }, [data, activeFilters, sortConfig, searchTerm]);

  const applyFiltersAndSort = () => {
    let processedData = [...data];
    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase()
      processedData = processedData.filter((row) => {
        const columnsToSearch = searchableColumns || columns;
        return columnsToSearch.some((column) => {
          const value = getNestedValue(row, column.accessor)
          return value && String(value).toLowerCase().includes(searchLower)
        })
      })
    }
    if (filterAccessor && activeFilters.length > 0 && activeFilters.length !== filterOptions.length) {
      processedData = processedData.filter(row => {
        const filterValue = getNestedValue(row, filterAccessor);
        return filterValue && activeFilters.includes(filterValue);
      });
    }
    if (sortConfig.key) {
      processedData.sort((a, b) => {
        const aValue = getNestedValue(a, sortConfig.key) ?? '';
        const bValue = getNestedValue(b, sortConfig.key) ?? '';
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

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getNestedValue = (obj: any, path: string | null) => {
    if (!path) return obj;
    const parts = path.split('.');
    let value = obj;
    for (const part of parts) {
      if (value === null || value === undefined) return '';
      value = value[part];
    }
    return value;
  };

  const handleFilterChange = (selectedOptions: string[]) => {
    setActiveFilters(selectedOptions);
  };

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const tableElement = document.querySelector('.data-table-container');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const generatePaginationItems = () => {
    const items = [] as React.ReactNode[];
    const maxPagesToShow = 5;
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
    let startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 2);
    if (endPage - startPage < maxPagesToShow - 2) {
      startPage = Math.max(2, endPage - (maxPagesToShow - 2));
    }
    if (startPage > 2) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
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
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
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

  const getRowClass = (row: any, index: number) => {
    if (customRowClass) {
      return customRowClass(row, index);
    }
    return index % 2 === 0 ? "bg-darkPrimary" : "bg-darkSecond";
  };

  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm.trim() || !text) return text
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    const parts = String(text).split(regex)
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={`${part}-${i}`} className="bg-primary text-white font-medium">
          {part}
        </span>
      ) : (
        part
      ),
    )
  }

  const renderCell = (row: any, column: DataTableColumn, colIndex: number) => {
    if (customCellRenderer?.[column.accessor]) {
      return customCellRenderer[column.accessor](row);
    }
    const value = getNestedValue(row, column.accessor)
    if (searchTerm.trim() && value) {
      return highlightMatch(value, searchTerm)
    }
    return value
  };

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
      <div className="flex flex-col md:flex-row gap-4 my-4">
        {searchable && (
          <div className="relative flex-grow h-full my-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-lightSecond" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-darkPrimary border-lightSecond text-white w-full"
          />
        </div>
        )}
      {filterOptions.length > 0 && filterAccessor && (
        <div className="md:w-64">
          <MultiSelect
            options={[...filterOptions]}
            selectedValues={activeFilters}
            onChange={handleFilterChange}
            placeholder="Filtrar"
            selectAllByDefault={true}
            label={`Filtrar por ${filterAccessor}`}
          />
          </div>
        )}
      </div>
      {searchTerm.trim() !== "" && (
        <div className="text-sm text-lightSecond mb-2">
          Mostrando {filteredData.length} resultados para "{searchTerm}"
          {filteredData.length === 0 && (
            <button onClick={() => setSearchTerm("")} className="ml-2 text-primary hover:underline">
              Limpiar búsqueda
            </button>
          )}
        </div>
      )}
      <Table>
        <TableHeader className="font-medium bg-primary">
          <TableRow>
            <TableHead className="text-white justify-center">Nº</TableHead>
            {columns.map((column) => (
              <TableHead
                key={column.accessor}
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
                key={row.id ?? rowIndex}
                className={getRowClass(row, rowIndex)}
                data-class-id={row.classId}
                data-decade={row.decade}
              >
                <TableCell>{(currentPage - 1) * pageSize + rowIndex + 1}</TableCell>
                {columns.map((column) => (
                  <TableCell key={column.accessor}>
                    {renderCell(row, column, columns.findIndex(col => col.accessor === column.accessor))}
                  </TableCell>
                ))}
                {customActions && (
                  <TableCell>
                    {customActions(row)}
                  </TableCell>
                )}
                {onEdit && (
                  <TableCell>
                    <a href={`/admin/${(onEdit as { path: string }).path}/${row.id}`} className="flex justify-center">
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
                      className="justify-center text-red-500 hover:text-red-700"
                      onClick={async (e) => {
                        e.preventDefault();
                        if (!row.id) return;
                        if (!confirm("¿Estás seguro de que quieres eliminar este elemento?")) return;
                        try {
                          const response = await fetch(`/api/admin/${(onDelete as { path: string }).path}/delete${(onDelete as { path: string }).path}`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: row.id }),
                          });
                          if (response.ok) {
                            window.location.reload();
                          } else {
                            alert("Error eliminando el elemento: " + response.statusText);
                            console.error("Error eliminando el elemento:", response.statusText);
                          }
                        } catch (error) {
                          alert("Error eliminando el elemento: " + error);
                        }
                      }}
                      title="Eliminar"
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