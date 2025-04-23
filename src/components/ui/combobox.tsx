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
  // Eliminar el estado commandInputValue ya que Command maneja la búsqueda internamente

  // Filtrar solo por label, nunca por value
  // const filteredOptions = options.filter(option =>
  //   option.label.toLowerCase().includes(commandInputValue.toLowerCase())
  // );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "w-full flex items-center border border-solid border-lightSecond rounded-md bg-darkSecond text-white hover:border-primary transition-colors px-3 py-2 mb-4",
            className,
          )}
        >
          <input
            type="text"
            value={options.find((option) => option.value === value)?.label ?? ""}
            placeholder={placeholder}
            onChange={(e) => {
              const selectedOption = options.find((option) => option.label === e.target.value)
              onValueChange(selectedOption ? selectedOption.value : "")
            }}
            className="w-full outline-none bg-transparent text-white placeholder:text-lightSecond"
            aria-label={placeholder}
          />
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-lightSecond" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-darkSecond border-lightSecond rounded-md mt-1">
        <Command className="bg-darkSecond text-white">
          <CommandInput
            placeholder={searchPlaceholder}
            className="text-white bg-darkSecond placeholder:text-lightSecond"
          />
          <CommandList className="text-white">
            <CommandEmpty className="text-gray-400">{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option, visibleIdx) => {
                let itemBgClass = ""
                if (value === option.value) {
                  itemBgClass = "bg-primary/20"
                } else {
                  itemBgClass = visibleIdx % 2 === 0 ? "bg-darkPrimary" : "bg-darkSecond"
                }
                return (
                  <CommandItem
                    value={option.label}
                    key={option.value}
                    onSelect={() => {
                      onValueChange(option.value === value ? "" : option.value)
                      setOpen(false)
                    }}
                    className={cn("text-white rounded-md px-2", itemBgClass)}
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100 text-primary" : "opacity-0")}
                    />
                    {option.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
