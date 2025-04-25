"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/db/supabase"
import { format } from "date-fns"
import MarkdownRenderer from "@/components/MarkdownRenderer"
import { Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Normativa = {
  id: number
  content: string
  updated_at: string
  isVisible: boolean
  championship: number
}

type Championship = {
  id: number
  name: string | null
}

export default function RulesViewer() {
  const [isLoading, setIsLoading] = useState(true)
  const [normativas, setNormativas] = useState<Normativa[]>([])
  const [championships, setChampionships] = useState<Championship[]>([])
  const [activeTab, setActiveTab] = useState<string>("1")

  useEffect(() => {
    const fetchData = async () => {
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

        // Cargar normativas
        const { data, error } = await supabase
          .from("racerules")
          .select("id, content, updated_at, isVisible, championship!inner(id)")
          .in("id", [1, 2])
          .order("id")

        if (error) {
          console.error("Error al cargar normativas:", error)
        } else if (data) {
          // Adaptar los datos al tipo Normativa
          const visibleNormativas: Normativa[] = data
            .filter((n: any) => n.id === 1 || n.isVisible)
            .map((n: any) => ({
              id: n.id,
              content: n.content ?? "",
              updated_at: n.updated_at ?? "",
              isVisible: n.isVisible,
              championship: n.championship?.id ?? null,
            }))
          setNormativas(visibleNormativas)
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Suscribirse a cambios en las normativas
    const subscription = supabase
      .channel("normativa-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "racerules",
          filter: "id=in.(1,2)",
        },
        async (payload) => {
          // Recargar todas las normativas cuando haya un cambio
          const { data } = await supabase
            .from("racerules")
            .select("id, content, updated_at, isVisible, championship!inner(id)")
            .in("id", [1, 2])
            .order("id")

          if (data) {
            const visibleNormativas: Normativa[] = data
              .filter((n: any) => n.id === 1 || n.isVisible)
              .map((n: any) => ({
                id: n.id,
                content: n.content ?? "",
                updated_at: n.updated_at ?? "",
                isVisible: n.isVisible,
                championship: n.championship?.id ?? null,
              }))
            setNormativas(visibleNormativas)
          }
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Formatear fecha de última actualización
  const formatLastUpdated = (date: string | null) => {
    if (!date) return null
    return format(new Date(date), "'Última actualización:' dd 'de' MMMM 'de' yyyy 'a las' HH:mm")
  }

  // Obtener el nombre del campeonato
  const getChampionshipName = (championshipId: number | null) => {
    if (!championshipId) return "Normativa General"
    const championship = championships.find((c) => c.id === championshipId)
    return championship ? championship.name : "Normativa General"
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Si solo hay una normativa, mostrarla directamente
  if (normativas.length === 1) {
    const normativa = normativas[0]
    return (
      <div className="w-full mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{getChampionshipName(normativa.championship)}</h2>
          {normativa.updated_at && (
            <div className="text-sm text-gray-600">{formatLastUpdated(normativa.updated_at)}</div>
          )}
        </div>

        <div className="bg-white rounded-lg border p-6">
          <MarkdownRenderer content={normativa.content} />
        </div>
      </div>
    )
  }

  // Si hay múltiples normativas, mostrarlas en pestañas
  return (
    <div className="w-full mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${normativas.length}, 1fr)` }}>
          {normativas.map((normativa) => (
            <TabsTrigger key={normativa.id} value={normativa.id.toString()}>
              {getChampionshipName(normativa.championship)}
            </TabsTrigger>
          ))}
        </TabsList>

        {normativas.map((normativa) => (
          <TabsContent key={normativa.id} value={normativa.id.toString()}>
            <div className="mb-4 text-sm text-gray-600 text-right">{formatLastUpdated(normativa.updated_at)}</div>
            <div className="bg-white rounded-lg border p-6">
              <MarkdownRenderer content={normativa.content} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
