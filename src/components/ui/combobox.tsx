"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ComboboxProps {
  readonly options: ReadonlyArray<{ readonly value: string; readonly label: string }>
  readonly placeholder?: string
  readonly searchPlaceholder?: string
  readonly emptyMessage?: string
  readonly value: string
  readonly onValueChange: (value: string) => void
  readonly className?: string
}

export function Combobox({
  options,
  placeholder = "Seleccionar opción...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontraron resultados.",
  value,
  onValueChange,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn("w-full justify-between text-white bg-black border-gray-700 hover:bg-gray-900 hover:text-white",className,)}>
          <input
            type="text"
            list="combobox-options"
            value={options.find((option) => option.value === value)?.label ?? ""}
            placeholder={placeholder}
            onChange={(e) => {
              const selectedOption = options.find(option => option.label === e.target.value);
              onValueChange(selectedOption ? selectedOption.value : "");
            }}
            className="w-full outline-none bg-transparent"
            aria-label={placeholder}
          />
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          <datalist id="combobox-options">
            {options.map(option => (
              <option key={option.value} value={option.label} />
            ))}
          </datalist>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-black border-gray-700">
        <Command className="bg-black">
          <CommandInput placeholder={searchPlaceholder} className="text-white" />
          <CommandList className="text-white">
            <CommandEmpty className="text-gray-400">{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                  className="text-white hover:bg-gray-800"
                >
                  <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
