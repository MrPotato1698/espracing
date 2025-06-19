import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ChevronUp, ChevronDown, Search, Edit2, Trash2 } from 'lucide-react';
import { MultiSelect } from '@/components/multi-select';
import { Input } from '@/components/ui/input';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

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
  readonly customRowClass?: ((row: any, index: number) => string) | null;
  readonly customCellRenderer?: { readonly [accessor: string]: (row: any) => React.ReactNode } | null;
  readonly initialSortConfig?: { readonly key: string | null; readonly direction: 'asc' | 'desc' };
  readonly searchable?: boolean;
  readonly searchPlaceholder?: string;
  readonly searchableColumns?: readonly { readonly accessor: string }[] | null;
  loading?: boolean;
}

export function DataTable({
  data,
  columns,
  onEdit,
  onDelete,
  pageSize = 10,
  filterOptions = [],
  filterAccessor = null,
  customRowClass = null,
  customCellRenderer = null,
  initialSortConfig = { key: null, direction: 'asc' },
  searchable = true,
  searchPlaceholder = 'Buscar en la tabla...',
  searchableColumns = null,
  loading = false,
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
          const value: any = getNestedValue(row, column.accessor)
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
    if ((column.accessor === "avatar" || column.accessor === "image") && value) {
      return <div style={{display:'flex', justifyContent:'center'}}><img src={value} alt="logo" style={{width:32, height:32}} /></div>;
    }
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
                className={`text-white cursor-pointer justify-center${column.accessor === 'avatar' ? ' text-center' : ''}`}
                onClick={() => requestSort(column.accessor)}
              >
                <div className="flex w-auto items-center justify-center">
                  {column.accessor === 'avatar' ? '' : column.header}
                  {sortConfig.key === column.accessor && (
                    sortConfig.direction === 'asc' ?
                      <ChevronUp className="inline-block ml-1 w-4 h-4" /> :
                      <ChevronDown className="inline-block ml-1 w-4 h-4" />
                  )}
                </div>
              </TableHead>
            ))}
            {(onEdit !== false || onDelete !== false) && (
              <TableHead className="text-white text-center">Acciones</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: pageSize }).map((_, idx) => (
              <TableRow key={idx}>
                <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                {columns.map((column, colIdx) => (
                  <TableCell key={colIdx}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
                {(onEdit !== false || onDelete !== false) && (
                  <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto"/></TableCell>
                )}
              </TableRow>
            ))
          ) : paginatedData.length > 0 ? (
            paginatedData.map((row, rowIndex) => (
              <TableRow
                key={row.id ?? rowIndex}
                className={getRowClass(row, rowIndex)}
                data-class-id={row.classId}
                data-decade={row.decade}
              >
                <TableCell>{(currentPage - 1) * pageSize + rowIndex + 1}</TableCell>
                {columns.map((column) => (
                  <TableCell key={column.accessor} className={column.accessor === 'avatar' ? 'text-center' : ''}>
                    {renderCell(row, column, columns.findIndex(col => col.accessor === column.accessor))}
                  </TableCell>
                ))}
                {(onEdit !== false || onDelete !== false) && (
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      {onEdit !== false && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            window.location.href = `/admin/${(onEdit as { path: string }).path}/${row.id}`;
                          }}
                          className="text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete !== false && (
                        <Button
                          variant="outline"
                          size="sm"
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
                          className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + ((onEdit !== false || onDelete !== false) ? 3 : 2)} className="text-center py-4 text-lightSecond">
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