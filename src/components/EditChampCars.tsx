import React, { useState } from "react";
import MultiSelect from "@/components/ui/multiselect";

interface EditChampCarsProps {
  champId: number;
  allCars: { id: number; model: string | null; brand: { id: number; name: string | null } | null }[];
  selectedCarIds: string[];
}

export default function EditChampCars({ champId, allCars, selectedCarIds: initialSelectedCarIds }: Readonly<EditChampCarsProps>) {
  const [selectedCarIds, setSelectedCarIds] = useState<string[]>(initialSelectedCarIds);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const response = await fetch("/api/admin/champcars", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ champId, carIds: selectedCarIds.map(Number) })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Error desconocido");
      }
      setSuccessMsg("Coches actualizados correctamente");
    } catch (err: any) {
      setErrorMsg("Error al actualizar coches: " + (err?.message ?? err));
    }
    setSaving(false);
  };

  return (
    <div className="my-6">
      <label className="text-lightPrimary text-lg font-medium" htmlFor="carsChamp">
        Coches participantes en el campeonato
      </label>
      <MultiSelect
        options={allCars
          .slice()
          .sort((a, b) => {
            const nameA = `${a.brand?.name ?? ''} ${a.model ?? ''}`.trim().toLowerCase();
            const nameB = `${b.brand?.name ?? ''} ${b.model ?? ''}`.trim().toLowerCase();
            return nameA.localeCompare(nameB);
          })
          .map(car => ({ label: `${car.brand?.name ?? ''} ${car.model ?? ''}`.trim(), value: car.id.toString() }))}
        values={selectedCarIds}
        onChange={setSelectedCarIds}
        name="carsChamp"
        id="carsChamp"
        placeholder="Selecciona uno o varios coches..."
        searchPlaceholder="Buscar..."
        emptyMessage="No se encontraron resultados."
      />
      <button
        className="mt-4 bg-primary text-white font-bold py-2 px-4 rounded hover:bg-darkSecond hover:text-lightPrimary border border-primary"
        type="button"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Guardando..." : "Guardar Coches"}
      </button>
      {successMsg && <div className="text-green-500 font-semibold mt-2">{successMsg}</div>}
      {errorMsg && <div className="text-red-500 font-semibold mt-2">{errorMsg}</div>}
    </div>
  );
}
