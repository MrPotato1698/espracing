"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink, RefreshCw, Heart, MessageCircle, Repeat2, TestTube } from "lucide-react"
import { Button } from "@/components/ui/button"

import { getMockTweetsLimited } from "@/mock/Tweets"

interface TwitterFeedProps {
  readonly username: string
  readonly useMockData?: boolean
}

interface Tweet {
  id: string
  text: string
  created_at: string
  user: {
    name: string
    screen_name: string
    profile_image_url: string
  }
  media?: {
    url: string
    type: string
  }[]
  public_metrics?: {
    retweet_count: number
    like_count: number
    reply_count: number
  }
}

export default function TwitterFeed({ username, useMockData = false  }: TwitterFeedProps) {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTweets = async () => {
    setLoading(true)
    setError(null)

    try {
      if (useMockData) {
        // Usar datos mockup
        const mockData = await getMockTweetsLimited(8, 1500) // 8 tweets con delay de 1.5s
        setTweets(mockData)
        setLoading(false)
        return
      }
      const response = await fetch(`/api/twitter?username=${username}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error ?? errorData.details ?? `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setTweets(data)
        setLoading(false)

    } catch (err) {
      console.error("Error al obtener tweets:", err)
      const errorMessage = err instanceof Error
        ? `Error al cargar tweets: ${err.message}`
        : "Error al cargar tweets. Por favor, intenta de nuevo más tarde."
      setError(errorMessage)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTweets()
  }, [username, useMockData])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Función para procesar enlaces, hashtags y menciones en el texto del tweet
  const processText = (text: string) => {
    // Reemplazar URLs
    let processedText = text.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-medium">$1</a>',
    )

    // Reemplazar hashtags
    processedText = processedText.replace(
      /#(\w+)/g,
      '<a href="https://twitter.com/hashtag/$1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-medium">#$1</a>',
    )

    // Reemplazar menciones
    processedText = processedText.replace(
      /@(\w+)/g,
      '<a href="https://twitter.com/$1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-medium">@$1</a>',
    )

    return processedText
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchTweets} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="h-8 w-8 mr-2 bg-black rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">X</span>
          </div>
          <span className="font-semibold text-lightPrimary">@{username}</span>
          {useMockData && (
            <div className="ml-2 px-2 py-1 bg-secondary text-darkPrimary text-xs rounded-full flex items-center">
              <TestTube className="h-3 w-3 mr-1" />
              Datos de prueba
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={fetchTweets} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span className="sr-only">Actualizar</span>
        </Button>
      </div>

      {(() => {
        if (loading) {
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden bg-lightPrimary border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <Skeleton className="h-10 w-10 rounded-full bg-darkSecond/20" />
                      <div className="space-y-2">
                      <Skeleton className="h-4 w-24 bg-darkSecond/20" />
                      <Skeleton className="h-3 w-16 bg-darkSecond/20" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full bg-darkSecond/20" />
                      <Skeleton className="h-4 w-5/6 bg-darkSecond/20" />
                      <Skeleton className="h-4 w-3/4 bg-darkSecond/20" />
                    </div>
                    {i % 3 === 0 && <Skeleton className="h-32 w-full mt-3 rounded bg-darkSecond/20" />}
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        }

        if (tweets.length === 0) {
          return (
            <div className="text-center py-8">
              <p className="text-lightPrimary/70">No se encontraron tweets para este usuario.</p>
            </div>
          )
        }

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tweets.map((tweet) => (
              <Card
                key={tweet.id}
                className="overflow-hidden bg-lightPrimary border-primary/20 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:scale-[1.02]"
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3 mb-3">
                    <img
                      src={tweet.user.profile_image_url || "/placeholder.svg?height=40&width=40"}
                      alt={tweet.user.name}
                      className="h-10 w-10 rounded-full border-2 border-primary/10"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <span className="font-semibold truncate text-darkPrimary">{tweet.user.name}</span>
                        <span className="text-darkPrimary/60 ml-2 text-sm">@{tweet.user.screen_name}</span>
                      </div>
                      <p className="text-sm text-darkPrimary/50">{formatDate(tweet.created_at)}</p>
                    </div>
                  </div>

                  <div
                    className="my-2 text-darkPrimary whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: processText(tweet.text) }}
                  />

                  {tweet.media && tweet.media.length > 0 && tweet.media[0].url && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-primary/10">
                      <img
                        src={tweet.media[0].url || "/placeholder.svg"}
                        alt="Tweet media"
                        className="w-full h-auto object-cover max-h-64"
                      />
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-primary/20 flex justify-between items-center">
                    {tweet.public_metrics && (
                      <div className="flex space-x-4 text-sm text-darkPrimary/60">
                        <span className="flex items-center hover:text-red-500 transition-colors cursor-pointer group">
                          <Heart className="h-4 w-4 mr-1 group-hover:fill-current" />
                          {tweet.public_metrics.like_count}
                        </span>
                        <span className="flex items-center hover:text-red-500 transition-colors cursor-pointer">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {tweet.public_metrics.reply_count}
                        </span>
                        <span className="flex items-center hover:text-red-500 transition-colors cursor-pointer">
                          <Repeat2 className="h-4 w-4 mr-1" />
                          {tweet.public_metrics.retweet_count}
                        </span>
                      </div>
                    )}
                    <a
                      href={`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm flex items-center hover:underline font-medium transition-colors"
                    >
                      Ver en X <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      })()}

      <div className="text-center mt-6">
        <a
          href={`https://twitter.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lightPrimary hover:underline inline-flex items-center font-medium transition-colors hover:text-secondary"
        >
          Ver más en X <ExternalLink className="ml-1 h-4 w-4" />
        </a>
      </div>
    </div>
  )
}
