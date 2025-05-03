import React from "react";

interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  values: string[];
  onChange?: (values: string[]) => void;
  name?: string;
  id?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export default function MultiSelect({
  options,
  values,
  onChange,
  name,
  id,
  placeholder = "Selecciona...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontraron resultados."
}: MultiSelectProps) {
  const [search, setSearch] = React.useState("");

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (value: string) => {
    if (values.includes(value)) {
      onChange && onChange(values.filter(v => v !== value));
    } else {
      onChange && onChange([...values, value]);
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex flex-wrap gap-2 mb-2">
        {values.length === 0 && (
          <span className="text-lightSecond text-sm">{placeholder}</span>
        )}
        {values.map(val => {
          const opt = options.find(o => o.value === val);
          return (
            <span key={val} className="bg-primary text-white px-2 py-1 rounded text-xs flex items-center gap-1">
              {opt?.label ?? val}
              <button type="button" className="ml-1 text-xs" onClick={() => handleSelect(val)}>
                ×
              </button>
            </span>
          );
        })}
      </div>
      <input
        type="text"
        className="w-full p-2 border border-lightSecond rounded mb-2 bg-darkSecond text-white"
        placeholder={searchPlaceholder}
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="max-h-40 overflow-y-auto border border-lightSecond rounded bg-darkSecond">
        {filteredOptions.length === 0 ? (
          <div className="p-2 text-lightSecond text-sm">{emptyMessage}</div>
        ) : (
          filteredOptions.map(opt => (
            <button
              type="button"
              key={opt.value}
              className={`w-full text-left p-2 cursor-pointer hover:bg-primary/30 ${values.includes(opt.value) ? 'bg-primary/60 text-white' : ''}`}
              onClick={() => handleSelect(opt.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(opt.value);
                }
              }}
            >
              {opt.label}
            </button>
          ))
        )}
      </div>
      {/* Para enviar los valores seleccionados en formularios nativos */}
      {name && values.map(val => (
        <input key={val} type="hidden" name={name} value={val} />
      ))}
    </div>
  );
}
