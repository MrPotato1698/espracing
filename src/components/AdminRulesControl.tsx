"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowUpDown } from "lucide-react"

type AdminRulesControlProps = {
  userId: string
  isSecondaryVisible: boolean
}

export default function AdminRulesControl({ userId, isSecondaryVisible }: Readonly<AdminRulesControlProps>) {
  const [isVisible, setIsVisible] = useState(isSecondaryVisible)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Cambiar visibilidad de la normativa secundaria
  const toggleSecondaryVisibility = async () => {
    setIsUpdating(true);
    setMessage(null);

    try {
      const newVisibility = !isVisible;
      const response = await fetch("/api/admin/rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: newVisibility, userId }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setMessage({
          type: "error",
          text: "Error al actualizar la visibilidad. Inténtalo de nuevo.",
        });
        return;
      }
      setIsVisible(newVisibility);
      setMessage({
        type: "success",
        text: `Normativa secundaria ${newVisibility ? "habilitada" : "deshabilitada"} correctamente.`,
      });
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error updating visibility:", error);
      setMessage({
        type: "error",
        text: "Error al actualizar la visibilidad. Inténtalo de nuevo.",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  // Intercambiar IDs entre normativas
  const swapNormativas = async () => {
    setIsSwapping(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isVisible }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setMessage({
          type: "error",
          text: "Error al intercambiar las normativas. Inténtalo de nuevo.",
        });
        setIsSwapping(false);
        return;
      }
      setMessage({
        type: "success",
        text: "Normativas intercambiadas correctamente. Recarga la página para ver los cambios.",
      });
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error intercambiando normativas:", error);
      setMessage({
        type: "error",
        text: "Error al intercambiar las normativas. Inténtalo de nuevo.",
      });
    } finally {
      setIsSwapping(false);
    }
  }

  const normativaSecundariaLabel = `Normativa secundaria ${isVisible ? "habilitada" : "deshabilitada"}`;

  return (
    <div className="bg-darkSecond rounded-lg border p-6 mb-6">
      <h3 className="text-lg font-medium mb-4">Configuración de Normativas</h3>

      {message && (
        <Alert variant={message.type === "success" ? "default" : "destructive"} className="mb-4">
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="secondary-visibility"
            checked={isVisible}
            onCheckedChange={toggleSecondaryVisibility}
            disabled={isUpdating}
          />
          <Label htmlFor="secondary-visibility">
            {isUpdating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Actualizando...
              </span>
            ) : (
              normativaSecundariaLabel
            )}
          </Label>
        </div>

        <Button
          onClick={swapNormativas}
          disabled={isSwapping || isUpdating}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isSwapping ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpDown className="h-4 w-4" />}
          {isSwapping ? "Intercambiando..." : "Intercambiar normativas"}
        </Button>
      </div>
    </div>
  )
}
