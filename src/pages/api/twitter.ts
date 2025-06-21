import type { APIRoute } from "astro"

interface TwitterUser {
  id: string
  name: string
  username: string
  profile_image_url: string
}

interface TwitterTweet {
  id: string
  text: string
  created_at: string
  author_id: string
  attachments?: {
    media_keys: string[]
  }
  public_metrics: {
    retweet_count: number
    like_count: number
    reply_count: number
  }
}

interface TwitterMedia {
  media_key: string
  type: string
  url?: string
  preview_image_url?: string
}

interface TwitterResponse {
  data: TwitterTweet[]
  includes?: {
    users: TwitterUser[]
    media: TwitterMedia[]
  }
}

export const GET: APIRoute = async ({ url, request }) => {
  const username = url.searchParams.get("username")

  if (!username) {
    return new Response(JSON.stringify({ error: "Username is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const token = import.meta.env.X_API_TOKEN

  if (!token) {
    return new Response(JSON.stringify({ error: "Twitter API credentials not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    // Primero obtenemos el ID del usuario
    const userResponse = await fetch(`https://api.twitter.com/2/users/by/username/${username}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!userResponse.ok) {
      const errorData = await userResponse.json()
      throw new Error(`Error al obtener usuario: ${JSON.stringify(errorData)}`)
    }

    const userData = await userResponse.json()

    if (!userData?.data.id) {
      throw new Error(`No se encontró el usuario: ${username}`)
    }

    const userId = userData.data.id

    // Ahora obtenemos los tweets del usuario
    const tweetsResponse = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?` +
        new URLSearchParams({
          max_results: "10",
          "tweet.fields": "created_at,public_metrics,attachments",
          expansions: "author_id,attachments.media_keys",
          "user.fields": "name,username,profile_image_url",
          "media.fields": "type,url,preview_image_url",
        }),
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
      },
    )

    if (!tweetsResponse.ok) {
      const errorData = await tweetsResponse.json()
      throw new Error(`Error al obtener tweets: ${JSON.stringify(errorData)}`)
    }

    const tweetsData: TwitterResponse = await tweetsResponse.json()

    // Si no hay tweets, devolver un array vacío
    if (!tweetsData.data || tweetsData.data.length === 0) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "max-age=300", // Cache por 5 minutos
        },
      })
    }

    // Transformar los datos para el frontend
  const transformedTweets = tweetsData.data.map((tweet) => {
        const author = tweetsData.includes?.users?.find((user) => user.id === tweet.author_id)
        const media = tweet.attachments?.media_keys
          ?.map((key) => tweetsData.includes?.media?.find((m) => m.media_key === key))
          .filter(Boolean).map((m) => ({
          url: m?.type === "photo" ? m?.url : m?.preview_image_url,
          type: m?.type ?? "photo",
        }))

        return {
          id: tweet.id,
          text: tweet.text,
          created_at: tweet.created_at,
          user: {
            name: author?.name ?? "",
            screen_name: author?.username ?? "",
            profile_image_url: author?.profile_image_url ?? "",
          },
          media: media || [],
          public_metrics: tweet.public_metrics,
        }
      })

    return new Response(JSON.stringify(transformedTweets), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "max-age=300", // Cache por 5 minutos
      },
    })
  } catch (error) {
    console.error("Twitter API Error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to fetch tweets",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
