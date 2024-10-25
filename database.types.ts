export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      car: {
        Row: {
          brand: string | null
          class: string | null
          description: string | null
          filename: string | null
          fuelLiterTime: number | null
          id: number
          imgbrand: string | null
          maxLiter: number | null
          model: string | null
          power: number | null
          subclass: number | null
          torque: number | null
          tyreTimeChange: number | null
          weight: number | null
          year: number | null
        }
        Insert: {
          brand?: string | null
          class?: string | null
          description?: string | null
          filename?: string | null
          fuelLiterTime?: number | null
          id: number
          imgbrand?: string | null
          maxLiter?: number | null
          model?: string | null
          power?: number | null
          subclass?: number | null
          torque?: number | null
          tyreTimeChange?: number | null
          weight?: number | null
          year?: number | null
        }
        Update: {
          brand?: string | null
          class?: string | null
          description?: string | null
          filename?: string | null
          fuelLiterTime?: number | null
          id?: number
          imgbrand?: string | null
          maxLiter?: number | null
          model?: string | null
          power?: number | null
          subclass?: number | null
          torque?: number | null
          tyreTimeChange?: number | null
          weight?: number | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "car_subclass_fkey"
            columns: ["subclass"]
            isOneToOne: false
            referencedRelation: "carsubclass"
            referencedColumns: ["id"]
          },
        ]
      }
      carsubclass: {
        Row: {
          class_design: string | null
          id: number
          name: string | null
          short_name: string | null
        }
        Insert: {
          class_design?: string | null
          id?: number
          name?: string | null
          short_name?: string | null
        }
        Update: {
          class_design?: string | null
          id?: number
          name?: string | null
          short_name?: string | null
        }
        Relationships: []
      }
      championship: {
        Row: {
          id: number
          ischampionship: boolean | null
          key_search: string | null
          name: string | null
          season: string | null
          year: number
        }
        Insert: {
          id: number
          ischampionship?: boolean | null
          key_search?: string | null
          name?: string | null
          season?: string | null
          year?: number
        }
        Update: {
          id?: number
          ischampionship?: boolean | null
          key_search?: string | null
          name?: string | null
          season?: string | null
          year?: number
        }
        Relationships: []
      }
      circuit: {
        Row: {
          filename: string | null
          id: number
          location: string | null
          name: string | null
          shortname: string | null
        }
        Insert: {
          filename?: string | null
          id: number
          location?: string | null
          name?: string | null
          shortname?: string | null
        }
        Update: {
          filename?: string | null
          id?: number
          location?: string | null
          name?: string | null
          shortname?: string | null
        }
        Relationships: []
      }
      circuitLayout: {
        Row: {
          capacity: number | null
          circuit: number
          filename: string | null
          id: number
          length: number | null
          name: string | null
        }
        Insert: {
          capacity?: number | null
          circuit: number
          filename?: string | null
          id: number
          length?: number | null
          name?: string | null
        }
        Update: {
          capacity?: number | null
          circuit?: number
          filename?: string | null
          id?: number
          length?: number | null
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "CircuitLayout_circuit_fkey"
            columns: ["circuit"]
            isOneToOne: false
            referencedRelation: "circuit"
            referencedColumns: ["id"]
          },
        ]
      }
      inscription: {
        Row: {
          id: string
          position: string | null
          profile: string | null
          race: string | null
          valid_laps: string | null
        }
        Insert: {
          id: string
          position?: string | null
          profile?: string | null
          race?: string | null
          valid_laps?: string | null
        }
        Update: {
          id?: string
          position?: string | null
          profile?: string | null
          race?: string | null
          valid_laps?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inscription_profile_fkey"
            columns: ["profile"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message: {
        Row: {
          description: string | null
          discord: string | null
          id: number
          name_emissor: string
          name_receiver: string
          readed: boolean | null
          region: string | null
        }
        Insert: {
          description?: string | null
          discord?: string | null
          id: number
          name_emissor: string
          name_receiver?: string
          readed?: boolean | null
          region?: string | null
        }
        Update: {
          description?: string | null
          discord?: string | null
          id?: number
          name_emissor?: string
          name_receiver?: string
          readed?: boolean | null
          region?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_name_receiver_fkey"
            columns: ["name_receiver"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pointsystem: {
        Row: {
          fastestlap: number | null
          id: number
          name: string
          points: Json
        }
        Insert: {
          fastestlap?: number | null
          id?: number
          name: string
          points: Json
        }
        Update: {
          fastestlap?: number | null
          id?: number
          name?: string
          points?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          dnf: number | null
          email: string | null
          flaps: number | null
          full_name: string | null
          id: string
          is_team_manager: boolean | null
          number_plate: number | null
          podiums: number | null
          poles: number | null
          races: number | null
          roleesp: number | null
          steam_id: string | null
          team: number | null
          top10: number | null
          top5: number | null
          wins: number | null
        }
        Insert: {
          avatar?: string | null
          dnf?: number | null
          email?: string | null
          flaps?: number | null
          full_name?: string | null
          id: string
          is_team_manager?: boolean | null
          number_plate?: number | null
          podiums?: number | null
          poles?: number | null
          races?: number | null
          roleesp?: number | null
          steam_id?: string | null
          team?: number | null
          top10?: number | null
          top5?: number | null
          wins?: number | null
        }
        Update: {
          avatar?: string | null
          dnf?: number | null
          email?: string | null
          flaps?: number | null
          full_name?: string | null
          id?: string
          is_team_manager?: boolean | null
          number_plate?: number | null
          podiums?: number | null
          poles?: number | null
          races?: number | null
          roleesp?: number | null
          steam_id?: string | null
          team?: number | null
          top10?: number | null
          top5?: number | null
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_roleesp_fkey"
            columns: ["roleesp"]
            isOneToOne: false
            referencedRelation: "role"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_team_fkey"
            columns: ["team"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
        ]
      }
      race: {
        Row: {
          championship: number | null
          filename: string
          id: number
          name: string | null
          orderinchamp: number
          pointsystem: number | null
        }
        Insert: {
          championship?: number | null
          filename: string
          id: number
          name?: string | null
          orderinchamp?: number
          pointsystem?: number | null
        }
        Update: {
          championship?: number | null
          filename?: string
          id?: number
          name?: string | null
          orderinchamp?: number
          pointsystem?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "race_championship_fkey"
            columns: ["championship"]
            isOneToOne: false
            referencedRelation: "championship"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_pointsystem_fkey"
            columns: ["pointsystem"]
            isOneToOne: false
            referencedRelation: "pointsystem"
            referencedColumns: ["id"]
          },
        ]
      }
      role: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id?: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      team: {
        Row: {
          description: string | null
          id: number
          image: string | null
          name: string
        }
        Insert: {
          description?: string | null
          id: number
          image?: string | null
          name?: string
        }
        Update: {
          description?: string | null
          id?: number
          image?: string | null
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
