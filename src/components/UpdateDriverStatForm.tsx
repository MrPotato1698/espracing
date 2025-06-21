import React, { useState } from "react";
import { Combobox } from "@/components/ui/combobox";
import { showToast } from "@/lib/utils";

interface DriverOption {
  value: string;
  label: string;
}

interface UpdateDriverStatFormProps {
  driverOptions: DriverOption[];
}

export function UpdateDriverStatForm({ driverOptions }: Readonly<UpdateDriverStatFormProps>) {
  const [selectedDriver, setSelectedDriver] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/admin/stats", { //newUserStats
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedDriver }),
      });
      if (!response.ok) throw new Error(`Error en la respuesta del servidor: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        showToast("Estadísticas actualizadas con éxito", "success");
        window.location.href = "/admin/admindrivers";
      } else {
        throw new Error(result.error ?? "Error desconocido");
      }
    } catch (error: any) {
      showToast(`Error al actualizar el piloto: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form id="editDriverStatForm" className="flex flex-col mt-5" onSubmit={handleSubmit}>
      <label className="mt-5 text-lg font-semibold" htmlFor="driverID">
        Selecciona el piloto para actualizar su estadística:
      </label>
      <Combobox
        options={driverOptions}
        value={selectedDriver}
        onValueChange={setSelectedDriver}
        placeholder="Selecciona un piloto..."
        searchPlaceholder="Buscar piloto..."
        className="bg-darkSecond text-lightPrimary text-lg border-none rounded-md p-2 ml-1 mt-px"
      />
      <button
        type="submit"
        className="py-1.5 px-3 w-fit mr-2 bg-darkPrimary text-white border-[#29dd38] border-2 rounded-md my-4 font-medium text-lg hover:bg-[#29dd38] hover:text-darkPrimary"
        disabled={loading || !selectedDriver}
      >
        Actualizar Estadísticas
      </button>
      {loading && (
        <div id="loaderStat" className="flex flex-row items-center justify-center gap-2 mt-2">
          <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span className="text-primary font-semibold">Actualizando estadísticas...</span>
        </div>
      )}
    </form>
  );
}
