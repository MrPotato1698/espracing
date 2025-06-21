import React, { useState, useEffect, useMemo } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { ChevronDown, Search } from 'lucide-react';

interface MultiSelectProps {
  readonly options: readonly string[];
  readonly selectedValues: readonly string[];
  readonly onChange: (selected: string[]) => void;
  readonly placeholder?: string;
  readonly className?: string;
  readonly selectAllByDefault?: boolean;
  readonly label?: string;
}

export function MultiSelect({
  options = [],
  selectedValues = [],
  onChange,
  placeholder = "Seleccionar opciones",
  className = "",
  selectAllByDefault = true,
  label
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(
    selectAllByDefault ? Array.from(options) : Array.from(selectedValues)
  );
  const [searchQuery, setSearchQuery] = useState('');

  const allSelected = options.length > 0 && selected.length === options.length;

  useEffect(() => {
    if (selectAllByDefault && options.length > 0 && selected.length === 0) {
      setSelected([...options]);
      onChange([...options]);
    }
  }, [options, selectAllByDefault]);

  useEffect(() => {
    if (selectedValues.length > 0) {
      setSelected(Array.from(selectedValues));
    }
  }, [selectedValues]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    return options.filter(option =>
      option.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  const selectAll = () => {
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
      setSelected([...options]);
      onChange([...options]);
    }
  };

  const deselectAll = () => {
    if (searchQuery.trim()) {
      const newSelected = selected.filter(item => !filteredOptions.includes(item));
      setSelected(newSelected);
      onChange(newSelected);
    } else {
      setSelected([]);
      onChange([]);
    }
  };

  const handleSelectAllChecked = () => {
    selectAll();
  };

  const handleSelectAllUnchecked = () => {
    deselectAll();
  };

  const handleSelectOption = (option: string, checked: boolean) => {
    let newSelected: string[];
    if (checked) {
      newSelected = [...selected, option];
    } else {
      newSelected = selected.filter(item => item !== option);
    }
    setSelected(newSelected);
    onChange(newSelected);
  };

  const allFilteredSelected = filteredOptions.length > 0 && 
    filteredOptions.every(option => selected.includes(option));

  let displayText: string;
  if (selected.length === 0) {
    displayText = placeholder;
  } else if (selected.length === options.length) {
    displayText = "Todos";
  } else {
    displayText = `${selected.length} opcion(es) seleccionada(s)`;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={`flex items-center justify-between w-full p-3 border border-solid border-lightSecond rounded-md bg-darkSecond text-lightPrimary hover:border-primary ${className}`}
        >
          <span className="truncate">
            {displayText}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-darkPrimary border border-lightSecond">
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
        <div className="p-2 border-b border-lightSecond">
          <div className="flex items-center space-x-2 p-2 hover:bg-darkSecond rounded cursor-pointer">
            <Checkbox
              id="select-all"
              checked={searchQuery.trim() ? allFilteredSelected : allSelected}
              onCheckedChange={(checked: boolean) => {
                if (checked) {
                  handleSelectAllChecked();
                }
                if (!checked) {
                  handleSelectAllUnchecked();
                }
              }}
              className="border-primary"
            />
            <Label htmlFor="select-all" className="text-lightPrimary cursor-pointer">
              {searchQuery.trim() ? "Seleccionar resultados de búsqueda" : "Seleccionar todos"}
            </Label>
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto p-2">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2 p-2 hover:bg-darkSecond rounded cursor-pointer">
                <Checkbox
                  id={`option-${option}`}
                  checked={selected.includes(option)}
                  onCheckedChange={(checked: boolean) => handleSelectOption(option, checked)}
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
