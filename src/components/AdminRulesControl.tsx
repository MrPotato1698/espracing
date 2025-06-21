"use client"

import { useState } from "react"
import { supabase } from "@/db/supabase"
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
    setIsUpdating(true)
    setMessage(null)

    try {
      const newVisibility = !isVisible

      const { error } = await supabase
        .from("racerules")
        .update({
          isVisible: newVisibility,
          updated_at: new Date().toISOString(),
          updated_by: userId,
        })
        .eq("id", 2)

      if (error) {
        console.error("Error al actualizar visibilidad:", error)
        setMessage({
          type: "error",
          text: "Error al actualizar la visibilidad. Inténtalo de nuevo.",
        })
        return
      }

      setIsVisible(newVisibility)
      setMessage({
        type: "success",
        text: `Normativa secundaria ${newVisibility ? "habilitada" : "deshabilitada"} correctamente.`,
      })

      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        setMessage(null)
      }, 3000)
    } catch (error) {
      console.error("Error:", error)
      setMessage({
        type: "error",
        text: "Error al actualizar la visibilidad. Inténtalo de nuevo.",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Intercambiar IDs entre normativas
  const swapNormativas = async () => {
    setIsSwapping(true)
    setMessage(null)

    try {
      // Obtener ambas normativas
      const { data: normativas, error: fetchError } = await supabase.from("racerules").select("*").in("id", [1, 2])

      if (fetchError || !normativas || normativas.length !== 2) {
        console.error("Error al obtener normativas:", fetchError)
        setMessage({
          type: "error",
          text: "Error al intercambiar las normativas. Inténtalo de nuevo.",
        })
        setIsSwapping(false)
        return
      }

      const primary = normativas.find((n) => n.id === 1)
      const secondary = normativas.find((n) => n.id === 2)

      if (!primary || !secondary) {
        setMessage({
          type: "error",
          text: "No se encontraron ambas normativas.",
        })
        setIsSwapping(false)
        return
      }

      // Eliminar las normativas existentes
      await supabase.from("racerules").delete().in("id", [1, 2])

      // Crear las nuevas normativas con IDs intercambiados
      await supabase.from("racerules").upsert([
        {
          id: 1,
          content: secondary.content,
          championship: secondary.championship,
          isVisible: true,
          updated_at: new Date().toISOString(),
          updated_by: userId,
        },
        {
          id: 2,
          content: primary.content,
          championship: primary.championship,
          isVisible: isVisible,
          updated_at: new Date().toISOString(),
          updated_by: userId,
        },
      ])

      setMessage({
        type: "success",
        text: "Normativas intercambiadas correctamente. Recarga la página para ver los cambios.",
      })

      // Recargar la página después de 2 segundos
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error("Error al intercambiar normativas:", error)
      setMessage({
        type: "error",
        text: "Error al intercambiar las normativas. Inténtalo de nuevo.",
      })
    } finally {
      setIsSwapping(false)
    }
  }

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
              `Normativa secundaria ${isVisible ? "habilitada" : "deshabilitada"}`
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
