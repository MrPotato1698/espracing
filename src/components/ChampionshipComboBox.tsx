import React, { useState, useMemo, useRef, useEffect } from "react";

interface Championship {
  id: number;
  name: string;
}

interface ChampionshipComboBoxProps {
  readonly championships: readonly Championship[];
  readonly selectedId: number | null;
  readonly onChange: (id: number) => void;
}

export default function ChampionshipComboBox({ championships, selectedId, onChange }: ChampionshipComboBoxProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [internalSelectedId, setInternalSelectedId] = useState<number | null>(selectedId ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Verificar que championships sea un array válido
  const safeChampionships = Array.isArray(championships) ? championships : [];

  const filtered = useMemo(() => {
    return safeChampionships.filter(c =>
      c?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [safeChampionships, search]);

  const [highlighted, setHighlighted] = useState<number | null>(null);

  useEffect(() => {
    setInternalSelectedId(selectedId ?? null);
  }, [selectedId]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.combo-dropdown')) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (onChange && typeof onChange === 'function') {
      onChange(internalSelectedId ?? 0);
    }

    const champInput = document.querySelector('input[name="championship"]');
    if (champInput && 'value' in champInput) {
      (champInput as HTMLInputElement).value = internalSelectedId ? String(internalSelectedId) : '';
    }
  }, [internalSelectedId, onChange]);

  // Si no hay campeonatos, mostrar un mensaje simple
  if (!safeChampionships.length) {
    return (
      <div className="bg-darkSecond text-lightPrimary text-lg w-11/12 border-none rounded-md p-2 ml-1 mt-px">
        No hay campeonatos disponibles
      </div>
    );
  }

  const selectedChampionship = safeChampionships.find(c => c.id === internalSelectedId);

  return (
    <div className="relative w-full combo-dropdown">
      <button
        type="button"
        className="bg-darkSecond text-lightPrimary text-lg w-11/12 border-none rounded-md p-2 ml-1 mt-px flex items-center cursor-pointer text-left"
        onClick={() => setOpen(!open)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(!open);
          }
        }}
      >
        {selectedChampionship ? selectedChampionship.name : "Selecciona un campeonato"}
        <span className="ml-auto">▼</span>
      </button>

      {open && (
        <div className="absolute z-10 w-11/12 bg-darkSecond border border-primary rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar campeonato..."
              className="w-full p-2 bg-darkSecond text-lightPrimary border-b border-primary outline-none mb-2"
            />
          </div>
          {filtered.length === 0 ? (
            <div className="p-2 text-lightPrimary">No hay resultados</div>
          ) : (
            filtered.map((c, idx) => (
              <button
                key={c.id}
                type="button"
                className={`w-full text-left p-2 cursor-pointer hover:bg-primary hover:text-darkPrimary focus:bg-primary focus:text-darkPrimary outline-none ${
                  highlighted === idx ? 'bg-primary text-darkPrimary' : ''
                } ${idx % 2 === 0 ? 'bg-darkPrimary' : 'bg-darkSecond'}`}
                onClick={() => {
                  setInternalSelectedId(c.id);
                  setOpen(false);
                  setSearch("");
                }}
                onMouseEnter={() => setHighlighted(idx)}
                onFocus={() => setHighlighted(idx)}
              >
                {c.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
