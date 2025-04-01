import React, { useState, useEffect, useMemo } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { ChevronDown, Search } from 'lucide-react';

export function MultiSelect({
  options = [],
  selectedValues = [],
  onChange,
  placeholder = "Seleccionar opciones",
  className = "",
  selectAllByDefault = true
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(
    selectAllByDefault ? [...options] : selectedValues
  );
  const [searchQuery, setSearchQuery] = useState('');

  const allSelected = options.length > 0 && selected.length === options.length;

  // Efecto para inicializar con todas las opciones seleccionadas
  useEffect(() => {
    if (selectAllByDefault && options.length > 0 && selected.length === 0) {
      setSelected([...options]);
      onChange([...options]);
    }
  }, [options, selectAllByDefault]);

  // Actualizar el estado cuando cambian las props
  useEffect(() => {
    if (selectedValues.length > 0) {
      setSelected(selectedValues);
    }
  }, [selectedValues]);

  // Filtrar opciones basadas en la búsqueda
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;

    return options.filter(option =>
      option.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  const handleSelectAll = (checked) => {
    if (checked) {
      // Si hay una búsqueda activa, seleccionar solo las opciones filtradas
      if (searchQuery.trim()) {
        const newSelected = [...selected];
        filteredOptions.forEach(option => {
          if (!newSelected.includes(option)) {
            newSelected.push(option);
          }
        });
        setSelected(newSelected);
        onChange(newSelected);
      } else {
        // Si no hay búsqueda, seleccionar todas las opciones
        setSelected([...options]);
        onChange([...options]);
      }
    } else {
      // Si hay una búsqueda activa, deseleccionar solo las opciones filtradas
      if (searchQuery.trim()) {
        const newSelected = selected.filter(item => !filteredOptions.includes(item));
        setSelected(newSelected);
        onChange(newSelected);
      } else {
        // Si no hay búsqueda, deseleccionar todas las opciones
        setSelected([]);
        onChange([]);
      }
    }
  };

  const handleSelectOption = (option, checked) => {
    let newSelected;

    if (checked) {
      newSelected = [...selected, option];
    } else {
      newSelected = selected.filter(item => item !== option);
    }

    setSelected(newSelected);
    onChange(newSelected);
  };

  // Verificar si todas las opciones filtradas están seleccionadas
  const allFilteredSelected = filteredOptions.length > 0 && 
    filteredOptions.every(option => selected.includes(option));

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={`flex items-center justify-between w-full p-3 border border-solid border-lightSecond rounded-md bg-darkSecond text-lightPrimary hover:border-primary ${className}`}
        >
          <span className="truncate">
            {selected.length === 0
              ? placeholder
              : selected.length === options.length
                ? "Todos"
                : `${selected.length} opcion(es) seleccionada(s)`}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-darkPrimary border border-lightSecond">
        {/* Campo de búsqueda */}
        <div className="p-2 border-b border-lightSecond">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-lightSecond" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 pl-8 border border-solid border-lightSecond rounded-md bg-darkSecond text-lightPrimary focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Opción "Seleccionar todos" */}
        <div className="p-2 border-b border-lightSecond">
          <div className="flex items-center space-x-2 p-2 hover:bg-darkSecond rounded cursor-pointer">
            <Checkbox
              id="select-all"
              checked={searchQuery.trim() ? allFilteredSelected : allSelected}
              onCheckedChange={handleSelectAll}
              className="border-primary"
            />
            <Label htmlFor="select-all" className="text-lightPrimary cursor-pointer">
              {searchQuery.trim() ? "Seleccionar resultados de búsqueda" : "Seleccionar todos"}
            </Label>
          </div>
        </div>

        {/* Lista de opciones */}
        <div className="max-h-60 overflow-y-auto p-2">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2 p-2 hover:bg-darkSecond rounded cursor-pointer">
                <Checkbox
                  id={`option-${option}`}
                  checked={selected.includes(option)}
                  onCheckedChange={(checked) => handleSelectOption(option, checked)}
                  className="border-primary"
                />
                <Label htmlFor={`option-${option}`} className="text-lightPrimary cursor-pointer">
                  {option}
                </Label>
              </div>
            ))
          ) : (
            <div className="p-2 text-center text-lightSecond">
              No se encontraron resultados
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}