import React, { useEffect, useState } from "react";
import { supabase } from "@/db/supabase";
import MultiSelect from "@/components/ui/multiselect";

interface EditChampCarsProps {
  champId: number;
}

export default function EditChampCars({ champId }: Readonly<EditChampCarsProps>) {
  const [allCars, setAllCars] = useState<{ id: number; model: string | null; brand: { id: number; name: string | null } | null }[]>([]);
  const [selectedCarIds, setSelectedCarIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Traer también la marca (brand) para mostrar brand.name + model
      const { data: allCarsData } = await supabase.from("car").select("id, model, brand:brand(id, name)");
      setAllCars(allCarsData || []);

      const { data: champCarsData } = await supabase
        .from("championshipcars")
        .select("car")
        .eq("championship", champId);
      setSelectedCarIds(champCarsData ? champCarsData.map(row => row.car.toString()) : []);
      setLoading(false);
    };
    fetchData();
  }, [champId]);

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      // Eliminar todos los coches actuales
      await supabase.from("championshipcars").delete().eq("championship", champId);
      // Insertar los nuevos
      if (selectedCarIds.length > 0) {
        const carRows = selectedCarIds.map(carId => ({ championship: champId, car: Number(carId) }));
        await supabase.from("championshipcars").insert(carRows);
      }
      setSuccessMsg("Coches actualizados correctamente");
    } catch (err: any) {
      setErrorMsg("Error al actualizar coches: " + (err?.message ?? err));
    }
    setSaving(false);
  };

  if (loading) return <div className="text-lightSecond">Cargando coches...</div>;

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
