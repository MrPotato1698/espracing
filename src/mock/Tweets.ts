export interface MockTweet {
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
  public_metrics: {
    retweet_count: number
    like_count: number
    reply_count: number
  }
}

export const mockTweets: MockTweet[] = [
  {
    id: "1",
    text: "¡Gran carrera este fin de semana en el circuito de Silverstone! 🏁 No te pierdas la transmisión en vivo este domingo a las 15:00. #ESPRacing #SimRacing #F1",
    created_at: "2024-01-15T14:30:00Z",
    user: {
      name: "ESP Racing",
      screen_name: "EspRacingCom",
      profile_image_url: "/placeholder.svg?height=48&width=48",
    },
    media: [
      {
        url: "/placeholder.svg?height=400&width=600",
        type: "photo",
      },
    ],
    public_metrics: {
      retweet_count: 45,
      like_count: 234,
      reply_count: 18,
    },
  },
  {
    id: "2",
    text: "Preparándonos para el próximo evento de la temporada. Los pilotos han estado entrenando intensamente toda la semana. ¡La emoción está a tope! 💪 #SimRacing #Competición #ESPRacing",
    created_at: "2024-01-14T10:15:00Z",
    user: {
      name: "ESP Racing",
      screen_name: "EspRacingCom",
      profile_image_url: "/placeholder.svg?height=48&width=48",
    },
    public_metrics: {
      retweet_count: 23,
      like_count: 156,
      reply_count: 12,
    },
  },
  {
    id: "3",
    text: "🎉 ¡NUEVO RÉCORD! @PilotoESP acaba de establecer un nuevo tiempo récord en Monza con 1:19.847. ¡Increíble vuelta! 🚗💨\n\nVe el replay completo en nuestro canal: https://youtube.com/espracing",
    created_at: "2024-01-13T16:45:00Z",
    user: {
      name: "ESP Racing",
      screen_name: "EspRacingCom",
      profile_image_url: "/placeholder.svg?height=48&width=48",
    },
    media: [
      {
        url: "/placeholder.svg?height=300&width=500",
        type: "photo",
      },
    ],
    public_metrics: {
      retweet_count: 67,
      like_count: 389,
      reply_count: 24,
    },
  },
  {
    id: "4",
    text: "Nuevas actualizaciones en nuestra plataforma de simulación. Ahora con mejor física de neumáticos y aerodinámica mejorada. 🔧⚙️",
    created_at: "2024-01-12T09:20:00Z",
    user: {
      name: "ESP Racing",
      screen_name: "EspRacingCom",
      profile_image_url: "/placeholder.svg?height=48&width=48",
    },
    public_metrics: {
      retweet_count: 12,
      like_count: 98,
      reply_count: 7,
    },
  },
  {
    id: "5",
    text: "¿Sabías que nuestros pilotos entrenan un promedio de 4 horas diarias? La dedicación es clave para el éxito en el simracing profesional. 📊 #DatosCuriosos #ESPRacing",
    created_at: "2024-01-11T18:30:00Z",
    user: {
      name: "ESP Racing",
      screen_name: "EspRacingCom",
      profile_image_url: "/placeholder.svg?height=48&width=48",
    },
    public_metrics: {
      retweet_count: 8,
      like_count: 76,
      reply_count: 5,
    },
  },
  {
    id: "6",
    text: "¡Felicidades a todo el equipo por el podium de ayer! 🥉 Tercer lugar en el campeonato europeo de GT3. ¡Vamos por más! 🏆\n\n#ESPRacing #GT3 #Podium #TeamWork",
    created_at: "2024-01-10T20:15:00Z",
    user: {
      name: "ESP Racing",
      screen_name: "EspRacingCom",
      profile_image_url: "/placeholder.svg?height=48&width=48",
    },
    media: [
      {
        url: "/placeholder.svg?height=350&width=550",
        type: "photo",
      },
    ],
    public_metrics: {
      retweet_count: 89,
      like_count: 445,
      reply_count: 32,
    },
  },
  {
    id: "7",
    text: "Tweet corto para probar el diseño. 🏁",
    created_at: "2024-01-09T12:00:00Z",
    user: {
      name: "ESP Racing",
      screen_name: "EspRacingCom",
      profile_image_url: "/placeholder.svg?height=48&width=48",
    },
    public_metrics: {
      retweet_count: 3,
      like_count: 25,
      reply_count: 1,
    },
  },
  {
    id: "8",
    text: "Este es un tweet muy largo para probar cómo se ve el diseño cuando tenemos mucho texto. Queremos asegurarnos de que el layout se mantiene consistente independientemente de la longitud del contenido. A veces los tweets pueden ser bastante extensos y necesitamos que se vean bien en ambas columnas, tanto en móvil como en escritorio. #ESPRacing #Testing #LongTweet #SimRacing #Design #Layout #Responsive",
    created_at: "2024-01-08T15:45:00Z",
    user: {
      name: "ESP Racing",
      screen_name: "EspRacingCom",
      profile_image_url: "/placeholder.svg?height=48&width=48",
    },
    public_metrics: {
      retweet_count: 15,
      like_count: 87,
      reply_count: 9,
    },
  },
]

// Función para obtener tweets mockup con delay simulado
export const getMockTweets = async (delay: number = 1000): Promise<MockTweet[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockTweets)
    }, delay)
  })
}

// Función para obtener un número específico de tweets
export const getMockTweetsLimited = async (limit: number = 6, delay: number = 1000): Promise<MockTweet[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockTweets.slice(0, limit))
    }, delay)
  })
}
