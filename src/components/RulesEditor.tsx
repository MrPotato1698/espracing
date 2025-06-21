"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/db/supabase"
import MarkdownRenderer from "@/components/MarkdownRenderer"

// Importaciones de UI
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, Save, Eye, Edit } from "lucide-react"
import { showToast } from "@/lib/utils"

// Tipos
type Profile = {
  id: string
  roleesp: number | null
}

type Championship = {
  id: number
  name: string | null
}

type RulesEditorProps = {
  normativaId: number
  userId: string
  userRole: number | null
}

export default function RulesEditor({ normativaId, userId, userRole }: Readonly<RulesEditorProps>) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [content, setContent] = useState<string>("")
  const [championships, setChampionships] = useState<Championship[]>([])
  const [selectedChampionship, setSelectedChampionship] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<string>("edit")
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar campeonatos
        const { data: championshipsData, error: championshipsError } = await supabase
          .from("championship")
          .select("id, name")
          .order("id")

        if (championshipsError) {
          console.error("Error al cargar campeonatos:", championshipsError)
        } else if (championshipsData) {
          setChampionships(championshipsData)
        }

        // Cargar normativa
        const { data: normativaData, error: normativaError } = await supabase
          .from("racerules")
          .select("content, championship!inner(id)")
          .eq("id", normativaId)
          .single()

        if (normativaError) {
          console.error("Error al cargar normativa:", normativaError)
        } else if (normativaData) {
          setContent(normativaData.content ?? "")
          setSelectedChampionship(normativaData.championship.id ?? null)
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [normativaId])

  // Guardar cambios en la normativa
  const saveContent = async () => {
    if (!userId) {
      setSaveMessage({
        type: "error",
        text: "Usuario no autenticado. Por favor, recarga la página.",
      })
      return
    }

    setIsSaving(true)
    setSaveMessage(null)

    try {
      const now = new Date().toISOString()

      const { error } = await supabase
        .from("racerules")
        .update({
          content,
          championship: selectedChampionship,
          updated_at: now,
          updated_by: userId,
        })
        .eq("id", normativaId)

      if (error) {
        showToast("Error al guardar los cambios: "+ error.message, "error")
        console.error("Error al guardar:" + error.message, error)
        setSaveMessage({
          type: "error",
          text: "Error al guardar los cambios. Inténtalo de nuevo.",
        })
        return
      }

      setSaveMessage({
        type: "success",
        text: "Cambios guardados correctamente.",
      })

      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        setSaveMessage(null)
      }, 3000)
    } catch (error) {
      console.error("Error:", error)
      setSaveMessage({
        type: "error",
        text: "Error al guardar los cambios. Inténtalo de nuevo.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Cambiar el campeonato
  const handleChampionshipChange = (championshipId: string) => {
    setSelectedChampionship(Number.parseInt(championshipId))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Normativa {normativaId === 1 ? "Principal" : "Secundaria"}</h2>
        <Button onClick={saveContent} disabled={isSaving || isLoading} className="flex items-center gap-2">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>

      {saveMessage && (
        <Alert variant={saveMessage.type === "success" ? "default" : "destructive"} className="mb-4">
          <AlertDescription>{saveMessage.text}</AlertDescription>
        </Alert>
      )}

      {/* Selector de campeonato */}
      <div className="mb-6">
        <Label htmlFor={`championship-select-${normativaId}`} className="mb-2 block">
          Campeonato
        </Label>
        <Select
          value={selectedChampionship?.toString() ?? ""}
          onValueChange={handleChampionshipChange}
          disabled={isSaving || isLoading}
        >
          <SelectTrigger id={`championship-select-${normativaId}`} className="w-full">
            <SelectValue placeholder="Selecciona un campeonato" />
          </SelectTrigger>
          <SelectContent>
            {championships.map((championship) => (
              <SelectItem key={championship.id} value={championship.id.toString()}>
                {championship.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Editar
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Vista previa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[50vh] font-mono text-sm"
            placeholder="# Título de la normativa

            Escribe aquí el contenido de la normativa usando Markdown..."
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-4 text-black">
          <div className="border rounded-lg p-6 min-h-[50vh] bg-white">
            <MarkdownRenderer content={content} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
